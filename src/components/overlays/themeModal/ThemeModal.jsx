import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import { useSubscription } from '../../../context/SubscriptionContext';
import './ThemeModal.css';

const ACCENT_COLORS = [
    { value: '#0ed45a', tKey: 'color_green'    },
    { value: '#00d2ff', tKey: 'color_blue'     },
    { value: '#8338ec', tKey: 'color_purple'   },
    { value: '#ff006e', tKey: 'color_pink'     },
    { value: '#fb5607', tKey: 'color_orange'   },
    { value: '#ffbe0b', tKey: 'color_yellow'   },
    { value: '#a78bfa', tKey: 'color_lavender' },
    { value: '#8cbed1', tKey: 'color_sky'      },
];

const RADIUS_KEYS = [
    { key: 'sharp', tKey: 'radius_sharp' },
    { key: 'soft',  tKey: 'radius_soft'  },
    { key: 'round', tKey: 'radius_round' },
    { key: 'ultra', tKey: 'radius_ultra' },
];

const DEFAULT_THEME = { mode: 'dark', accent: '#0ed45a', radius: 'soft' };

const ThemeModal = ({ isOpen, onClose }) => {
    const { theme, setTheme } = useTheme();
    const { hasFeature } = useSubscription();
    const { t } = useTranslation('common.theme');

    // Draft state — ThemeContext'e sadece Uygula butonunda yazılır
    const [draft, setDraft] = useState({ ...theme });

    // Modal her açıldığında context'teki güncel değerden başla
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (isOpen) setDraft({ ...theme });
    }, [isOpen, theme]);

    // Kısıtlama Kontrolü
    const isAdvancedThemeEnabled = hasFeature('theme_management');

    const handleApply = () => {
        setTheme(draft);
        onClose();
    };

    const handleReset = () => {
        setDraft(DEFAULT_THEME);
        setTheme(DEFAULT_THEME);
    };

    // Portal: overlay'i body'e doğrudan bağla — parent'ın transform/filter
    // stacking context'i z-index'i kırdığı için bu şart
    return ReactDOM.createPortal(
        <div className={`tm-panel-overlay${isOpen ? ' active' : ''}`} onClick={onClose}>
            {/* --preview-accent: panel içinde seçilen renk anlık önizleme sağlar
                variables.css --accent-color ile senkron ThemeContext üzerinden akar */}
            <div
                className={`tm-side-panel${isOpen ? ' open' : ''}`}
                style={{ '--preview-accent': draft.accent }}
                onClick={e => e.stopPropagation()}
            >
                <div className="tm-panel-header">
                    <div className="tm-header-text">
                        <h3>{t('title')}</h3>
                        <p>{t('subtitle')}</p>
                    </div>
                    <button className="tm-panel-close" onClick={onClose}>
                        <i className="ti ti-x" />
                    </button>
                </div>

                <div className="tm-panel-body">
                    {/* Arayüz Modu */}
                    <div className="tm-panel-section">
                        <label className="tm-section-label">{t('mode_label')}</label>
                        <div className="tm-mode-grid">
                            {['dark', 'light'].map(mode => (
                                <div
                                    key={mode}
                                    className={`tm-mode-card${draft.mode === mode ? ' active' : ''}`}
                                    onClick={() => setDraft(p => ({ ...p, mode }))}
                                >
                                    <div className={`tm-mode-preview ${mode}-preview`} />
                                    <span>{mode === 'dark' ? t('dark') : t('light')}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gelişmiş Ayarlar — Sadece Professional */}
                    <div className={`tm-advanced-section${!isAdvancedThemeEnabled ? ' locked' : ''}`}>
                        {!isAdvancedThemeEnabled && (
                            <div className="tm-lock-overlay">
                                <div className="tm-lock-icon">
                                    <i className="ti ti-lock" />
                                </div>
                                <span>{t('plan_required')}</span>
                            </div>
                        )}

                        {/* Vurgu Rengi */}
                        <div className="tm-panel-section">
                            <label className="tm-section-label">{t('accent_label')}</label>
                            <div className="tm-color-grid">
                                {ACCENT_COLORS.map(c => (
                                    <div
                                        key={c.value}
                                        className={`tm-color-dot${draft.accent === c.value ? ' active' : ''}`}
                                        style={{ background: c.value }}
                                        title={t(c.tKey)}
                                        onClick={() => isAdvancedThemeEnabled && setDraft(p => ({ ...p, accent: c.value }))}
                                    >
                                        {draft.accent === c.value && <i className="ti ti-check" />}
                                    </div>
                                ))}
                            </div>

                            {/* Seçili rengi variables.css --accent-color ile senkronize et */}
                            <div className="tm-color-preview">
                                <span className="tm-color-hex">{draft.accent}</span>
                                <div className="tm-color-swatch" style={{ background: draft.accent }} />
                            </div>
                        </div>

                        {/* Kenar Yapısı */}
                        <div className="tm-panel-section">
                            <label className="tm-section-label">{t('radius_label')}</label>
                            <div className="tm-radius-grid">
                                {RADIUS_KEYS.map(r => (
                                    <button
                                        key={r.key}
                                        type="button"
                                        className={`tm-radius-btn${draft.radius === r.key ? ' active' : ''}`}
                                        onClick={() => isAdvancedThemeEnabled && setDraft(p => ({ ...p, radius: r.key }))}
                                    >
                                        <span className="tm-radius-preview" data-radius={r.key} />
                                        {t(r.tKey)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="tm-panel-footer">
                    <button type="button" className="tm-btn-reset" onClick={handleReset}>
                        <i className="ti ti-refresh" />
                        {t('btn_reset')}
                    </button>
                    <button type="button" className="tm-btn-apply" onClick={handleApply}>
                        {t('btn_apply')}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ThemeModal;