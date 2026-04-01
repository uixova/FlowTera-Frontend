import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../common/Loader';
import { notificationService } from '../../services/notificationService'; // Süslü parantezli kalsın, export const yapmışsın
import '../../components/components.css/Notification.css';

const Notification = ({ isOpen, onClose, userRole = 'admin' }) => {
    const [requests, setRequests] = useState([]);
    const [infos, setInfos] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Veri Çekme Fonksiyonu
    const fetchNotifications = async () => {
        setLoading(true);
        try {
            // HATA BURADAYDI: .getAll() yerine servisteki gerçek ismi çağırdık
            const result = await notificationService.getSortedNotifications();
            
            setRequests(result.requests || []);
            setInfos(result.infos || []);
            setTotalCount(result.total || 0);
        } catch (error) {
            console.error("Hata: Bildirimler çekilemedi", error);
        } finally {
            setLoading(false);
        }
    };

    // Modal açıldığında verileri çek
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Bildirim silme fonksiyonu (Servise bağladık)
    const removeNotification = async (id) => {
        await notificationService.deleteNotification(id);
        // UI'dan da anlık temizleyelim
        setInfos(prev => prev.filter(item => item.id !== id));
        setRequests(prev => prev.filter(item => item.id !== id));
        setTotalCount(prev => prev - 1);
    };

    const handleNavigate = (path, targetId) => {
        navigate(`${path}?id=${targetId}`);
        onClose();
    };

    return (
        <div className="nt-panel-overlay" onClick={onClose}>
            <div className="nt-panel-container" onClick={(e) => e.stopPropagation()}>
                <div className="nt-header">
                    <div className="nt-header-title">
                        <h3>Activity Center</h3>
                        <span className="count-badge">
                            {loading ? "..." : totalCount}
                        </span>
                    </div>
                    <button className="nt-close-btn" onClick={onClose}>
                        <i className="ti ti-x"></i>
                    </button>
                </div>

                <div className="nt-content">
                    {loading ? (
                        <Loader type="dots" text="Bildirimler Yükleniyor..." />
                    ) : (
                        <>
                            {/* Pending Requests */}
                            {(userRole === 'admin' || userRole === 'moderator') && requests.length > 0 && (
                                <section className="nt-section">
                                    <div className="section-title"><span>Pending Requests</span></div>
                                    {requests.map(item => (
                                        <div key={item.id} className="nt-request-card">
                                            <div className="req-clickable" onClick={() => handleNavigate(item.path, item.targetId)}>
                                                <div className="req-header">
                                                    <span className={`req-type-tag ${item.category}`}>{item.category}</span>
                                                    <span className="req-date-text">{item.date}</span>
                                                </div>
                                                <span className="req-user">{item.user}</span>
                                                <p className="req-detail"><strong>{item.title}:</strong> {item.detail}</p>
                                            </div>
                                            <div className="req-actions">
                                                <button className="btn-approve" onClick={() => removeNotification(item.id)}>Approve</button>
                                                <button className="btn-reject" onClick={() => removeNotification(item.id)}>Reject</button>
                                            </div>
                                        </div>
                                    ))}
                                </section>
                            )}

                            {/* Recent Notifications */}
                            <section className="nt-section">
                                <div className="section-title"><span>Recent Notifications</span></div>
                                <div className="nt-list">
                                    {infos.length > 0 ? infos.map(nt => (
                                        <div key={nt.id} className={`nt-item ${nt.category}`}>
                                            <div className="nt-icon">
                                                <i className={nt.category === 'success' ? 'ti ti-circle-check' : 'ti ti-info-square-rounded'}></i>
                                            </div>
                                            <div className="nt-text">
                                                <p>{nt.text}</p>
                                                <span className="nt-time-text">{nt.time}</span>
                                            </div>
                                            <button className="nt-del-btn" onClick={() => removeNotification(nt.id)}>
                                                <i className="ti ti-trash"></i>
                                            </button>
                                        </div>
                                    )) : <p className="no-data">Herhangi bir bildirim bulunamadı.</p>}
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notification;