import { api } from '../../../api/api';
import { Plan } from '@/types/types';

// Ödeme formu payload'u için tip tanımı
export interface PaymentPayload {
    number?: string | number;
    name?: string;
    expiry?: string;
    cvc?: string | number;
    [key: string]: any; // Diğer olası form alanları için esneklik
}

// Geri dönüş tipi arayüzü
export interface PaymentResult {
    success: boolean;
    message: string;
    planName?: string;
    details?: string;
}

// Paginated veya düz array'den veriyi güvenle çıkar
const extractList = <T>(response: any): T[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    return [];
};

export const paymentService = {

    // Ödemeyi işle 
    async processPayment(
        paymentData: PaymentPayload, 
        userId: string | number, 
        planId: string | number
    ): Promise<PaymentResult> {
        try {
            if (!userId) throw new Error("Kullanıcı kimliği eksik.");
            if (!planId) throw new Error("Plan kimliği eksik.");

            console.log(`${userId} için ${planId} ödemesi alınıyor...`);

            const response = await api.plans.getAll();
            const plans = extractList<Plan>(response);

            if (!plans.length) throw new Error("Plan verileri doğrulanamadı.");

            const targetPlan = plans.find(p => String(p.id) === String(planId));
            if (!targetPlan) throw new Error(`"${planId}" planı bulunamadı.`);

            const lastFour = paymentData?.number
                ? String(paymentData.number).slice(-4)
                : '****';

            // Gerçek API gelince buraya api.fetch() çağrısı eklenecek
            return {
                success: true,
                message: "Abonelik aktif edildi!",
                planName: targetPlan.name,
                details: lastFour
            };
        } catch (error: any) {
            console.error("Ödeme İşlem Hatası:", error.message);
            return { success: false, message: "Ödeme başarısız: " + error.message };
        }
    },

    // Yeni kullanıcı için ön kayıt doğrulaması 
    async validateRegistrationPayment(tempId: string | number): Promise<{ valid: boolean }> {
        try {
            if (!tempId) throw new Error("Geçici kayıt ID eksik.");
            console.log(`Geçici kayıt ID doğrulanıyor: ${tempId}`);
            // Gelecekte: const check = await api.fetch('VALIDATE', { tempId });
            return { valid: true };
        } catch (error) {
            console.error("Doğrulama hatası:", error);
            return { valid: false };
        }
    }
};