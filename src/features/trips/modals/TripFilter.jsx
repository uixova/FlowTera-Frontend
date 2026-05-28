import React from 'react';
import { useTranslation } from 'react-i18next';
import { useI18n } from '../../../utils/i18nHelpers';

const TRIP_CATEGORY_VALUES = ['Business', 'Vacation', 'Event', 'Conference', 'Training', 'Operation', 'Marketing', 'Other'];
const VEHICLE_VALUES       = ['Plane', 'Train', 'Car', 'Bus', 'Ship', 'Taxi', 'Motorcycle', 'Other'];
const STATUS_VALUES        = ['approved', 'pending', 'onroad', 'rejected'];

const TripFilter = ({ filters, setFilters }) => {
    const { t } = useTranslation('trips.filter');
    const { tStatus, tTripCategory, tVehicle } = useI18n();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="filter-sidebar-content">
            <div className="filter-amount-row">
                <div className="filter-input-group">
                    <label>{t('start_date')}</label>
                    <input
                        type="date"
                        name="startDate"
                        value={filters.startDate || ''}
                        onChange={handleChange}
                    />
                </div>
                <div className="filter-input-group">
                    <label>{t('end_date')}</label>
                    <input
                        type="date"
                        name="endDate"
                        value={filters.endDate || ''}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="filter-input-group">
                <label>{t('category_label')}</label>
                <select name="category" value={filters.category || ''} onChange={handleChange}>
                    <option value="">{t('all_categories')}</option>
                    {TRIP_CATEGORY_VALUES.map((v) => (
                        <option key={v} value={v}>{tTripCategory(v)}</option>
                    ))}
                </select>
            </div>

            <div className="filter-input-group">
                <label>{t('vehicle_label')}</label>
                <select name="vehicle" value={filters.vehicle || ''} onChange={handleChange}>
                    <option value="">{t('all_vehicles')}</option>
                    {VEHICLE_VALUES.map((v) => (
                        <option key={v} value={v}>{tVehicle(v)}</option>
                    ))}
                </select>
            </div>

            <div className="filter-input-group">
                <label>{t('status_label')}</label>
                <select name="status" value={filters.status || ''} onChange={handleChange}>
                    <option value="">{t('all_statuses')}</option>
                    {STATUS_VALUES.map((v) => (
                        <option key={v} value={v}>{tStatus(v)}</option>
                    ))}
                </select>
            </div>

            <div className="filter-amount-row">
                <div className="filter-input-group">
                    <label>{t('min_duration')}</label>
                    <input
                        type="number"
                        name="minDuration"
                        placeholder="0"
                        value={filters.minDuration || ''}
                        onChange={handleChange}
                    />
                </div>
                <div className="filter-input-group">
                    <label>{t('max_duration')}</label>
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
