import React from 'react';
import './HistoryItem.css';
import { useTimeAgo } from '../../../hooks/useTimeAgo';

const HistoryItem = ({ item, isActive, onToggle }) => {
    const timeAgo = useTimeAgo(item.createdAt);

    return (
        <div 
            className={`history-wrapper ${isActive ? 'is-expanded' : ''}`}
            data-role={item.role} 
        >
            <div className="history-item" onClick={() => onToggle(item.id)}>
                <div className="hi-status-line"></div>
                <div className={`hi-icon ${item.iconClass}`}>
                    <i className={`ti ${item.icon}`}></i>
                </div>
                
                <div className="hi-content">
                    <div className="hi-info">
                        <span className={`hi-badge ${item.role}`}>{item.badge}</span>
                        <span className="hi-user">{item.user}</span>
                        <span className="hi-action">{item.action}</span>
                        <span className="hi-target">{item.target}</span>
                    </div>
                    
                    <div className="hi-meta">
                        <span className="hi-time">{timeAgo}</span>
                        {item.amount ? (
                            <span className="hi-amount">{item.amount}</span>
                        ) : (
                            <span className={`hi-tag-base ${item.tagClass}`}>{item.tag}</span>
                        )}
                        <i className="ti ti-chevron-down hi-chevron"></i>
                    </div>
                </div>
            </div>

            <div className="history-accordion-content">
                <div className="hi-det-inner">
                    <div className="hi-det-grid">
                        {item.details && Object.entries(item.details)
                            .filter(([key]) => !['priority', 'fleet_unit', 'request_id'].includes(key))
                            .map(([key, value]) => (
                                <div className="hi-det-box" key={key}>
                                    <span className="hi-det-label">
                                        {key.replace(/_/g, ' ').toUpperCase()}
                                    </span>
                                    <span className="hi-det-value">{value}</span>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryItem;