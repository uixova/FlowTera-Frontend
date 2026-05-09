import React, { useState } from 'react';
import Loader from '../../components/ui/Loader';
import './History.css';
import SubNavbar from '../../components/navigation/SubNavbar';
import PaginationFooter from '../../components/ui/PaginationFooter';
import HistoryItem from './components/HistoryItem';
import ActionSidebar from '../../components/navigation/ActionSidebar';
import HistoryFilter from './modals/HistoryFilter';

// Hook ve Servisler
import { historyService } from './services/historyService';
import { usePagination } from '../../hooks/usePagination';
import { useFilter } from '../../hooks/useFilter';
import { useTeam } from '../../context/TeamContext';

const History = () => {
    const { selectedTeamId } = useTeam();
    const [activeLog,    setActiveLog]    = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const {
        data: historyData, loading, loadingMore, hasMore, loadMore, totalCount
    } = usePagination(historyService.getHistoryByTeam, selectedTeamId, 20);

    // Filtreleme işlemi
    const {
        searchTerm, setSearchTerm,
        tempFilters, setTempFilters,
        filteredData: filteredLogs,
        applyFilters, clearFilters
    } = useFilter(
        historyData || [],
        { startDate: '', endDate: '', role: '', type: '', target: '' },
        ['user', 'action', 'target']
    );

    const handleToggle = (id) => setActiveLog((prev) => (prev === id ? null : id));

    const isFiltered = searchTerm || Object.values(tempFilters).some(Boolean);

    const filterFooter = (
        <div className="as-filter-footer">
            <button className="btn-clear" onClick={clearFilters}>Tümünü Temizle</button>
            <button className="btn-apply" onClick={() => { applyFilters(); setIsFilterOpen(false); }}>
                Filtreleri Uygula
            </button>
        </div>
    );

    if (loading) return <Loader type="butterfly" />;

    return (
        // key={selectedTeamId} sayesinde takım değişince tüm liste componenti sıfırlanır
        <div className="history-page" key={selectedTeamId}>
            <SubNavbar
                pageName="Aktif Geçmiş"
                searchPlaceholder="Kullanıcı, işlem veya hedef ara..."
                searchValue={searchTerm}
                onSearch={(val) => setSearchTerm(val)}
                showSearch={true}
                showCreate={false}
                buttons={[
                    {
                        icon: 'ti ti-adjustments-horizontal',
                        tooltip: 'Filtrele',
                        onClick: () => setIsFilterOpen(true),
                    },
                ]}
            />

            <hr className="sub-nav-divider" />

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
                            totalCount={isFiltered ? filteredLogs.length : totalCount}
                            label="İşlem Geçmişi"
                        />
                    </>
                ) : (
                    <div className="no-data-info">
                        {isFiltered
                            ? 'Arama kriterlerine uygun kayıt bulunamadı.'
                            : 'Bu takıma ait aktivite kaydı bulunamadı.'}
                    </div>
                )}
            </div>

            <ActionSidebar
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                title={<h2>İşlemleri Filtrele</h2>}
                footer={filterFooter}
            >
                <HistoryFilter filters={tempFilters} setFilters={setTempFilters} />
            </ActionSidebar>
        </div>
    );
};

export default History;