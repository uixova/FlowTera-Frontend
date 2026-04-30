import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import FAQ from './components/FAQ';
import Features from './components/Features';
import Subs from './components/Subs';
import useCounter from './hook/useCounter';
import './auth.css/Landing.css';

// Mini Sparkline Component
const Sparkline = ({ data, color }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((v - min) / (max - min)) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '60px' }}>
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,100 ${points} 100,100`} fill={`url(#grad-${color})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// Live Expense Feed Item
const FeedItem = ({ icon, text, amount, time, type, delay }) => (
  <div className="feed-item" style={{ animationDelay: `${delay}s` }}>
    <div className={`feed-icon ${type}`}>
      <i className={`ti ${icon}`}></i>
    </div>
    <div className="feed-meta">
      <span className="feed-text">{text}</span>
      <span className="feed-time">{time}</span>
    </div>
    <span className={`feed-amount ${type}`}>{amount}</span>
  </div>
);


const Landing = () => {
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  const c1 = useCounter(998, 2000, statsVisible);
  const c2 = useCounter(24, 2000, statsVisible);
  const c3 = useCounter(100, 2000, statsVisible);

  useEffect(() => {
    document.title = "FlowTera | Finansal Akışın Yeni Nesli";
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStatsVisible(true);
    }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const expenseData = [12, 19, 15, 27, 22, 34, 28, 42, 38, 51, 45, 60];

  return (
    <div className="landing-container">
      {/* AMBIENT BACKGROUNDS */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>
      
      <div className="grid-overlay"></div>

      {/* NAVBAR */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <div className="logo-icon-wrapper">
            <img 
                src="/Logo.png" 
                alt="FlowTera Logo"
                className="logo-img" 
            />
          </div>
          <span className='app-name'>FlowTera</span>
        </div>
        <div className="nav-links">
          <a href="#features">Yetenekler</a>
          <a href="#workflow">Akış Sistemi</a>
          <a href="#pricing">Fiyatlar</a>
          <a href="#faq">FAQ & SSS</a>
          <div className="nav-divider"></div>
          <Link to="/login" className="nav-login-btn">Giriş Yap</Link>
          <Link to="/signup" className="nav-register-btn">
            Ücretsiz Başla <i className="ti ti-arrow-narrow-right"></i>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="pulse-dot"></span>
            AI Destekli Finans 2.0 Şimdi Yayında
          </div>
          <h1>
            Harcamalarınızı <br />
            <span className="gradient-text">Işık Hızında</span> Yönetin
          </h1>
          <p>
            FlowTera; yapay zeka destekli expense analizi, takım bazlı yetki yönetimi
            ve kusursuz seyahat planlamasını tek bir akışta birleştirir.
          </p>
          <div className="hero-actions">
            <button className="primary-btn">
              Hemen Deneyin <i className="ti ti-arrow-narrow-right"></i>
            </button>
            <button className="secondary-btn">
              <i className="ti ti-player-play"></i> Demoyu İzle
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="dashboard-mockup">
            <div className="mockup-header">
              <div className="dots"><span></span><span></span><span></span></div>
              <div className="mockup-title">
                <i className="ti ti-topology-star-2" style={{ color: '#0ed45a', fontSize: '14px' }}></i>
                FlowTera Dashboard
              </div>
              <div className="mockup-actions">
                <span className="mockup-action-dot active"></span>
                <span className="mockup-action-dot"></span>
              </div>
            </div>

            <div className="mockup-body">
              {/* Mini Sidebar */}
              <div className="mockup-sidebar">
                <div className="mock-nav-item active"><i className="ti ti-layout-dashboard"></i></div>
                <div className="mock-nav-item"><i className="ti ti-receipt"></i></div>
                <div className="mock-nav-item"><i className="ti ti-plane"></i></div>
                <div className="mock-nav-item"><i className="ti ti-users"></i></div>
                <div className="mock-nav-item"><i className="ti ti-chart-bar"></i></div>
              </div>

              {/* Main Content */}
              <div className="mockup-main">
                {/* Top KPI Row */}
                <div className="kpi-row">
                  <div className="kpi-card">
                    <span className="kpi-label">Bu Ay</span>
                    <span className="kpi-value green">₺48.250</span>
                    <span className="kpi-delta up"><i className="ti ti-trending-up"></i> +12%</span>
                  </div>
                  <div className="kpi-card">
                    <span className="kpi-label">Bekleyen</span>
                    <span className="kpi-value yellow">₺7.800</span>
                    <span className="kpi-delta">3 talep</span>
                  </div>
                  <div className="kpi-card">
                    <span className="kpi-label">Onaylanan</span>
                    <span className="kpi-value cyan">142</span>
                    <span className="kpi-delta up"><i className="ti ti-check"></i></span>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="mockup-chart-area">
                  <div className="chart-header">
                    <span>Harcama Trendi </span>
                    <span className="chart-badge">Son 12 Ay</span>
                  </div>
                  <Sparkline data={expenseData} color="#0ed45a" />
                </div>

                {/* Live Feed */}
                <div className="mockup-feed">
                  <FeedItem icon="ti-plane" text="İstanbul → Berlin" amount="+₺12.450" time="2dk önce" type="approved" delay={0} />
                  <FeedItem icon="ti-receipt" text="Ofis Malzemeleri" amount="₺340" time="15dk önce" type="pending" delay={0.3} />
                  <FeedItem icon="ti-building" text="Otel Rezervasyonu" amount="₺8.200" time="1sa önce" type="approved" delay={0.6} />
                </div>
              </div>
            </div>
          </div>

          {/* Floating Cards */}
          <div className="floating-card c1">
            <i className="ti ti-circle-check" style={{ color: "#0ed45a" }}></i>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>+₺12.450 Onaylandı</div>
              <div style={{ color: '#555', fontSize: '0.7rem' }}>Seyahat harcaması</div>
            </div>
          </div>
          <div className="floating-card c2">
            <i className="ti ti-users" style={{ color: "#00d2ff" }}></i>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Pazarlama Aktif</div>
              <div style={{ color: '#555', fontSize: '0.7rem' }}>8 üye çevrimiçi</div>
            </div>
          </div>
          <div className="floating-card c3">
            <i className="ti ti-robot" style={{ color: "#a78bfa" }}></i>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>AI Analizi</div>
              <div style={{ color: '#555', fontSize: '0.7rem' }}>Fiş tanındı ✓</div>
            </div>
          </div>
        </div>
      </header>

      {/* STATS */}
      <section className="stats-grid" ref={statsRef}>
        <div className="stat-card">
          <div className="stat-icon"><i className="ti ti-eye-check"></i></div>
          <h3>%{c1 > 0 ? (c1 / 10).toFixed(1) : '0.0'}</h3>
          <p>OCR Doğruluğu</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="ti ti-bolt"></i></div>
          <h3>{c2 > 0 ? (c2 / 10).toFixed(1) : '0.0'}s</h3>
          <p>İşlem Hızı</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="ti ti-building-skyscraper"></i></div>
          <h3>{c3}+</h3>
          <p>Kurumsal Takım</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="ti ti-lock"></i></div>
          <h3>256-bit</h3>
          <p>Uçtan Uca Şifreleme</p>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section-padding">
        <div className="section-header">
          <span className="sub-title">Yetenekler</span>
          <h2>Karmaşıklığı Basitliğe Dönüştürün</h2>
          <p className="section-desc">Her büyüklükteki ekip için tasarlanmış, kurumsal güçte araçlar.</p>
        </div>
        <Features />
      </section>

      {/* WORKFLOW */}
      <section id="workflow" className="workflow-section">
        <div className="workflow-container">
          <div className="workflow-text">
            <span className="sub-title">Akıllı İş Akışı</span>
            <h2>Sıfır Sürtünme, Tam Kontrol</h2>
            <p>FlowTera, en karmaşık ekip yapılarını bile saniyeler içinde kurmanıza ve yönetmenize olanak tanır.</p>
            <ul className="workflow-list">
              <li>
                <div className="wf-icon-wrap"><i className="ti ti-capture" style={{ fontSize: "20px" }}></i></div>
                <div>
                  <strong>Giriş ve AI Yakalama</strong>
                  <span>Herkes fişini yükler; AI dil, para birimi ve kategori ayrımını saniyeler içinde yapar.</span>
                </div>
              </li>
              <li>
                <div className="wf-icon-wrap"><i className="ti ti-hierarchy-2" style={{ fontSize: "20px" }}></i></div>
                <div>
                  <strong>Esnek Takım Mimarisi</strong>
                  <span>Ücretsiz planda bile sınırsız takıma katılın, her proje için ayrı onay zinciri kurun.</span>
                </div>
              </li>
              <li>
                <div className="wf-icon-wrap"><i className="ti ti-shield-code" style={{ fontSize: "20px" }}></i></div>
                <div>
                  <strong>Otonom Denetim</strong>
                  <span>Sistem, şirket kurallarını manuel kontrole gerek kalmadan 7/24 denetler.</span>
                </div>
              </li>
              <li>
                <div className="wf-icon-wrap"><i className="ti ti-database-export" style={{ fontSize: "20px" }}></i></div>
                <div>
                  <strong>Kesintisiz Senkronizasyon</strong>
                  <span>Onaylanan harcamalar anında muhasebe sisteminize veya banka kayıtlarınıza işlenir.</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="workflow-visual-advanced">
            {/* Animated Flow */}
            <div className="flow-diagram">
              {[
                { icon: 'ti-arrows-split', label: 'Çalışan', sublabel: 'Talep Oluşturur', color: '#0ed45a' },
                { icon: 'ti-scan', label: 'AI Engine', sublabel: 'Analiz & Kontrol', color: '#888', highlight: true },
                { icon: 'ti-user-check', label: 'Yönetici', sublabel: 'Gözden Geçirir', color: '#00d2ff' },
                { icon: 'ti-cloud-upload', label: 'Onay', sublabel: 'Sisteme aktarım', color: '#a78bfa' },
              ].map((step, i) => (
                <React.Fragment key={i}>
                  <div className={`flow-step ${step.highlight ? 'highlight' : ''}`} style={{ '--step-color': step.color }}>
                    <div className="flow-step-icon">
                      <i className={`ti ${step.icon}`}></i>
                    </div>
                    <span className="flow-step-label">{step.label}</span>
                    <span className="flow-step-sub">{step.sublabel}</span>
                  </div>
                  {i < 3 && (
                    <div className="flow-arrow">
                      <div className="flow-arrow-line">
                        <div className="flow-arrow-dot dot1"></div>
                        <div className="flow-arrow-dot dot2"></div>
                        <div className="flow-arrow-dot dot3"></div>
                      </div>
                      <i className="ti ti-chevron-right"></i>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Policy Card */}
            <div className="policy-card">
              <div className="policy-header">
                <i className="ti ti-settings-automation" style={{ color: '#0ed45a' }}></i>
                <span>Dinamik Politika Motoru</span>
              </div>
              <div className="policy-rules">
                {[
                  { rule: 'Mükerrer Fiş → Otomatik Red', active: true },
                  { rule: 'Takım Bütçe Sınırı → Uyarı Gönder', active: true },
                  { rule: 'Mesai Dışı Harcama → Bayrakla', active: true },
                  { rule: 'Eksik Veri → Kullanıcıya Hatırlat', active: false },
                ].map((r, i) => (
                  <div key={i} className={`policy-rule ${r.active ? 'active' : 'inactive'}`}>
                    <i className={`ti ${r.active ? 'ti-circle-check' : 'ti-circle-dashed'}`}></i>
                    {r.rule}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="pricing-section section-padding">
        <div className="section-header">
          <span className="sub-title">Fiyatlandırma</span>
          <h2>Ekibinize Göre Büyüyen Planlar</h2>
          <p className="section-desc">Tüm planlarda 14 gün ücretsiz deneme. Kredi kartı gerekmez.</p>
        </div>
        <Subs /> 
      </section>

      {/* FAQ */}
      <section id="faq" className="section-padding">
        <FAQ />
      </section>

      {/* CTA BANNER */}
      <section className="cta-section">
        <div className="cta-glow"></div>
        <div className="cta-content">
          <h2>Finansal Akışınızı Bugün Dönüştürün</h2>
          <p>14 gün ücretsiz. Kurulum yok. Kredi kartı gerekmez.</p>
          <div className="cta-actions">
            <button className="primary-btn large">
              Ücretsiz Başla <i className="ti ti-arrow-narrow-right"></i>
            </button>
            <button className="secondary-btn large">
              Demo İste <i className="ti ti-calendar"></i>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="nav-logo" style={{ marginBottom: '16px' }}>
                <div className="logo-icon-wrapper">
                    <img 
                        src="/Logo.png" 
                        alt="FlowTera Logo" 
                        className="logo-img" 
                    />
                </div>
                <span>FlowTera</span>
            </div>
            <p>Geleceğin finansal yönetim standartlarını bugünden belirleyin.</p>
            <div className="footer-social">
              <a href="#"><i className="ti ti-brand-twitter"></i></a>
              <a href="#"><i className="ti ti-brand-linkedin"></i></a>
              <a href="https://github.com/uixova"><i className="ti ti-brand-github"></i></a>
            </div>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Ürün</h4>
              <a href="#">Özellikler</a>
              <a href="#">Fiyatlandırma</a>
              <a href="#">Güvenlik</a>
              <a href="#">API Dokümantasyon</a>
            </div>
            <div className="link-group">
              <h4>Şirket</h4>
              <a href="#">Hakkımızda</a>
              <a href="#">Blog</a>
              <a href="#">Kariyer</a>
              <a href="#">Basın</a>
            </div>
            <div className="link-group">
              <h4>Destek</h4>
              <a href="#">Yardım Merkezi</a>
              <a href="#">Durum Sayfası</a>
              <a href="#">İletişim</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 FlowTera AI. Built for the future of teams.</p>
          <div className="footer-badges">
            <span className="footer-badge"><i className="ti ti-lock"></i> SOC 2 Type II</span>
            <span className="footer-badge"><i className="ti ti-shield"></i> GDPR Uyumlu</span>
            <span className="footer-badge"><i className="ti ti-certificate"></i> ISO 27001</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;