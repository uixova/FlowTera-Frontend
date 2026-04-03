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
                    <label>Start Date</label>
                    <input 
                        type="date" 
                        name="startDate" 
                        value={filters.startDate || ''} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="filter-input-group">
                    <label>End Date</label>
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
                <label>Category</label>
                <select name="category" value={filters.category} onChange={handleChange}>
                    <option value="">All Categories</option>
                    <option value="Business">Business</option>
                    <option value="Vacation">Vacation</option>
                    <option value="Road Trip">Road Trip</option>
                </select>
            </div>

            {/* Araç Tipi */}
            <div className="filter-input-group">
                <label>Vehicle Type</label>
                <select name="vehicle" value={filters.vehicle} onChange={handleChange}>
                    <option value="">All Vehicles</option>
                    <option value="Plane">Plane</option>
                    <option value="Car">Car</option>
                    <option value="Train">Train</option>
                    <option value="Bus">Bus</option>
                </select>
            </div>

            {/* Trip Durumu */}
            <div className="filter-input-group">
                <label>Trip Status</label>
                <select name="status" value={filters.status || ''} onChange={handleChange}>
                    <option value="">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="onroad">On Road</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {/* Süre Aralığı */}
            <div className="filter-row">
                <div className="filter-input-group">
                    <label>Min Duration (Days)</label>
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
                    <label>Max Duration (Days)</label>
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