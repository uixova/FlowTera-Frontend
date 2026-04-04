import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import SubNavbar from '../../components/navigation/SubNavbar';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../hooks/useAuth';
import { useFilter } from '../../hooks/useFilter'; 
import { useTimeAgo } from '../../hooks/useTimeAgo';
import './css/Requests.css';

const Requests = () => {
    const navigate = useNavigate();
    const { roleNameForTeam, loading: authLoading } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');
    const [rejectReason, setRejectReason] = useState({ id: null, text: '' });
    const [searchTerm, setSearchTerm] = useState(""); 
    const [selectedTeamId, setSelectedTeamId] = useState(localStorage.getItem('tm_selected_id'));

    // GÜVENLİK VE TAKIM DEĞİŞİMİ KONTROLÜ
    useEffect(() => {
        const handleTeamChange = () => {
            const newId = localStorage.getItem('tm_selected_id');
            setSelectedTeamId(newId);
            if (newId && roleNameForTeam(newId) !== 'Admin') {
                navigate('/team'); 
            }
        };
        window.addEventListener('teamChanged', handleTeamChange);
        return () => window.removeEventListener('teamChanged', handleTeamChange);
    }, [roleNameForTeam, navigate]);

    // Veri Çekme - Callback bozulmadı
    const fetchRequests = useCallback(async () => {
        if (!selectedTeamId) return;
        setLoading(true);
        try {
            const result = await notificationService.getSortedNotifications();
            // teamId'ye göre filtreleme yapıyoruz
            const teamRequests = (result.requests || []).filter(item => 
                item.type === 'request' && String(item.teamId) === String(selectedTeamId)
            );
            setRequests(teamRequests);
        } catch (error) {
            console.error("Failed to load claims:", error);
        } finally {
            setLoading(false);
        }
    }, [selectedTeamId]);

    useEffect(() => { 
        if (!authLoading) {
            fetchRequests();
        }
    }, [fetchRequests, authLoading]);

    // Arama Filtrelemesi (useFilter)
    const { filteredData } = useFilter(requests, searchTerm, ['user', 'title', 'detail']);

    // Sekme Filtrelemesi
    const finalDisplayData = useMemo(() => {
        return filteredData.filter(req => {
            if (activeTab === 'pending') return !req.status || req.status === 'pending';
            return req.status === activeTab;
        });
    }, [filteredData, activeTab]);

    // API üzerinden veri çekme 
    const handleAction = async (id, status, reasonText = '') => {
        try {
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
            console.error("Operation could not be completed:", error);
        }
    };

    if (authLoading) return <Loader type="dots" />;

    return (
        <div className="requests-page">
            <SubNavbar 
                pageName="Talep Yönetimi" 
                showSearch={true}
                searchValue={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                showCreate={false}
            />

            <div className="req-tabs">
                <button className={activeTab === 'pending' ? 'active' : ''} onClick={() => setActiveTab('pending')}>
                    Beklemede ({requests.filter(r => !r.status || r.status === 'pending').length})
                </button>
                <button className={activeTab === 'approved' ? 'active' : ''} onClick={() => setActiveTab('approved')}>
                    Onaylandı ({requests.filter(r => r.status === 'approved').length})
                </button>
                <button className={activeTab === 'rejected' ? 'active' : ''} onClick={() => setActiveTab('rejected')}>
                    Reddedildi ({requests.filter(r => r.status === 'rejected').length})
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
                    <div className="no-req">Henüz kriterlere uygun bir talep yok.</div>
                )}
            </div>
        </div>
    );
};

// Alt Bileşen: useTimeAgo'yu her kart için ayrı yönetmek sağlıklı olandır
const RequestItem = ({ req, activeTab, handleAction, rejectReason, setRejectReason }) => {
    const timeDisplay = useTimeAgo(req.date);

    return (
        <div className={`req-main-card ${activeTab}`}>
            <div className="req-card-header">
                <span className={`req-badge ${req.category}`}>{req.category}</span>
                <span className="req-time">{timeDisplay}</span>
            </div>
            
            <div className="req-card-body">
                <h4>{req.user}</h4>
                <p className="req-sub"><strong>{req.title}:</strong> {req.detail}</p>
                {req.rejectionReason && (
                    <div className="view-reason">
                        <strong>Neden:</strong> {req.rejectionReason}
                    </div>
                )}
            </div>

            {activeTab === 'pending' && (
                <div className="req-card-footer">
                    {rejectReason.id === req.id ? (
                        <div className="reject-area">
                            <textarea 
                                placeholder="Neden reddedildiğini açıkla..."
                                value={rejectReason.text}
                                onChange={(e) => setRejectReason({...rejectReason, text: e.target.value})}
                                autoFocus
                            />
                            <div className="reject-btns">
                                <button 
                                    className="btn-confirm-reject" 
                                    onClick={() => handleAction(req.id, 'rejected', rejectReason.text)}
                                    disabled={!rejectReason.text.trim()}
                                >
                                    Reddi Onayla
                                </button>
                                <button className="btn-cancel" onClick={() => setRejectReason({ id: null, text: '' })}>
                                    İptal et
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="action-btns">
                            <button className="btn-approve" onClick={() => handleAction(req.id, 'approved')}>
                                Onayla
                            </button>
                            <button className="btn-reject" onClick={() => setRejectReason({ id: req.id, text: '' })}>
                                Reddet
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Requests;