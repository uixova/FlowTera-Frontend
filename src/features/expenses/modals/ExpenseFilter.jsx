import React from 'react';

const CATEGORIES = [
    { value: '',              label: 'Tüm Kategoriler' },
    { value: 'Food',          label: 'Yiyecek & İçecek' },
    { value: 'Transport',     label: 'Ulaşım' },
    { value: 'Accommodation', label: 'Konaklama' },
    { value: 'Health',        label: 'Sağlık' },
    { value: 'Entertainment', label: 'Eğlence' },
];

const STATUSES = [
    { value: '',         label: 'Tüm Durumlar' },
    { value: 'Pending',  label: 'Beklemede' },
    { value: 'Approved', label: 'Onaylandı' },
    { value: 'Rejected', label: 'Reddedildi' },
];

const METHODS = [
    { value: '',               label: 'Tüm Yöntemler' },
    { value: 'Credit Card',    label: 'Kredi Kartı' },
    { value: 'Cash',           label: 'Nakit' },
    { value: 'Bank Transfer',  label: 'Banka Transferi' },
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
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="filter-sidebar-content">
            <FilterSelect label="Kategori"       name="category"      value={filters.category}      onChange={handleChange} options={CATEGORIES} />
            <FilterSelect label="İşlem Durumu"   name="status"        value={filters.status}        onChange={handleChange} options={STATUSES} />
            <FilterSelect label="Ödeme Yöntemi"  name="paymentMethod" value={filters.paymentMethod} onChange={handleChange} options={METHODS} />

            <div className="filter-amount-row">
                <div className="filter-input-group">
                    <label>Min Miktar</label>
                    <input
                        type="number"
                        name="minAmount"
                        placeholder="0"
                        value={filters.minAmount || ''}
                        onChange={handleChange}
                    />
                </div>
                <div className="filter-input-group max-amount">
                    <label>Max Miktar</label>
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