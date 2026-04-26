import React, { createContext, useState, useContext, useCallback } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        return sessionStorage.getItem('selectedCurrency') || 'USD';
    });

    const symbols = { USD: '$', TRY: '₺', EUR: '€', GBP: '£' };

    // Para birimi güncelleme
    const updateCurrency = useCallback((code) => {
        setSelectedCurrency(code);
        sessionStorage.setItem('selectedCurrency', code);
    }, []);

    // MERKEZİ DÖNÜŞTÜRME (Analysis ve Listeler için)
    const convert = useCallback((item, targetCurrency) => {
        const amount = parseFloat(item.amount) || 0;
        const itemCurrency = item.currency || 'USD';

        if (itemCurrency === targetCurrency) return amount;

        // Kayıt içindeki kurları kullan 
        const recordRates = item.exchangeRates;
        if (recordRates && recordRates[itemCurrency] && recordRates[targetCurrency]) {
            return (amount / recordRates[itemCurrency]) * recordRates[targetCurrency];
        }

        // Fallback: LocalStorage'daki genel kurları kullan
        const rawRates = localStorage.getItem('tm_saved_rates');
        if (rawRates) {
            const rates = JSON.parse(rawRates);
            const amountInBase = amount / (rates[itemCurrency] || 1);
            return amountInBase * (rates[targetCurrency] || 1);
        }

        return amount;
    }, []);

    // MERKEZİ FORMATLAMA
    const format = useCallback((value, currency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || selectedCurrency,
        }).format(value || 0);
    }, [selectedCurrency]);

    return (
        <CurrencyContext.Provider value={{ 
            selectedCurrency, 
            updateCurrency, 
            convert, 
            format,
            symbol: symbols[selectedCurrency] || selectedCurrency 
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCurrency = () => useContext(CurrencyContext);