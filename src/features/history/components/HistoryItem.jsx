import React from 'react';
import { useTranslation } from 'react-i18next';
import './HistoryItem.css';
import { useTimeAgo } from '../../../hooks/useTimeAgo';

const EXCLUDED_DETAIL_KEYS = ['priority', 'fleet_unit', 'request_id'];

// Maps raw Turkish tag/badge values from backend to history.list translation keys
const TAG_KEY_MAP = {
    // Turkish values from logWriter
    'Onaylandı':  'tag_approved',
    'Onaylı':     'tag_approved',
    'Reddedildi': 'tag_rejected',
    'Yeni Üye':   'tag_new_member',
    'Çıkarıldı':  'tag_removed',
    // English keys from demo/new logs
    'approved':   'tag_approved',
    'rejected':    'tag_rejected',
    'expense':    'tag_expense',
    'travel':     'tag_travel',
    'new_member': 'tag_new_member',
    'removed':    'tag_removed',
    // Turkish category tags
    'Gider':      'tag_expense',
    'Seyahat':    'tag_travel',
};

// Maps raw Turkish detail keys to history.list det_ translation keys
const DETAIL_KEY_MAP = {
    'tutar':           'det_amount',
    'amount':          'det_amount',
    'kategori':        'det_category',
    'category':        'det_category',
    'varış':           'det_destination',
    'destination':     'det_destination_label',
    'araç':            'det_vehicle',
    'vehicle':         'det_vehicle',
    'neden':           'det_reason',
    'reason':          'det_reason',
    'onaylayan':       'det_approver',
    'approver':        'det_approver',
    'rejection_reason':'det_rejection_reason',
    'assigned_role':   'det_assigned_role',
};

const HistoryItem = ({ item, isActive, onToggle }) => {
    const { t } = useTranslation('history.list');
    const timeAgo = useTimeAgo(item.createdAt);

    // Translate action using type (preferred) or action key
    const actionKey = item.type || item.action;
    const actionLabel = t(actionKey, { defaultValue: item.action || actionKey });

    // Translate tag
    const tagLabel = item.tag
        ? t(TAG_KEY_MAP[item.tag] || item.tag, { defaultValue: item.tag })
        : null;

    const detailEntries = item.details
        ? Object.entries(item.details).filter(([key]) => !EXCLUDED_DETAIL_KEYS.includes(key))
        : [];

    return (
        <div
            className={`history-wrapper${isActive ? ' is-expanded' : ''}`}
            data-role={item.role}
        >
            <div className="history-item" onClick={() => onToggle(item.id)}>
                <div className={`hi-icon ${item.iconClass || ''}`}>
                    <i className={`ti ${item.icon}`} />
                </div>

                <div className="hi-content">
                    <div className="hi-info">
                        <span className={`hi-badge ${item.role}`}>{item.badge}</span>
                        <span className="hi-user">{item.user}</span>
                        <span className="hi-action">{actionLabel}</span>
                        {item.target && (
                            <span className="hi-target" title={item.target}>{item.target}</span>
                        )}
                    </div>

                    <div className="hi-meta">
                        <span className="hi-time">{timeAgo}</span>
                        {item.amount ? (
                            <span className="hi-amount">{item.amount}</span>
                        ) : tagLabel ? (
                            <span className={`hi-tag-base ${item.tagClass || ''}`}>{tagLabel}</span>
                        ) : null}
                        <i className="ti ti-chevron-down hi-chevron" />
                    </div>
                </div>
            </div>

            {detailEntries.length > 0 && (
                <div className="history-accordion-content">
                    <div className="hi-det-inner">
                        <div className="hi-det-grid">
                            {detailEntries.map(([key, value]) => {
                                const labelKey = DETAIL_KEY_MAP[key];
                                const label = labelKey
                                    ? t(labelKey, { defaultValue: key.replace(/_/g, ' ') })
                                    : key.replace(/_/g, ' ');
                                return (
                                    <div className="hi-det-box" key={key}>
                                        <span className="hi-det-label">{label}</span>
                                        <span className="hi-det-value">{String(value)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryItem;
