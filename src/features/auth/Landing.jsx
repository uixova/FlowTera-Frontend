import React, { useEffect, useRef, useState, useCallback, useMemo, memo, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import './Landing.css';

// Below-fold sections — lazy loaded, not in initial bundle
const FAQ      = lazy(() => import('./components/FAQ'));
const Features = lazy(() => import('./components/Features'));
const Subs     = lazy(() => import('./components/Subs'));

// Static outside component — never recreated
const EXPENSE_DATA = [12, 19, 15, 27, 22, 34, 28, 42, 38, 51, 45, 60];

const WORKFLOW_STEPS = [
    { icon: 'ti-arrows-split', label: 'Çalışan',   sublabel: 'Talep Oluşturur',  color: '#0ed45a' },
    { icon: 'ti-scan',         label: 'AI Engine',  sublabel: 'Analiz & Kontrol', color: '#888', highlight: true },
    { icon: 'ti-user-check',   label: 'Yönetici',   sublabel: 'Gözden Geçirir',  color: '#00d2ff' },
    { icon: 'ti-cloud-upload', label: 'Onay',        sublabel: 'Sisteme aktarım', color: '#a78bfa' },
];

const POLICY_RULES = [
    { rule: 'Mükerrer Fiş → Otomatik Red',          active: true  },
    { rule: 'Takım Bütçe Sınırı → Uyarı Gönder',   active: true  },
    { rule: 'Mesai Dışı Harcama → Bayrakla',        active: true  },
    { rule: 'Eksik Veri → Kullanıcıya Hatırlat',   active: false },
];

const FEED_ITEMS = [
    { icon: 'ti-plane',    text: 'İstanbul → Berlin', amount: '+₺12.450', time: '2dk önce',  type: 'approved', delay: 0    },
    { icon: 'ti-receipt',  text: 'Ofis Malzemeleri',  amount: '₺340',     time: '15dk önce', type: 'pending',  delay: 0.3  },
    { icon: 'ti-building', text: 'Otel Rezervasyonu', amount: '₺8.200',   time: '1sa önce',  type: 'approved', delay: 0.6  },
];

// Memoized sub-components
const Sparkline = memo(({ data, color }) => {
    const max    = Math.max(...data);
    const min    = Math.min(...data);
    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((v - min) / (max - min)) * 80 - 10;
        return `${x},${y}`;
    }).join(' ');
    return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '60px' }}>
            <defs>
                <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0"   />
                </linearGradient>
            </defs>
            <polygon  points={`0,100 ${points} 100,100`} fill={`url(#grad-${color})`} />
            <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
});

const FeedItem = memo(({ icon, text, amount, time, type, delay }) => (
    <div className="feed-item" style={{ animationDelay: `${delay}s` }}>
        <div className={`feed-icon ${type}`}><i className={`ti ${icon}`} /></div>
        <div className="feed-meta">
            <span className="feed-text">{text}</span>
            <span className="feed-time">{time}</span>
        </div>
        <span className={`feed-amount ${type}`}>{amount}</span>
    </div>
));

const SectionLoader = () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <Loader type="butterfly" />
    </div>
);

