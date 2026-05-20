import { api } from '../../../api/api';
import { Expense, Trip, Team } from '@/types/types';

// Fonksiyon imzası: Harcama veya Seyahat nesnesini para birimine göre dönüştürür
type ConvertFn = (item: Expense | Trip, currency: string) => number;

const extractList = <T>(response: any): T[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    return [];
};

export const analysisService = {

    getTeamAnalysis: async (teamId: string | number, viewMode: 'all' | 'expenses' | 'trips' = 'all', convertFn: ConvertFn) => {

        const [expensesRes, tripsRes, teamsRes] = await Promise.all([
            api.expenses.getAll({ pageSize: 2000 }),
            api.trips.getAll({ pageSize: 2000 }),
            api.teams.getAll({ pageSize: 500 })
        ]);

        const expenses = extractList<Expense>(expensesRes);
        const trips    = extractList<Trip>(tripsRes);
        const teams    = extractList<Team>(teamsRes);

        const currentTeam = teams.find(t => String(t.id) === String(teamId));
        const teamCurrency = currentTeam?.settings?.currency || 'USD';

        // Takıma ait verileri filtrele
        const teamExpenses = expenses.filter(e => String(e.teamId) === String(teamId));
        const teamTrips    = trips.filter(t => String(t.teamId) === String(teamId));

        const targetData: (Expense | Trip)[] =
            viewMode === 'expenses' ? teamExpenses :
            viewMode === 'trips'    ? teamTrips    :
                                     [...teamExpenses, ...teamTrips];

        const getValue = (item: Expense | Trip) => convertFn(item, teamCurrency);

        // Güvenli tarih parse 
        const parseDate = (str?: string) => {
            if (!str) return null;
            const parts = str.split('/').map(Number);
            if (parts.length !== 3) return null;
            const [d, m, y] = parts;
            if (!d || !m || !y) return null;
            return { day: d, month: m - 1, year: y };
        };

        const getDate = (item: Expense | Trip) => parseDate(item.date || (item as Trip).startDate);

        // "YYYY-MM" formatında ay anahtarı
        const monthKey = (d: { year: number; month: number }) =>
            `${d.year}-${String(d.month).padStart(2, '0')}`;

        const now = new Date();
        const currentKey = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;

        const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevKey  = `${prevDate.getFullYear()}-${String(prevDate.getMonth()).padStart(2, '0')}`;

        // Aylık toplamlar
        const monthlyMap: Record<string, number> = {};

        targetData.forEach(item => {
            const d = getDate(item);
            if (!d) return;
            const key = monthKey(d);
            const val = getValue(item);
            monthlyMap[key] = parseFloat(((monthlyMap[key] || 0) + val).toFixed(2));
        });

        const currentMonthTotal = monthlyMap[currentKey] || 0;
        const lastMonthTotal    = monthlyMap[prevKey]    || 0;

        // Genel toplam 
        const totalSpending = parseFloat(targetData.reduce(
            (sum, item) => sum + getValue(item), 0
        ).toFixed(2));

        // Büyüme oranı
        const spendingGrowth =
            lastMonthTotal > 0
                ? Number((((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1))
                : totalSpending > 0 ? 100 : null;

        // Yıllık toplam
        const currentYear = now.getFullYear();
        const yearlyTotal = parseFloat(targetData.reduce((sum, item) => {
            const d = getDate(item);
            if (!d || d.year !== currentYear) return sum;
            return sum + getValue(item);
        }, 0).toFixed(2));

        // Kategori dağılımı 
        const categoryData: Array<{ name: string; value: number }> = targetData.reduce((acc: any[], item) => {
            const name = (item as Expense).category || (item as Trip).destination || 'Diğer';
            const val  = getValue(item);
            const found = acc.find(i => i.name === name);
            if (found) {
                found.value = parseFloat((found.value + val).toFixed(2));
            } else {
                acc.push({ name, value: parseFloat(val.toFixed(2)) });
            }
            return acc;
        }, []);

        // Cash flow (aylık) 
        const cashFlowMap: Record<string, { month: string; amount: number; order: number }> = {};

        targetData.forEach(item => {
            const d = getDate(item);
            if (!d) return;
            const key = monthKey(d);
            const val = getValue(item);

            if (!cashFlowMap[key]) {
                cashFlowMap[key] = {
                    month: new Date(d.year, d.month)
                        .toLocaleString('tr-TR', { month: 'short' }),
                    amount: 0,
                    order: d.year * 12 + d.month
                };
            }
            cashFlowMap[key].amount = parseFloat((cashFlowMap[key].amount + val).toFixed(2));
        });

        const cashFlowData = Object.values(cashFlowMap)
            .sort((a, b) => a.order - b.order)
            .map(({ month, amount }) => ({ month, amount }));

        // Durum dağılımı
        const normalize = (s?: string) => s?.toLowerCase().replace(/\s/g, '');

        const statusCount = targetData.reduce(
            (acc, item) => {
                const s = normalize(item.statusClass || item.status);
                if (s === 'approved') acc.approved++;
                else if (s === 'pending') acc.pending++;
                else if (s === 'rejected') acc.rejected++;
                return acc;
            },
            { approved: 0, pending: 0, rejected: 0 }
        );

        const statusData = [
            { name: 'Onaylı',     value: statusCount.approved  },
            { name: 'Bekleyen',   value: statusCount.pending   },
            { name: 'Reddedilen', value: statusCount.rejected  }
        ];

        return {
            summary: {
                totalSpending,
                currentMonthSpending: currentMonthTotal,
                lastMonthSpending:    lastMonthTotal,
                spendingGrowth,
                yearlyTotal,

                pendingReports: teamExpenses.filter(
                    e => normalize(e.statusClass || e.status) === 'pending'
                ).length,

                activeTrips: teamTrips.filter(
                    t => normalize(t.statusClass || t.status) === 'onroad'
                ).length,

                teamCurrency
            },

            categoryData,
            cashFlowData,
            statusData
        };
    }
};