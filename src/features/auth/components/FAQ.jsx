import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './FAQ.css';
import { faqData } from '@/data/faqData';

const FAQ = () => {
  const { t } = useTranslation('auth.faq');
  const [activeId, setActiveId]   = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch]       = useState('');

  const CATEGORIES = [
    { id: 'all',         label: t('cat_all'),         icon: 'ti-layout-grid' },
    { id: 'entegrasyon', label: t('cat_integration'),  icon: 'ti-plug-connected' },
    { id: 'guvenlik',    label: t('cat_security'),     icon: 'ti-shield-check' },
    { id: 'fiyat',       label: t('cat_pricing'),      icon: 'ti-tag' },
    { id: 'ai',          label: t('cat_ai'),           icon: 'ti-cpu' },
  ];

  const filtered = useMemo(() => {
    return faqData.filter((item) => {
      const matchCat = activeTab === 'all' || item.cat === activeTab;
      const searchLower = search.toLowerCase();
      const matchSearch = !search
        || item.q.toLowerCase().includes(searchLower)
        || item.a.toLowerCase().includes(searchLower);
      return matchCat && matchSearch;
    });
  }, [activeTab, search]);

  const toggle = (id) => setActiveId((prev) => (prev === id ? null : id));

  return (
    <div className="faq-wrapper">

      <div className="faq-header">
        <span className="sub-title">{t('badge')}</span>
        <h2>{t('heading')}</h2>
        <p>{t('desc')}</p>
      </div>

      <div className="faq-search-wrap">
        <i className="ti ti-search faq-search-icon"></i>
        <input
          type="text"
          className="faq-search"
          placeholder={t('search_placeholder')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setActiveId(null); }}
        />
      </div>

      <div className="faq-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`faq-tab ${activeTab === cat.id ? 'active' : ''}`}
            onClick={() => { setActiveTab(cat.id); setActiveId(null); setSearch(''); }}
          >
            <i className={`ti ${cat.icon}`}></i>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="faq-list">
        {filtered.length === 0 ? (
          <div className="faq-empty">
            <i className="ti ti-search-off"></i>
            {t('no_results')}
          </div>
        ) : (
          filtered.map((item) => {
            const isOpen = activeId === item.id;
            return (
              <div
                key={item.id}
                className={`faq-item ${isOpen ? 'active' : ''}`}
                onClick={() => toggle(item.id)}
              >
                <div className="faq-question">
                  <div className="faq-q-icon">
                    <i className={`ti ${item.icon}`}></i>
                  </div>
                  <span className="faq-q-text">{item.q}</span>
                  <div className="faq-chevron">
                    <i className="ti ti-chevron-down"></i>
                  </div>
                </div>

                <div className="faq-answer">
                  <div className="faq-answer-inner">
                    <div
                      className="faq-answer-content"
                      dangerouslySetInnerHTML={{ __html: item.a }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="faq-cta">
        <span className="faq-cta-text">
          <strong>{t('cta_question')}</strong> {t('cta_desc')}
        </span>
        <a href="mailto:destek@flowtera.ai" className="faq-cta-btn">
          <i className="ti ti-mail"></i> {t('cta_email')}
        </a>
        <a href="#" className="faq-cta-btn" style={{ background: 'rgba(0,210,255,0.08)', borderColor: 'rgba(0,210,255,0.22)', color: '#00d2ff' }}>
          <i className="ti ti-calendar"></i> {t('cta_demo')}
        </a>
      </div>

    </div>
  );
};

export default FAQ;
