import { useState, useCallback, useEffect } from 'react';

// Servis metodunun dışarıya döneceği response yapısı (senin paginated interface'inle uyumlu)
interface PaginationResponse<T> {
    data: T[];
    hasMore: boolean;
    total?: number;
    totalCount?: number; 
    [key: string]: any;
}

export const usePagination = <T>(
    serviceMethod: (id: any, page: number, limit: number) => Promise<PaginationResponse<T>>,
    externalId: any,
    limit: number = 20
) => {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [totalCount, setTotalCount] = useState<number>(0);

    const loadData = useCallback(async (targetPage: number, isFirstLoad: boolean = false) => {
        try {
            if (isFirstLoad) setLoading(true);
            else setLoadingMore(true);

            // Servis metodunu çağırıyoruz 
            const response = await serviceMethod(externalId, targetPage, limit);
            
            if (isFirstLoad) {
                setData(response.data);
            } else {
                setData(prev => [...prev, ...response.data]);
            }
            
            setHasMore(response.hasMore);
            setTotalCount(response.totalCount ?? response.total ?? 0);
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

    const refreshData = useCallback(() => {
        setPage(1);
        return loadData(1, true);
    }, [loadData]);

    return { data, loading, loadingMore, hasMore, loadMore, setData, totalCount, refreshData };
};