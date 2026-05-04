import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api/api';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentPlan = useMemo(
        () => plans.find(p => p.id === currentUser?.subscription?.planId) ?? null,
        [plans, currentUser?.subscription?.planId]
    );

    useEffect(() => {
        const fetchPlanData = async () => {
            try {
                const data = await api.plans.getAll();
                if (data) setPlans(data.sort((a, b) => a.order - b.order));
            } catch (err) {
                console.error('Plan fetch error:', err);
                setError(err?.message || 'Plan verisi alınamadı.');
            } finally {
                setLoading(false);
            }
        };
        fetchPlanData();
    }, []);

    const hasFeature = useCallback((featureKey) => {
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
export const useSubscription = () => useContext(SubscriptionContext);