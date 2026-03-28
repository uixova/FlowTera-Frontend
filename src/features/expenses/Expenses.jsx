import React, { useState } from 'react'; 
import Loader from '../../components/common/Loader';
import './expenses.css/Expenses.css';
import SubNavbar from '../../components/navigation/SubNavbar';
import CreateExpense from './modals/CreateExpense';
import ExpenseDetail from './modals/ExpenseDetail';
import CurrencyModal from '../../components/modals/CurrencyModal';
import PaginationFooter from '../../components/common/PaginationFooter';

// Servis ve Hook importları
import { expenseService } from './services/expenseService';
import { usePagination } from '../../hooks/usePagination';

const Expenses = () => {
    // MODAL VE UI STATELERİ 
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCurrencyOpen, setIsCurrencyOpen] = useState(false); 
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        return sessionStorage.getItem('selectedCurrency') || 'USD';
    });

    // VERİ YÖNETİMİ (HOOK)
    const activeTeamId = localStorage.getItem('tm_selected_id');
    
    const { 
        data: expenses, 
        loading, 
        loadingMore, 
        hasMore, 
        loadMore 
    } = usePagination(expenseService.getExpensesByTeam, activeTeamId, 20);

    const handleOpenDetail = (expense) => {
        setSelectedExpense(expense);
        setIsDetailOpen(true);
    };

    const handleCurrencySelect = (currencyCode) => {
        setSelectedCurrency(currencyCode);
        sessionStorage.setItem('selectedCurrency', currencyCode);
    };

    // İlk yükleme ekranı
    if (loading) return <Loader type="butterfly" />;

    return (
        <div className="expense-page-container">
            {/* Üst Navigasyon ve Aksiyon Butonları */}
            <SubNavbar 
                pageName="Expenses"
                showCurrency={true}
                searchPlaceholder="Search expenses..."
                createLabel="New Expense"
                onCreate={() => setIsCreateOpen(true)}
                buttons={[
                    { 
                        icon: 'ti ti-coins', 
                        label: selectedCurrency, 
                        className: 'currency-btn-trigger',
                        onClick: () => setIsCurrencyOpen(!isCurrencyOpen)
                    },
                    { icon: 'ti ti-filter', tooltip: 'Filter', onClick: () => console.log("Filter") }
                ]}
            />
            
            <hr className="sub-nav-divider" />

            {/* Harcamalar Tablo Görünümü */}
            <div className="expense-table-wrapper">
                <div className="expense-title-nav">
                    <input type="checkbox" />
                    <span className="ex-title-span">Details</span>
                    <span className="ex-title-span">Category</span>
                    <span className="ex-title-span">Merchant</span>
                    <span className="ex-title-span">Payment</span>
                    <span className="ex-title-span">Amount</span>
                    <span className="ex-title-span">Report</span>
                    <span className="ex-title-span">Status</span>
                </div>

                <div className="expense-list-container">
                    {expenses.length > 0 ? (
                        <>
                            {expenses.map((expense) => (
                                <div 
                                    key={expense.id} 
                                    className="expense-block" 
                                    onClick={() => handleOpenDetail(expense)}
                                >
                                    <input type="checkbox" onClick={(e) => e.stopPropagation()} />
                    
                                    {/* İkon ve Başlık */}
                                    <div className="expense-block-details">
                                        <span className="expense-icon">
                                            <i className={`ti ${expense.icon || 'ti-receipt'}`}></i>
                                        </span>
                                        <div className="expense-details-text">
                                            <span className="expense-date">{expense.date}</span>
                                            <span className="expense-title">{expense.title}</span>
                                        </div>
                                    </div>

                                    <span className="ex-category-tag">{expense.category}</span>
                                    <span className="ex-merchant-text">{expense.merchant}</span>
                                    <span className="ex-method-text">{expense.paymentMethod}</span>

                                    {/* Tutar Alanı */}
                                    <div className="ex-list-amount-wrapper">
                                        <span className="ex-list-symbol">{expense.currencySymbol}</span>
                                        <span className="ex-list-amount-val">{(Number(expense.amount) || 0).toFixed(2)}</span>
                                        <span className="ex-list-currency">{expense.currency}</span>
                                    </div>

                                    <span className="ex-report-name">{expense.report || 'General'}</span>

                                    <span className={`expense-status ${expense.status?.toLowerCase()}`}>
                                        {expense.status}
                                    </span>
                                </div>
                            ))}

                            {/* Pagination Footer*/}
                            <PaginationFooter 
                                hasMore={hasMore}
                                loadingMore={loadingMore}
                                loadMore={loadMore}
                                currentCount={expenses.length} 
                                label="expenses"
                            />
                        </>
                    ) : (
                        <div className="no-data-info">Kayıtlı harcama bulunamadı.</div>
                    )}
                </div>
            </div>

            {/* Modallar */}
            <CreateExpense isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            
            <ExpenseDetail 
                isOpen={isDetailOpen} 
                onClose={() => setIsDetailOpen(false)} 
                data={selectedExpense} 
            />

            <CurrencyModal 
                isOpen={isCurrencyOpen} 
                onClose={() => setIsCurrencyOpen(false)} 
                currentCurrency={selectedCurrency}
                onSelect={handleCurrencySelect}
            />
        </div>
    );
}

export default Expenses;