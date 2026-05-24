import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api/api';
import planFallback from '../data/plan.json';

interface SubscriptionContextType {
    plans: any[];
    currentPlan: any | null;
    hasFeature: (featureKey: string) => boolean;
    loading: boolean;
    error: string | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
    children: React.ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
    const { currentUser } = useAuth() as any; // AuthContext'ten gelen veri için esnek koruma
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error] = useState<string | null>(null);

    const currentPlan = useMemo(() => {
        if (!plans.length || !currentUser?.subscription) return null;
        const sub = currentUser.subscription;
        // Match by planId, badge, or plan name (case-insensitive)
        return plans.find(p =>
            (sub.planId && p.id === sub.planId) ||
            (sub.badge  && p.badge === sub.badge) ||
            (sub.plan   && p.name.toLowerCase() === sub.plan.toLowerCase()) ||
            (sub.plan   && p.badge?.toLowerCase() === sub.plan.toLowerCase())
        ) ?? null;
    }, [plans, currentUser?.subscription]);

    useEffect(() => {
        const fetchPlanData = async () => {
            try {
                const res  = await api.plans.getAll();
                const data = (res as any)?.data ?? res;
                if (Array.isArray(data) && data.length > 0) {
                    setPlans(data.sort((a: any, b: any) => a.order - b.order));
                } else {
                    setPlans([...planFallback].sort((a, b) => (a.order || 0) - (b.order || 0)));
                }
            } catch {
                setPlans([...planFallback].sort((a, b) => (a.order || 0) - (b.order || 0)));
            } finally {
                setLoading(false);
            }
        };
        fetchPlanData();
    }, []);

    const hasFeature = useCallback((featureKey: string): boolean => {
        if (!currentPlan?.feature_keys) return false;
        return currentPlan.feature_keys.includes(featureKey);
    }, [currentPlan]);

    const value = useMemo(() => ({
        plans,
        currentPlan,
        hasFeature,
        loading,
        error,
    }), [plans, currentPlan, hasFeature, loading, error]);

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};