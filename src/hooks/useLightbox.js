import { useState, useCallback } from 'react';

export const useImageBox = () => {
    const [isImageMaximized, setIsImageMaximized] = useState(false);

    // Resim açma/kapama durumunu yönetmek için tek bir fonksiyon
    const handleImageToggle = useCallback((state, openAction = null, closeAction = null) => {
        setIsImageMaximized(state);
        
        if (state) {
            // Resim açıldığında yapılacak ek işlemler (örneğin, arka paneli kapatmak) için openAction fonksiyonunu çağırıyoruz
            if (openAction) openAction();
        } else {
            // Resim kapandığında yapılacak ek işlemler (örneğin, arka paneli tekrar açmak) için closeAction fonksiyonunu çağırıyoruz
            if (closeAction) closeAction();
        }
    }, []);

    // Sidebar'ın kapanmasını engellemek için orijinal onClose fonksiyonunu saran bir fonksiyon
    const wrapSidebarClose = useCallback((originalOnClose) => {
        return (...args) => {
            if (isImageMaximized) return;
            if (originalOnClose) originalOnClose(...args);
        };
    }, [isImageMaximized]);

    return {
        isImageMaximized,
        handleImageToggle,
        wrapSidebarClose
    };
};