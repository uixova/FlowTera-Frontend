import React, { useState, useEffect } from 'react';
import Loader from '../../components/common/Loader';
import './history.css/History.css';
import './history.css/HistoryItem.css';
import SubNavbar from '../../components/navigation/SubNavbar';
import PaginationFooter from '../../components/common/PaginationFooter';
import HistoryItem from './components/HistoryItem';
import ActionSidebar from '../../components/navigation/ActionSidebar';
import HistoryFilter from './modals/HistoryFilter';

// Hook ve Servisler
import { historyService } from './services/historyService';
import { usePagination } from '../../hooks/usePagination';
import { useFilter } from '../../hooks/useFilter';

const History = () => {
    const [teamId, setTeamId] = useState(() => localStorage.getItem('tm_selected_id'));
    const [activeLog, setActiveLog] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Takım Senkronizasyonu
    useEffect(() => {
        const handleTeamUpdate = () => {
            const currentId = localStorage.getItem('tm_selected_id');
            setTeamId(prevId => String(prevId || '') === String(currentId || '') ? prevId : currentId);
        };
        window.addEventListener('teamChanged', handleTeamUpdate);
        window.addEventListener('storage', handleTeamUpdate);
        return () => {
            window.removeEventListener('teamChanged', handleTeamUpdate);
            window.removeEventListener('storage', handleTeamUpdate);
        };
    }, []);

    // Veri Çekme
    const { 
        data: historyData, 
        loading, 
        loadingMore, 
        hasMore, 
        loadMore,
        totalCount
    } = usePagination(historyService.getHistoryByTeam, teamId, 20);

    // Filtreleme işlemi için özel hook kullanımı
    const {
        searchTerm, setSearchTerm,
        tempFilters, setTempFilters,
        filteredData: filteredLogs,
        applyFilters, clearFilters
    } = useFilter(
        historyData || [],
        {
            startDate: '',
            endDate: '',
            role: '',
            type: '',
            target: ''
        },
        ['user', 'action', 'target']
    );

    const handleToggle = (id) => {
        setActiveLog(activeLog === id ? null : id);
    };

    // Filtre Alt Butonları
    const filterFooter = (
        <div className="as-filter-footer">
            <button className="btn-clear" onClick={clearFilters}>
                Clear All
            </button>
            <button className="btn-apply" onClick={() => { applyFilters(); setIsFilterOpen(false); }}>
                Apply Filters
            </button>
        </div>
    );

    if (loading) return <Loader type="butterfly" />;

    return (
        <div className="history-page" key={teamId}>
            <SubNavbar 
                pageName="Activity History"
                searchValue={searchTerm}
                onSearch={(val) => setSearchTerm(val)} 
                showSearch={true}      
                showCreate={false}      
                buttons={[
                    { 
                        icon: 'ti ti-adjustments-horizontal', 
                        tooltip: 'Filter Logs', 
                        onClick: () => setIsFilterOpen(true) 
                    }
                ]}
            />
            
            <hr className="hi-divider" />

            <div className="history-list-container">
                {filteredLogs.length > 0 ? (
                    <>
                        {filteredLogs.map((item) => (
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
                            currentCount={filteredLogs.length} 
                            totalCount={searchTerm || Object.values(tempFilters).some(x => x) ? filteredLogs.length : totalCount}
                            label="activity logs" 
                        />
                    </>
                ) : (
                    <div className="no-data-info">
                        {Object.values(tempFilters).some(x => x) || searchTerm 
                            ? "Arama kriterlerine uygun kayıt bulunamadı." 
                            : "Bu takıma ait bir aktivite kaydı bulunamadı."}
                    </div>
                )}
            </div>

            {/* FİLTRE SİDEBARI */}
            <ActionSidebar 
                isOpen={isFilterOpen} 
                onClose={() => setIsFilterOpen(false)} 
                title="Filter Activities"
                footer={filterFooter}
            >
                {/* BURADA tempFilters KULLANIYORUZ - ANLIK DEĞİŞİM SADECE BURADA GÖRÜNÜR */}
                <HistoryFilter filters={tempFilters} setFilters={setTempFilters} />
            </ActionSidebar>
        </div>
    );
};

export default History;