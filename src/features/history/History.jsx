import React, { useState, useEffect } from 'react';
import Loader from '../../components/common/Loader';
import './history.css/History.css';
import './history.css/HistoryItem.css';
import SubNavbar from '../../components/navigation/SubNavbar';
import PaginationFooter from '../../components/common/PaginationFooter';
import HistoryItem from './components/HistoryItem';

import { historyService } from './services/historyService';
import { usePagination } from '../../hooks/usePagination';

const History = () => {
    // Takım ID'sini localStorage'dan alıyoruz, yoksa null olur
    const [searchTerm, setSearchTerm] = useState('');
    const [activeLog, setActiveLog] = useState(null);
    const [teamId, setTeamId] = useState(() => localStorage.getItem('tm_selected_id'));


    // Takım ID'si değiştiğinde verilerin güncellenmesi için dinleyici ekliyoruz
    useEffect(() => {
        const handleTeamUpdate = () => {
            const currentId = localStorage.getItem('tm_selected_id');
            setTeamId(prevTeamId =>
                String(prevTeamId || '') === String(currentId || '') ? prevTeamId : currentId
            );
        };

        window.addEventListener('teamChanged', handleTeamUpdate);
        window.addEventListener('storage', handleTeamUpdate);

        return () => {
            window.removeEventListener('teamChanged', handleTeamUpdate);
            window.removeEventListener('storage', handleTeamUpdate);
        };
    }, []);

    // usePagination hook'u, verilen fetch fonksiyonunu kullanarak sayfalama ve veri yönetimi sağlar
    const { 
        data: historyData, 
        loading, 
        loadingMore, 
        hasMore, 
        loadMore,
        totalCount
    } = usePagination(historyService.getHistoryByTeam, teamId, 20);

    // Bir log öğesinin genişletilmesi veya daraltılması için toggle fonksiyonu
    const handleToggle = (id) => {
        setActiveLog(activeLog === id ? null : id);
    };

    // Arama terimine göre filtreleme yaparak sadece ilgili logları gösteriyoruz
    const filteredData = historyData.filter(item => 
        item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.target.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Veriler yüklenirken Loader bileşenini gösteriyoruz
    if (loading) return <Loader type="butterfly" />;

    return (
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
                            <HistoryItem 
                                key={item.id} 
                                item={item} 
                                isActive={activeLog === item.id} 
                                onToggle={handleToggle} 
                            />
                        ))}
                        <PaginationFooter 
                            hasMore={hasMore} 
                            loadingMore={loadingMore} 
                            loadMore={loadMore} 
                            currentCount={searchTerm ? filteredData.length : historyData.length} 
                            totalCount={searchTerm ? filteredData.length : totalCount}
                            label="activity logs" 
                        />
                    </>
                ) : (
                    <div className="no-data-info">Bu takıma ait bir aktivite kaydı bulunamadı.</div>
                )}
            </div>
        </div>
    );
};

export default History;