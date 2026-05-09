import React from 'react';
import './HistoryItem.css';
import { useTimeAgo } from '../../../hooks/useTimeAgo';

const EXCLUDED_DETAIL_KEYS = ['priority', 'fleet_unit', 'request_id'];

const HistoryItem = ({ item, isActive, onToggle }) => {
    const timeAgo = useTimeAgo(item.createdAt);

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
                        <span className="hi-action">{item.action}</span>
                        {item.target && (
                            <span className="hi-target" title={item.target}>{item.target}</span>
                        )}
                    </div>

                    <div className="hi-meta">
                        <span className="hi-time">{timeAgo}</span>
                        {item.amount ? (
                            <span className="hi-amount">{item.amount}</span>
                        ) : item.tag ? (
                            <span className={`hi-tag-base ${item.tagClass || ''}`}>{item.tag}</span>
                        ) : null}
                        <i className="ti ti-chevron-down hi-chevron" />
                    </div>
                </div>
            </div>

            {detailEntries.length > 0 && (
                <div className="history-accordion-content">
                    <div className="hi-det-inner">
                        <div className="hi-det-grid">
                            {detailEntries.map(([key, value]) => (
                                <div className="hi-det-box" key={key}>
                                    <span className="hi-det-label">
                                        {key.replace(/_/g, ' ')}
                                    </span>
                                    <span className="hi-det-value">{String(value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryItem;