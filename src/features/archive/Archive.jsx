import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Archive.css';
import { archiveService } from './services/archiveServices';
import Loader from '../../components/ui/Loader';
import { useTeam } from '../../context/TeamContext';
import { useCurrency } from '../../context/CurrencyContext';
import ArchiveGrid from './components/ArchiveGrid';
import ArchiveTimeline from './components/ArchiveTimeline';
import ImageBox from '../../components/overlays/imageBox/ImageBox';

// Filtre kategorileri — sidebar için
const NAV_ITEMS = [
    { id: 'all',      label: 'Tümü',        icon: 'ti-archive'           },
    { id: 'expense',  label: 'Harcamalar',  icon: 'ti-credit-card'       },
    { id: 'trip',     label: 'Seyahatler',  icon: 'ti-plane-departure'   },
    { id: 'approved', label: 'Onaylananlar', icon: 'ti-circle-check'     },
    { id: 'pending',  label: 'Bekleyenler', icon: 'ti-clock'             },
    { id: 'rejected', label: 'Reddedilenler', icon: 'ti-circle-x'        },
    { id: 'invoices', label: 'Faturalar',   icon: 'ti-photo'             },
];

const Archive = () => {
    const { selectedTeamId } = useTeam();
    const { symbol }         = useCurrency();

    const [rawData, setRawData]   = useState({ expenses: { data: [] }, trips: { data: [] } });
    const [loading, setLoading]   = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [viewMode, setViewMode] = useState('timeline'); // 'grid', 'timeline'
    const [sort, setSort]         = useState('newest'); // 'newest', 'oldest', 'amount'

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

    // Takım değişince veriyi yenile
    useEffect(() => { loadData(); }, [loadData]);

    // AppContainer sınıfı disable/enable
    useEffect(() => {
            const appContainer = document.querySelector('.app-container');
            if (appContainer) appContainer.classList.add('st-page-active');
            return () => appContainer?.classList.remove('st-page-active');
        }, []);

    // Tüm kalemleri tip etiketiyle birleştir
    const allItems = useMemo(() => {
        const expenses = (rawData?.expenses?.data ?? []).map(e => ({ ...e, _type: 'expense' }));
        const trips    = (rawData?.trips?.data    ?? []).map(t => ({ ...t, _type: 'trip'    }));
        return [...expenses, ...trips];
    }, [rawData]);

    // Sidebar sayaçları
    const counts = useMemo(() => ({
        all:      allItems.length,
        expense:  allItems.filter(i => i._type === 'expense').length,
        trip:     allItems.filter(i => i._type === 'trip').length,
        approved: allItems.filter(i => i.status?.toLowerCase() === 'approved').length,
        pending:  allItems.filter(i => ['pending', 'on road'].includes(i.status?.toLowerCase())).length,
        rejected: allItems.filter(i => i.status?.toLowerCase() === 'rejected').length,
        invoices: allItems.filter(i => i.image).length,
    }), [allItems]);

    // Aktif sekmeye göre filtrele
    const filtered = useMemo(() => {
        let items = allItems;
        switch (activeTab) {
            case 'expense':  items = items.filter(i => i._type === 'expense'); break;
            case 'trip':     items = items.filter(i => i._type === 'trip');    break;
            case 'approved': items = items.filter(i => i.status?.toLowerCase() === 'approved'); break;
            case 'pending':  items = items.filter(i => ['pending', 'on road'].includes(i.status?.toLowerCase())); break;
            case 'rejected': items = items.filter(i => i.status?.toLowerCase() === 'rejected'); break;
            case 'invoices': items = items.filter(i => i.image); break;
            default: break;
        }

        // Sıralama
        return [...items].sort((a, b) => {
            if (sort === 'amount')  return (b.amount ?? 0) - (a.amount ?? 0);
            const dateA = new Date(a.date?.split('/').reverse().join('-') || 0);
            const dateB = new Date(b.date?.split('/').reverse().join('-') || 0);
            return sort === 'oldest' ? dateA - dateB : dateB - dateA;
        });
    }, [allItems, activeTab, sort]);

    // İstatistikler
    const stats = useMemo(() => {
        const total   = allItems.reduce((s, i) => s + (i.amount ?? 0), 0);
        const maxItem = allItems.reduce((m, i) => (i.amount > (m?.amount ?? 0) ? i : m), null);
        return { total, maxItem };
    }, [allItems]);

    if (loading) return (
        <div className="arc-loader-wrap">
            <Loader type="butterfly" />
        </div>
    );

    return (
        /* key={selectedTeamId} — takım değişince tüm state sıfırlanır */
        <div className="arc-wrapper" key={selectedTeamId}>

            {/* Sidebar */}
            <aside className="arc-sidebar">
                <span className="arc-sidebar-title">Arşiv</span>

                {NAV_ITEMS.map(item => (
                    <button
                        key={item.id}
                        className={`arc-nav-btn${activeTab === item.id ? ' active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <i className={`ti ${item.icon}`} />
                        {item.label}
                        {counts[item.id] > 0 && (
                            <span className="arc-nav-count">{counts[item.id]}</span>
                        )}
                    </button>
                ))}

                <hr className="arc-sidebar-divider" />

                {/* Sıralama */}
                <span className="arc-sidebar-title" style={{ marginTop: 'var(--space-2)' }}>Sırala</span>
                {[
                    { id: 'newest', label: 'En Yeni',  icon: 'ti-sort-descending' },
                    { id: 'oldest', label: 'En Eski',  icon: 'ti-sort-ascending'  },
                    { id: 'amount', label: 'Tutara Göre', icon: 'ti-coins'        },
                ].map(s => (
                    <button
                        key={s.id}
                        className={`arc-nav-btn${sort === s.id ? ' active' : ''}`}
                        onClick={() => setSort(s.id)}
                    >
                        <i className={`ti ${s.icon}`} />
                        {s.label}
                    </button>
                ))}
            </aside>

            {/* Ana İçerik */}
            <main className="arc-main">

                {/* Header */}
                <header className="arc-header">
                    <div className="arc-header-left">
                        <span className="arc-breadcrumb">
                            Merkez <i className="ti ti-chevron-right" /> Arşiv
                        </span>
                        <h1 className="arc-title">
                            {NAV_ITEMS.find(n => n.id === activeTab)?.label ?? 'Arşiv'}
                        </h1>
                        <p className="arc-subtitle">
                            {filtered.length} kayıt listeleniyor
                        </p>
                    </div>
                    <div className="arc-header-right">
                        {/* Grid / Timeline toggle */}
                        <div className="arc-view-toggle">
                            <button
                                className={`arc-view-btn${viewMode === 'timeline' ? ' active' : ''}`}
                                onClick={() => setViewMode('timeline')}
                                title="Zaman çizelgesi"
                            >
                                <i className="ti ti-layout-list" />
                            </button>
                            <button
                                className={`arc-view-btn${viewMode === 'grid' ? ' active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                title="Izgara"
                            >
                                <i className="ti ti-layout-grid" />
                            </button>
                        </div>

                        {/* Yenile */}
                        <button className="arc-action-btn" onClick={loadData}>
                            <i className="ti ti-refresh" />
                            Yenile
                        </button>
                    </div>
                </header>

                {/* Stats bar */}
                <div className="arc-stats-bar">
                    <div className="arc-stat-item">
                        <span className="arc-stat-label">Toplam Kayıt</span>
                        <span className="arc-stat-value accent">{allItems.length}</span>
                    </div>
                    <div className="arc-stat-item">
                        <span className="arc-stat-label">Toplam Tutar</span>
                        <span className="arc-stat-value">
                            {symbol}{stats.total.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
                        </span>
                    </div>
                    <div className="arc-stat-item">
                        <span className="arc-stat-label">Onaylanan</span>
                        <span className="arc-stat-value success">{counts.approved}</span>
                    </div>
                    <div className="arc-stat-item">
                        <span className="arc-stat-label">Bekleyen</span>
                        <span className="arc-stat-value warning">{counts.pending}</span>
                    </div>
                    <div className="arc-stat-item">
                        <span className="arc-stat-label">Reddedilen</span>
                        <span className="arc-stat-value danger">{counts.rejected}</span>
                    </div>
                    <div className="arc-stat-item">
                        <span className="arc-stat-label">Faturalı</span>
                        <span className="arc-stat-value">{counts.invoices}</span>
                        <span className="arc-stat-sub">görsel kayıt</span>
                    </div>
                </div>

                {/* İçerik */}
                <div className="arc-scroll">
                    {filtered.length === 0 ? (
                        <div className="arc-empty">
                            <div className="arc-empty-icon">
                                <i className="ti ti-archive-off" />
                            </div>
                            <h3>Kayıt Bulunamadı</h3>
                            <p>Bu filtrede gösterilecek arşiv kaydı yok.</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <ArchiveGrid items={filtered} symbol={symbol} />
                    ) : (
                        <ArchiveTimeline items={filtered} symbol={symbol} />
                    )}
                </div>
            </main>
        </div>
    );
};

export default Archive;