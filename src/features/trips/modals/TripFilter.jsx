import React from 'react';

const CATEGORIES = [
    { value: '',          label: 'Tüm Kategoriler' },
    { value: 'Business',  label: 'İş Gezisi'       },
    { value: 'Vacation',  label: 'Tatil'            },
    { value: 'Event',     label: 'Etkinlik'         },
    { value: 'Other',     label: 'Diğer'            },
];

const VEHICLES = [
    { value: '',       label: 'Tüm Araçlar' },
    { value: 'Plane',  label: 'Uçak'        },
    { value: 'Train',  label: 'Tren'        },
    { value: 'Car',    label: 'Araba'       },
    { value: 'Bus',    label: 'Otobüs'      },
    { value: 'Ship',   label: 'Gemi'        },
];

const STATUSES = [
    { value: '',         label: 'Tüm Durumlar' },
    { value: 'approved', label: 'Onaylandı'    },
    { value: 'pending',  label: 'Beklemede'    },
    { value: 'onroad',   label: 'Yolda'        },
    { value: 'rejected', label: 'Reddedildi'   },
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

const TripFilter = ({ filters, setFilters }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="filter-sidebar-content">
            <div className="filter-amount-row">
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

            <FilterSelect label="Kategori"    name="category" value={filters.category} onChange={handleChange} options={CATEGORIES} />
            <FilterSelect label="Araç Türü"   name="vehicle"  value={filters.vehicle}  onChange={handleChange} options={VEHICLES} />
            <FilterSelect label="Gezi Durumu" name="status"   value={filters.status}   onChange={handleChange} options={STATUSES} />

            <div className="filter-amount-row">
                <div className="filter-input-group">
                    <label>Min Süre (Gün)</label>
                    <input
                        type="number"
                        name="minDuration"
                        placeholder="0"
                        value={filters.minDuration || ''}
                        onChange={handleChange}
                    />
                </div>
                <div className="filter-input-group">
                    <label>Max Süre (Gün)</label>
                    <input
                        type="number"
                        name="maxDuration"
                        placeholder="∞"
                        value={filters.maxDuration || ''}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default TripFilter;