import React, { useState, useEffect } from 'react';
import '../teams.css/Modals.css';
import '../teams.css/Activity.css'
import allLogs from '../data/userLog.json'; 

const TeamLogModal = ({ isOpen, onClose, user, teamId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [userLogs, setUserLogs] = useState([]);

    useEffect(() => {
    const fetchLogs = async () => {
        if (!isOpen || !user || !teamId) return;

        // API Simülasyonu (Async bekleme hatayı engeller)
        await new Promise(res => setTimeout(res, 50)); 
        
        const filtered = allLogs.filter(log => 
          String(log.userId) === String(user.id) && 
          String(log.teamId) === String(teamId)
        );
        setUserLogs(filtered);
    };

    fetchLogs();
    }, [isOpen, user, teamId]);

    if (!isOpen) return null;

    // Arama filtresi
    const filteredDisplayLogs = userLogs.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="tm-modal-overlay">
            <div className="tm-modal-container">
                <div className="tm-modal-header">
                    <div className="tm-modal-user">
                        <img src={user?.avatar} alt="User" />
                        <div className="user-meta">
                            <h3>{user?.name}</h3>
                            <span>{user?.email}</span>
                        </div>
                    </div>
                    <button className="tm-modal-close" onClick={onClose}>
                        <i className="ti ti-x"></i>
                    </button>
                </div>

                <div className="tm-modal-search-bar">
                    <div className="tm-sel-search-wrapper modal-search">
                        <i className="ti ti-search"></i>
                        <input 
                            type="text" 
                            placeholder="Search activities..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="tm-modal-body">
                    <div className="tm-log-list">
                        {filteredDisplayLogs.length > 0 ? (
                            filteredDisplayLogs.map(log => (
                                <div className="log-entry" key={log.id}>
                                    <div className={`entry-icon ${getColorClass(log.type)}`}>
                                        <i className={`ti ${getIcon(log.type)}`}></i>
                                    </div>
                                    <div className="entry-details">
                                        <div className="entry-header">
                                            <span className="entry-title">{log.action}</span>
                                            <span className="entry-time">{log.time} - {log.date}</span>
                                        </div>
                                        <p>{log.details || 'Activity recorded successfully.'}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-logs" style={{textAlign: 'center', padding: '20px', color: '#666'}}>
                                No activities found for this team.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const getColorClass = (type) => {
    switch(type) {
        case 'add': return 'add';     
        case 'update': return 'update';  
        case 'settings': return 'settings';   
        default: return 'settings';
    }
};

const getIcon = (type) => {
    switch(type) {
        case 'add': return 'ti-plus';
        case 'update': return 'ti-edit';
        case 'settings': return 'ti-settings';
        case 'login': return 'ti-login';
        default: return 'ti-info-circle';
    }
};

export default TeamLogModal;