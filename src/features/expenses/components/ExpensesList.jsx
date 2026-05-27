import React, { useCallback, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useActionPermissions } from '../../../hooks/useActionPermissions';
import { useCurrency } from '../../../context/CurrencyContext';
import { useI18n } from '../../../utils/i18nHelpers';

const ExpenseRow = memo(({ expense, onOpenDetail, onEdit }) => {
    const { t } = useTranslation('expenses.list');
    const { tCategory, tStatus } = useI18n();
    const { canEdit } = useActionPermissions(expense);
    const { convert, selectedCurrency, symbol } = useCurrency();

    const displayAmount = useMemo(() => convert(expense, selectedCurrency), [expense, selectedCurrency, convert]);

    const statusKey = expense.status?.toLowerCase();

    const statusInfo = useMemo(() => {
        const iconMap = {
            approved: 'ti-circle-check',
            pending:  'ti-clock-hour-4',
            rejected: 'ti-circle-x',
        };
        return {
            label: tStatus(statusKey || expense.status || ''),
            cls:   statusKey || '',
            icon:  iconMap[statusKey] || 'ti-help-square-filled',
        };
    }, [statusKey, expense.status, tStatus]);

    const isPending = statusKey === 'pending';

    const handleRowClick = useCallback((e) => {
        if (isPending && canEdit) {
            onEdit(e, expense);
        } else {
            onOpenDetail(expense);
        }
    }, [isPending, canEdit, expense, onEdit, onOpenDetail]);

    const handleEditClick = useCallback((e) => {
        e.stopPropagation();
        onEdit(e, expense);
    }, [expense, onEdit]);

    return (
        <div className="expense-block" onClick={handleRowClick}>
            <div className="expense-block-details">
                <span className="expense-icon">
                    <i className={`ti ${expense.icon || 'ti-receipt'}`} />
                </span>
                <div className="expense-details-text">
                    <span className="expense-date">{expense.date}</span>
                    <span className="expense-title" title={expense.title}>{expense.title}</span>
                </div>
            </div>

            <span className="ex-category-tag">{tCategory(expense.category)}</span>
            <span className="ex-merchant-text">{expense.merchant}</span>
            <span className="ex-method-text">{expense.paymentMethod}</span>

            <div className="ex-list-amount-wrapper">
                <span className="ex-list-symbol">{symbol}</span>
                <span className="ex-list-amount-val">{(Number(displayAmount) || 0).toFixed(2)}</span>
                <span className="ex-list-currency">{selectedCurrency}</span>
            </div>

            <span className="ex-report-name">{expense.report || 'General'}</span>

            <div className={`expense-status ${statusInfo.cls}`} title={statusInfo.label}>
                <span className="status-text">{statusInfo.label}</span>
                <i className={`status-icon ti ${statusInfo.icon}`} />
            </div>

            <div className="ex-row-actions">
                {canEdit && isPending && (
                    <button
                        className="action-btn edit"
                        onClick={handleEditClick}
                        title={t('edit', { ns: 'common.buttons' })}
                    >
                        <i className="ti ti-edit" />
                    </button>
                )}
            </div>
        </div>
    );
});

ExpenseRow.displayName = 'ExpenseRow';

const ExpensesList = memo(({ data, onOpenDetail, onEdit }) => {
    return (
        <div className="expense-list-container">
            {data.map((expense) => (
                <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    onOpenDetail={onOpenDetail}
                    onEdit={onEdit}
                />
            ))}
        </div>
    );
});

ExpensesList.displayName = 'ExpensesList';

export default ExpensesList;
