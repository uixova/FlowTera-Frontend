import React from 'react';
import './HelpSidebar.css';

const CONTACT_LINKS = [
    { key: 'github',  href: 'https://github.com/uixova', icon: 'ti-brand-github',  label: 'GitHub'       },
    { key: 'linkedin',href: 'https://www.linkedin.com/in/salih-%C3%B6ks%C3%BCz-418411400/', icon: 'ti-brand-linkedin',label: 'LinkedIn'     },
    // { key: 'discord', href: null, icon: 'ti-brand-discord', label: 'Discord'       },
    { key: 'email',   href: null, icon: 'ti-mail',          label: 'E-posta Desteği'},
    // { key: 'docs',    href: null, icon: 'ti-book-2',        label: 'Dokümanlar'    },
];

const HelpSidebar = ({ categories, contact, activeId, onSelect, counts, search, onSearch }) => (
    <aside className="help-sidebar">
        <div className="help-sidebar-head">
            <h2>Yardım Merkezi</h2>
            <p>Bir kategori seçin veya arama yapın</p>
        </div>

        <div className="help-search-wrap">
            <div className="help-search">
                <i className="ti ti-search" />
                <input
                    type="text"
                    placeholder="Konu ara..."
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
                    <span className="help-cat-label">{cat.label}</span>
                    {counts[cat.id] !== undefined && (
                        <span className="help-cat-count">{counts[cat.id]}</span>
                    )}
                </button>
            ))}
        </div>

        <div className="help-contact-strip">
            <span className="help-contact-title">Geliştirici ile İletişim</span>
            {CONTACT_LINKS.map(link => (
                <a
                    key={link.key}
                    href={contact?.[link.key] || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`help-contact-link ${link.key}`}
                >
                    <i className={`ti ${link.icon}`} />
                    {link.label}
                </a>
            ))}
        </div>
    </aside>
);

export default HelpSidebar;