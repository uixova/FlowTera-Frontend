import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import SubNavbar from '../../components/navigation/SubNavbar';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import { useFilter } from '../../hooks/useFilter'; 
import { useTimeAgo } from '../../hooks/useTimeAgo';
import { useTeam } from '../../context/TeamContext'; 
import './css/Requests.css';

const Requests = () => {
    const navigate = useNavigate();
    const { roleNameForTeam, loading: authLoading } = useAuth();
    const { selectedTeamId } = useTeam(); 
    
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');
    const [rejectReason, setRejectReason] = useState({ id: null, text: '' });
    const [searchTerm, setSearchTerm] = useState("");

    // Güvenlik Kontrolü: Admin değilse sayfadan at
    useEffect(() => {
        if (!authLoading && selectedTeamId) {
            const role = roleNameForTeam(selectedTeamId);
            if (role !== 'Admin') {
                console.warn("Yetkisiz erişim: Admin yetkisi gerekiyor.");
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
            console.error("Talepler yüklenemedi:", error);
        } finally {
            setLoading(false);
        }
    }, [selectedTeamId]);

    // Takım veya Auth durumu değişince veriyi tazele
    useEffect(() => { 
        if (!authLoading && selectedTeamId) {
            fetchRequests();
        }
    }, [fetchRequests, authLoading, selectedTeamId]);

    // Arama Filtrelemesi
    const { filteredData } = useFilter(requests, {}, ['user', 'title', 'detail'], searchTerm);

    // Sekme (Status) Filtrelemesi
    const finalDisplayData = useMemo(() => {
        return filteredData.filter(req => {
            const currentStatus = req.status || 'pending';
            return currentStatus === activeTab;
        });
    }, [filteredData, activeTab]);

    // Aksiyon Yönetimi (Onay/Red)
    const handleAction = async (id, status, reasonText = '') => {
        try {
            await notificationService.respondToRequest(id, status, selectedTeamId);
            
            // State'i local olarak güncelle 
            setRequests(prev => prev.map(req => {
                if (req.id === id) {
                    return { 
                        ...req, 
                        status: status, 
                        rejectionReason: status === 'rejected' ? reasonText : req.rejectionReason 
                    };
                }
                return req;
            }));
            setRejectReason({ id: null, text: '' });
        } catch (error) {
            console.error("İşlem hatası:", error);
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

            <div className="req-tabs">
                <button className={activeTab === 'pending' ? 'active' : ''} onClick={() => setActiveTab('pending')}>
                    Beklemede <span className="tab-count">{requests.filter(r => !r.status || r.status === 'pending').length}</span>
                </button>
                <button className={activeTab === 'approved' ? 'active' : ''} onClick={() => setActiveTab('approved')}>
                    Onaylandı <span className="tab-count">{requests.filter(r => r.status === 'approved').length}</span>
                </button>
                <button className={activeTab === 'rejected' ? 'active' : ''} onClick={() => setActiveTab('rejected')}>
                    Reddedildi <span className="tab-count">{requests.filter(r => r.status === 'rejected').length}</span>
                </button>
            </div>

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
                        <i className="ti ti-box-off"></i>
                        <p>{searchTerm ? `"${searchTerm}" aramasına uygun sonuç bulunamadı.` : "Henüz bir talep bulunmuyor."}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Alt Bileşen (Memory leak olmaması için dışarıda veya memo ile tanımlanabilir)
const RequestItem = ({ req, activeTab, handleAction, rejectReason, setRejectReason }) => {
    const timeDisplay = useTimeAgo(req.date);

    return (
        <div className={`req-modern-card status-${req.status || 'pending'}`}>
            <div className="req-accent-bar"></div>
            
            <div className="req-content">
                <div className="req-left-side">
                    <div className={`req-icon-box ${req.category}`}>
                        <i className={`ti ti-${req.category === 'expense' ? 'receipt-2' : req.category === 'team' ? 'users-group' : 'plane-departure'}`}></i>
                    </div>
                    <div className="req-info">
                        <div className="req-user-row">
                            <span className="req-username">{req.user}</span>
                            <span className="req-dot">•</span>
                            <span className="req-time">{timeDisplay}</span>
                        </div>
                        <h4 className="req-title">{req.title}</h4>
                        <p className="req-detail">{req.detail}</p>
                    </div>
                </div>
            </div>

            <div className="req-right-side">
                {activeTab === 'pending' ? (
                    rejectReason.id === req.id ? (
                        <div className="compact-reject-area">
                            <input 
                                type="text"
                                placeholder="Red nedeni..."
                                value={rejectReason.text}
                                onChange={(e) => setRejectReason({...rejectReason, text: e.target.value})}
                                autoFocus
                            />
                            <div className="compact-reject-btns">
                                <button className="confirm" onClick={() => handleAction(req.id, 'rejected', rejectReason.text)} disabled={!rejectReason.text.trim()}>
                                    <i className="ti ti-check"></i> Onayla
                                </button>
                                <button className="cancel" onClick={() => setRejectReason({ id: null, text: '' })}>
                                    İptal
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="action-row">
                            <button className="btn-icon approve" onClick={() => handleAction(req.id, 'approved')}>
                                <i className="ti ti-circle-check"></i> Onayla
                            </button>
                            <button className="btn-icon reject" onClick={() => setRejectReason({ id: req.id, text: '' })}>
                                <i className="ti ti-circle-x"></i> Reddet
                            </button>
                        </div>
                    )
                ) : (
                    <div className={`final-status-badge ${activeTab}`}>
                        {activeTab === 'approved' ? 'ONAYLANDI' : 'REDDEDİLDİ'}
                    </div>
                )}
            </div>
            
            {req.rejectionReason && (
                <div className="req-reason-footer">
                    <i className="ti ti-info-circle"></i> <strong>Red Nedeni:</strong> {req.rejectionReason}
                </div>
            )}
        </div>
    );
};

export default Requests;