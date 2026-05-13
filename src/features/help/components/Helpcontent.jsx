import React, { useState } from 'react';
import './HelpContent.css';

const TYPE_LABELS = {
    steps:   'Adımlar',
    list:    'Liste',
    article: 'Makale',
    alert:   'Uyarı',
};

const ALERT_ICONS = {
    warning: 'ti-alert-triangle',
    info:    'ti-info-circle',
    danger:  'ti-alert-circle',
};

const CAT_COLOR_STYLES = {
    accent: { bg: 'var(--accent-ghost)',      color: 'var(--accent-color)',   border: 'var(--accent-border)'          },
    green:  { bg: 'var(--status-success-bg)', color: 'var(--status-success)', border: 'var(--status-success-border)'  },
    cyan:   { bg: 'var(--status-info-bg)',    color: 'var(--status-info)',    border: 'var(--status-info-border)'     },
    purple: { bg: 'var(--status-purple-bg)',  color: 'var(--status-purple)',  border: 'var(--status-purple-border)'   },
    yellow: { bg: 'var(--status-pending-bg)', color: 'var(--status-pending)', border: 'var(--status-pending-border)'  },
    orange: {
        bg:     'color-mix(in srgb, var(--_orange) 10%, transparent)',
        color:  'var(--_orange)',
        border: 'color-mix(in srgb, var(--_orange) 28%, transparent)',
    },
    red:    { bg: 'var(--status-danger-bg)',  color: 'var(--status-danger)',  border: 'var(--status-danger-border)'   },
    muted:  { bg: 'var(--bg-inset)',          color: 'var(--text-muted)',     border: 'var(--border-default)'         },
};

const HelpItem = ({ item }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className={`help-item type-${item.type}${open ? ' is-open' : ''}`}>
            <div className="help-item-header" onClick={() => setOpen(o => !o)}>
                <div className="help-item-left">
                    <span className="help-item-type-dot" />
                    <span className="help-item-title">{item.title}</span>
                </div>
                <span className="help-item-tag">{TYPE_LABELS[item.type] || item.type}</span>
                <i className="ti ti-chevron-down help-item-chevron" />
            </div>

            <div className="help-item-body">
                <div className="help-item-inner">
                    {item.type === 'article' && (
                        <p className="help-article-text">{item.content}</p>
                    )}

                    {item.type === 'steps' && (
                        <ol className="help-steps-list">
                            {item.steps?.map((step, i) => (
                                <li key={i} className="help-step">
                                    <span className="help-step-num">{i + 1}</span>
                                    <span className="help-step-text">{step}</span>
                                </li>
                            ))}
                        </ol>
                    )}

                    {item.type === 'list' && (
                        <ul className="help-list-items">
                            {item.items?.map((row, i) => (
                                <li key={i} className="help-list-row">
                                    <i className="ti ti-point-filled" />
                                    <span>
                                        <span className="help-list-label">{row.label}</span>
                                        <span className="help-list-desc">{row.desc}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {item.type === 'alert' && (
                        <div className={`help-alert-box severity-${item.severity || 'info'}`}>
                            <i className={`ti ${ALERT_ICONS[item.severity] || 'ti-info-circle'} help-alert-icon`} />
                            <p className="help-alert-text">{item.content}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const HelpContent = ({ category, items, search }) => {
    if (!category) return null;

    const colorStyle = CAT_COLOR_STYLES[category.color] || CAT_COLOR_STYLES.accent;

    return (
        <main className="help-main">
            <div className="help-main-head">
                <div
                    className="help-main-cat-icon"
                    style={{
                        background:  colorStyle.bg,
                        color:       colorStyle.color,
                        borderColor: colorStyle.border,
                    }}
                >
                    <i className={`ti ${category.icon}`} />
                </div>
                <div>
                    <h1>{category.label}</h1>
                    <p>
                        {search
                            ? `"${search}" için ${items.length} sonuç`
                            : `${items.length} konu bulundu`
                        }
                    </p>
                </div>
            </div>

            {items.length > 0 ? (
                <div className="help-items-list">
                    {items.map(item => (
                        <HelpItem key={item.id} item={item} />
                    ))}
                </div>
            ) : (
                <div className="help-empty">
                    <i className="ti ti-search-off" />
                    <p>
                        {search
                            ? `"${search}" aramasına uygun sonuç bulunamadı.`
                            : 'Bu kategoride henüz içerik yok.'}
                    </p>
                </div>
            )}
        </main>
    );
};

export default HelpContent;