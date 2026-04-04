import React from 'react';

const ExpenseFilter = ({ filters, setFilters }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="filter-sidebar-content">
            {/* Category Seçimi */}
            <div className="filter-input-group">
                <label>Kategori</label>
                <select name="category" value={filters.category} onChange={handleChange}>
                    <option value="">Tüm Kategoriler</option>
                    <option value="Travel">Seyahat</option>
                    <option value="Food & Drink">Yiyecek ve İçecek</option>
                    <option value="Accommodation">Konaklama</option>
                    <option value="Transport">Ulaşım</option>
                    <option value="Entertainment">Eğlence</option>
                </select>
            </div>

            {/* Status Seçimi */}
            <div className="filter-input-group">
                <label>İşlem Durumu</label>
                <select name="status" value={filters.status} onChange={handleChange}>
                    <option value="">Tüm Durumlar</option>
                    <option value="pending">Beklemede</option>
                    <option value="approved">Onaylandı</option>
                    <option value="rejected">Reddedildi</option>
                </select>
            </div>

            {/* Payment Method Seçimi */}
            <div className="filter-input-group">
                <label>Ödeme Yöntemi</label>
                <select name="paymentMethod" value={filters.paymentMethod} onChange={handleChange}>
                    <option value="">Tüm Yöntemler</option>
                    <option value="Credit Card">Kredi Kartı</option>
                    <option value="Cash">Nakit</option>
                    <option value="Bank Transfer">Banka Transferi</option>
                </select>
            </div>

            {/* Amount Aralığı (Min - Max) */}
            <div className="filter-amount-row">
                <div className="filter-input-group">
                    <label>Min Miktar</label>
                    <input 
                        type="number" 
                        name="minAmount"
                        placeholder="0" 
                        value={filters.minAmount}
                        onChange={handleChange}
                    />
                </div>
                <div className="filter-input-group max-amount">
                    <label>Max Miktar</label>
                    <input 
                        type="number" 
                        name="maxAmount"
                        placeholder="Max" 
                        value={filters.maxAmount}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default ExpenseFilter;