import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';
import i18n from '../locales/i18n';

interface CurrencyContextType {
    selectedCurrency: string;
    updateCurrency: (code: string) => void;
    convert: (item: any, targetCurrency: string) => number;
    format: (value: number, currency?: string) => string;
    formatMonthYear: (date?: Date | string | null) => string;
    symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', TRY: '₺',
    JPY: '¥', CHF: 'Fr', CAD: 'C$', AUD: 'A$',
    CNY: '¥', INR: '₹',
};
const CURRENCY_STORAGE_KEY = 'selectedCurrency';
const RATES_STORAGE_KEY    = 'tm_saved_rates';
const RATES_TTL_KEY        = 'tm_rates_ttl';
const RATES_TTL_MS         = 4 * 60 * 60 * 1000; // 4 hours
const RATES_API            = 'https://api.frankfurter.dev/v1/latest?base=USD';

interface CurrencyProviderProps {
    children: React.ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
    const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
        return sessionStorage.getItem(CURRENCY_STORAGE_KEY) || 'USD';
    });

    // Fetch live exchange rates from Frankfurter (ECB data, no API key required)
    useEffect(() => {
        const shouldFetch = () => {
            const ttl = localStorage.getItem(RATES_TTL_KEY);
            return !ttl || Date.now() > parseInt(ttl, 10);
        };

        if (!shouldFetch()) return;

        fetch(RATES_API)
            .then(r => r.json())
            .then(data => {
                if (data?.rates) {
                    const rates: Record<string, number> = { USD: 1, ...data.rates };
                    localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(rates));
                    localStorage.setItem(RATES_TTL_KEY, String(Date.now() + RATES_TTL_MS));
                }
            })
            .catch(() => {/* silently fail — use cached or record rates */});
    }, []);

    const updateCurrency = useCallback((code: string) => {
        setSelectedCurrency(code);
        sessionStorage.setItem(CURRENCY_STORAGE_KEY, code);
    }, []);

    const convert = useCallback((item: any, targetCurrency: string): number => {
        const amount = parseFloat(item.amount) || 0;
        const itemCurrency = item.currency || 'USD';

        if (itemCurrency === targetCurrency) return amount;

        // Build a merged rate table: global rates as base, record rates override (more precise)
        let rates: Record<string, number> = { USD: 1 };
        try {
            const raw = localStorage.getItem(RATES_STORAGE_KEY);
            if (raw) Object.assign(rates, JSON.parse(raw));
        } catch { /* ignore */ }

        // Record-level rates (stored at transaction time) take priority
        const recordRates = item.exchangeRates;
        if (recordRates && typeof recordRates === 'object') {
            Object.assign(rates, recordRates);
        }

        const fromRate = rates[itemCurrency];
        const toRate   = rates[targetCurrency];
        if (fromRate && toRate) {
            return (amount / fromRate) * toRate;
        }

        return amount;
    }, []);

    const format = useCallback((value: number, currency?: string): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || selectedCurrency,
        }).format(value || 0);
    }, [selectedCurrency]);

    const formatMonthYear = useCallback((date?: Date | string | null): string => {
        const d = date instanceof Date ? date : (date ? new Date(date) : new Date());
        return d.toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { month: 'long', year: 'numeric' });
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
export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};