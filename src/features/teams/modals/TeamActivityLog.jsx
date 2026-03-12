import React, { useState, useEffect } from 'react';
import '../teams.css/Activity.css';
import { teamsService } from '../services/teamsService'; 

const TeamLogModal = ({ isOpen, onClose, user, teamId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [userLogs, setUserLogs] = useState([]);
    const [loading, setLoading] = useState(false);

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

    return (
        <>
            <div className={`tm-log-overlay ${isOpen ? 'is-active' : ''}`} onClick={onClose} />
            <div className={`tm-log-panel ${isOpen ? 'is-open' : ''}`}>
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
                    <button className="tm-log-close" onClick={onClose}><i className="ti ti-x"></i></button>
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
                        <div className="hi-loading">Loglar Getiriliyor...</div>
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

const getColorClass = (type) => {
    const map = { add: 'green', update: 'orange', settings: 'blue', delete: 'red', login: 'purple' };
    return map[type] || 'blue';
};

const getIcon = (type) => {
    const map = { add: 'ti-plus', update: 'ti-pencil', settings: 'ti-settings', delete: 'ti-trash', login: 'ti-login' };
    return map[type] || 'ti-circle';
};

export default TeamLogModal;