const Landing = () => {
    const navigate = useNavigate();
    const { loginWithCredentials } = useAuth();
    const statsRef     = useRef(null);
    const [statsVisible, setStatsVisible] = useState(false);
    const [demoLoading, setDemoLoading]   = useState(false);
    const originalThemeRef = useRef(null);

    // Counters — only compute when visible
    const [c1, setC1] = useState(0);
    const [c2, setC2] = useState(0);
    const [c3, setC3] = useState(0);

    const handleDemoClick = useCallback(async () => {
        if (demoLoading) return;
        setDemoLoading(true);
        const demoEmail = import.meta.env.VITE_DEMO_EMAIL || 'demo@flowtera.app';
        await loginWithCredentials(demoEmail, '', false);
        navigate('/home', { replace: true });
    }, [demoLoading, loginWithCredentials, navigate]);

    useEffect(() => {
        document.title = 'FlowTera | Finansal Akışın Yeni Nesli';
        originalThemeRef.current = document.documentElement.getAttribute('data-theme');
        document.documentElement.removeAttribute('data-theme');

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setStatsVisible(true);
        }, { threshold: 0.3 });
        if (statsRef.current) observer.observe(statsRef.current);

        return () => {
            observer.disconnect();
            if (originalThemeRef.current) {
                document.documentElement.setAttribute('data-theme', originalThemeRef.current);
            }
        };
    }, []);

    // Animate counters only when section becomes visible, respects reduced-motion
    useEffect(() => {
        if (!statsVisible) return;
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) { setC1(997); setC2(24); setC3(50); return; }

        const duration = 2000;
        const startTime = performance.now();
        let raf;
        const tick = (now) => {
            const t = Math.min((now - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            setC1(Math.floor(ease * 997));
            setC2(Math.floor(ease * 24));
            setC3(Math.floor(ease * 50));
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [statsVisible]);

    // Memoized sparkline — never recalculates
    const sparkline = useMemo(() => <Sparkline data={EXPENSE_DATA} color="#0ed45a" />, []);

    // Memoized feed items
    const feedItems = useMemo(() =>
        FEED_ITEMS.map((item, i) => <FeedItem key={i} {...item} />)
    , []);

    if (demoLoading) {
        return (
            <div className="full-screen-loader" style={{ background: 'var(--bg-base)' }}>
                <Loader type="butterfly" />
            </div>
        );
    }

    return (
        <div className="landing-container">
            <div className="glow-orb orb-1" aria-hidden="true" />
            <div className="glow-orb orb-2" aria-hidden="true" />
            <div className="grid-overlay"   aria-hidden="true" />

            {/* Mobile Demo FAB */}
            <button className="landing-demo-fab" onClick={handleDemoClick} disabled={demoLoading} aria-label="Demo modunu dene">
                <i className="ti ti-flask" />
                <span>Demo</span>
            </button>

            {/* NAVBAR */}
            <nav className="landing-nav">
                <div className="nav-logo">
                    <div className="logo-icon-wrapper">
                        <img src="/Logo.png" alt="FlowTera Logo" className="logo-img" width="34" height="34" />
                    </div>
                    <span className="app-name">FlowTera</span>
                </div>
                <div className="nav-links">
                    <a href="#features">Yetenekler</a>
                    <a href="#workflow">Akış Sistemi</a>
                    <a href="#pricing">Fiyatlar</a>
                    <a href="#faq">FAQ & SSS</a>
                    <div className="nav-divider" />
                    <button className="nav-demo-btn" onClick={handleDemoClick} disabled={demoLoading}>Demo Dene</button>
                    <Link to="/login"  className="nav-login-btn">Giriş Yap</Link>
                    <Link to="/signup" className="nav-register-btn">Ücretsiz Başla</Link>
                </div>
            </nav>

            {/* HERO */}
            <header className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="pulse-dot" />
                        OCR & AI Destekli Fatura Yönetimi Açık Beta'da
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
                        <Link to="/signup" className="primary-btn">
                            Hemen Deneyin <i className="ti ti-arrow-narrow-right" />
                        </Link>
                        <button className="secondary-btn" onClick={handleDemoClick} disabled={demoLoading}>
                            <i className="ti ti-player-play" /> Demo Deneyin
                        </button>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="dashboard-mockup">
                        <div className="mockup-header">
                            <div className="dots"><span /><span /><span /></div>
                            <div className="mockup-title">
                                <i className="ti ti-topology-star-2" style={{ color: '#0ed45a', fontSize: '14px' }} />
                                FlowTera Dashboard
                            </div>
                            <div className="mockup-actions">
                                <span className="mockup-action-dot active" />
                                <span className="mockup-action-dot" />
                            </div>
                        </div>

                        <div className="mockup-body">
                            <div className="mockup-sidebar">
                                <div className="mock-nav-item active"><i className="ti ti-layout-dashboard" /></div>
                                <div className="mock-nav-item"><i className="ti ti-receipt" /></div>
                                <div className="mock-nav-item"><i className="ti ti-plane" /></div>
                                <div className="mock-nav-item"><i className="ti ti-users" /></div>
                                <div className="mock-nav-item"><i className="ti ti-chart-bar" /></div>
                            </div>

                            <div className="mockup-main">
                                <div className="kpi-row">
                                    <div className="kpi-card">
                                        <span className="kpi-label">Bu Ay</span>
                                        <span className="kpi-value green">₺48.250</span>
                                        <span className="kpi-delta up"><i className="ti ti-trending-up" /> +12%</span>
                                    </div>
                                    <div className="kpi-card">
                                        <span className="kpi-label">Bekleyen</span>
                                        <span className="kpi-value yellow">₺7.800</span>
                                        <span className="kpi-delta">3 talep</span>
                                    </div>
                                    <div className="kpi-card">
                                        <span className="kpi-label">Onaylanan</span>
                                        <span className="kpi-value cyan">142</span>
                                        <span className="kpi-delta up"><i className="ti ti-check" /></span>
                                    </div>
                                </div>

                                <div className="mockup-chart-area">
                                    <div className="chart-header">
                                        <span>Harcama Trendi</span>
                                        <span className="chart-badge">Son 12 Ay</span>
                                    </div>
                                    {sparkline}
                                </div>

                                <div className="mockup-feed">{feedItems}</div>
                            </div>
                        </div>
                    </div>

                    <div className="floating-card c1" aria-hidden="true">
                        <i className="ti ti-circle-check" style={{ color: '#0ed45a' }} />
                        <div>
                            <div className="fc-title">+₺12.450 Onaylandı</div>
                            <div className="fc-sub">Seyahat harcaması</div>
                        </div>
                    </div>
                    <div className="floating-card c2" aria-hidden="true">
                        <i className="ti ti-users" style={{ color: '#00d2ff' }} />
                        <div>
                            <div className="fc-title">Pazarlama Aktif</div>
                            <div className="fc-sub">8 üye çevrimiçi</div>
                        </div>
                    </div>
                    <div className="floating-card c3" aria-hidden="true">
                        <i className="ti ti-robot" style={{ color: '#a78bfa' }} />
                        <div>
                            <div className="fc-title">AI Analizi</div>
                            <div className="fc-sub">Fiş tanındı ✓</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* STATS */}
            <section className="stats-grid" ref={statsRef}>
                <div className="stat-card">
                    <div className="stat-icon"><i className="ti ti-eye-check" /></div>
                    <h3>%{c1 > 0 ? (c1 / 10).toFixed(1) : '0.0'}</h3>
                    <p>OCR Doğruluğu</p>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><i className="ti ti-bolt" /></div>
                    <h3>{c2 > 0 ? (c2 / 10).toFixed(1) : '0.0'}s</h3>
                    <p>İşlem Hızı</p>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><i className="ti ti-building-skyscraper" /></div>
                    <h3>{c3}+</h3>
                    <p>Aktif Takım</p>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><i className="ti ti-lock" /></div>
                    <h3>256-bit</h3>
                    <p>Uçtan Uca Şifreleme</p>
                </div>
            </section>

            {/* FEATURES — lazy */}
            <section id="features" className="section-padding lz-section">
                <div className="section-header">
                    <span className="sub-title">Yetenekler</span>
                    <h2>Karmaşıklığı Basitliğe Dönüştürün</h2>
                    <p className="section-desc">Her büyüklükteki ekip için tasarlanmış, kurumsal güçte araçlar.</p>
                </div>
                <Suspense fallback={<SectionLoader />}>
                    <Features />
                </Suspense>
            </section>

            {/* WORKFLOW */}
            <section id="workflow" className="workflow-section lz-section">
                <div className="workflow-container">
                    <div className="workflow-text">
                        <span className="sub-title">Akıllı İş Akışı</span>
                        <h2>Sıfır Sürtünme, Tam Kontrol</h2>
                        <p>FlowTera, en karmaşık ekip yapılarını bile saniyeler içinde kurmanıza ve yönetmenize olanak tanır.</p>
                        <ul className="workflow-list">
                            <li>
                                <div className="wf-icon-wrap"><i className="ti ti-capture" style={{ fontSize: '20px' }} /></div>
                                <div>
                                    <strong>Giriş ve AI Yakalama</strong>
                                    <span>Herkes fişini yükler; AI dil, para birimi ve kategori ayrımını saniyeler içinde yapar.</span>
                                </div>
                            </li>
                            <li>
                                <div className="wf-icon-wrap"><i className="ti ti-hierarchy-2" style={{ fontSize: '20px' }} /></div>
                                <div>
                                    <strong>Esnek Takım Mimarisi</strong>
                                    <span>Ücretsiz planda bile sınırsız takıma katılın, her proje için ayrı onay zinciri kurun.</span>
                                </div>
                            </li>
                            <li>
                                <div className="wf-icon-wrap"><i className="ti ti-shield-code" style={{ fontSize: '20px' }} /></div>
                                <div>
                                    <strong>Otonom Denetim</strong>
                                    <span>Sistem, şirket kurallarını manuel kontrole gerek kalmadan 7/24 denetler.</span>
                                </div>
                            </li>
                            <li>
                                <div className="wf-icon-wrap"><i className="ti ti-database-export" style={{ fontSize: '20px' }} /></div>
                                <div>
                                    <strong>Kesintisiz Senkronizasyon</strong>
                                    <span>Onaylanan harcamalar anında muhasebe sisteminize veya banka kayıtlarınıza işlenir.</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="workflow-visual-advanced">
                        <div className="flow-diagram">
                            {WORKFLOW_STEPS.map((step, i) => (
                                <React.Fragment key={i}>
                                    <div className={`flow-step${step.highlight ? ' highlight' : ''}`} style={{ '--step-color': step.color }}>
                                        <div className="flow-step-icon"><i className={`ti ${step.icon}`} /></div>
                                        <span className="flow-step-label">{step.label}</span>
                                        <span className="flow-step-sub">{step.sublabel}</span>
                                    </div>
                                    {i < 3 && (
                                        <div className="flow-arrow">
                                            <div className="flow-arrow-line">
                                                <div className="flow-arrow-dot dot1" />
                                                <div className="flow-arrow-dot dot2" />
                                                <div className="flow-arrow-dot dot3" />
                                            </div>
                                            <i className="ti ti-chevron-right" />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        <div className="policy-card">
                            <div className="policy-header">
                                <i className="ti ti-settings-automation" style={{ color: '#0ed45a' }} />
                                <span>Dinamik Politika Motoru</span>
                            </div>
                            <div className="policy-rules">
                                {POLICY_RULES.map((r, i) => (
                                    <div key={i} className={`policy-rule ${r.active ? 'active' : 'inactive'}`}>
                                        <i className={`ti ${r.active ? 'ti-circle-check' : 'ti-circle-dashed'}`} />
                                        {r.rule}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PRICING — lazy */}
            <section id="pricing" className="pricing-section section-padding lz-section">
                <div className="section-header">
                    <span className="sub-title">Fiyatlandırma</span>
                    <h2>Ekibinize Göre Büyüyen Planlar</h2>
                    <p className="section-desc">Tüm planlarda 14 gün ücretsiz deneme. Kredi kartı gerekmez.</p>
                </div>
                <Suspense fallback={<SectionLoader />}>
                    <Subs />
                </Suspense>
            </section>

            {/* FAQ — lazy */}
            <section id="faq" className="section-padding lz-section">
                <Suspense fallback={<SectionLoader />}>
                    <FAQ />
                </Suspense>
            </section>

            {/* CTA */}
            <section className="cta-section lz-section">
                <div className="cta-glow" aria-hidden="true" />
                <div className="cta-content">
                    <h2>Finansal Akışınızı Bugün Dönüştürün</h2>
                    <p>14 gün ücretsiz. Kurulum yok. Kredi kartı gerekmez.</p>
                    <div className="cta-actions">
                        <Link to="/signup" className="primary-btn large">
                            Ücretsiz Başla <i className="ti ti-arrow-narrow-right" />
                        </Link>
                        <button className="secondary-btn large" onClick={handleDemoClick} disabled={demoLoading}>
                            Demo Deneyin <i className="ti ti-eye" />
                        </button>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="landing-footer lz-section">
                <div className="footer-content">
                    <div className="footer-brand">
                        <div className="nav-logo" style={{ marginBottom: '16px' }}>
                            <div className="logo-icon-wrapper">
                                <img src="/Logo.png" alt="FlowTera Logo" className="logo-img" width="34" height="34" loading="lazy" />
                            </div>
                            <span>FlowTera</span>
                        </div>
                        <p>Geleceğin finansal yönetim standartlarını bugünden belirleyin.</p>
                        <div className="footer-social">
                            <a href="#" aria-label="Twitter"><i className="ti ti-brand-twitter" /></a>
                            <a href="#" aria-label="LinkedIn"><i className="ti ti-brand-linkedin" /></a>
                            <a href="https://github.com/uixova" aria-label="GitHub"><i className="ti ti-brand-github" /></a>
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
                        <span className="footer-badge"><i className="ti ti-lock" /> SOC 2 Type II</span>
                        <span className="footer-badge"><i className="ti ti-shield" /> GDPR Uyumlu</span>
                        <span className="footer-badge"><i className="ti ti-certificate" /> ISO 27001</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
