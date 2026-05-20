import { useState, useCallback } from 'react';

// Modal tipleri için ortak bir tip tanımı
type ModalType = 'info' | 'warning' | 'success' | 'error' | string;

interface AlertConfig {
    isOpen: boolean;
    title: string;
    message: string;
    type: ModalType;
    onClose: (() => void) | null;
}

interface ConfirmConfig {
    isOpen: boolean;
    title: string;
    message: string;
    type: ModalType;
    onConfirm: () => void;
}

export const useModal = () => {
    // Alert State'i
    const [alertConfig, setAlertConfig] = useState<AlertConfig>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onClose: null
    });

    // Confirm State'i
    const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>({
        isOpen: false,
        title: '',
        message: '',
        type: 'warning',
        onConfirm: () => {}
    });

    // Alert'i tetikleyen fonksiyon
    const showAlert = useCallback((
        title: string, 
        message: string, 
        type: ModalType = 'info', 
        callback: (() => void) | null = null
    ) => {
        setAlertConfig({
            isOpen: true,
            title,
            message,
            type,
            onClose: callback
        });
    }, []);

    // Confirm'i tetikleyen fonksiyon
    const askConfirm = useCallback((
        title: string, 
        message: string, 
        onConfirm: () => void, 
        type: ModalType = 'warning'
    ) => {
        setConfirmConfig({
            isOpen: true,
            title,
            message,
            type,
            onConfirm
        });
    }, []);

    // Kapatma fonksiyonları
    const closeAlert = useCallback(() => {
        setAlertConfig(prev => {
            if (prev.onClose) prev.onClose();
            return { ...prev, isOpen: false };
        });
    }, []);

    const closeConfirm = useCallback(() => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
    }, []);

    return {
        alertConfig,
        confirmConfig,
        showAlert,
        askConfirm,
        closeAlert,
        closeConfirm
    };
};