import React, { useState, useEffect, memo } from 'react';
import Loader from '../../../components/common/Loader';
import '../teams.css/Activity.css';
import { teamsService } from '../services/teamsService'; 

const TeamLogModal = ({ isOpen, onClose, user, teamId }) => {
    const [userLogs, setUserLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    // Animasyon kontrolü için yeni state
    const [isAnimate, setIsAnimate] = useState(false);

    // Animasyon Tetikleyici
    useEffect(() => {
        let timer;
        if (isOpen) {
            // Render sırasına girmek için minik bir gecikme
            timer = setTimeout(() => setIsAnimate(true), 10);
        } else {
            setIsAnimate(false);
        }
        return () => clearTimeout(timer);
    }, [isOpen]);

    // Veri Çekme Logic'i
    useEffect(() => {
        if (!isOpen || !user || !teamId) {
            setUserLogs([]);
            return;
        }

        const fetchUserLogs = async () => {
            try {
                setLoading(true);
                const data = await teamsService.getUserLogs(user.id, teamId);
                setUserLogs(data);
            } catch (error) {
                console.error("Loglar çekilirken hata:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserLogs();
    }, [isOpen, user, teamId]);

    const filteredDisplayLogs = userLogs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!user && !isOpen) return null;

    return (
        <>
            {/* Class'ları isAnimate üzerinden yönetiyoruz */}
            <div 
                className={`tm-log-overlay ${isAnimate ? 'is-active' : ''}`} 
                onClick={onClose} 
            />
            
            <div className={`tm-log-panel ${isAnimate ? 'is-open' : ''}`}>
                <div className="tm-log-header">
                    <div className="tm-log-user-info">
                        <div className="tm-avatar-wrapper">
                            <img src={user?.avatar || 'https://via.placeholder.com/40'} alt="User" />
                        </div>
                        <div className="user-meta">
                            <h3>{user?.name}</h3>
                            <span>{user?.email}</span>
                        </div>
                    </div>
                    <button className="tm-log-close" onClick={onClose}>
                        <i className="ti ti-x"></i>
                    </button>
                </div>

                <div className="tm-log-search">
                    <div className="modal-search-input">
                        <i className="ti ti-search"></i>
                        <input 
                            type="text" 
                            placeholder="Filter activities..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="tm-log-body">
                    {loading ? (
                        <Loader type="dots" text="Loglar Getiriliyor..." />
                    ) : filteredDisplayLogs.length > 0 ? (
                        <div className="timeline-container">
                            {filteredDisplayLogs.map((log) => (
                                <div className="timeline-item" key={log.id}>
                                    <div className={`timeline-icon ${getColorClass(log.type)}`}>
                                        <i className={`ti ${getIcon(log.type)}`}></i>
                                    </div>
                                    <div className="timeline-content">
                                        <div className="timeline-header">
                                            <span className="timeline-title">{log.action}</span>
                                            <span className="timeline-date">{log.time}</span>
                                        </div>
                                        <p className="timeline-desc">{log.details}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-activity">No records found.</div>
                    )}
                </div>
            </div>
        </>
    );
};

// Log türüne göre renk sınıfı döndüren yardımcı fonksiyon
const getColorClass = (type) => {
    const map = { add: 'green', update: 'orange', settings: 'blue', delete: 'red', login: 'purple' };
    return map[type] || 'blue';
};

// Log türüne göre ikon sınıfı döndüren yardımcı fonksiyon
const getIcon = (type) => {
    const map = { add: 'ti-plus', update: 'ti-pencil', settings: 'ti-settings', delete: 'ti-trash', login: 'ti-login' };
    return map[type] || 'ti-circle';
};

export default memo(TeamLogModal);