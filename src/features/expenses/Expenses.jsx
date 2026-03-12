import React, { useState, useEffect } from 'react'; 
import './expenses.css/Expenses.css';
import CreateExpense from './modals/CreateExpense';
import ExpenseDetail from './modals/ExpenseDetail';

import { expenseService } from './services/expenseService';

const Expenses = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Servis üzerinden veriyi çekme
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const data = await expenseService.getAllExpenses();
                setExpenses(data);
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleOpenDetail = (expenseData) => {
        setSelectedExpense(expenseData); 
        setIsDetailOpen(true);
    };

    // Yüklenme ekranı 
    if (loading) return <div className="ex-loading">Harcamalar yükleniyor...</div>;

    return (
        <div className="expense" id="expense">
            {/* Navigasyon Alanı */}
            <div className="ex-nav">
                <div className="ex-nav-title">
                    <h1>Expenses</h1>
                </div>
                <div className="ex-nav-buttons">
                    <div className="search-wrapper">
                        <i className="ti ti-search"></i>
                        <input type="text" placeholder="Search expenses..." />
                    </div>
                    <button id="exCreateExpense" onClick={() => setIsCreateOpen(true)}>New Expense</button>
                    <button className="ex-filter-cta" id="exFilterBtn">
                        <i className="ti ti-filter"></i>
                    </button>
                    <button className="ex-ranking-cta" id="exRankingBtn">
                        <i className="ti ti-filter-2"></i>
                    </button>
                    <button className="ex-setting-three-dot" id="exSettingBtn">
                        <i className="ti ti-list-details"></i>
                    </button>
                </div>
            </div>
            
            <hr />

            {/* Liste Başlıkları */}
            <div className="expense-title-nav">
                <input type="checkbox" id="selectAllExpense" />
                <span className="ex-title-span">Details</span>
                <span className="ex-title-span">Category</span>
                <span className="ex-title-span">Merchant</span>
                <span className="ex-title-span">Payment</span>
                <span className="ex-title-span">Amount</span>
                <span className="ex-title-span">Report</span>
                <span className="ex-title-span">Status</span>
            </div>

            {/* Dinamik Harcama Listesi */}
            <div className="expense-list-container">
                {expenses.length > 0 ? (
                    expenses.map((expense) => (
                        <div 
                            key={expense.id}
                            className="expense-block" 
                            onClick={() => handleOpenDetail(expense)}
                        >
                            <input 
                                type="checkbox" 
                                className="select-expense" 
                                onClick={(e) => e.stopPropagation()} 
                            />
                            
                            <div className="expense-block-details">
                                <span className="expense-icon">
                                    <i className={`ti ${expense.icon || 'ti-receipt'}`}></i>
                                </span>
                                <div className="expense-details-text">
                                    <span className="expense-date">{expense.date}</span>
                                    <span className="expense-title">{expense.title}</span>
                                </div>
                            </div>

                            <span className="expense-category">{expense.category}</span>
                            <span className="expense-merchant">{expense.merchant}</span>
                            <span className="expense-payment-method">{expense.paymentMethod}</span>
                            <span className="ex-expense-amount">{expense.amount}</span>
                            <span className="expense-report">{expense.report}</span>
                            
                            <span className={`expense-status ${expense.status?.toLowerCase()}`}>
                                {expense.status}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="no-data-msg">No expenses found.</div>
                )}
            </div>

            {/* Modallar */}
            <CreateExpense 
                isOpen={isCreateOpen} 
                onClose={() => setIsCreateOpen(false)} 
            />

            <ExpenseDetail 
                isOpen={isDetailOpen} 
                onClose={() => setIsDetailOpen(false)} 
                data={selectedExpense} 
            />
        </div>
    );
}

export default Expenses;