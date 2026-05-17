import { useState, useCallback } from 'react';

export const useModal = () => {
    // Alert State'i
    const [alertConfig, setAlertConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onClose: null
    });

    // Confirm State'i
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'warning',
        onConfirm: () => {}
    });

    // Alert'i tetikleyen fonksiyon
    const showAlert = useCallback((title, message, type = 'info', callback = null) => {
        setAlertConfig({
            isOpen: true,
            title,
            message,
            type,
            onClose: callback
        });
    }, []);

    // Confirm'i tetikleyen fonksiyon
    const askConfirm = useCallback((title, message, onConfirm, type = 'warning') => {
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