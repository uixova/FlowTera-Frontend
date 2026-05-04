import React, { useState, useEffect, useCallback } from 'react';
import './Archive.css';
import Galery from './components/Galery';
import { archiveService } from './services/archiveServices';
import Loader from '../../components/common/Loader';
import { useTeam } from '../../context/TeamContext'; 

const Archive = () => {
    const [data, setData] = useState({ expenses: [], trips: [] });
    const [loading, setLoading] = useState(true);
    
    const { selectedTeamId } = useTeam();

    const loadData = useCallback(async () => {
        if (!selectedTeamId) return;

        setLoading(true);
        try {
            const result = await archiveService.getArchiveData(selectedTeamId);
            setData(result || { expenses: [], trips: [] });
        } catch (err) { 
            console.error("Veri yükleme hatası:", err); 
        } finally { 
            setLoading(false); 
        }
    }, [selectedTeamId]);

    // ID değiştikçe veriyi yeniden yükle
    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading) return <div className="archive-loader"><Loader /></div>;

    // Faturası olan tüm kalemleri birleştir
    const allInvoices = [
        ...(data.expenses || []),
        ...(data.trips || [])
    ].filter(item => item.image);

    return (
        /* key={selectedTeamId} ekleyerek takım değişiminde tüm sayfa state'inin 
           temizlenmesini ve sıfırdan render edilmesini sağlıyoruz ki doğru veri gösterilsin! */
        <div className="archive-container" key={selectedTeamId}>
            <aside className="archive-sidebar">
                <div className="sidebar-brand">
                    <div className="brand-dot"></div>
                    <h3>FLOWTERA</h3>
                </div>
                <nav className="archive-nav">
                    <button className="active">
                        <i className="ti ti-photo"></i> <span>Tüm Faturalar</span>
                    </button>
                </nav>
            </aside>

            <main className="archive-content">
                <header className="content-header">
                    <div className="header-info">
                        <span className="breadcrumb">Merkez / Arşiv / Galeri</span>
                        <h2>FATURA ARŞİVİ</h2>
                    </div>
                </header>
                <div className="archive-scroll-area">
                    {allInvoices.length > 0 ? (
                        <Galery data={allInvoices} />
                    ) : (
                        <div className="no-data-info">Bu takıma ait görsel arşiv bulunamadı.</div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Archive;