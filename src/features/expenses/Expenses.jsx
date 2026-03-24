import React, { useState, useEffect, useCallback } from 'react'; 
import Loader from '../../components/common/Loader';
import './expenses.css/Expenses.css';
import SubNavbar from '../../components/navigation/SubNavbar';
import CreateExpense from './modals/CreateExpense';
import ExpenseDetail from './modals/ExpenseDetail';
import CurrencyModal from '../../components/modals/CurrencyModal';
// Harcama servis fonksiyonları
import { expenseService } from './services/expenseService';

const Expenses = () => {
    // State tanımları
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCurrencyOpen, setIsCurrencyOpen] = useState(false); 
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        return sessionStorage.getItem('selectedCurrency') || 'USD';
    });
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    

    // Veri yükleme fonksiyonu, useCallback ile sarmalanarak gereksiz yeniden oluşturulmaların önüne geçilir.
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            // 1. LocalStorage'dan aktif takım ID'sini al
            const activeTeamId = localStorage.getItem('tm_selected_id');
            
            // 2. Servise bu ID'yi göndererek filtreli veriyi çek
            const data = await expenseService.getExpensesByTeam(activeTeamId);
            
            setExpenses(data);
        } catch (error) { 
            console.error("Veri yükleme hatası:", error); 
        } finally { 
            setLoading(false); 
        }
    }, []);

    // Bileşen yüklendiğinde veri çekme
    useEffect(() => {
    // İlk açılışta veriyi çek
    loadData();
    // Takım değiştiğinde çalışacak fonksiyon
    const handleTeamRefresh = () => {
        loadData(); // Bu fonksiyonun içinde setLoading(true) olduğu için loader çıkar.
    };

    // Dinleyiciyi ekle
    window.addEventListener('teamChanged', handleTeamRefresh);
    window.addEventListener('storage', handleTeamRefresh); // Diğer sekmeler/pencereler için garantiye alalım

    return () => {
        // Bellek sızıntısı olmasın diye temizle
        window.removeEventListener('teamChanged', handleTeamRefresh);
        window.removeEventListener('storage', handleTeamRefresh);
    };
}, [loadData]);

    // Harcama detayını açan yardımcı fonksiyon
    const handleOpenDetail = (expense) => {
        setSelectedExpense(expense);
        setIsDetailOpen(true);
    };

    // Para birimi seçildiğinde çağrılacak fonksiyon
    const handleCurrencySelect = (currencyCode) => {
        setSelectedCurrency(currencyCode);
        sessionStorage.setItem('selectedCurrency', currencyCode);
    };

    // Yükleniyor durumunda Loader bileşenini göster
    if (loading) return <Loader type="butterfly" />;

    return (
        <div className="expense-page-container">
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

                {/* Harcamalar tablosu */}
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

                {/* Harcamalar listesi, tıklanabilir bloklar halinde */}
                <div className="expense-list-container">
                    {expenses.length > 0 ? (
                        expenses.map((expense) => (
                            <div key={expense.id} className="expense-block" onClick={() => handleOpenDetail(expense)}>
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
                        ))
                    ) : (
                        <div className="no-data-info">Kayıtlı harcama bulunamadı.</div>
                    )}
                </div>
            </div>

                    {/* Modallar */}
            <CreateExpense isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            <ExpenseDetail isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} data={selectedExpense} />

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