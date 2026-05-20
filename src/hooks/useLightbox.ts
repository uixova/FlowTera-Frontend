import { useState, useCallback } from 'react';

export const useImageBox = () => {
    const [isImageMaximized, setIsImageMaximized] = useState<boolean>(false);

    // Resim açma/kapama durumunu yönetmek için tek bir fonksiyon
    const handleImageToggle = useCallback((
        state: boolean, 
        openAction: (() => void) | null = null, 
        closeAction: (() => void) | null = null
    ) => {
        setIsImageMaximized(state);
        
        if (state) {
            // Resim açıldığında yapılacak ek işlemler
            if (openAction) openAction();
        } else {
            // Resim kapandığında yapılacak ek işlemler
            if (closeAction) closeAction();
        }
    }, []);

    // Sidebar'ın kapanmasını engellemek için orijinal onClose fonksiyonunu saran bir fonksiyon
    const wrapSidebarClose = useCallback((originalOnClose?: (...args: any[]) => void) => {
        return (...args: any[]) => {
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