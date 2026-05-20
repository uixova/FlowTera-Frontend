import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api/api';

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
    const [error, setError] = useState<string | null>(null);

    const currentPlan = useMemo(
        () => plans.find(p => p.id === currentUser?.subscription?.planId) ?? null,
        [plans, currentUser?.subscription?.planId]
    );

    useEffect(() => {
        const fetchPlanData = async () => {
            try {
                const data = await api.plans.getAll();
                if (data) setPlans(data.sort((a: any, b: any) => a.order - b.order));
            } catch (err: any) {
                console.error('Plan fetch error:', err);
                setError(err?.message || 'Plan verisi alınamadı.');
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