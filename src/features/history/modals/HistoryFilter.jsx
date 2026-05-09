import React from 'react';

const ROLES = [
    { value: '',          label: 'Tüm Roller'  },
    { value: 'admin',     label: 'Admin'        },
    { value: 'moderator', label: 'Moderatör'    },
    { value: 'member',    label: 'Üye'          },
    { value: 'system',    label: 'Sistem'       },
];

const TYPES = [
    { value: '',               label: 'Tüm İşlemler'       },
    { value: 'expense_add',    label: 'Harcama Eklendi'    },
    { value: 'system_update',  label: 'Sistem Güncellemesi' },
    { value: 'member_join',    label: 'Yeni Üye Kaydı'     },
    { value: 'trip_approval',  label: 'Gezi Onayı'         },
    { value: 'rejection',      label: 'Reddedilen Talepler' },
    { value: 'status_update',  label: 'Durum Güncellemesi' },
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

const HistoryFilter = ({ filters, setFilters }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="filter-sidebar-content">
            {/* Tarih Aralığı (ISO Formatı İçin) */}
            <div className="filter-amount-row">
                <div className="filter-input-group">
                    <label>Başlangıç Tarihi</label>
                    <input type="date" name="startDate" value={filters.startDate || ''} onChange={handleChange} />
                </div>
                <div className="filter-input-group">
                    <label>Bitiş Tarihi</label>
                    <input type="date" name="endDate" value={filters.endDate || ''} onChange={handleChange} />
                </div>
            </div>

            <FilterSelect label="İşlemi Yapan (Rol)" name="role" value={filters.role} onChange={handleChange} options={ROLES} />
            <FilterSelect label="İşlem Türü"         name="type" value={filters.type} onChange={handleChange} options={TYPES} />

            <div className="filter-input-group">
                <label>Hedef Kullanıcı / İşlem</label>
                <input
                    type="text"
                    name="target"
                    placeholder="Hedef ara..."
                    value={filters.target || ''}
                    onChange={handleChange}
                />
            </div>
        </div>
    );
};

export default HistoryFilter;