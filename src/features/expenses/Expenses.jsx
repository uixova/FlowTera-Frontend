import React, { useEffect, useState, useRef } from 'react';
import Loader from '../../components/ui/Loader';
import './Expenses.css';
import SubNavbar from '../../components/navigation/SubNavbar';
import CreateExpense from './modals/CreateExpense';
import ExpenseDetail from './modals/ExpenseDetail';
import CurrencyModal from '../../components/overlays/currency/CurrencyModal';
import PaginationFooter from '../../components/ui/PaginationFooter';
import ActionSidebar from '../../components/navigation/ActionSidebar';
import ExpenseFilter from './modals/ExpenseFilter';
import ExpensesList from './components/ExpensesList';
import Alert from '../../components/overlays/Alert';
import Confirm from '../../components/overlays/Confirm';

import { expenseService } from './services/expenseService';
import { archiveService } from '../archive/services/archiveServices';
import { usePagination } from '../../hooks/usePagination';
import { useFilter } from '../../hooks/useFilter';
import { useCurrency } from '../../context/CurrencyContext';
import { useModal } from '../../hooks/useModal';
import { useTeam } from '../../context/TeamContext';
import { useAuth } from '../../context/AuthContext';
import { isDemoUser } from '../../utils/demo';

const Expenses = () => {
    const { alertConfig, confirmConfig, showAlert, askConfirm, closeAlert, closeConfirm } = useModal();
    const { selectedCurrency, updateCurrency } = useCurrency();
    const { activeTeam, selectedTeamId } = useTeam();
    const { currentUser } = useAuth();
    const isDemo = isDemoUser(currentUser?.email);

    const [isCreateOpen,  setIsCreateOpen]  = useState(false);
    const [isDetailOpen,  setIsDetailOpen]  = useState(false);
    const [isCurrencyOpen,setIsCurrencyOpen]= useState(false);
    const [isFilterOpen,  setIsFilterOpen]  = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [isEditMode,    setIsEditMode]    = useState(false);

    const prevTeamIdRef = useRef(selectedTeamId);

    // Takım değiştiğinde, o takımın varsayılan kurunu başlangıç olarak ayarla
    useEffect(() => {
        const teamChanged   = prevTeamIdRef.current !== selectedTeamId;
        const savedSelection = sessionStorage.getItem('selectedCurrency');

        if (teamChanged) {
            // Takım değiştiyse, eski manuel seçimi temizle ve takımın varsayılanına geç
            if (activeTeam?.settings?.currency) {
                updateCurrency(activeTeam.settings.currency);
                sessionStorage.removeItem('selectedCurrency');
            }
            // Referansı güncelle
            prevTeamIdRef.current = selectedTeamId;
        } else if (!savedSelection && activeTeam?.settings?.currency) {
            updateCurrency(activeTeam.settings.currency);
        }
    }, [selectedTeamId, activeTeam?.settings?.currency, updateCurrency]);

    const {
        data: expenses, loading, loadingMore, hasMore, loadMore, totalCount, refreshData
    } = usePagination(expenseService.getExpensesByTeam, selectedTeamId, 20);

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

    const handleSuccess = (message = 'İşlem başarıyla gerçekleştirildi.') => {
        setIsCreateOpen(false);
        setIsEditMode(false);
        setSelectedExpense(null);
        showAlert('Başarılı', message, 'success');
        setTimeout(() => refreshData(), 0);
    };

    const handleDelete = (expense) => {
        askConfirm(
            'Gideri Sil',
            'Bu gideri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
            async () => {
                try {
                    await expenseService.deleteExpense(expense.id);
                    archiveService.invalidate();
                    setIsCreateOpen(false);
                    setIsEditMode(false);
                    setSelectedExpense(null);
                    showAlert('Başarılı', 'Gider başarıyla silindi.', 'success');
                    setTimeout(() => refreshData(), 0);
                } catch (err) {
                    console.error('Silme başarısız:', err);
                    showAlert('Hata', 'Gider silinirken bir hata oluştu.', 'error');
                }
            },
            'danger'
        );
    };

    if (loading) return <Loader type="butterfly" />;

    const filterFooter = (
        <div className="as-filter-footer">
            <button className="btn-clear" onClick={clearFilters}>Tümünü Temizle</button>
            <button className="btn-apply" onClick={() => { applyFilters(); setIsFilterOpen(false); }}>
                Filtreleri Uygula
            </button>
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
                    if (isDemo) {
                        showAlert("Demo Modu", "Harcama eklemek için kayıt olun veya giriş yapın.", "info");
                        return;
                    }
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
                        onClick: () => setIsCurrencyOpen(true),
                    },
                    {
                        icon: 'ti ti-filter',
                        onClick: () => setIsFilterOpen(true),
                    },
                ]}
            />

            <hr className="sub-nav-divider" />

            <div className="expense-table-wrapper">
                <div className="expense-title-nav">
                    <span className="ex-title-span">Detaylar</span>
                    <span className="ex-title-span">Kategori</span>
                    <span className="ex-title-span">İşletme</span>
                    <span className="ex-title-span">Ödeme</span>
                    <span className="ex-title-span">Miktar</span>
                    <span className="ex-title-span">Rapor</span>
                    <span className="ex-title-span">Durum</span>
                    <span className="ex-title-span" />
                </div>

                {filteredExpenses.length > 0 ? (
                    <>
                        <ExpensesList
                            data={filteredExpenses}
                            onOpenDetail={(ex) => { setSelectedExpense(ex); setIsDetailOpen(true); }}
                            onEdit={(e, ex) => {
                                if(e) e.stopPropagation();
                                setSelectedExpense(ex);
                                setIsEditMode(true);
                                setIsCreateOpen(true);
                            }}
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
                    <div className="no-data-info">Kriterlerinize uyan hiçbir gider bulunamadı.</div>
                )}
            </div>

            <ActionSidebar
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                title={<h2>Filtrele</h2>}
                footer={filterFooter}
            >
                <ExpenseFilter filters={tempFilters} setFilters={setTempFilters} />
            </ActionSidebar>

            <CreateExpense
                isOpen={isCreateOpen}
                onClose={() => { setIsCreateOpen(false); setIsEditMode(false); setSelectedExpense(null); }}
                editData={isEditMode ? selectedExpense : null}
                onSuccess={handleSuccess}
                onDelete={() => handleDelete(selectedExpense)}
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
                teamDefaultCurrency={activeTeam?.settings?.currency || ''}
                onSelect={(curr) => updateCurrency(curr)}
            />

            <Alert {...alertConfig} onClose={closeAlert} />
            <Confirm {...confirmConfig} onClose={closeConfirm} />
        </div>
    );
};

export default Expenses;