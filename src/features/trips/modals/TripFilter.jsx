import React from 'react';

const TripFilter = ({ filters, setFilters }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="filter-sidebar-content">
            {/* Tarih Aralığı */}
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

            {/* Kategori */}
            <div className="filter-input-group">
                <label>Kategori</label>
                <select name="category" value={filters.category} onChange={handleChange}>
                    <option value="">Tüm Kategoriler</option>
                    <option value="Business">İş Gezisi</option>
                    <option value="Vacation">Tatil</option>
                    <option value="Road Trip">Yolculuk</option>
                </select>
            </div>

            {/* Araç Tipi */}
            <div className="filter-input-group">
                <label>Araç Türü</label>
                <select name="vehicle" value={filters.vehicle} onChange={handleChange}>
                    <option value="">Tüm Araçlar</option>
                    <option value="Plane">Uçak</option>
                    <option value="Car">Araba</option>
                    <option value="Train">Tren</option>
                    <option value="Bus">Otobüs</option>
                </select>
            </div>

            {/* Trip Durumu */}
            <div className="filter-input-group">
                <label>Gezi Durumu</label>
                <select name="status" value={filters.status || ''} onChange={handleChange}>
                    <option value="">Tüm Durumlar</option>
                    <option value="approved">Onaylandı</option>
                    <option value="pending">Beklemede</option>
                    <option value="onroad">Yolda</option>
                    <option value="rejected">Reddedildi</option>
                </select>
            </div>

            {/* Süre Aralığı */}
            <div className="filter-row">
                <div className="filter-input-group">
                    <label>Min Süre (Gün)</label>
                    <input 
                        type="number" 
                        name="minDuration" 
                        value={filters.minDuration} 
                        onChange={handleChange} 
                        placeholder="0" 
                        className='input-val'
                    />
                </div>
                <div className="filter-input-group">
                    <label>Max Süre (Gün)</label>
                    <input 
                        type="number" 
                        name="maxDuration" 
                        value={filters.maxDuration} 
                        onChange={handleChange} 
                        placeholder="Max" 
                        className='input-val'
                    />
                </div>
            </div>
        </div>
    );
};

export default TripFilter;