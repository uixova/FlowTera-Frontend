import { restFetch } from '../../../api/api';
import { Plan } from '@/types/types';

export interface UserSubscriptionResult {
    planId:            string;
    plan:              string;
    maxTeams:          number;
    maxMembersPerTeam: number;
    usage:             { ocr: number; aiAnaliz: number };
    feature_keys?:     string[];
    planName:          string;
    planDetails:       Plan | null;
}

export const subscriptionService = {

    // Kullanıcı aboneliğini getir
    async getUserSubscription(userId: string | number): Promise<UserSubscriptionResult | null> {
        if (!userId) return null;
        try {
            const result = await restFetch<{ status: string; data: any }>(`/subscriptions/user/${userId}`);
            const sub    = (result as any).data ?? result;
            return {
                ...sub,
                planName:    sub.planName    || sub.plan || 'Free',
                planDetails: sub.planDetails || null,
            };
        } catch { return null; }
    },

    // Mevcut planları getir
    async getAvailablePlans(): Promise<Plan[]> {
        try {
            const result = await restFetch<{ status: string; data: Plan[] }>(`/plans`);
            const plans  = Array.isArray((result as any).data) ? (result as any).data : [];
            return [...plans].sort((a: Plan, b: Plan) => ((a as any).price ?? 0) - ((b as any).price ?? 0));
        } catch { return []; }
    },

    // Feature erişim kontrolü
    async hasFeature(userId: string | number, featureKey: string): Promise<boolean> {
        if (!userId || !featureKey) return false;
        const subscription = await this.getUserSubscription(userId);
        return subscription?.feature_keys?.includes(featureKey) ?? false;
    },

    // Plan yükselt
    async updateSubscription(userId: string | number, planId: string | number): Promise<{ success: boolean; message: string }> {
        if (!userId || !planId) return { success: false, message: 'Eksik parametre.' };
        try {
            await restFetch(`/subscriptions/user/${userId}`, { method: 'PATCH', body: { planId } });
            return { success: true, message: 'Abonelik güncellendi.' };
        } catch (err: any) {
            return { success: false, message: err.message || 'Abonelik güncellenemedi.' };
        }
    },

    // Abonelik iptal
    async cancelSubscription(userId: string | number): Promise<{ success: boolean; message: string }> {
        if (!userId) return { success: false, message: 'Kullanıcı kimliği eksik.' };
        try {
            await restFetch(`/subscriptions/user/${userId}`, { method: 'DELETE' });
            return { success: true, message: 'Abonelik iptal edildi.' };
        } catch (err: any) {
            return { success: false, message: err.message || 'Abonelik iptal edilemedi.' };
        }
    },
};
