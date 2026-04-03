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
                    <label>From Date</label>
                    <input 
                        type="date" 
                        name="startDate" 
                        value={filters.startDate || ''} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="filter-input-group">
                    <label>To Date</label>
                    <input 
                        type="date" 
                        name="endDate" 
                        value={filters.endDate || ''} 
                        onChange={handleChange} 
                    />
                </div>
            </div>

            {/* Rol Filtresi (admin, member, moderator, system) */}
            <div className="filter-input-group">
                <label>Performed By (Role)</label>
                <select name="role" value={filters.role || ''} onChange={handleChange}>
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="member">Member</option>
                    <option value="system">System</option>
                </select>
            </div>

            {/* İşlem Tipi (Log Type) */}
            <div className="filter-input-group">
                <label>Action Type</label>
                <select name="type" value={filters.type || ''} onChange={handleChange}>
                    <option value="">All Actions</option>
                    <option value="expense_add">Expense Added</option>
                    <option value="system_update">System Update</option>
                    <option value="member_join">Member Join</option>
                    <option value="trip_approval">Trip Approval</option>
                    <option value="rejection">Rejection</option>
                    <option value="status_update">Status Update</option>
                </select>
            </div>

            {/* Kullanıcı Bazlı Hızlı Filtre (Opsiyonel) */}
            <div className="filter-input-group">
                <label>Target User/Object</label>
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