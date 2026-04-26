import React from 'react';
import { useActionPermissions } from '../../../hooks/useActionPermissions';
import { useCurrency } from '../../../context/CurrencyContext';
import { useModal } from '../../../hooks/useModal';
import Confirm from '../../../components/modals/Confirm';

const ExpenseRow = ({ expense, onOpenDetail, onEdit, onDeleteClick }) => {
    const { canEdit, canDelete } = useActionPermissions(expense);
    const { convert, selectedCurrency, symbol } = useCurrency();
    const displayAmount = convert(expense, selectedCurrency);

    return (
        <div className="expense-block" onClick={() => onOpenDetail(expense)}>
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
                <span className="ex-list-symbol">{symbol}</span>
                <span className="ex-list-amount-val">
                    {(Number(displayAmount) || 0).toFixed(2)}
                </span>
                <span className="ex-list-currency">{selectedCurrency}</span>
            </div>
            <span className="ex-report-name">{expense.report || 'General'}</span>
            <span className={`expense-status ${expense.status?.toLowerCase()}`}>
                {expense.status}
            </span>

            <div className="ex-row-actions">
                {canEdit && (
                    <button className="action-btn edit" onClick={(e) => onEdit(e, expense)}>
                        <i className="ti ti-edit"></i>
                    </button>
                )}
                {canDelete && (
                    <button className="action-btn delete" onClick={(e) => onDeleteClick(e, expense)}>
                        <i className="ti ti-trash"></i>
                    </button>
                )}
            </div>
        </div>
    );
};

const ExpensesList = ({ data, onOpenDetail, onEdit, onDelete }) => {
    const { confirmConfig, askConfirm, closeConfirm } = useModal();

    const handleDeleteClick = (e, expense) => {
        e.stopPropagation(); 
        askConfirm(
            "Harcama Kaydını Sil",
            `"${expense.title}" başlıklı harcamayı silmek istediğinize emin misiniz?`,
            () => onDelete(e, expense.id), 
            "danger"
        );
    };

    return (
        <div className="expense-list-container">
            {data.map((expense) => (
                <ExpenseRow 
                    key={expense.id} 
                    expense={expense} 
                    onOpenDetail={onOpenDetail}
                    onEdit={onEdit}
                    onDeleteClick={handleDeleteClick}
                />
            ))}
            <Confirm {...confirmConfig} onClose={closeConfirm} />
        </div>
    );
};

export default ExpensesList;