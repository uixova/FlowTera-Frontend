import React, { useState, useEffect, memo } from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import Loader from '../../../components/common/Loader';
import Input from '../../../components/common/Input';
import '../teams.css/Activity.css';
// API servislerini içe aktar
import { teamsService } from '../services/teamsService';

const TeamLogModal = ({ isOpen, onClose, user, teamId }) => {
    const [userLogs, setUserLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Veri Çekme Logic'i (Aynen korundu)
    useEffect(() => {
        if (!isOpen || !user || !teamId) {
            setUserLogs([]);
            return;
        }

        // Logları çekmek için async fonksiyon
        const fetchUserLogs = async () => {
            try {
                setLoading(true);
                const data = await teamsService.getUserLogs(user.id, teamId);
                setUserLogs(data);
            } catch (error) {
                console.error("Error when pulling logs:", error);
            } finally {
                setLoading(false);
            }
        };

        // Modal açıldığında logları çekiyoruz
        fetchUserLogs();
    }, [isOpen, user, teamId]);

    const filteredDisplayLogs = userLogs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sidebar başlığı için özel içerik (Avatar, isim, email)
    const sidebarTitle = (
        <div className="tm-log-header-alt">
            <div className="tm-log-user-info">
                <div className="tm-avatar-wrapper">
                    {user?.isDeleted ? (
                        <div className="tm-avatar-deleted" aria-hidden="true">
                            <i className="ti ti-trash"></i>
                        </div>
                    ) : (
                        <img src={user?.avatar || 'https://via.placeholder.com/40'} alt="User" />
                    )}
                </div>
                <div className="user-meta">
                    <h3>{user?.name || 'Kullanıcı Aktivitesi'}</h3>
                    {!user?.isDeleted && user?.email ? <span>{user.email}</span> : null}
                </div>
            </div>
        </div>
    );

    return (
        <ActionSidebar
            isOpen={isOpen}
            onClose={onClose}
            title={sidebarTitle}
            width="500px" 
        >
            <div className="tm-log-container-internal">
                {/* Arama Alanı */}
                <div className="tm-log-search-wrapper">
                    <Input
                        className="tm-log-search-input"
                        icon="ti ti-search"
                        placeholder="İşlemleri Filtrele..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="tm-log-body-content">
                    {loading ? (
                        <div className="log-loader-container">
                            <Loader type="dots" />
                        </div>
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
                        <div className="no-activity">
                            <i className="ti ti-history"></i>
                            <p>Bu kullanıcıya ait bir işlem geçmişi bulunamadı.</p>
                        </div>
                    )}
                </div>
            </div>
        </ActionSidebar>
    );
};

// Yardımcı fonksiyonlar 
const getColorClass = (type) => {
    const map = { add: 'green', update: 'orange', settings: 'blue', delete: 'red', login: 'purple' };
    return map[type] || 'blue';
};

const getIcon = (type) => {
    const map = { add: 'ti-plus', update: 'ti-pencil', settings: 'ti-settings', delete: 'ti-trash', login: 'ti-login' };
    return map[type] || 'ti-circle';
};

export default memo(TeamLogModal);