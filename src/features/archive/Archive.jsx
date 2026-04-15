import React, { useState, useEffect } from 'react';
import './css/Archive.css';
import Galery from './components/Galery';
import { archiveService } from './services/archiveServices';
import Loader from '../../components/common/Loader';

const Archive = () => {
    const [data, setData] = useState({ expenses: [], trips: [] });
    const [loading, setLoading] = useState(true);
    const selectedTeamId = localStorage.getItem('tm_selected_id');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const result = await archiveService.getArchiveData(selectedTeamId);
                setData(result);
            } catch (err) { 
                console.error("Veri yükleme hatası:", err); 
            } finally { 
                setLoading(false); 
            }
        };
        loadData();
    }, [selectedTeamId]);

    if (loading) return <div className="archive-loader"><Loader /></div>;

    const allInvoices = [
        ...(data.expenses || []),
        ...(data.trips || [])
    ].filter(item => item.image);

    return (
        <div className="archive-container">
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
                    <Galery data={allInvoices} />
                </div>
            </main>
        </div>
    );
};

export default Archive;