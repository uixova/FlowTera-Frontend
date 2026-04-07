import React, { createContext, useState, useContext } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
    // Session veya Local storage'dan kullanıcı tercihini al
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        return sessionStorage.getItem('selectedCurrency') || 'USD';
    });

    // Sembolleri merkezi yönetelim
    const symbols = {
        USD: '$',
        TRY: '₺',
        EUR: '€',
        GBP: '£'
    };

    // KRİTİK HESAPLAMA MOTORU
    const convertAmount = (expense) => {
        const { localAmount, localCurrency, exchangeRates, amount} = expense;
        
        // Eğer seçilen kur, harcamanın yapıldığı orijinal kur (localCurrency) ile aynıysa 
        // Direkt orijinal rakamı döndür 
        if (selectedCurrency === localCurrency) {
            return localAmount;
        }

        // Eğer harcama objesinde exchangeRates yoksa (eski veriler için fallback)
        if (!exchangeRates) return amount;

        // Matematik: (Orijinal Miktar / Orijinal Birimin Kuru) * Seçilen Birimin Kuru
        // Not: exchangeRates içindeki değerler 1 USD bazlıdır.
        const baseInUSD = localAmount / exchangeRates[localCurrency];
        const targetValue = baseInUSD * exchangeRates[selectedCurrency];

        return targetValue;
    };

    const updateCurrency = (code) => {
        setSelectedCurrency(code);
        sessionStorage.setItem('selectedCurrency', code);
    };

    return (
        <CurrencyContext.Provider value={{ 
            selectedCurrency, 
            updateCurrency, 
            convertAmount, 
            symbol: symbols[selectedCurrency] || selectedCurrency 
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};


// eslint-disable-next-line react-refresh/only-export-components
export const useCurrency = () => useContext(CurrencyContext);