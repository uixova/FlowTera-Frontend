import { useState, useCallback, useEffect } from 'react';

export const usePagination = (serviceMethod, externalId, limit = 20) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    const loadData = useCallback(async (targetPage, isFirstLoad = false) => {
        try {
            if (isFirstLoad) setLoading(true);
            else setLoadingMore(true);

            // Servis metodunu çağırıyoruz (Örn: expenseService.getExpensesByTeam)
            const response = await serviceMethod(externalId, targetPage, limit);
            
            if (isFirstLoad) {
                setData(response.data);
            } else {
                setData(prev => [...prev, ...response.data]);
            }
            
            setHasMore(response.hasMore);
            setTotalCount(response.totalCount ?? 0);
        } catch (error) {
            console.error("Pagination Hook Error:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [serviceMethod, externalId, limit]);

    // ID değişirse (takım değişirse) her şeyi sıfırla ve baştan yükle
    useEffect(() => {
        setPage(1);
        loadData(1, true);
    }, [externalId, loadData]);

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadData(nextPage, false);
        }
    };

    return { data, loading, loadingMore, hasMore, loadMore, setData, totalCount };
};