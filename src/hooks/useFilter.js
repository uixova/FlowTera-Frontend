import { useState, useEffect, useMemo, useCallback } from 'react';

// externalSearchTerm ve onExternalSearchChange ekledik (opsiyonel)
export const useFilter = (data, initialFilters, searchFields = ['title'], externalSearchTerm = null) => {
    const [internalSearchTerm, setInternalSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [tempFilters, setTempFilters] = useState(initialFilters || {});
    const [appliedFilters, setAppliedFilters] = useState(initialFilters || {});

    // Eğer dışarıdan bir term geliyorsa onu kullan, gelmiyorsa hook'un içindekini
    const currentSearchTerm = externalSearchTerm !== null ? externalSearchTerm : internalSearchTerm;

    // Debounce mekanizması her zaman "aktif" olan term'i dinler
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(currentSearchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [currentSearchTerm]);

    const normalizeDate = useCallback((date) => {
        if (!date) return null;
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    }, []);

    // Tarih formatlarını normalize eden yardımcı fonksiyon
    const parseCustomDate = useCallback((dateStr) => {
        if (!dateStr) return null;
        if (typeof dateStr === 'string' && dateStr.includes('T')) return normalizeDate(dateStr);
        if (typeof dateStr === 'string' && dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/');
            return normalizeDate(new Date(year, month - 1, day));
        }
        return normalizeDate(dateStr);
    }, [normalizeDate]);

    // Sadece sayısal değerleri temizleyen yardımcı fonksiyon
    const cleanNumber = (val) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        return parseInt(String(val).replace(/[^0-9]/g, '')) || 0;
    };

    // Filtrelenmiş veriyi hesaplayan memoize edilmiş fonksiyon
    const filteredData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];

        return data.filter(item => {
            // Arama terimi kontrolü
            const matchesSearch = debouncedSearch === '' || searchFields.some(field => 
                String(item[field] || '').toLowerCase().includes(debouncedSearch.toLowerCase())
            );

            // Uygulanan filtrelerin kontrolü
            const matchesFilters = Object.keys(appliedFilters).every(key => {
                const val = appliedFilters[key];
                if (val === undefined || val === null || val === '') return true;

                if (key === 'startDate') return parseCustomDate(item.startDate || item.date) >= normalizeDate(val);
                if (key === 'endDate') return parseCustomDate(item.endDate || item.date) <= normalizeDate(val);

                if (key.startsWith('min')) {
                    const field = key.slice(3).charAt(0).toLowerCase() + key.slice(4);
                    return cleanNumber(item[field]) >= Number(val);
                }
                if (key.startsWith('max')) {
                    const field = key.slice(3).charAt(0).toLowerCase() + key.slice(4);
                    return cleanNumber(item[field]) <= Number(val);
                }

                return String(item[key] || '').toLowerCase() === String(val).toLowerCase();
            });

            return matchesSearch && matchesFilters;
        });
    }, [data, debouncedSearch, appliedFilters, searchFields, parseCustomDate, normalizeDate]);

    return {
        // Eğer dışarıdan yönetiliyorsa dışarıdaki state döner, yoksa içerdeki
        searchTerm: currentSearchTerm, 
        setSearchTerm: setInternalSearchTerm,
        tempFilters, setTempFilters,
        appliedFilters, filteredData,
        applyFilters: () => setAppliedFilters({ ...tempFilters }),
        clearFilters: () => {
            setTempFilters(initialFilters || {});
            setAppliedFilters(initialFilters || {});
            setInternalSearchTerm('');
        }
    };
};