import { api } from '../../../api/api';

const extractList = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    return [];
};
export const subscriptionService = {

    // Mevcut kullanıcı aboneliğini getir
    getUserSubscription: async (userId) => {
        if (!userId) return null;

        const [usersResponse, plansResponse] = await Promise.all([
            api.users.getAll({ pageSize: 1000 }),
            api.plans.getAll()
        ]);

        const users = extractList(usersResponse);
        const plans = Array.isArray(plansResponse)
            ? plansResponse
            : extractList(plansResponse);

        const user = users.find(u => String(u.id) === String(userId));
        if (!user) return null;

        const userPlanId = user.subscription?.planId;
        const linkedPlan = plans.find(p => String(p.id) === String(userPlanId));

        return {
            ...user.subscription,
            planName: linkedPlan?.name || user.subscription?.plan || 'Free',
            planDetails: linkedPlan || null
        };
    },

    // Tüm mevcut planları getir 
    getAvailablePlans: async () => {
        const response = await api.plans.getAll();
        const plans = Array.isArray(response)
            ? response
            : extractList(response);
        return [...plans].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    },

    // Kullanıcının belirli bir feature'a erişimi var mı 
    hasFeature: async (userId, featureKey) => {
        if (!userId || !featureKey) return false;
        const subscription = await subscriptionService.getUserSubscription(userId);
        return subscription?.feature_keys?.includes(featureKey) ?? false;
    },

    // Abonelik güncelleme (simülasyon) 
    updateSubscription: async (userId, planId) => {
        if (!userId || !planId) return { success: false, message: "Eksik parametre." };
        // Gelecekte: return await api.fetch('USERS', {}, { method: 'PATCH', body: { planId } });
        console.log(`[API UPDATE] User: ${userId} → Plan: ${planId}`);
        return { success: true, message: "Abonelik güncellendi." };
    },

    // Abonelik iptali (simülasyon) 
    cancelSubscription: async (userId) => {
        if (!userId) return { success: false, message: "Kullanıcı kimliği eksik." };
        // Gelecekte: return await api.fetch('USERS', {}, { method: 'DELETE' });
        console.log(`[API DELETE] User: ${userId} aboneliği iptal edildi.`);
        return { success: true, message: "Abonelik iptal edildi." };
    }
};