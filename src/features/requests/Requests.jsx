import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../../locales/i18n';
import Loader from '../../components/ui/Loader';
import SubNavbar from '../../components/navigation/SubNavbar';
import { notificationService } from '../../services/notificationService';
import { socketClient } from '../../api/socketClient';
import { useAuth } from '../../context/AuthContext';
import { useFilter } from '../../hooks/useFilter';
import { useTimeAgo } from '../../hooks/useTimeAgo';
import { useTeam } from '../../context/TeamContext';
import './Requests.css';

// Icon maps — labels are resolved at render time via t()
const CATEGORY_ICONS = {
    expense: 'ti-receipt-2',
    team:    'ti-users-group',
    travel:  'ti-plane-departure',
};

const TAB_KEYS = [
    { key: 'pending',  icon: 'ti-clock-pause'  },
    { key: 'approved', icon: 'ti-circle-check' },
    { key: 'rejected', icon: 'ti-circle-x'     },
];

const Requests = () => {
    const { t } = useTranslation('requests');
    const navigate = useNavigate();
    const { roleNameForTeam, loading: authLoading } = useAuth();
    const { selectedTeamId } = useTeam();

    const [loading,      setLoading]      = useState(false);
    const [requests,     setRequests]     = useState([]);
    const [activeTab,    setActiveTab]    = useState('pending');
    const [rejectReason, setRejectReason] = useState({ id: null, text: '' });
    const [searchTerm,   setSearchTerm]   = useState('');

    // Güvenlik Kontrolü: Admin değilse sayfadan at
    // null = auth henüz yüklenmedi, sadece başka bir role varsa redirect
    useEffect(() => {
        if (!authLoading && selectedTeamId) {
            const role = roleNameForTeam(selectedTeamId);
            if (role !== null && role !== 'Admin') {
                console.warn('Yetkisiz erişim: Admin yetkisi gerekiyor.');
                navigate('/team');
            }
        }
    }, [authLoading, selectedTeamId, roleNameForTeam, navigate]);

    // Veri Çekme
    const fetchRequests = useCallback(async () => {
        if (!selectedTeamId) return;
        setLoading(true);
        try {
            const result = await notificationService.getTeamRequests(selectedTeamId);
            setRequests(result || []);
        } catch (error) {
            console.error('Talepler yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedTeamId]);

    // Takım veya Auth durumu değişince veriyi tazele
    useEffect(() => {
        if (!authLoading && selectedTeamId) fetchRequests();
    }, [fetchRequests, authLoading, selectedTeamId]);

    // WS: yeni talep veya durum değişimi → listeyi tazele
    useEffect(() => {
        const unsub = socketClient.on('request:update', () => {
            if (selectedTeamId) fetchRequests();
        });
        return unsub;
    }, [selectedTeamId, fetchRequests]);

    // Arama Filtrelemesi
    const { filteredData } = useFilter(requests, {}, ['user', 'title', 'detail'], searchTerm);

    // Sekme (Status) Filtrelemesi
    const finalDisplayData = useMemo(() => (
        filteredData.filter(req => (req.status || 'pending') === activeTab)
    ), [filteredData, activeTab]);

    // Sekmeye Göre Sayım
    const countByStatus = useMemo(() => ({
        pending:  requests.filter(r => !r.status || r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
    }), [requests]);

    // Aksiyon Yönetimi (Onay / Red)
    const handleAction = async (id, status, reasonText = '') => {
        try {
            await notificationService.respondToRequest(id, status, selectedTeamId, reasonText || undefined);

            // State'i local olarak güncelle
            setRequests(prev => prev.map(req =>
                req.id !== id ? req : {
                    ...req,
                    status: status,
                    rejectionReason: status === 'rejected' ? reasonText : req.rejectionReason,
                }
            ));
            setRejectReason({ id: null, text: '' });
        } catch (error) {
            console.error('İşlem hatası:', error);
        }
    };

    if (authLoading) return <Loader type="dots" />;

    return (
        <div className="requests-page" key={selectedTeamId}>
            <SubNavbar
                pageName={t('page_title')}
                searchPlaceholder={t('search_placeholder')}
                showSearch={true}
                searchValue={searchTerm}
                onSearch={(val) => setSearchTerm(val)}
                showCreate={false}
            />

            <hr className="sub-nav-divider" />

            {/* Sekmeler */}
            <div className="req-tabs">
                {TAB_KEYS.map(tab => (
                    <button
                        key={tab.key}
                        className={activeTab === tab.key ? 'active' : ''}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        <i className={`ti ${tab.icon}`} />
                        {t(`tab_${tab.key}`)}
                        <span className="tab-count">{countByStatus[tab.key]}</span>
                    </button>
                ))}
            </div>

            {/* Kart Listesi */}
            <div className="req-container">
                {loading ? (
                    <Loader type="dots" />
                ) : finalDisplayData.length > 0 ? (
                    finalDisplayData.map(req => (
                        <RequestItem
                            key={req.id}
                            req={req}
                            activeTab={activeTab}
                            handleAction={handleAction}
                            rejectReason={rejectReason}
                            setRejectReason={setRejectReason}
                        />
                    ))
                ) : (
                    <div className="no-req">
                        <i className="ti ti-inbox-off" />
                        <p>{t('no_requests')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Alt Bileşen (Memory leak olmaması için dışarıda tanımlandı)
const RequestItem = ({ req, activeTab, handleAction, rejectReason, setRejectReason }) => {
    const { t } = useTranslation('requests');
    const timeDisplay = useTimeAgo(req.date);
    const catIcon = CATEGORY_ICONS[req.category] || CATEGORY_ICONS.expense;
    const catLabel = t(`cat_${req.category}`, { defaultValue: req.category });

    return (
        <div className={`req-modern-card status-${req.status || 'pending'}`}>
            <div className="req-accent-bar" />

            <div className="req-content">
                <div className="req-left-side">
                    <div className={`req-icon-box ${req.category}`}>
                        <i className={`ti ${catIcon}`} />
                    </div>

                    <div className="req-info">
                        <div className="req-user-row">
                            <span className="req-username">{req.user}</span>
                            <span className="req-dot">•</span>
                            <span className="req-time">{timeDisplay}</span>
                            <span className={`req-category-tag ${req.category}`}>
                                {catLabel}
                            </span>
                        </div>

                        <h4 className="req-title">
                            {req.type ? t(`title_${req.type}`, { defaultValue: req.title }) : req.title}
                        </h4>
                        <p className="req-detail">{req.detail}</p>
                    </div>
                </div>
            </div>

            {/* Aksiyon Alanı */}
            <div className="req-right-side">
                {activeTab === 'pending' ? (
                    rejectReason.id === req.id ? (
                        <div className="compact-reject-area">
                            <input
                                type="text"
                                placeholder={t('reject_placeholder')}
                                value={rejectReason.text}
                                onChange={(e) => setRejectReason({ ...rejectReason, text: e.target.value })}
                                autoFocus
                            />
                            <div className="compact-reject-btns">
                                <button
                                    className="confirm"
                                    onClick={() => handleAction(req.id, 'rejected', rejectReason.text)}
                                    disabled={!rejectReason.text.trim()}
                                >
                                    <i className="ti ti-check" /> {t('reject', { ns: 'common.buttons' })}
                                </button>
                                <button
                                    className="cancel"
                                    onClick={() => setRejectReason({ id: null, text: '' })}
                                >
                                    {t('cancel', { ns: 'common.buttons' })}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="action-row">
                            <button className="btn-icon approve" onClick={() => handleAction(req.id, 'approved')}>
                                <i className="ti ti-circle-check" /> {t('approve', { ns: 'common.buttons' })}
                            </button>
                            <button className="btn-icon reject" onClick={() => setRejectReason({ id: req.id, text: '' })}>
                                <i className="ti ti-circle-x" /> {t('reject', { ns: 'common.buttons' })}
                            </button>
                        </div>
                    )
                ) : (
                    <div className={`final-status-badge ${activeTab}`}>
                        <i className={`ti ${activeTab === 'approved' ? 'ti-circle-check' : 'ti-circle-x'}`} />
                        {activeTab === 'approved' ? t('tab_approved').toUpperCase() : t('tab_rejected').toUpperCase()}
                    </div>
                )}
            </div>

            {/* Red Nedeni Footer */}
            {req.rejectionReason && (
                <div className="req-reason-footer">
                    <i className="ti ti-info-circle" />
                    <span>
                        <strong>{t('reject_reason')}:</strong>{' '}
                        {i18n.language === 'en' && req.rejectionReasonEn ? req.rejectionReasonEn : req.rejectionReason}
                    </span>
                </div>
            )}
        </div>
    );
};

export default Requests;