import React, { useState } from 'react';
import './expenses.css/Expenses.css';
import CreateExpense from './modals/CreateExpense';
import ExpenseDetail from './modals/ExpenseDetail';
import allExpenses from './data/expenses.json'; 

const Expenses = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);

    const handleOpenDetail = (expenseData) => {
        setSelectedExpense(expenseData); 
        setIsDetailOpen(true);
    };

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
                {allExpenses.length > 0 ? (
                    allExpenses.map((expense) => (
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
                            
                            {/* Status için dinamik class ataması */}
                            <span className={`expense-status ${expense.status.toLowerCase()}`}>
                                {expense.status}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="no-data-msg">No expenses found.</div>
                )}
            </div>

            {/* Modallar / Paneller */}
            <CreateExpense 
                isOpen={isCreateOpen} 
                onClose={() => setIsCreateOpen(false)} 
            />

            {/* Detail */}
            <ExpenseDetail 
                isOpen={isDetailOpen} 
                onClose={() => setIsDetailOpen(false)} 
                data={selectedExpense} 
            />
        </div>
    );
}

export default Expenses;