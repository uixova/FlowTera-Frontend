import { useCallback } from 'react';

export const useCurrency = () => {
    const convert = useCallback((item, teamCurrency) => {
        const amount = parseFloat(item.amount) || 0;
        const itemCurrency = item.currency || 'USD';

        // Eğer para birimleri aynıysa direkt miktarı dön
        if (itemCurrency === teamCurrency) return amount;

        // Kaydın kendi içindeki o günkü kurları kontrol et (ExchangeRates)
        const recordRates = item.exchangeRates;
        if (recordRates && recordRates[itemCurrency] && recordRates[teamCurrency]) {
            return (amount / recordRates[itemCurrency]) * recordRates[teamCurrency];
        }

        // Eğer kayıtta kur yoksa localStorage'daki güncel kurları kullan
        const rawRates = localStorage.getItem('tm_saved_rates');
        if (rawRates) {
            const rates = JSON.parse(rawRates);
            const amountInBase = amount / (rates[itemCurrency] || 1);
            return amountInBase * (rates[teamCurrency] || 1);
        }

        return amount;
    }, []);

    const format = useCallback((value, currency) => {
        return value.toLocaleString('en-US', { 
            style: 'currency', 
            currency: currency || 'USD' 
        });
    }, []);

    const formatMonthYear = useCallback((date = new Date()) => {
        return date.toLocaleString('tr-TR', { month: 'long', year: 'numeric' });
    }, []);

    return { convert, format, formatMonthYear };
};