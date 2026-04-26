import React, { useState, useMemo, useEffect } from 'react';
import '../auth.css/FAQ.css';

const CATEGORIES = [
  { id: 'all',          label: 'Tümü',           icon: 'ti-layout-grid' },
  { id: 'entegrasyon',  label: 'Entegrasyon',     icon: 'ti-plug-connected' },
  { id: 'guvenlik',     label: 'Güvenlik & GDPR', icon: 'ti-shield-check' },
  { id: 'fiyat',        label: 'Fiyatlandırma',   icon: 'ti-tag' },
  { id: 'ai',           label: 'AI & Teknoloji',  icon: 'ti-cpu' },
];

const FAQ = () => {
    const [questions, setQuestions] = useState([]);
    const [activeId, setActiveId]     = useState(null);
    const [activeTab, setActiveTab]   = useState('all');
    const [search, setSearch]         = useState('');

    useEffect(() => {
        fetch('/data/faq.json') 
            .then(res => res.json())
            .then(data => {
        setQuestions(data);
        })
        .catch(err => {
            console.error("FAQ yüklenemedi:", err);
        });
    }, []);

    const filtered = useMemo(() => {
        return questions.filter((item) => {
        const matchCat = activeTab === 'all' || item.cat === activeTab;
        const searchLower = search.toLowerCase();
        const matchSearch = !search
            || item.q.toLowerCase().includes(searchLower)
            || item.a.toLowerCase().includes(searchLower);
            return matchCat && matchSearch;
        });
    }, [questions, activeTab, search]);

  const toggle = (id) => setActiveId((prev) => (prev === id ? null : id));

  return (
    <div className="faq-wrapper">

      {/* Header */}
      <div className="faq-header">
        <span className="sub-title">FAQ & SSS</span>
        <h2>Merak Edilenler</h2>
        <p>Aklınızdaki soruları bulamadıysanız ekibimiz size yardımcı olmaktan memnuniyet duyar.</p>
      </div>

      {/* Search */}
      <div className="faq-search-wrap">
        <i className="ti ti-search faq-search-icon"></i>
        <input
          type="text"
          className="faq-search"
          placeholder="Soru ara…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setActiveId(null); }}
        />
      </div>

      {/* Category Tabs */}
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

      {/* Accordion List */}
      <div className="faq-list">
        {filtered.length === 0 ? (
          <div className="faq-empty">
            <i className="ti ti-search-off"></i>
            Aradığınız soruya ait sonuç bulunamadı.
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
                {/* Question Row */}
                <div className="faq-question">
                  <div className="faq-q-icon">
                    <i className={`ti ${item.icon}`}></i>
                  </div>
                  <span className="faq-q-text">{item.q}</span>
                  <div className="faq-chevron">
                    <i className="ti ti-chevron-down"></i>
                  </div>
                </div>

                {/* Answer Panel — CSS grid trick for smooth height animation */}
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

      {/* Bottom CTA */}
      <div className="faq-cta">
        <span className="faq-cta-text">
          <strong>Hâlâ sorunuz mu var?</strong> Sizinle hemen iletişime geçmek için hazırız.
        </span>
        <a href="mailto:destek@flowtera.ai" className="faq-cta-btn">
          <i className="ti ti-mail"></i> Bize Yazın
        </a>
        <a href="#" className="faq-cta-btn" style={{ background: 'rgba(0,210,255,0.08)', borderColor: 'rgba(0,210,255,0.22)', color: '#00d2ff' }}>
          <i className="ti ti-calendar"></i> Demo İste
        </a>
      </div>

    </div>
  );
};

export default FAQ;