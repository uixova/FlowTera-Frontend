import { useState, useEffect, useMemo, useCallback } from 'react';

export const useFilter = <T extends Record<string, any>>(
    data: T[] | null | undefined, 
    initialFilters: Record<string, any>, 
    searchFields: string[] = ['title'], 
    externalSearchTerm: string | null = null
) => {
    const [internalSearchTerm, setInternalSearchTerm] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');
    const [tempFilters, setTempFilters] = useState<Record<string, any>>(initialFilters || {});
    const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>(initialFilters || {});

    const currentSearchTerm = externalSearchTerm !== null ? externalSearchTerm : internalSearchTerm;

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(currentSearchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [currentSearchTerm]);

    const normalizeDate = useCallback((date: any): number | null => {
        if (!date) return null;
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    }, []);

    const parseCustomDate = useCallback((dateStr: any): number | null => {
        if (!dateStr) return null;
        if (typeof dateStr === 'string' && dateStr.includes('T')) return normalizeDate(dateStr);
        if (typeof dateStr === 'string' && dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/');
            return normalizeDate(new Date(Number(year), Number(month) - 1, Number(day)));
        }
        return normalizeDate(dateStr);
    }, [normalizeDate]);

    const cleanNumber = (val: any): number => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        return parseInt(String(val).replace(/[^0-9]/g, '')) || 0;
    };

    const filteredData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];

        return data.filter(item => {
            const matchesSearch = debouncedSearch === '' || searchFields.some(field => 
                String(item[field] || '').toLowerCase().includes(debouncedSearch.toLowerCase())
            );

            const matchesFilters = Object.keys(appliedFilters).every(key => {
                const val = appliedFilters[key];
                if (val === undefined || val === null || val === '') return true;

                if (key === 'startDate') return (parseCustomDate(item.startDate || item.date) ?? 0) >= (normalizeDate(val) ?? 0);
                if (key === 'endDate') return (parseCustomDate(item.endDate || item.date) ?? 0) <= (normalizeDate(val) ?? 0);

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
        searchTerm: currentSearchTerm, 
        setSearchTerm: setInternalSearchTerm,
        tempFilters, 
        setTempFilters,
        appliedFilters, 
        filteredData,
        applyFilters: () => setAppliedFilters({ ...tempFilters }),
        clearFilters: () => {
            setTempFilters(initialFilters || {});
            setAppliedFilters(initialFilters || {});
            setInternalSearchTerm('');
        }
    };
};