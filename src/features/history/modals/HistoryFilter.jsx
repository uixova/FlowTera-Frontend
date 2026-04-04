import React from 'react';

const HistoryFilter = ({ filters, setFilters }) => {
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="filter-sidebar-content">
            {/* Tarih Aralığı (ISO Formatı İçin) */}
            <div className="filter-row">
                <div className="filter-input-group">
                    <label>Başlangıç Tarihi</label>
                    <input 
                        type="date" 
                        name="startDate" 
                        value={filters.startDate || ''} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="filter-input-group">
                    <label>Bitiş Tarihi</label>
                    <input 
                        type="date" 
                        name="endDate" 
                        value={filters.endDate || ''} 
                        onChange={handleChange} 
                    />
                </div>
            </div>

            {/* Rol Filtresi (Yönetici, Üye, Moderatör, Sistem) */}
            <div className="filter-input-group">
                <label>İşlemi Yapan (Rol)</label>
                <select name="role" value={filters.role || ''} onChange={handleChange}>
                    <option value="">Tüm Roller</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderatör</option>
                    <option value="member">Üye</option>
                    <option value="system">Sistem</option>
                </select>
            </div>

            {/* İşlem Tipi (Log Type) */}
            <div className="filter-input-group">
                <label>İşlem Türü</label>
                <select name="type" value={filters.type || ''} onChange={handleChange}>
                    <option value="">Tüm İşlemler</option>
                    <option value="expense_add">Harcama Eklendi</option>
                    <option value="system_update">Sistem Güncellemesi</option>
                    <option value="member_join">Yeni Üye Kaydı</option>
                    <option value="trip_approval">Gezi Onayı</option>
                    <option value="rejection">Reddedilen Talepler</option>
                    <option value="status_update">Durum Güncellemesi</option>
                </select>
            </div>

            {/* Kullanıcı Bazlı Hızlı Filtre (Opsiyonel) */}
            <div className="filter-input-group">
                <label>Hedef Kullanıcı/İşlem</label>
                <input 
                    type="text" 
                    name="target" 
                    placeholder="Search target..." 
                    value={filters.target || ''} 
                    onChange={handleChange}
                    className="input-val"
                />
            </div>
        </div>
    );
};

export default HistoryFilter;