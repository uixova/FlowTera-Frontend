import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './Archive.css';
import { archiveService } from './services/archiveServices';
import Loader from '../../components/ui/Loader';
import { useTeam } from '../../context/TeamContext';
import { useCurrency } from '../../context/CurrencyContext';
import ArchiveGrid from './components/ArchiveGrid';
import ArchiveTimeline from './components/ArchiveTimeline';
import ActionSidebar from '../../components/navigation/ActionSidebar';
import BackToTop from '../../components/ui/BackToTop';

import PaginationFooter from '../../components/ui/PaginationFooter';
import { usePagination } from '../../hooks/usePagination';

const NAV_ITEM_DEFS = [
    { id: 'all',      labelKey: 'nav_all',      icon: 'ti-archive'         },
    { id: 'expense',  labelKey: 'nav_expense',  icon: 'ti-credit-card'     },
    { id: 'trip',     labelKey: 'nav_trip',     icon: 'ti-plane-departure' },
    { id: 'approved', labelKey: 'nav_approved', icon: 'ti-circle-check'    },
    { id: 'pending',  labelKey: 'nav_pending',  icon: 'ti-clock'           },
    { id: 'rejected', labelKey: 'nav_rejected', icon: 'ti-circle-x'        },
    { id: 'invoices', labelKey: 'nav_invoices', icon: 'ti-photo'           },
];

const SORT_ITEM_DEFS = [
    { id: 'newest', labelKey: 'sort_newest', icon: 'ti-sort-descending' },
    { id: 'oldest', labelKey: 'sort_oldest', icon: 'ti-sort-ascending'  },
    { id: 'amount', labelKey: 'sort_amount', icon: 'ti-coins'           },
];

