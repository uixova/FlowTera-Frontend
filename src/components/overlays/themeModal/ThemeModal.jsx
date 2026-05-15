import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTheme } from '../../../context/ThemeContext';
import { useSubscription } from '../../../context/SubscriptionContext';
import './ThemeModal.css';

const ACCENT_COLORS = [
    { value: '#0ed45a', label: 'Yeşil'     },
    { value: '#00d2ff', label: 'Mavi'       },
    { value: '#8338ec', label: 'Mor'        },
    { value: '#ff006e', label: 'Pembe'      },
    { value: '#fb5607', label: 'Turuncu'    },
    { value: '#ffbe0b', label: 'Sarı'       },
    { value: '#a78bfa', label: 'Lavanta'    },
    { value: '#8cbed1', label: 'Açık Mavi'  },
];

const RADIUS_OPTIONS = [
    { key: 'sharp', label: 'Keskin'   },
    { key: 'soft',  label: 'Yumuşak'  },
    { key: 'round', label: 'Oval'     },
    { key: 'ultra', label: 'Tam Oval' },
];

const DEFAULT_THEME = { mode: 'dark', accent: '#0ed45a', radius: 'soft' };

const ThemeModal = ({ isOpen, onClose }) => {
    const { theme, setTheme } = useTheme();
    const { hasFeature } = useSubscription();

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
                        <h3>Görünüm Ayarları</h3>
                        <p>Sistemi kendine göre özelleştir</p>
                    </div>
                    <button className="tm-panel-close" onClick={onClose}>
                        <i className="ti ti-x" />
                    </button>
                </div>

                <div className="tm-panel-body">
                    {/* Arayüz Modu — tüm kullanıcılar değiştirebilir */}
                    <div className="tm-panel-section">
                        <label className="tm-section-label">Arayüz Modu</label>
                        <div className="tm-mode-grid">
                            {['dark', 'light'].map(mode => (
                                <div
                                    key={mode}
                                    className={`tm-mode-card${draft.mode === mode ? ' active' : ''}`}
                                    onClick={() => setDraft(p => ({ ...p, mode }))}
                                >
                                    <div className={`tm-mode-preview ${mode}-preview`} />
                                    <span>{mode === 'dark' ? 'Koyu Tema' : 'Açık Tema'}</span>
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
                                <span>Bu ayarlar Professional plan gerektirir</span>
                            </div>
                        )}

                        {/* Vurgu Rengi */}
                        <div className="tm-panel-section">
                            <label className="tm-section-label">Vurgu Rengi</label>
                            <div className="tm-color-grid">
                                {ACCENT_COLORS.map(c => (
                                    <div
                                        key={c.value}
                                        className={`tm-color-dot${draft.accent === c.value ? ' active' : ''}`}
                                        style={{ background: c.value }}
                                        title={c.label}
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
                            <label className="tm-section-label">Kenar Yapısı</label>
                            <div className="tm-radius-grid">
                                {RADIUS_OPTIONS.map(r => (
                                    <button
                                        key={r.key}
                                        type="button"
                                        className={`tm-radius-btn${draft.radius === r.key ? ' active' : ''}`}
                                        onClick={() => isAdvancedThemeEnabled && setDraft(p => ({ ...p, radius: r.key }))}
                                    >
                                        <span className="tm-radius-preview" data-radius={r.key} />
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="tm-panel-footer">
                    <button type="button" className="tm-btn-reset" onClick={handleReset}>
                        <i className="ti ti-refresh" />
                        Sıfırla
                    </button>
                    <button type="button" className="tm-btn-apply" onClick={handleApply}>
                        Değişiklikleri Uygula
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ThemeModal;