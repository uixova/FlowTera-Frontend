import React from 'react';
import './TeamCard.css';

const TeamCard = ({ team, onSelect }) => {
    // Bakım modunda olup olmadığını kontrol et
    const isMaintenance = team.settings?.status === 'maintenance';

    return (
        <div
            className={`tm-sel-card ${isMaintenance ? 'maintenance-mode' : ''}`}
            onClick={onSelect}
        >
            {/* Bakım Modu Badge'i - Sadece bakımdayken görünür */}
            {isMaintenance && (
                <div className="tm-maintenance-badge">
                    <i className="ti ti-tool" />
                    <span>Bakımda</span>
                </div>
            )}

            <div className="tm-sel-card-top">
                <img
                    src={team.image}
                    alt={team.name}
                    className="tm-sel-avatar"
                    style={{ filter: isMaintenance ? 'grayscale(100%) opacity(0.6)' : 'none' }}
                />
                <div className="tm-sel-info">
                    <h4>{team.name}</h4>
                    <div className="tm-sel-meta">
                        <i className="ti ti-calendar-event" />
                        <span>{team.createdAt}</span>
                    </div>
                </div>
            </div>

            <div className="tm-sel-divider" />

            <div className="tm-sel-card-bottom">
                <div className="tm-sel-stats">
                    <i className="ti ti-users" />
                    <span>{team.members} Üye</span>
                </div>
                <div className="tm-sel-arrow">
                    {/* Bakım modundaysa ok yerine kilit ikonu */}
                    <i className={`ti ${isMaintenance ? 'ti-lock' : 'ti-chevron-right'}`} />
                </div>
            </div>
        </div>
    );
};

export default TeamCard;