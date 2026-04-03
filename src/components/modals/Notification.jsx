import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../common/Loader';
import { notificationService } from '../../services/notificationService';
import { useTimeAgo } from '../../hooks/useTimeAgo';
import { useAuth } from '../../hooks/useAuth'; 
import '../../components/components.css/Notification.css';

const Notification = ({ isOpen, onClose }) => {
    const [infos, setInfos] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    //  currentUserId ve auth loading durumunu hook'tan çekiyoruz
    const { currentUserId, loading: authLoading } = useAuth();

    const fetchNotifications = useCallback(async () => {
        // userId yoksa veya hala auth yükleniyorsa işlem yapma
        if (!currentUserId || authLoading) return;

        setLoading(true);
        try {
            // Servise hook'tan gelen güncel userId'yi gönderiyoruz
            const result = await notificationService.getSortedNotifications(currentUserId);
            setInfos(result.infos || []);
            setTotalCount(result.infos?.length || 0);
        } catch (error) {
            console.error("Hata: Bildirimler çekilemedi", error);
        } finally {
            setLoading(false);
        }
    }, [currentUserId, authLoading]); // Bağımlılıklara authLoading eklendi

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    if (!isOpen) return null;

    const removeNotification = async (id) => {
        try {
            await notificationService.deleteNotification(id);
            setInfos(prev => prev.filter(item => item.id !== id));
            setTotalCount(prev => prev - 1);
        } catch (error) {
            console.error("Bildirim silinirken hata oluştu:", error);
        }
    };

    const handleItemClick = (path, targetId) => {
        if (path) {
            const fullPath = targetId ? `${path}?id=${targetId}` : path;
            navigate(fullPath);
            onClose();
        }
    };

    return (
        <div className="nt-panel-overlay" onClick={onClose}>
            <div className="nt-panel-container" onClick={(e) => e.stopPropagation()}>
                <div className="nt-header">
                    <div className="nt-header-title">
                        <h3>Activity Center</h3>
                        <span className="count-badge">{loading ? "..." : totalCount}</span>
                    </div>
                    <button className="nt-close-btn" onClick={onClose}>
                        <i className="ti ti-x"></i>
                    </button>
                </div>

                <div className="nt-content">
                    {/* Auth veya bildirim yükleniyorsa loader göster */}
                    {loading || authLoading ? (
                        <Loader type="dots" text="Yükleniyor..." />
                    ) : (
                        <section className="nt-section">
                            <div className="section-title"><span>Recent Notifications</span></div>
                            <div className="nt-list">
                                {infos.length > 0 ? infos.map(nt => (
                                    <NotificationItem 
                                        key={nt.id} 
                                        nt={nt} 
                                        onRemove={removeNotification} 
                                        onClick={handleItemClick} 
                                    />
                                )) : <p className="no-data">Bildirim Bulunamadı.</p>}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

const NotificationItem = ({ nt, onRemove, onClick }) => {
    const timeAgo = useTimeAgo(nt.date);

    return (
        <div className={`nt-item ${nt.category}`}>
            <div 
                className="nt-clickable-area" 
                onClick={() => onClick(nt.path, nt.targetId)}
                style={{ cursor: nt.path ? 'pointer' : 'default', display: 'flex', flex: 1, gap: '12px', alignItems: 'center' }}
            >
                <div className="nt-icon">
                    <i className={nt.category === 'success' ? 'ti ti-circle-check' : 'ti ti-info-square-rounded'}></i>
                </div>
                <div className="nt-text">
                    <p>{nt.text}</p>
                    <span className="nt-time-text">{timeAgo}</span>
                </div>
            </div>
            <button className="nt-del-btn" onClick={() => onRemove(nt.id)}>
                <i className="ti ti-trash"></i>
            </button>
        </div>
    );
};

export default Notification;