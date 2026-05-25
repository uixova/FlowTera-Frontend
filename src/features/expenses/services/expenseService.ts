import { api, restFetch } from '../../../api/api';
import { Expense, Team } from '@/types/types';
import { dataEvents } from '../../../hooks/useDataRefresh';
import { isDemoMode } from '../../../utils/demo';
import demoExpenses from '../../../data/demo-expenses.json';

export interface EnrichedExpense extends Expense {
    user: string;
    userAvatar: string | null;
    userRole: string;
}

export interface ExpenseFetchResult {
    data: EnrichedExpense[];
    hasMore: boolean;
    totalCount: number;
}

const extractList = <T>(response: any): T[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    return [];
};

export interface ParsedInvoice {
    merchant:       string | null;
    amount:         number | null;
    currency:       string | null;
    date:           string | null;
    time:           string | null;  // HH:MM — null when not found on receipt
    category:       string | null;
    payment_method: string | null;  // Cash / Credit Card / etc. — null when not detected
    confidence:     number;
}

const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';

const getAuthToken = () =>
    localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';

// S3 presigned upload: backend presigned URL al, dosyayı direkt S3'e yükle, key döner
async function uploadReceiptFile(file: File, teamId: string): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const presignedRes = await restFetch<{ status: string; data: { uploadUrl: string; key: string } }>(
        '/uploads/presigned',
        { params: { ext, teamId } }
    );
    const { uploadUrl, key } = (presignedRes as any).data;
    await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
    });
    return key;
}

// OCR: S3'e yüklenen fatura/fişi analiz et
async function analyzeReceipt(key: string): Promise<ParsedInvoice> {
    const res = await restFetch<{ status: string; data: ParsedInvoice }>(
        '/uploads/analyze-receipt',
        { method: 'POST', body: { key } }
    );
    return (res as any).data as ParsedInvoice;
}

// OCR: Dosyayı doğrudan gönder — S3 roundtrip yok, daha hızlı
async function analyzeReceiptDirect(file: File): Promise<ParsedInvoice> {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API_PREFIX}/uploads/ocr-direct`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        body: fd,
    });
    if (!res.ok) throw new Error(`OCR direct failed: ${res.status}`);
    const json = await res.json() as { data: ParsedInvoice };
    return json.data;
}

export const expenseService = {

    uploadReceiptFile,
    analyzeReceipt,
    analyzeReceiptDirect,

    // Takım bazında giderleri getir — backend EnrichedExpense döner
    async getExpensesByTeam(teamId: string | number, page = 1, limit = 20): Promise<ExpenseFetchResult> {
        if (!teamId) return { data: [], hasMore: false, totalCount: 0 };

        if (isDemoMode()) {
            const all = demoExpenses as unknown as EnrichedExpense[];
            const start = (page - 1) * limit;
            return { data: all.slice(start, start + limit), hasMore: start + limit < all.length, totalCount: all.length };
        }

        const response = await api.expenses.getAll({ teamId: String(teamId), page, pageSize: limit });
        const expenses = extractList<EnrichedExpense>(response);
        const total    = (response as any)?.total ?? expenses.length;

        return {
            data:       expenses,
            hasMore:    (response as any)?.hasMore ?? page * limit < total,
            totalCount: total,
        };
    },

    // Yeni gider oluştur
    async createExpense(payload: Record<string, any>): Promise<{ success: boolean; data?: any }> {
        try {
            const result = await restFetch<{ status: string; data: any }>(
                `/expenses`,
                { method: 'POST', body: payload, params: { teamId: payload.teamId } }
            );
            api.expenses.invalidate();
            dataEvents.notify();
            return { success: true, data: (result as any).data };
        } catch {
            return { success: false };
        }
    },

    // Gider güncelle
    async updateExpense(id: string | number, payload: Partial<Expense>): Promise<{ success: boolean }> {
        try {
            await restFetch(`/expenses/${id}`, { method: 'PUT', body: payload });
            api.expenses.invalidate();
            dataEvents.notify();
            return { success: true };
        } catch {
            return { success: false };
        }
    },

    // Gider durumunu güncelle (admin)
    async updateExpenseStatus(id: string | number, status: 'approved' | 'rejected', rejectionReason?: string): Promise<{ success: boolean }> {
        try {
            await restFetch(`/expenses/${id}/status`, {
                method: 'PATCH',
                body:   { status, rejectionReason: rejectionReason ?? null },
            });
            api.expenses.invalidate();
            dataEvents.notify();
            return { success: true };
        } catch {
            return { success: false };
        }
    },

    // Takım bilgisini getir
    async getTeamInfo(teamId: string | number): Promise<Team | null> {
        const response = await api.teams.getAll({ pageSize: 500 });
        const allTeams = extractList<Team>(response);
        return allTeams.find(t => String(t.id) === String(teamId)) ?? null;
    },

    // Gider sil
    async deleteExpense(id: string | number): Promise<{ success: boolean }> {
        try {
            await restFetch(`/expenses/${id}`, { method: 'DELETE' });
            api.expenses.invalidate();
            dataEvents.notify();
            return { success: true };
        } catch {
            return { success: false };
        }
    },
};
