import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/ui/Loader';
import './History.css';
import SubNavbar from '../../components/navigation/SubNavbar';
import PaginationFooter from '../../components/ui/PaginationFooter';
import HistoryItem from './components/HistoryItem';
import ActionSidebar from '../../components/navigation/ActionSidebar';
import HistoryFilter from './modals/HistoryFilter';
import BackToTop from '../../components/ui//BackToTop';

// Hook ve Servisler
import { historyService } from './services/historyService';
import { usePagination } from '../../hooks/usePagination';
import { useFilter } from '../../hooks/useFilter';
import { useTeam } from '../../context/TeamContext';

const History = () => {
    const { t } = useTranslation('history');
    const { t: tBtn } = useTranslation('common.buttons');
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
            <button className="btn-clear" onClick={clearFilters}>{tBtn('reset')}</button>
            <button className="btn-apply" onClick={() => { applyFilters(); setIsFilterOpen(false); }}>
                {tBtn('apply')}
            </button>
        </div>
    );

    if (loading) return <Loader type="butterfly" />;

    return (
        // key={selectedTeamId} sayesinde takım değişince tüm liste componenti sıfırlanır
        <div className="history-page" key={selectedTeamId}>
            <SubNavbar
                pageName={t('page_title')}
                searchPlaceholder={t('search_placeholder')}
                searchValue={searchTerm}
                onSearch={(val) => setSearchTerm(val)}
                showSearch={true}
                showCreate={false}
                buttons={[
                    {
                        icon: 'ti ti-adjustments-horizontal',
                        tooltip: tBtn('filter'),
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
                            label={t('list_label')}
                        />
                    </>
                ) : (
                    <div className="no-data-info">
                        {isFiltered
                            ? t('no_history')
                            : t('no_history')}
                    </div>
                )}
            </div>

            <ActionSidebar
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                title={<h2>{tBtn('filter')}</h2>}
                footer={filterFooter}
            >
                <HistoryFilter filters={tempFilters} setFilters={setTempFilters} />
            </ActionSidebar>
            <BackToTop 
                scrollContainerSelector=".history-list-container" 
                scrollThreshold={400} 
            />
        </div>
    );
};

export default History;