import React from 'react';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation('history.filter');

    const ROLES = [
        { value: '',          label: t('all_roles')      },
        { value: 'admin',     label: t('role_admin')     },
        { value: 'moderator', label: t('role_moderator') },
        { value: 'member',    label: t('role_member')    },
        { value: 'system',    label: t('role_system')    },
    ];

    const TYPES = [
        { value: '',               label: t('all_actions')        },
        { value: 'expense_add',    label: t('type_expense_add')   },
        { value: 'system_update',  label: t('type_system_update') },
        { value: 'member_join',    label: t('type_member_join')   },
        { value: 'trip_approval',  label: t('type_trip_approval') },
        { value: 'rejection',      label: t('type_rejection')     },
        { value: 'status_update',  label: t('type_status_update') },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="filter-sidebar-content">
            <div className="filter-amount-row">
                <div className="filter-input-group">
                    <label>{t('start_date')}</label>
                    <input type="date" name="startDate" value={filters.startDate || ''} onChange={handleChange} />
                </div>
                <div className="filter-input-group">
                    <label>{t('end_date')}</label>
                    <input type="date" name="endDate" value={filters.endDate || ''} onChange={handleChange} />
                </div>
            </div>

            <FilterSelect label={t('role_label')} name="role" value={filters.role} onChange={handleChange} options={ROLES} />
            <FilterSelect label={t('type_label')} name="type" value={filters.type} onChange={handleChange} options={TYPES} />

            <div className="filter-input-group">
                <label>{t('target_label')}</label>
                <input
                    type="text"
                    name="target"
                    placeholder={t('target_placeholder')}
                    value={filters.target || ''}
                    onChange={handleChange}
                />
            </div>
        </div>
    );
};

export default HistoryFilter;
