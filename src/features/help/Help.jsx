import React, { useState, useEffect, useMemo } from 'react';
import './Help.css';
import HelpSidebar from './components/HelpSidebar';
import HelpContent from './components/HelpContent';
import Loader from '../../components/ui/Loader';

const Help = () => {
    const [data,          setData]          = useState(null);
    const [loading,       setLoading]       = useState(true);
    const [activeId,      setActiveId]      = useState(null);
    const [search,        setSearch]        = useState('');

    // help_data.json'u public/data'dan çek
    useEffect(() => {
        fetch('/data/help.data.json')
            .then(r => r.json())
            .then(json => {
                setData(json);
                setActiveId(json.categories?.[0]?.id ?? null);
            })
            .catch(err => console.error('[Help] Veri yüklenemedi:', err))
            .finally(() => setLoading(false));
    }, []);

    // sayfa açılışında app-container i kaldır
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
            return { id: '__search', label: 'Arama Sonuçları', icon: 'ti-search', color: 'accent' };
        }
        return data.categories.find(c => c.id === activeId) ?? null;
    }, [data, activeId, search]);

    const handleCatSelect = (id) => {
        setActiveId(id);
        setSearch('');
    };

    if (loading) return <Loader type="butterfly" />;
    if (!data)   return null;

    return (
        <div className="help-page">
            <HelpSidebar
                categories={data.categories}
                contact={data.contact}
                activeId={search ? null : activeId}
                onSelect={handleCatSelect}
                counts={counts}
                search={search}
                onSearch={setSearch}
            />
            <HelpContent
                category={activeCategory}
                items={visibleItems}
                search={search}
            />
        </div>
    );
};

export default Help;