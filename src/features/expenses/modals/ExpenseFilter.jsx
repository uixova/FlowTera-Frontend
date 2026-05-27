import React from 'react';
import { useTranslation } from 'react-i18next';
import { useI18n } from '../../../utils/i18nHelpers';

const CATEGORY_VALUES = [
    'Food', 'Transport', 'Accommodation', 'Health', 'Entertainment',
    'Office', 'Education', 'Technology', 'Shopping', 'Utilities',
    'Finance', 'Events', 'Marketing', 'Legal', 'Other',
];

const STATUS_VALUES = ['pending', 'approved', 'rejected'];

const METHOD_VALUES = [
    'Cash', 'Credit Card', 'Bank Transfer', 'Debit Card',
    'Mobile Payment', 'Check', 'Other',
];

const FilterSelect = ({ label, name, value, onChange, options }) => (
    <div className="filter-input-group">
        <label>{label}</label>
        <select name={name} value={value || ''} onChange={onChange}>
            {options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    </div>
);

const ExpenseFilter = ({ filters, setFilters }) => {
    const { t } = useTranslation('expenses.filter');
    const { tCategory, tStatus, tPayment } = useI18n();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const categoryOptions = [
        { value: '', label: t('all_categories') },
        ...CATEGORY_VALUES.map(v => ({ value: v, label: tCategory(v) })),
    ];

    const statusOptions = [
        { value: '', label: t('all_statuses') },
        ...STATUS_VALUES.map(v => ({ value: v, label: tStatus(v) })),
    ];

    const methodOptions = [
        { value: '', label: t('all_methods') },
        ...METHOD_VALUES.map(v => ({ value: v, label: tPayment(v) })),
    ];

    return (
        <div className="filter-sidebar-content">
            <FilterSelect label={t('category', { ns: 'common.forms' })}      name="category"      value={filters.category}      onChange={handleChange} options={categoryOptions} />
            <FilterSelect label={t('status')}                                  name="status"        value={filters.status}        onChange={handleChange} options={statusOptions} />
            <FilterSelect label={t('payment_method', { ns: 'common.forms' })} name="paymentMethod" value={filters.paymentMethod} onChange={handleChange} options={methodOptions} />

            <div className="filter-amount-row">
                <div className="filter-input-group">
                    <label>{t('min_amount')}</label>
                    <input
                        type="number"
                        name="minAmount"
                        placeholder="0"
                        value={filters.minAmount || ''}
                        onChange={handleChange}
                    />
                </div>
                <div className="filter-input-group max-amount">
                    <label>{t('max_amount')}</label>
                    <input
                        type="number"
                        name="maxAmount"
                        placeholder="∞"
                        value={filters.maxAmount || ''}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default ExpenseFilter;
