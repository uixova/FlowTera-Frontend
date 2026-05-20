import { api } from '../../../api/api';
import { User, Plan } from '@/types/types';

export interface UserSubscriptionResult extends NonNullable<User['subscription']> {
    planName: string;
    planDetails: Plan | null;
}

// Paginated veya düz array'den veriyi güvenle çıkar
const extractList = <T>(response: any): T[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    return [];
};

export const subscriptionService = {

    // Mevcut kullanıcı aboneliğini getir
    async getUserSubscription(userId: string | number): Promise<UserSubscriptionResult | null> {
        if (!userId) return null;

        const [usersResponse, plansResponse] = await Promise.all([
            api.users.getAll({ pageSize: 1000 }),
            api.plans.getAll()
        ]);

        const users = extractList<User>(usersResponse);
        const plans = Array.isArray(plansResponse)
            ? (plansResponse as Plan[])
            : extractList<Plan>(plansResponse);

        const user = users.find(u => String(u.id) === String(userId));
        if (!user || !user.subscription) return null;

        const userPlanId = user.subscription?.planId;
        const linkedPlan = plans.find(p => String(p.id) === String(userPlanId));

        return {
            ...user.subscription,
            planName: linkedPlan?.name || user.subscription?.plan || 'Free',
            planDetails: linkedPlan || null
        };
    },

    // Tüm mevcut planları getir 
    async getAvailablePlans(): Promise<Plan[]> {
        const response = await api.plans.getAll();
        const plans = Array.isArray(response)
            ? (response as Plan[])
            : extractList<Plan>(response);
        return [...plans].sort((a, b) => ((a as any).price ?? 0) - ((b as any).price ?? 0));
    },

    // Kullanıcının belirli bir feature'a erişimi var mı 
    async hasFeature(userId: string | number, featureKey: string): Promise<boolean> {
        if (!userId || !featureKey) return false;
        const subscription = await this.getUserSubscription(userId);
        return subscription?.feature_keys?.includes(featureKey) ?? false;
    },

    // Abonelik güncelleme (simülasyon) 
    async updateSubscription(userId: string | number, planId: string | number): Promise<{ success: boolean; message: string }> {
        if (!userId || !planId) return { success: false, message: "Eksik parametre." };
        // Gelecekte: return await api.fetch('USERS', {}, { method: 'PATCH', body: { planId } });
        console.log(`[API UPDATE] User: ${userId} → Plan: ${planId}`);
        return { success: true, message: "Abonelik güncellendi." };
    },

    // Abonelik iptali (simülasyon) 
    async cancelSubscription(userId: string | number): Promise<{ success: boolean; message: string }> {
        if (!userId) return { success: false, message: "Kullanıcı kimliği eksik." };
        // Gelecekte: return await api.fetch('USERS', {}, { method: 'DELETE' });
        console.log(`[API DELETE] User: ${userId} aboneliği iptal edildi.`);
        return { success: true, message: "Abonelik iptal edildi." };
    }
};