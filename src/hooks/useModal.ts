import { useState, useCallback, useRef } from 'react';

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
    const alertCallbackRef = useRef<(() => void) | null>(null);

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
        alertCallbackRef.current = callback;
        setAlertConfig({
            isOpen: true,
            title,
            message,
            type,
            onClose: null,
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
        const cb = alertCallbackRef.current;
        alertCallbackRef.current = null;
        setAlertConfig(prev => ({ ...prev, isOpen: false }));
        if (cb) cb();
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