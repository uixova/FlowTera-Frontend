import React, { useEffect, useState } from 'react'; 
import Loader from '../../components/common/Loader';
import './expenses.css/Expenses.css';
import SubNavbar from '../../components/navigation/SubNavbar';
import CreateExpense from './modals/CreateExpense';
import ExpenseDetail from './modals/ExpenseDetail';
import CurrencyModal from '../../components/modals/CurrencyModal';
import PaginationFooter from '../../components/common/PaginationFooter';
import ActionSidebar from '../../components/navigation/ActionSidebar'; 
import ExpenseFilter from './modals/ExpenseFilter';

// Servis ve Hook importları
import { expenseService } from './services/expenseService';
import { usePagination } from '../../hooks/usePagination';
import { useFilter } from '../../hooks/useFilter'; 

const Expenses = () => {
    // MODAL VE UI STATELERİ 
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCurrencyOpen, setIsCurrencyOpen] = useState(false); 
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        return sessionStorage.getItem('selectedCurrency') || 'USD';
    });

    // VERİ YÖNETİMİ
    const [activeTeamId, setActiveTeamId] = useState(() => localStorage.getItem('tm_selected_id'));

    // Takım değişikliklerini dinleyerek activeTeamId'yi güncelleyen useEffect
    useEffect(() => {
        const syncSelectedTeam = () => {
            const nextTeamId = localStorage.getItem('tm_selected_id');
            setActiveTeamId(prevTeamId =>
                String(prevTeamId || '') === String(nextTeamId || '') ? prevTeamId : nextTeamId
            );
        };
        // Hem özel event hem de storage event'ini dinleyerek takım değişikliklerini senkronize ediyoruz
        window.addEventListener('teamChanged', syncSelectedTeam);
        window.addEventListener('storage', syncSelectedTeam);
        return () => {
            window.removeEventListener('teamChanged', syncSelectedTeam);
            window.removeEventListener('storage', syncSelectedTeam);
        };
    }, []);
    
    // Sayfalama ve Veri Çekme
    const { 
        data: expenses, loading, loadingMore, hasMore, loadMore, totalCount
    } = usePagination(expenseService.getExpensesByTeam, activeTeamId, 20);

    // Filtreleme işlemi için özel hook kullanımı
    const {
        searchTerm, setSearchTerm,
        tempFilters, setTempFilters,
        filteredData: filteredExpenses,
        applyFilters, clearFilters
    } = useFilter(
        expenses || [],
        {
            category: '',
            status: '',
            paymentMethod: '',
            minAmount: '',
            maxAmount: ''
        },
        ['title', 'merchant']
    );

    // Expense detay modalını açan fonksiyon
    const handleOpenDetail = (expense) => {
        setSelectedExpense(expense);
        setIsDetailOpen(true);
    };

    // Para Birimi Seçimi
    const handleCurrencySelect = (currencyCode) => {
        setSelectedCurrency(currencyCode);
        sessionStorage.setItem('selectedCurrency', currencyCode);
    };

    // Filtreleme sidebar'ının footer'ı (Clear ve Apply butonları)
    const filterFooter = (
        <div className="as-filter-footer">
            <button 
                className="btn-clear" 
                onClick={clearFilters}
            >
                Tümünü Temizle
            </button>
            <button 
                className="btn-apply" 
                onClick={() => { applyFilters(); setIsFilterOpen(false); }}
            >
                Filtreleri Uygula
            </button>
        </div>
    );

    if (loading) return <Loader type="butterfly" />;

    return (
        <div className="expense-page-container">
            <SubNavbar 
                pageName="Giderler"
                showCurrency={true}
                searchPlaceholder="Harcama ara..."
                searchValue={searchTerm}
                createLabel="Harcama Oluştur"
                onCreate={() => setIsCreateOpen(true)}
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
                        tooltip: 'Filter', 
                        onClick: () => setIsFilterOpen(true) 
                    }
                ]}
            />
            
            <hr className="sub-nav-divider" />

            <div className="expense-table-wrapper">
                <div className="expense-title-nav">
                    <input type="checkbox" />
                    <span className="ex-title-span">Detaylar</span>
                    <span className="ex-title-span">Kategori</span>
                    <span className="ex-title-span">İşletme</span>
                    <span className="ex-title-span">Ödeme</span>
                    <span className="ex-title-span">Miktar</span>
                    <span className="ex-title-span">Rapor</span>
                    <span className="ex-title-span">İşlem Durumu</span>
                </div>

                <div className="expense-list-container">
                    {filteredExpenses.length > 0 ? (
                        <>
                            {filteredExpenses.map((expense) => (
                                <div 
                                    key={expense.id} 
                                    className="expense-block" 
                                    onClick={() => handleOpenDetail(expense)}
                                >
                                    <input type="checkbox" onClick={(e) => e.stopPropagation()} />
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

            
            <ActionSidebar 
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                title="Filter Expenses"
                width="400px"
                footer={filterFooter}
            >
                <ExpenseFilter filters={tempFilters} setFilters={setTempFilters} />
            </ActionSidebar>

            {/* Modalların render edilmesi */}
            <CreateExpense isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            <ExpenseDetail 
                isOpen={isDetailOpen} 
                onClose={() => setIsDetailOpen(false)} 
                data={selectedExpense}
                onReopen={() => setIsDetailOpen(true)} 
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