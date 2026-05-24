import { restFetch } from '../../../api/api';

export interface PaymentPayload {
    number?: string | number;
    name?: string;
    expiry?: string;
    cvc?: string | number;
    [key: string]: any;
}

export interface PaymentResult {
    success: boolean;
    message: string;
    planName?: string;
    details?: string;
}

export const paymentService = {

    // Ödeme işle — backend /payments/create-intent + simulate-success
    async processPayment(
        paymentData: PaymentPayload,
        userId: string | number,
        planId: string | number
    ): Promise<PaymentResult> {
        try {
            if (!userId) throw new Error('Kullanıcı kimliği eksik.');
            if (!planId) throw new Error('Plan kimliği eksik.');

            const result = await restFetch<{ status: string; data: any }>(
                `/payments/simulate-success`,
                { method: 'POST', body: { userId, planId, paymentData } }
            );

            const lastFour = paymentData?.number
                ? String(paymentData.number).slice(-4)
                : '****';

            return {
                success:  true,
                message:  'Abonelik aktif edildi!',
                planName: (result as any).data?.planName || '',
                details:  lastFour,
            };
        } catch (error: any) {
            return { success: false, message: 'Ödeme başarısız: ' + error.message };
        }
    },

    // Kayıt öncesi ödeme doğrulama
    async validateRegistrationPayment(tempId: string | number): Promise<{ valid: boolean }> {
        if (!tempId) return { valid: false };
        try {
            await restFetch(`/payments/validate`, { params: { tempId: String(tempId) } });
            return { valid: true };
        } catch {
            return { valid: false };
        }
    },
};
