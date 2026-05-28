import React from 'react';
import { useTranslation } from 'react-i18next';
import { useI18n } from '../../../utils/i18nHelpers';
import './Helpsidebar.css';

const CONTACT_LINKS_BASE = [
    { key: 'github',   href: 'https://github.com/uixova',                                                                  icon: 'ti-brand-github',   labelKey: null,          staticLabel: 'GitHub'   },
    { key: 'linkedin', href: 'https://www.linkedin.com/in/salih-%C3%B6ks%C3%BCz-418411400/', icon: 'ti-brand-linkedin', labelKey: null,          staticLabel: 'LinkedIn'  },
    // { key: 'discord', href: null, icon: 'ti-brand-discord', labelKey: null, staticLabel: 'Discord' },
    { key: 'email',    href: null,                                                                                          icon: 'ti-mail',           labelKey: 'email_support', staticLabel: null       },
    // { key: 'docs',    href: null, icon: 'ti-book-2', labelKey: null, staticLabel: 'Dokümanlar' },
];

const HelpSidebar = ({ categories, contact, activeId, onSelect, counts, search, onSearch }) => {
    const { t } = useTranslation('help.sidebar');
    const { lang } = useI18n();

    return (
        <aside className="help-sidebar">
            <div className="help-sidebar-head">
                <h2>{t('heading')}</h2>
                <p>{t('subtitle')}</p>
            </div>

            <div className="help-search-wrap">
                <div className="help-search">
                    <i className="ti ti-search" />
                    <input
                        type="text"
                        placeholder={t('search_placeholder')}
                        value={search}
                        onChange={e => onSearch(e.target.value)}
                    />
                    {search && (
                        <i
                            className="ti ti-x"
                            style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13 }}
                            onClick={() => onSearch('')}
                        />
                    )}
                </div>
            </div>

            <div className="help-cat-list">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={[
                            'help-cat-btn',
                            activeId === cat.id ? 'active' : '',
                            `help-cat-color-${cat.color}`,
                        ].filter(Boolean).join(' ')}
                        onClick={() => onSelect(cat.id)}
                    >
                        <span className="help-cat-icon">
                            <i className={`ti ${cat.icon}`} />
                        </span>
                        <span className="help-cat-label">{typeof cat.label === 'object' ? cat.label[lang] : cat.label}</span>
                        {counts[cat.id] !== undefined && (
                            <span className="help-cat-count">{counts[cat.id]}</span>
                        )}
                    </button>
                ))}
            </div>

            <div className="help-contact-strip">
                <span className="help-contact-title">{t('contact_title')}</span>
                {CONTACT_LINKS_BASE.map(link => (
                    <a
                        key={link.key}
                        href={contact?.[link.key] || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`help-contact-link ${link.key}`}
                    >
                        <i className={`ti ${link.icon}`} />
                        {link.labelKey ? t(link.labelKey) : link.staticLabel}
                    </a>
                ))}
            </div>
        </aside>
    );
};

export default HelpSidebar;
