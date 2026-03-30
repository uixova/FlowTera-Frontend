import React, { useState, useEffect } from 'react';
import Loader from '../../components/common/Loader';
import './history.css/History.css';
import SubNavbar from '../../components/navigation/SubNavbar';
import PaginationFooter from '../../components/common/PaginationFooter';

// Servis ve Hook importları
import { historyService } from './services/historyService';
import { usePagination } from '../../hooks/usePagination';

const History = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeLog, setActiveLog] = useState(null);

    // ID'yi state'e bağlıyoruz
    const [teamId, setTeamId] = useState(() => localStorage.getItem('tm_selected_id'));

    // Navbar'daki 'storage' event'ini dinliyoruz
    useEffect(() => {
        const handleTeamUpdate = () => {
            const currentId = localStorage.getItem('tm_selected_id');
            if (currentId !== teamId) {
                setTeamId(currentId); // ID değişince state güncellenir, hook tetiklenir
            }
        };

        // Navbar'ın fırlattığı event'i yakala
        window.addEventListener('storage', handleTeamUpdate);
        
        return () => window.removeEventListener('storage', handleTeamUpdate);
    }, [teamId]);

    // usePagination artık teamId state'ini izliyor
    const { 
        data: historyData, 
        loading, 
        loadingMore, 
        hasMore, 
        loadMore 
    } = usePagination(historyService.getHistoryByTeam, teamId, 20);

    const handleToggle = (id) => {
        setActiveLog(activeLog === id ? null : id);
    };

    const filteredData = historyData.filter(item => 
        item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.target.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Takım değiştiği an 'loading' true olur ve Loader temizce gelir
    if (loading) return <Loader type="butterfly" />;

    return (
        /* key={teamId} ekleyerek component'in temizlenmesini garanti ediyoruz */
        <div className="history-page" key={teamId}>
            <SubNavbar 
                pageName="Activity History"
                onSearch={(val) => setSearchTerm(val)}
                showSearch={true}      
                showCreate={false}      
                buttons={[{ icon: 'ti ti-adjustments-horizontal', tooltip: 'Filter Logs', onClick: () => {} }]}
            />
            
            <hr className="hi-divider" />

            <div className="history-list-container">
                {filteredData.length > 0 ? (
                    <>
                        {filteredData.map((item) => (
                            <div key={item.id} className={`history-wrapper ${activeLog === item.id ? 'is-expanded' : ''}`}>
                                <div className="history-item" onClick={() => handleToggle(item.id)}>
                                    <div className="hi-status-line"></div>
                                    <div className={`hi-icon ${item.iconClass}`}>
                                        <i className={`ti ${item.icon}`}></i>
                                    </div>
                                    <div className="hi-content">
                                        <div className="hi-info">
                                            <span className={`hi-badge ${item.role}`}>{item.badge}</span>
                                            <span className="hi-user">{item.user}</span>
                                            <span className="hi-action">{item.action}</span>
                                            <span className="hi-target">{item.target}</span>
                                        </div>
                                        <div className="hi-meta">
                                            <span className="hi-time">{item.time}</span>
                                            {item.amount ? <span className="hi-amount">{item.amount}</span> : <span className={item.tagClass}>{item.tag}</span>}
                                            <i className="ti ti-chevron-down hi-chevron"></i>
                                        </div>
                                    </div>
                                </div>
                                <div className="history-accordion-content">
                                    <div className="hi-det-inner">
                                        <div className="hi-det-grid">
                                            {item.details && Object.entries(item.details).map(([key, value]) => (
                                                <div className="hi-det-box" key={key}>
                                                    <span className="hi-det-label">{key.replace(/_/g, ' ').toUpperCase()}</span>
                                                    <span className="hi-det-value">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {/* Pagination Footer */}
                        <PaginationFooter hasMore={hasMore} loadingMore={loadingMore} loadMore={loadMore} currentCount={historyData.length} label="activity logs" />
                    </>
                ) : (
                    <div className="no-data-info">Bu takıma ait bir aktivite kaydı bulunamadı.</div>
                )}
            </div>
        </div>
    );
};

export default History;