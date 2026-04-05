import React from 'react';

const ExpenseFilter = ({ filters, setFilters }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Sayısal alanlar için boş bırakıldığında null veya boş string yönetimi
        setFilters(prev => ({ 
            ...prev, 
            [name]: value 
        }));
    };

    return (
        <div className="filter-sidebar-content">
            {/* Kategori Seçimi - Value'ların data ile eşleştiğinden emin ol */}
            <div className="filter-input-group">
                <label>Kategori</label>
                <select name="category" value={filters.category || ''} onChange={handleChange}>
                    <option value="">Tüm Kategoriler</option>
                    <option value="Food">Yemek</option> 
                    <option value="Transport">Ulaşım</option>
                    <option value="Accommodation">Konaklama</option>
                    <option value="Health">Sağlık</option>
                    <option value="Entertainment">Eğlence</option>
                </select>
            </div>

            {/* Durum Seçimi - Küçük harf/Büyük harf uyumuna dikkat */}
            <div className="filter-input-group">
                <label>İşlem Durumu</label>
                <select name="status" value={filters.status || ''} onChange={handleChange}>
                    <option value="">Tüm Durumlar</option>
                    <option value="Pending">Beklemede</option>
                    <option value="Approved">Onaylandı</option>
                    <option value="Rejected">Reddedildi</option>
                </select>
            </div>

            {/* Ödeme Yöntemi */}
            <div className="filter-input-group">
                <label>Ödeme Yöntemi</label>
                <select name="paymentMethod" value={filters.paymentMethod || ''} onChange={handleChange}>
                    <option value="">Tüm Yöntemler</option>
                    <option value="Credit Card">Kredi Kartı</option>
                    <option value="Cash">Nakit</option>
                    <option value="Bank Transfer">Banka Transferi</option>
                </select>
            </div>

            {/* Miktar Aralığı */}
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
                        placeholder="Max" 
                        value={filters.maxAmount || ''}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default ExpenseFilter;