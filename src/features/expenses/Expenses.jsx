import React, { useEffect, useState, useCallback } from 'react'; 
import Loader from '../../components/common/Loader';
import './expenses.css/Expenses.css';
import SubNavbar from '../../components/navigation/SubNavbar';
import CreateExpense from './modals/CreateExpense';
import ExpenseDetail from './modals/ExpenseDetail';
import CurrencyModal from '../../components/modals/CurrencyModal';
import PaginationFooter from '../../components/common/PaginationFooter';
import ActionSidebar from '../../components/navigation/ActionSidebar'; 
import ExpenseFilter from './modals/ExpenseFilter';
import ExpensesList from './components/ExpensesList'; 
import Alert from '../../components/modals/Alert';

import { expenseService } from './services/expenseService';
import { usePagination } from '../../hooks/usePagination';
import { useFilter } from '../../hooks/useFilter'; 
import { useCurrency } from '../../context/CurrencyContext';
import { useModal } from '../../hooks/useModal';

const Expenses = () => {
    const { alertConfig, showAlert, closeAlert } = useModal();
    
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCurrencyOpen, setIsCurrencyOpen] = useState(false); 
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false); 
    
    const { selectedCurrency, updateCurrency } = useCurrency();
    const [activeTeamId, setActiveTeamId] = useState(() => localStorage.getItem('tm_selected_id'));
    const [teamDefaultCurrency, setTeamDefaultCurrency] = useState('');

    const syncSelectedTeam = useCallback(() => {
        const nextTeamId = localStorage.getItem('tm_selected_id');
        const rawCache = localStorage.getItem('tm_teams_cache');

        if (String(nextTeamId) === String(activeTeamId) && teamDefaultCurrency !== '') return;

        if (rawCache && nextTeamId) {
            try {
                const teams = JSON.parse(rawCache);
                const currentTeam = teams.find(t => String(t.id) === String(nextTeamId));
                
                if (currentTeam?.settings?.currency) {
                    setActiveTeamId(nextTeamId);
                    setTeamDefaultCurrency(currentTeam.settings.currency);
                    updateCurrency(currentTeam.settings.currency);
                }
            } catch (e) { console.error(e); }
        }
    }, [activeTeamId, teamDefaultCurrency, updateCurrency]); 

    useEffect(() => {
        window.addEventListener('teamChanged', syncSelectedTeam);
        window.addEventListener('storage', syncSelectedTeam);
        return () => {
            window.removeEventListener('teamChanged', syncSelectedTeam);
            window.removeEventListener('storage', syncSelectedTeam);
        };
    }, [syncSelectedTeam]);
    
    const { 
        data: expenses, loading, loadingMore, hasMore, loadMore, totalCount, refreshData
    } = usePagination(expenseService.getExpensesByTeam, activeTeamId, 20);

    const {
        searchTerm, setSearchTerm,
        tempFilters, setTempFilters,
        filteredData: filteredExpenses,
        applyFilters, clearFilters
    } = useFilter(
        expenses || [],
        { category: '', status: '', paymentMethod: '', minAmount: '', maxAmount: '' },
        ['title', 'merchant']
    );

    const handleDelete = async (e, id) => {
        try {
            await expenseService.deleteExpense(id);
            refreshData();
            showAlert("Başarılı", "Harcama kaydı kalıcı olarak silindi.", "success");
        } catch (err) {
            console.error(err);
            showAlert("Hata", "Silme işlemi başarısız oldu.", "error");
        }
    };

    const handleSuccess = () => {
        setIsCreateOpen(false);
        setIsEditMode(false);
        setSelectedExpense(null);
        setTimeout(() => refreshData(), 0);
    };

    if (loading) return <Loader type="butterfly" />;

    const filterFooter = (
        <div className="as-filter-footer">
            <button className="btn-clear" onClick={clearFilters}>Tümünü Temizle</button>
            <button className="btn-apply" onClick={() => { applyFilters(); setIsFilterOpen(false); }}>Filtreleri Uygula</button>
        </div>
    );

    return (
        <div className="expense-page-container">
            <SubNavbar 
                pageName="Giderler"
                showCurrency={true}
                searchPlaceholder="Harcama ara..."
                searchValue={searchTerm}
                createLabel="Harcama Oluştur"
                onCreate={() => { 
                    setIsEditMode(false); 
                    setSelectedExpense(null); 
                    setIsCreateOpen(true); 
                }}
                onSearch={(val) => setSearchTerm(val)}
                buttons={[
                    { 
                        icon: 'ti ti-coins', 
                        label: selectedCurrency, 
                        className: 'currency-btn-trigger',
                        onClick: () => setIsCurrencyOpen(true)
                    },
                    { 
                        icon: 'ti ti-filter', 
                        onClick: () => setIsFilterOpen(true) 
                    }
                ]}
            />
            
            <hr className="sub-nav-divider" />

            <div className="expense-table-wrapper">
                <div className="expense-title-nav">
                    <span className="ex-title-span">Detaylar</span>
                    <span className="ex-title-span">Kategori</span>
                    <span className="ex-title-span">İşletme</span>
                    <span className="ex-title-span">Ödeme Yöntemi</span>
                    <span className="ex-title-span">Miktar</span>
                    <span className="ex-title-span">Rapor</span>
                    <span className="ex-title-span">İşlem Durumu</span>
                    <span className="ex-title-span">İşlemler</span>
                </div>

                <div className="expense-list-container">
                    {filteredExpenses.length > 0 ? (
                        <>
                            <ExpensesList 
                                data={filteredExpenses}
                                onOpenDetail={(ex) => { setSelectedExpense(ex); setIsDetailOpen(true); }}
                                onEdit={(e, ex) => {
                                    e.stopPropagation();
                                    setSelectedExpense(ex);
                                    setIsEditMode(true);
                                    setIsCreateOpen(true);
                                }}
                                onDelete={handleDelete}
                            />
                            <PaginationFooter 
                                hasMore={hasMore}
                                loadingMore={loadingMore}
                                loadMore={loadMore}
                                currentCount={filteredExpenses.length} 
                                totalCount={totalCount}
                                label="expenses"
                            />
                        </>
                    ) : (
                        <div className="no-data-info">Kriterlerinize uyan hiçbir gider bulunmamaktadır.</div>
                    )}
                </div>
            </div>

            <ActionSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter Expenses" footer={filterFooter}>
                <ExpenseFilter filters={tempFilters} setFilters={setTempFilters} />
            </ActionSidebar>

            <CreateExpense 
                isOpen={isCreateOpen} 
                onClose={() => { setIsCreateOpen(false); setIsEditMode(false); setSelectedExpense(null); }} 
                editData={isEditMode ? selectedExpense : null}
                onSuccess={handleSuccess}
            />

            <ExpenseDetail 
                isOpen={isDetailOpen} 
                onClose={() => setIsDetailOpen(false)} 
                data={selectedExpense}
                onSuccess={handleSuccess}
            />

            <CurrencyModal 
                isOpen={isCurrencyOpen} 
                onClose={() => setIsCurrencyOpen(false)} 
                currentCurrency={selectedCurrency}
                teamDefaultCurrency={teamDefaultCurrency}
                onSelect={(curr) => updateCurrency(curr)}
            />

            <Alert {...alertConfig} onClose={closeAlert} />
        </div>
    );
}

export default Expenses;