const Archive = () => {
    const { t } = useTranslation('archive');
    const { selectedTeamId } = useTeam();
    const { symbol }         = useCurrency();

    const [rawData,          setRawData]          = useState({ expenses: { data: [] }, trips: { data: [] } });
    const [loading,          setLoading]          = useState(true);
    const [activeTab,        setActiveTab]        = useState('all');
    const [viewMode,         setViewMode]         = useState('timeline');
    const [sort,             setSort]             = useState('newest');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [filterOpen,       setFilterOpen]       = useState(false);

    // Ana veriyi API'den çekme
    const loadData = useCallback(async () => {
        if (!selectedTeamId) return;
        setLoading(true);
        try {
            const result = await archiveService.getArchiveData({ teamId: selectedTeamId });
            setRawData(result || { expenses: { data: [] }, trips: { data: [] } });
        } catch (err) {
            console.error('Arşiv yüklenemedi:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedTeamId]);

    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        const appContainer = document.querySelector('.app-container');
        if (appContainer) appContainer.classList.add('st-page-active');
        return () => appContainer?.classList.remove('st-page-active');
    }, []);

    // Tüm datayı birleştirme ve istatistik hesaplama 
    const allItems = useMemo(() => {
        const expenses = (rawData?.expenses?.data ?? []).map(e => ({ ...e, _type: 'expense' }));
        const trips    = (rawData?.trips?.data    ?? []).map(t => ({ ...t, _type: 'trip'    }));
        return [...expenses, ...trips];
    }, [rawData]);

    const counts = useMemo(() => ({
        all:      allItems.length,
        expense:  allItems.filter(i => i._type === 'expense').length,
        trip:     allItems.filter(i => i._type === 'trip').length,
        approved: allItems.filter(i => i.status?.toLowerCase() === 'approved').length,
        pending:  allItems.filter(i => ['pending', 'on road'].includes(i.status?.toLowerCase())).length,
        rejected: allItems.filter(i => i.status?.toLowerCase() === 'rejected').length,
        invoices: allItems.filter(i => i.receipt).length,
    }), [allItems]);

    const filtered = useMemo(() => {
        let items = allItems;
        switch (activeTab) {
            case 'expense':  items = items.filter(i => i._type === 'expense'); break;
            case 'trip':     items = items.filter(i => i._type === 'trip');    break;
            case 'approved': items = items.filter(i => i.status?.toLowerCase() === 'approved'); break;
            case 'pending':  items = items.filter(i => ['pending', 'on road'].includes(i.status?.toLowerCase())); break;
            case 'rejected': items = items.filter(i => i.status?.toLowerCase() === 'rejected'); break;
            case 'invoices': items = items.filter(i => i.receipt); break;
            default: break;
        }
        return [...items].sort((a, b) => {
            if (sort === 'amount') return (b.amount ?? 0) - (a.amount ?? 0);
            const dateA = new Date(a.date || a.startDate || 0).getTime();
            const dateB = new Date(b.date || b.startDate || 0).getTime();
            return sort === 'oldest' ? dateA - dateB : dateB - dateA;
        });
    }, [allItems, activeTab, sort]);

    const stats = useMemo(() => ({
        total: allItems.reduce((s, i) => s + (i.amount ?? 0), 0),
    }), [allItems]);

    // PAGINATION ENTEGRASYONU (Cascading Render Korumalı)
    
    // Sonsuz döngü (cascading render) olmaması için filtrelenmiş datayı ref'te tutuyoruz.
    const filteredRef = useRef([]);
    useEffect(() => {
        filteredRef.current = filtered;
    }, [filtered]);

    // Hook'un beklediği servis formatına uygun Lokal Slicer Servisi
    const localPaginationService = useCallback(async (triggerStr, targetPage, limit) => {
        const start = (targetPage - 1) * limit;
        const end = start + limit;
        const currentData = filteredRef.current;
        
        // React'in state'leri batchleyebilmesi için çok kısa bir bekleme süresi
        await new Promise(res => setTimeout(res, 50));

        return {
            data: currentData.slice(start, end),
            hasMore: end < currentData.length,
            totalCount: currentData.length
        };
    }, []); // Dependency array tamamen BOŞ. Bu sayede hook useEffect'ini tetikleyip patlatmaz.

    // Tab, sıralama veya ana veri değiştiğinde Pagination'ı 1. sayfaya sıfırlamak için trigger ID
    const paginationTriggerId = `${selectedTeamId}-${activeTab}-${sort}-${rawData.expenses.data.length}-${rawData.trips.data.length}`;

    // usePagination Hook'umuzu çağırıyoruz
    const {
        data: paginatedItems,
        loading: isPaginating,
        loadingMore,
        hasMore,
        loadMore,
        totalCount
    } = usePagination(localPaginationService, paginationTriggerId, 20);

    const handleTabSelect  = (id) => { setActiveTab(id); setFilterOpen(false); };
    const handleSortSelect = (id) => { setSort(id);      setFilterOpen(false); };

    // İlk yüklemede API'den veri beklenirken ana loader'ı göster
    if (loading) return (
        <div className="arc-loader-wrap">
            <Loader type="butterfly" />
        </div>
    );

    const NAV_ITEMS  = NAV_ITEM_DEFS.map(d => ({ ...d, label: t(d.labelKey) }));
    const SORT_ITEMS = SORT_ITEM_DEFS.map(d => ({ ...d, label: t(d.labelKey) }));

    const filterSidebarContent = (
        <div className="arc-filter-sidebar-content">
            <p className="arc-filter-section-label">{t('filter_cat')}</p>
            {NAV_ITEMS.map(item => (
                <button
                    key={item.id}
                    className={`arc-nav-btn${activeTab === item.id ? ' active' : ''}`}
                    onClick={() => handleTabSelect(item.id)}
                >
                    <i className={`ti ${item.icon}`} />
                    {item.label}
                    {counts[item.id] > 0 && (
                        <span className="arc-nav-count">{counts[item.id]}</span>
                    )}
                </button>
            ))}

            <hr className="arc-sidebar-divider" style={{ margin: '16px 0' }} />

            <p className="arc-filter-section-label">{t('filter_sort')}</p>
            {SORT_ITEMS.map(s => (
                <button
                    key={s.id}
                    className={`arc-nav-btn${sort === s.id ? ' active' : ''}`}
                    onClick={() => handleSortSelect(s.id)}
                >
                    <i className={`ti ${s.icon}`} />
                    {s.label}
                </button>
            ))}
        </div>
    );

    return (
        <div className="arc-wrapper" key={selectedTeamId}>
            <aside className={`arc-sidebar${sidebarCollapsed ? ' is-collapsed' : ''}`}>
                <span className="arc-sidebar-title">{t('sidebar_title')}</span>
                {NAV_ITEMS.map(item => (
                    <button
                        key={item.id}
                        className={`arc-nav-btn${activeTab === item.id ? ' active' : ''}`}
                        onClick={() => handleTabSelect(item.id)}
                    >
                        <i className={`ti ${item.icon}`} />
                        {item.label}
                        {counts[item.id] > 0 && (
                            <span className="arc-nav-count">{counts[item.id]}</span>
                        )}
                    </button>
                ))}
                <hr className="arc-sidebar-divider" />
                <span className="arc-sidebar-title">{t('sort_title')}</span>
                {SORT_ITEMS.map(s => (
                    <button
                        key={s.id}
                        className={`arc-nav-btn${sort === s.id ? ' active' : ''}`}
                        onClick={() => handleSortSelect(s.id)}
                    >
                        <i className={`ti ${s.icon}`} />
                        {s.label}
                    </button>
                ))}
            </aside>

            <main className="arc-main">
                <header className="arc-header">
                    <div className="arc-header-left">
                        <span className="arc-breadcrumb">
                            {t('breadcrumb')} <i className="ti ti-chevron-right" /> {t('sidebar_title')}
                        </span>
                        <h1 className="arc-title">
                            {NAV_ITEMS.find(n => n.id === activeTab)?.label ?? t('sidebar_title')}
                        </h1>
                        <p className="arc-subtitle">{filtered.length} {t('records_count')}</p>
                    </div>

                    <div className="arc-header-right">
                        <button className="arc-sidebar-toggle" onClick={() => setSidebarCollapsed(v => !v)}>
                            <i className={`ti ${sidebarCollapsed ? 'ti-layout-sidebar' : 'ti-layout-sidebar-left-collapse'}`} />
                            <span>{sidebarCollapsed ? t('btn_filters') : t('btn_hide')}</span>
                        </button>
                        <button className="arc-mobile-filter-btn" onClick={() => setFilterOpen(true)}>
                            <i className="ti ti-adjustments-horizontal" />
                            <span>{t('btn_filter')}</span>
                            {activeTab !== 'all' && <span className="arc-filter-active-dot" />}
                        </button>
                        <div className="arc-view-toggle">
                            <button className={`arc-view-btn${viewMode === 'timeline' ? ' active' : ''}`} onClick={() => setViewMode('timeline')}>
                                <i className="ti ti-layout-list" />
                            </button>
                            <button className={`arc-view-btn${viewMode === 'grid' ? ' active' : ''}`} onClick={() => setViewMode('grid')}>
                                <i className="ti ti-layout-grid" />
                            </button>
                        </div>
                        <button className="arc-action-btn" onClick={loadData}>
                            <i className="ti ti-refresh" />
                            <span>{t('btn_refresh')}</span>
                        </button>
                    </div>
                </header>

                <div className="arc-stats-bar">
                    <div className="arc-stat-item">
                        <span className="arc-stat-label">{t('stat_total')}</span>
                        <span className="arc-stat-value accent">{allItems.length}</span>
                    </div>
                    <div className="arc-stat-item">
                        <span className="arc-stat-label">{t('stat_amount')}</span>
                        <span className="arc-stat-value">
                            {symbol}{stats.total.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
                        </span>
                    </div>
                    <div className="arc-stat-item">
                        <span className="arc-stat-label">{t('stat_approved')}</span>
                        <span className="arc-stat-value success">{counts.approved}</span>
                    </div>
                    <div className="arc-stat-item">
                        <span className="arc-stat-label">{t('stat_pending')}</span>
                        <span className="arc-stat-value warning">{counts.pending}</span>
                    </div>
                    <div className="arc-stat-item">
                        <span className="arc-stat-label">{t('stat_rejected')}</span>
                        <span className="arc-stat-value danger">{counts.rejected}</span>
                    </div>
                    <div className="arc-stat-item">
                        <span className="arc-stat-label">{t('stat_invoiced')}</span>
                        <span className="arc-stat-value">{counts.invoices}</span>
                        <span className="arc-stat-sub">{t('stat_visual')}</span>
                    </div>
                </div>

                {/* İçerik Alanı */}
                <div className="arc-scroll">
                    {paginatedItems.length === 0 && !isPaginating ? (
                        <div className="arc-empty">
                            <div className="arc-empty-icon">
                                <i className="ti ti-archive-off" />
                            </div>
                            <h3>{t('not_found')}</h3>
                            <p>{t('not_found_sub')}</p>
                        </div>
                    ) : (
                        <>
                            {viewMode === 'grid' ? (
                                <ArchiveGrid items={paginatedItems} symbol={symbol} />
                            ) : (
                                <ArchiveTimeline items={paginatedItems} symbol={symbol} />
                            )}
                            
                            {/* Pagination Butonu */}
                            {paginatedItems.length > 0 && (
                                <PaginationFooter
                                    hasMore={hasMore}
                                    loadingMore={loadingMore}
                                    loadMore={loadMore}
                                    currentCount={paginatedItems.length}
                                    totalCount={totalCount}
                                    label={t('record_label')}
                                />
                            )}
                        </>
                    )}
                </div>
            </main>

            <ActionSidebar isOpen={filterOpen} onClose={() => setFilterOpen(false)} title={t('filter_title')} width="280px">
                {filterSidebarContent}
            </ActionSidebar>
            <BackToTop 
                scrollContainerSelector=".arc-scroll" 
                scrollThreshold={300} 
            />
        </div>
    );
};

export default Archive;