import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';

const CurrencyContext = createContext();

const CURRENCY_SYMBOLS = { USD: '$', TRY: '₺', EUR: '€', GBP: '£' };
const CURRENCY_STORAGE_KEY = 'selectedCurrency';
const RATES_STORAGE_KEY = 'tm_saved_rates';

export const CurrencyProvider = ({ children }) => {
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        return sessionStorage.getItem(CURRENCY_STORAGE_KEY) || 'USD';
    });

    const updateCurrency = useCallback((code) => {
        setSelectedCurrency(code);
        sessionStorage.setItem(CURRENCY_STORAGE_KEY, code);
    }, []);

    const convert = useCallback((item, targetCurrency) => {
        const amount = parseFloat(item.amount) || 0;
        const itemCurrency = item.currency || 'USD';

        if (itemCurrency === targetCurrency) return amount;

        // Önce kayıt içindeki kurları dene
        const recordRates = item.exchangeRates;
        if (recordRates?.[itemCurrency] && recordRates?.[targetCurrency]) {
            return (amount / recordRates[itemCurrency]) * recordRates[targetCurrency];
        }

        try {
            const rawRates = localStorage.getItem(RATES_STORAGE_KEY);
            if (rawRates) {
                const rates = JSON.parse(rawRates);
                const amountInBase = amount / (rates[itemCurrency] || 1);
                return amountInBase * (rates[targetCurrency] || 1);
            }
        } catch {
            console.warn('Currency rates parse error — falling back to original amount.');
        }

        return amount;
    }, []);

    const format = useCallback((value, currency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || selectedCurrency,
        }).format(value || 0);
    }, [selectedCurrency]);

    const formatMonthYear = useCallback((date) => {
        const d = date instanceof Date ? date : new Date();
        return d.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    }, []);

    const value = useMemo(() => ({
        selectedCurrency,
        updateCurrency,
        convert,
        format,
        formatMonthYear,
        symbol: CURRENCY_SYMBOLS[selectedCurrency] || selectedCurrency,
    }), [selectedCurrency, updateCurrency, convert, format, formatMonthYear]);

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCurrency = () => useContext(CurrencyContext);