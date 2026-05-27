import React, { useEffect, useRef, useState, useCallback, useMemo, memo, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import './Landing.css';

// Below-fold sections — lazy loaded, not in initial bundle
const FAQ      = lazy(() => import('./components/FAQ'));
const Features = lazy(() => import('./components/Features'));
const Subs     = lazy(() => import('./components/Subs'));

// Static outside component — never recreated
const EXPENSE_DATA = [12, 19, 15, 27, 22, 34, 28, 42, 38, 51, 45, 60];

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
    const { t } = useTranslation('auth.landing');
    const navigate = useNavigate();
    const { loginWithCredentials } = useAuth();

    const WORKFLOW_STEPS = [
        { icon: 'ti-arrows-split', label: t('wfstep_employee'),  sublabel: t('wfstep_employee_sub'),  color: '#0ed45a' },
        { icon: 'ti-scan',         label: t('wfstep_ai_label'),  sublabel: t('wfstep_ai_sub'),         color: '#888', highlight: true },
        { icon: 'ti-user-check',   label: t('wfstep_manager'),   sublabel: t('wfstep_manager_sub'),    color: '#00d2ff' },
        { icon: 'ti-cloud-upload', label: t('wfstep_approval'),  sublabel: t('wfstep_approval_sub'),   color: '#a78bfa' },
    ];

    const POLICY_RULES = [
        { rule: t('policy_rule1'), active: true  },
        { rule: t('policy_rule2'), active: true  },
        { rule: t('policy_rule3'), active: true  },
        { rule: t('policy_rule4'), active: false },
    ];

    const FEED_ITEMS = [
        { icon: 'ti-plane',    text: t('feed_istanbul'), amount: '+₺12.450', time: t('feed_time_2min'),  type: 'approved', delay: 0    },
        { icon: 'ti-receipt',  text: t('feed_office'),   amount: '₺340',     time: t('feed_time_15min'), type: 'pending',  delay: 0.3  },
        { icon: 'ti-building', text: t('feed_hotel'),    amount: '₺8.200',   time: t('feed_time_1h'),    type: 'approved', delay: 0.6  },
    ];
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
        document.title = 'FlowTera';
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
        let raf;
        if (prefersReduced) {
            raf = requestAnimationFrame(() => {
                setC1(997);
                setC2(24);
                setC3(50);
            });
            return () => cancelAnimationFrame(raf);
        }

        const duration = 2000;
        const startTime = performance.now();
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
            <button className="landing-demo-fab" onClick={handleDemoClick} disabled={demoLoading} aria-label={t('nav_demo')}>
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
                    <a href="#features">{t('nav_features')}</a>
                    <a href="#workflow">{t('nav_workflow')}</a>
                    <a href="#pricing">{t('nav_pricing')}</a>
                    <a href="#faq">{t('nav_faq')}</a>
                    <div className="nav-divider" />
                    <button className="nav-demo-btn" onClick={handleDemoClick} disabled={demoLoading}>{t('nav_demo')}</button>
                    <Link to="/login"  className="nav-login-btn">{t('login_link')}</Link>
                    <Link to="/signup" className="nav-register-btn">{t('signup_link')}</Link>
                </div>
            </nav>

            {/* HERO */}
            <header className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="pulse-dot" />
                        {t('hero_badge')}
                    </div>
                    <h1>
                        {t('hero_h1_1')} <br />
                        <span className="gradient-text">{t('hero_h1_gradient')}</span> {t('hero_h1_2')}
                    </h1>
                    <p>{t('hero_desc')}</p>
                    <div className="hero-actions">
                        <Link to="/signup" className="primary-btn">
                            {t('hero_cta')} <i className="ti ti-arrow-narrow-right" />
                        </Link>
                        <button className="secondary-btn" onClick={handleDemoClick} disabled={demoLoading}>
                            <i className="ti ti-player-play" /> {t('hero_demo')}
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
                                        <span className="kpi-label">{t('kpi_this_month')}</span>
                                        <span className="kpi-value green">₺48.250</span>
                                        <span className="kpi-delta up"><i className="ti ti-trending-up" /> +12%</span>
                                    </div>
                                    <div className="kpi-card">
                                        <span className="kpi-label">{t('kpi_pending')}</span>
                                        <span className="kpi-value yellow">₺7.800</span>
                                        <span className="kpi-delta">{t('kpi_requests')}</span>
                                    </div>
                                    <div className="kpi-card">
                                        <span className="kpi-label">{t('kpi_approved')}</span>
                                        <span className="kpi-value cyan">142</span>
                                        <span className="kpi-delta up"><i className="ti ti-check" /></span>
                                    </div>
                                </div>

                                <div className="mockup-chart-area">
                                    <div className="chart-header">
                                        <span>{t('chart_spending_trend')}</span>
                                        <span className="chart-badge">{t('chart_last_12')}</span>
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
                            <div className="fc-title">{t('fc1_title')}</div>
                            <div className="fc-sub">{t('fc1_sub')}</div>
                        </div>
                    </div>
                    <div className="floating-card c2" aria-hidden="true">
                        <i className="ti ti-users" style={{ color: '#00d2ff' }} />
                        <div>
                            <div className="fc-title">{t('fc2_title')}</div>
                            <div className="fc-sub">{t('fc2_sub')}</div>
                        </div>
                    </div>
                    <div className="floating-card c3" aria-hidden="true">
                        <i className="ti ti-robot" style={{ color: '#a78bfa' }} />
                        <div>
                            <div className="fc-title">{t('fc3_title')}</div>
                            <div className="fc-sub">{t('fc3_sub')}</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* STATS */}
            <section className="stats-grid" ref={statsRef}>
                <div className="stat-card">
                    <div className="stat-icon"><i className="ti ti-eye-check" /></div>
                    <h3>%{c1 > 0 ? (c1 / 10).toFixed(1) : '0.0'}</h3>
                    <p>{t('stat_ocr')}</p>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><i className="ti ti-bolt" /></div>
                    <h3>{c2 > 0 ? (c2 / 10).toFixed(1) : '0.0'}s</h3>
                    <p>{t('stat_speed')}</p>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><i className="ti ti-building-skyscraper" /></div>
                    <h3>{c3}+</h3>
                    <p>{t('stat_teams')}</p>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><i className="ti ti-lock" /></div>
                    <h3>256-bit</h3>
                    <p>{t('stat_encryption')}</p>
                </div>
            </section>

            {/* FEATURES — lazy */}
            <section id="features" className="section-padding lz-section">
                <div className="section-header">
                    <span className="sub-title">{t('section_features_badge')}</span>
                    <h2>{t('section_features_title')}</h2>
                    <p className="section-desc">{t('section_features_desc')}</p>
                </div>
                <Suspense fallback={<SectionLoader />}>
                    <Features />
                </Suspense>
            </section>

            {/* WORKFLOW */}
            <section id="workflow" className="workflow-section lz-section">
                <div className="workflow-container">
                    <div className="workflow-text">
                        <span className="sub-title">{t('section_workflow_badge')}</span>
                        <h2>{t('section_workflow_title')}</h2>
                        <p>{t('section_workflow_desc')}</p>
                        <ul className="workflow-list">
                            <li>
                                <div className="wf-icon-wrap"><i className="ti ti-capture" style={{ fontSize: '20px' }} /></div>
                                <div>
                                    <strong>{t('wf_step1_title')}</strong>
                                    <span>{t('wf_step1_desc')}</span>
                                </div>
                            </li>
                            <li>
                                <div className="wf-icon-wrap"><i className="ti ti-hierarchy-2" style={{ fontSize: '20px' }} /></div>
                                <div>
                                    <strong>{t('wf_step2_title')}</strong>
                                    <span>{t('wf_step2_desc')}</span>
                                </div>
                            </li>
                            <li>
                                <div className="wf-icon-wrap"><i className="ti ti-shield-code" style={{ fontSize: '20px' }} /></div>
                                <div>
                                    <strong>{t('wf_step3_title')}</strong>
                                    <span>{t('wf_step3_desc')}</span>
                                </div>
                            </li>
                            <li>
                                <div className="wf-icon-wrap"><i className="ti ti-database-export" style={{ fontSize: '20px' }} /></div>
                                <div>
                                    <strong>{t('wf_step4_title')}</strong>
                                    <span>{t('wf_step4_desc')}</span>
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
                                <span>{t('policy_engine')}</span>
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
                    <span className="sub-title">{t('section_pricing_badge')}</span>
                    <h2>{t('section_pricing_title')}</h2>
                    <p className="section-desc">{t('section_pricing_desc')}</p>
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
                    <h2>{t('cta_title')}</h2>
                    <p>{t('cta_desc')}</p>
                    <div className="cta-actions">
                        <Link to="/signup" className="primary-btn large">
                            {t('cta_start')} <i className="ti ti-arrow-narrow-right" />
                        </Link>
                        <button className="secondary-btn large" onClick={handleDemoClick} disabled={demoLoading}>
                            {t('cta_demo')} <i className="ti ti-eye" />
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
                        <p>{t('footer_tagline')}</p>
                        <div className="footer-social">
                            <a href="#" aria-label="Twitter"><i className="ti ti-brand-twitter" /></a>
                            <a href="#" aria-label="LinkedIn"><i className="ti ti-brand-linkedin" /></a>
                            <a href="https://github.com/uixova" aria-label="GitHub"><i className="ti ti-brand-github" /></a>
                        </div>
                    </div>
                    <div className="footer-links">
                        <div className="link-group">
                            <h4>{t('footer_product')}</h4>
                            <a href="#">{t('footer_link_features')}</a>
                            <a href="#">{t('footer_link_pricing')}</a>
                            <a href="#">{t('footer_link_security')}</a>
                            <a href="#">{t('footer_link_api')}</a>
                        </div>
                        <div className="link-group">
                            <h4>{t('footer_company')}</h4>
                            <a href="#">{t('footer_link_about')}</a>
                            <a href="#">{t('footer_link_blog')}</a>
                            <a href="#">{t('footer_link_careers')}</a>
                            <a href="#">{t('footer_link_press')}</a>
                        </div>
                        <div className="link-group">
                            <h4>{t('footer_support')}</h4>
                            <a href="#">{t('footer_link_help')}</a>
                            <a href="#">{t('footer_link_status')}</a>
                            <a href="#">{t('footer_link_contact')}</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>{t('footer_copyright')}</p>
                    <div className="footer-badges">
                        <span className="footer-badge"><i className="ti ti-lock" /> {t('footer_badge_soc')}</span>
                        <span className="footer-badge"><i className="ti ti-shield" /> {t('footer_badge_gdpr')}</span>
                        <span className="footer-badge"><i className="ti ti-certificate" /> {t('footer_badge_iso')}</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
