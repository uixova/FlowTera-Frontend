import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api/api';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    // Kullanıcıyı planId üzerinden eşleştiriyoruz (user.json'daki subscription.planId)
    const currentPlan = plans.find(p => p.id === currentUser?.subscription?.planId);

    useEffect(() => {
        const fetchPlanData = async () => {
            const data = await api.plans.getAll();
            if (data) setPlans(data.sort((a, b) => a.order - b.order));
            setLoading(false);
        };
        fetchPlanData();
    }, []);

    // MERKEZİ KONTROL FONKSİYONU
    const hasFeature = (featureKey) => {
        if (!currentPlan || !currentPlan.feature_keys) return false;
        // Kullanıcının planındaki teknik anahtarlarda bu özellik var mı?
        return currentPlan.feature_keys.includes(featureKey);
    };

    const value = {
        plans,
        currentPlan,
        hasFeature, 
        loading
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSubscription = () => useContext(SubscriptionContext);