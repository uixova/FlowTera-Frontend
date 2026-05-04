import React, { useState, useEffect, useCallback } from 'react';
import Loader from '../../common/Loader';
import { notificationService } from '../../../services/notificationService';
import { useTimeAgo } from '../../../hooks/useTimeAgo';
import { useAuth } from '../../../context/AuthContext';
import './Notification.css';

const Notification = ({ isOpen, onClose }) => {
    const [infos, setInfos] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    const { currentUserId, loading: authLoading } = useAuth();

    const fetchNotifications = useCallback(async () => {
        if (!currentUserId || authLoading) return;

        setLoading(true);
        try {
            const result = await notificationService.getUserNotifications(currentUserId);
            setInfos(result.infos || []);
            setRequests(result.invites || []);
        } catch (error) {
            console.error("Bildirimler çekilemedi:", error);
        } finally {
            setLoading(false);
        }
    }, [currentUserId, authLoading]);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    const handleAction = async (id, action, teamId) => {
        try {
            await notificationService.respondToRequest(id, action, teamId);
            setRequests(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error("İşlem başarısız:", error);
        }
    };

    // SADECE bilgilendirmeleri (infos) temizler
    const handleClearInfos = async () => {
        if (infos.length === 0) return;
        try {
            await notificationService.clearAllInfos(currentUserId); 
            setInfos([]);
        } catch (error) {
            console.error("Bildirimler temizlenirken hata:", error);
        }
    };

    const removeNotification = async (id) => {
        try {
            await notificationService.deleteNotification(id);
            setInfos(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error("Notification not deleted:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="nt-panel-overlay" onClick={onClose}>
            <div className="nt-panel-container" onClick={(e) => e.stopPropagation()}>
                <div className="nt-header">
                    <div className="nt-header-title">
                        <h3>Aktivite Merkezi</h3>
                        <span className="count-badge">
                            {loading ? "..." : (requests.length + infos.length)}
                        </span>
                    </div>
                    <div className="nt-header-actions">
                        {infos.length > 0 && (
                            <button className="clear-all-btn" onClick={handleClearInfos}>
                                Temizle
                            </button>
                        )}
                        <button className="nt-close-btn" onClick={onClose}>
                            <i className="ti ti-x"></i>
                        </button>
                    </div>
                </div>

                <div className="nt-content">
                    {loading || authLoading ? (
                        <div className="nt-loader-wrapper"><Loader type="dots"/></div>
                    ) : (
                        <>
                            {/* TAKIM DAVETLERİ (REQUESTS) */}
                            {requests.length > 0 && (
                                <section className="nt-section">
                                    <div className="section-title"><span>Bekleyen Davetler</span></div>
                                    <div className="nt-list">
                                        {requests.map(req => (
                                            <div key={req.id} className="nt-invite-card">
                                                <div className="invite-card-header">
                                                    <div className="team-avatar">
                                                        {req.teamLogo ? (
                                                            <img src={req.teamLogo} alt="" />
                                                        ) : (
                                                            req.teamName?.charAt(0).toUpperCase() || "T"
                                                        )}
                                                    </div>
                                                    <div className="invite-info">
                                                        <p className="invite-main-text">
                                                            <strong>{req.sender}</strong> seni takıma çağırdı
                                                        </p>
                                                        <p className="invite-sub-text">{req.teamName}</p>
                                                    </div>
                                                </div>
                                                <div className="invite-card-actions">
                                                    <button 
                                                        className="btn-invite-accept" 
                                                        onClick={() => handleAction(req.id, 'accept', req.teamId)}
                                                    >
                                                        Kabul Et
                                                    </button>
                                                    <button 
                                                        className="btn-invite-reject" 
                                                        onClick={() => handleAction(req.id, 'reject', req.teamId)}
                                                    >
                                                        Reddet
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* BİLGİLENDİRMELER (INFOS) */}
                            <section className="nt-section">
                                <div className="section-title"><span>Son Bildirimler</span></div>
                                <div className="nt-list">
                                    {infos.length > 0 ? infos.map(nt => (
                                        <NotificationItem 
                                            key={nt.id} 
                                            nt={nt} 
                                            onRemove={removeNotification} 
                                        />
                                    )) : <p className="no-data">Henüz bildirim yok.</p>}
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const NotificationItem = ({ nt, onRemove }) => {
    const timeAgo = useTimeAgo(nt.date);
    return (
        <div className={`nt-item ${nt.category}`}>
            <div className="nt-icon">
                <i className={nt.category === 'success' ? 'ti ti-circle-check' : 'ti ti-info-square-rounded'}></i>
            </div>
            <div className="nt-text">
                <p>{nt.text}</p>
                <span className="nt-time-text">{timeAgo}</span>
            </div>
            <button className="nt-del-btn" onClick={() => onRemove(nt.id)}>
                <i className="ti ti-trash"></i>
            </button>
        </div>
    );
};

export default Notification;