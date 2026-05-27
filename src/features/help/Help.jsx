import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './Help.css';
import HelpSidebar from './components/Helpsidebar';
import HelpContent from './components/Helpcontent';
import ActionSidebar from '../../components/navigation/ActionSidebar';
import { helpData } from '@/data/helpData';

const Help = () => {
    const { t } = useTranslation('help');
    const data                              = helpData;
    const [activeId,      setActiveId]      = useState(helpData.categories?.[0]?.id ?? null);
    const [search,        setSearch]        = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Sayfa açılışında app-container padding'ini kaldır
    useEffect(() => {
        const appContainer = document.querySelector('.app-container');
        if (appContainer) appContainer.classList.add('st-page-active');
        return () => appContainer?.classList.remove('st-page-active');
    }, []);

    // Kategori başına öge sayısı
    const counts = useMemo(() => {
        if (!data) return {};
        return data.categories.reduce((acc, cat) => {
            acc[cat.id] = data.items.filter(i => i.category === cat.id).length;
            return acc;
        }, {});
    }, [data]);

    // Görüntülenecek öğeler — arama veya kategori filtresi
    const visibleItems = useMemo(() => {
        if (!data) return [];
        const trimmed = search.trim().toLowerCase();

        if (trimmed) {
            // Arama aktifken tüm kategorilerde tara
            return data.items.filter(item =>
                item.title.toLowerCase().includes(trimmed) ||
                (typeof item.content === 'string' && item.content.toLowerCase().includes(trimmed))
            );
        }
        return data.items.filter(item => item.category === activeId);
    }, [data, activeId, search]);

    // Arama varken aktif kategoriyi "Tüm Sonuçlar" gibi göstermek için sahte kategori
    const activeCategory = useMemo(() => {
        if (!data) return null;
        if (search.trim()) {
            return { id: '__search', label: t('search_results'), icon: 'ti-search', color: 'accent' };
        }
        return data.categories.find(c => c.id === activeId) ?? null;
    }, [data, activeId, search]);

    // Kategori seçimi — drawer'ı da kapat
    const handleCatSelect = (id) => {
        setActiveId(id);
        setSearch('');
        setIsSidebarOpen(false);
    };

    return (
        <div className="help-page">
            {/* Desktop sidebar — 680px üstünde görünür */}
            <div className="help-desktop-sidebar-wrapper">
                <HelpSidebar
                    categories={data.categories}
                    contact={data.contact}
                    activeId={search ? null : activeId}
                    onSelect={handleCatSelect}
                    counts={counts}
                    search={search}
                    onSearch={setSearch}
                />
            </div>

            <div className="help-content-wrapper">
                {/* Mobil kategori tetikleyici — sadece dar ekranda görünür */}
                <button
                    className="help-mobile-trigger-btn"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <i className="ti ti-layout-sidebar" />
                    {t('help_center')}
                    <i className="ti ti-chevron-down" style={{ marginLeft: 'auto', fontSize: '0.85rem', opacity: 0.6 }} />
                </button>

                <HelpContent
                    category={activeCategory}
                    items={visibleItems}
                    search={search}
                />
            </div>

            {/* Mobil kategori drawer */}
            <ActionSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                title={t('help_center')}
                width="300px"
            >
                <div className="help-mobile-sidebar-container">
                    <HelpSidebar
                        categories={data.categories}
                        contact={data.contact}
                        activeId={search ? null : activeId}
                        onSelect={handleCatSelect}
                        counts={counts}
                        search={search}
                        onSearch={setSearch}
                    />
                </div>
            </ActionSidebar>
        </div>
    );
};

export default Help;