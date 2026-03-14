import React, { useState, useEffect } from 'react'; 
import './expenses.css/Expenses.css';
import SubNavbar from '../../components/navigation/SubNavbar';
import CreateExpense from './modals/CreateExpense';
import ExpenseDetail from './modals/ExpenseDetail';

// Mock API çağrısı için örnek servis
import { expenseService } from './services/expenseService';

const Expenses = () => {
    // Modal Açma/Kapama State'leri
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Verileri API'den çekme (Simülasyon)
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const data = await expenseService.getAllExpenses();
                setExpenses(data);
            } catch (error) { console.error(error); } 
            finally { setLoading(false); }
        };
        // Bileşen yüklendiğinde verileri çek
        loadData();
    }, []);

    // loading true ise yükleniyor mesajı göster
    if (loading) return <div className="ex-loading">Harcamalar yükleniyor...</div>;

    return (
        <div className="expense-page-container">
            {/* SubNavbar bileşeni, başlık, arama ve butonları içerir */}
            <SubNavbar 
                title="Expenses"
                searchPlaceholder="Search expenses..."
                createLabel="New Expense"
                onCreate={() => setIsCreateOpen(true)}
                onSearch={(val) => console.log("Arama:", val)}
                buttons={[
                    { icon: 'ti ti-filter', tooltip: 'Filter', onClick: () => console.log("Filter") },
                    { icon: 'ti ti-filter-2', tooltip: 'Ranking', onClick: () => console.log("Ranking") },
                    { icon: 'ti ti-list-details', tooltip: 'Details', onClick: () => console.log("Details") }
                ]}
            />
            
            <hr className="sub-nav-divider" />

            <div className="expense-table-wrapper">
                {/* Liste Başlıkları */}
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

                {/* Liste İçeriği */}
                <div className="expense-list-container">
                    {expenses.map((expense) => (
                        <div key={expense.id} className="expense-block" onClick={() => {
                            setSelectedExpense(expense);
                            setIsDetailOpen(true);
                        }}>
                            {/* Veri hücreleri buraya... */}
                            <input type="checkbox" onClick={(e) => e.stopPropagation()} />
                            <div className="expense-block-details">
                                <span className="expense-icon"><i className={`ti ${expense.icon || 'ti-receipt'}`}></i></span>
                                <div className="expense-details-text">
                                    <span className="expense-date">{expense.date}</span>
                                    <span className="expense-title">{expense.title}</span>
                                </div>
                            </div>
                            <span>{expense.category}</span>
                            <span>{expense.merchant}</span>
                            <span>{expense.paymentMethod}</span>
                            <span className="ex-expense-amount">{expense.amount}</span>
                            <span>{expense.report}</span>
                            <span className={`expense-status ${expense.status?.toLowerCase()}`}>{expense.status}</span>
                        </div>
                    ))}
                </div>
            </div>

            <CreateExpense isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            <ExpenseDetail isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} data={selectedExpense} />
        </div>
    );
}

export default Expenses;