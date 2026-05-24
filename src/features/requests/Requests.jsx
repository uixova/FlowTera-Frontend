import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/ui/Loader';
import SubNavbar from '../../components/navigation/SubNavbar';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import { useFilter } from '../../hooks/useFilter';
import { useTimeAgo } from '../../hooks/useTimeAgo';
import { useTeam } from '../../context/TeamContext';
import './Requests.css';

// Kategori Konfigürasyonu
const CATEGORY_CONFIG = {
    expense: { icon: 'ti-receipt-2',      label: 'Gider'    },
    team:    { icon: 'ti-users-group',     label: 'Takım'    },
    travel:  { icon: 'ti-plane-departure', label: 'Seyahat'  },
};

// Sekme Konfigürasyonu
const TABS = [
    { key: 'pending',  label: 'Beklemede',  icon: 'ti-clock-pause'  },
    { key: 'approved', label: 'Onaylandı',  icon: 'ti-circle-check' },
    { key: 'rejected', label: 'Reddedildi', icon: 'ti-circle-x'     },
];

const Requests = () => {
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
            await notificationService.respondToRequest(id, status, selectedTeamId);

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
                pageName="Talep Yönetimi"
                searchPlaceholder="İstek ara..."
                showSearch={true}
                searchValue={searchTerm}
                onSearch={(val) => setSearchTerm(val)}
                showCreate={false}
            />

            <hr className="sub-nav-divider" />

            {/* Sekmeler */}
            <div className="req-tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={activeTab === tab.key ? 'active' : ''}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        <i className={`ti ${tab.icon}`} />
                        {tab.label}
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
                        <p>
                            {searchTerm
                                ? `"${searchTerm}" aramasına uygun sonuç bulunamadı.`
                                : 'Henüz bir talep bulunmuyor.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Alt Bileşen (Memory leak olmaması için dışarıda veya memo ile tanımlanabilir)
const RequestItem = ({ req, activeTab, handleAction, rejectReason, setRejectReason }) => {
    const timeDisplay = useTimeAgo(req.date);
    const catConfig   = CATEGORY_CONFIG[req.category] || CATEGORY_CONFIG.expense;

    return (
        <div className={`req-modern-card status-${req.status || 'pending'}`}>
            <div className="req-accent-bar" />

            <div className="req-content">
                <div className="req-left-side">
                    <div className={`req-icon-box ${req.category}`}>
                        <i className={`ti ${catConfig.icon}`} />
                    </div>

                    <div className="req-info">
                        <div className="req-user-row">
                            <span className="req-username">{req.user}</span>
                            <span className="req-dot">•</span>
                            <span className="req-time">{timeDisplay}</span>
                            <span className={`req-category-tag ${req.category}`}>
                                {catConfig.label}
                            </span>
                        </div>

                        <h4 className="req-title">{req.title}</h4>
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
                                placeholder="Red nedeni girin..."
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
                                    <i className="ti ti-check" /> Reddet
                                </button>
                                <button
                                    className="cancel"
                                    onClick={() => setRejectReason({ id: null, text: '' })}
                                >
                                    İptal
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="action-row">
                            <button className="btn-icon approve" onClick={() => handleAction(req.id, 'approved')}>
                                <i className="ti ti-circle-check" /> Onayla
                            </button>
                            <button className="btn-icon reject" onClick={() => setRejectReason({ id: req.id, text: '' })}>
                                <i className="ti ti-circle-x" /> Reddet
                            </button>
                        </div>
                    )
                ) : (
                    <div className={`final-status-badge ${activeTab}`}>
                        <i className={`ti ${activeTab === 'approved' ? 'ti-circle-check' : 'ti-circle-x'}`} />
                        {activeTab === 'approved' ? 'ONAYLANDI' : 'REDDEDİLDİ'}
                    </div>
                )}
            </div>

            {/* Red Nedeni Footer */}
            {req.rejectionReason && (
                <div className="req-reason-footer">
                    <i className="ti ti-info-circle" />
                    <span><strong>Red Nedeni:</strong> {req.rejectionReason}</span>
                </div>
            )}
        </div>
    );
};

export default Requests;