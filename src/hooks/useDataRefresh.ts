// hooks/useDataRefresh.ts
type Listener = () => void;
const listeners = new Set<Listener>();

// Hook olmayan, servislerde kullanılabilir yardımcı fonksiyonlar
export const dataEvents = {
    subscribe: (callback: Listener) => {
        listeners.add(callback);
        return () => { listeners.delete(callback); };
    },
    notify: () => {
        listeners.forEach(callback => callback());
    }
};

// Bileşenlerde dinlemek için kullanılacak olan gerçek Hook
import { useEffect } from 'react';
export const useSubscribeToRefresh = (callback: () => void) => {
    useEffect(() => {
        return dataEvents.subscribe(callback);
    }, [callback]);
};