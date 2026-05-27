import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation('expenses.list');
    const { t: tBtn } = useTranslation('common.buttons');
    const { t: tModals } = useTranslation('common.modals');
    const { t: tErrors } = useTranslation('common.errors');
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

    const handleSuccess = () => {
        setIsCreateOpen(false);
        setIsEditMode(false);
        setSelectedExpense(null);
        showAlert(tModals('success'), t('success_generic'), 'success');
        setTimeout(() => refreshData(), 0);
    };

    const handleDelete = (expense) => {
        askConfirm(
            t('delete_title'),
            t('delete_confirm_msg'),
            async () => {
                try {
                    await expenseService.deleteExpense(expense.id);
                    archiveService.invalidate();
                    setIsCreateOpen(false);
                    setIsEditMode(false);
                    setSelectedExpense(null);
                    showAlert(tModals('success'), t('delete_success'), 'success');
                    setTimeout(() => refreshData(), 0);
                } catch {
                    showAlert(tModals('error'), t('delete_error'), 'error');
                }
            },
            'danger'
        );
    };

    if (loading) return <Loader type="butterfly" />;

    const filterFooter = (
        <div className="as-filter-footer">
            <button className="btn-clear" onClick={clearFilters}>{tBtn('reset')}</button>
            <button className="btn-apply" onClick={() => { applyFilters(); setIsFilterOpen(false); }}>
                {tBtn('apply')}
            </button>
        </div>
    );

    return (
        <div className="expense-page-container">
            <SubNavbar
                pageName={t('page_title')}
                showCurrency={true}
                searchPlaceholder={t('search_placeholder')}
                searchValue={searchTerm}
                createLabel={tBtn('create_expense')}
                onCreate={() => {
                    if (isDemo) {
                        showAlert(tErrors('demo_mode'), t('demo_create'), "info");
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
                    <span className="ex-title-span">{t('col_details')}</span>
                    <span className="ex-title-span">{t('col_category')}</span>
                    <span className="ex-title-span">{t('col_merchant')}</span>
                    <span className="ex-title-span">{t('col_payment')}</span>
                    <span className="ex-title-span">{t('col_amount')}</span>
                    <span className="ex-title-span">{t('col_report')}</span>
                    <span className="ex-title-span">{t('col_status')}</span>
                    <span className="ex-title-span" />
                </div>

                {filteredExpenses.length > 0 ? (
                    <>
                        <ExpensesList
                            data={filteredExpenses}
                            onOpenDetail={(ex) => { setSelectedExpense(ex); setIsDetailOpen(true); }}
                            onEdit={(e, ex) => {
                                if (e) e.stopPropagation();
                                if (isDemo) {
                                    showAlert(tErrors('demo_mode'), t('demo_edit'), "info");
                                    return;
                                }
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
                    <div className="no-data-info">{t('no_expenses')}</div>
                )}
            </div>

            <ActionSidebar
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                title={<h2>{tBtn('filter')}</h2>}
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