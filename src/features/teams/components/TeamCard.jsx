import React from 'react';
import '../teams.css/TeamCard.css'

const TeamCard = ({ team, onSelect }) => {
  // Bakım modunda olup olmadığını kontrol et
  const isMaintenance = team.settings?.status === 'maintenance';

  return (
    <div 
      className={`tm-sel-card ${team.active ? 'active' : ''} ${isMaintenance ? 'maintenance-mode' : ''}`} 
      onClick={onSelect}
    >
      {/* Bakım Modu Badge'i - Sadece bakımdayken görünür */}
      {isMaintenance && (
        <div className="tm-maintenance-badge">
          <i className="ti ti-tool"></i>
          <span>Bakımda</span>
        </div>
      )}

      <div className="tm-sel-card-top">
        <img 
          src={team.image} 
          alt={team.name} 
          className="tm-sel-avatar" 
          // Bakım modundaysa görseli de biraz soluklaştırabiliriz
          style={{ filter: isMaintenance ? 'grayscale(100%) opacity(0.7)' : 'none' }}
        />
        <div className="tm-sel-info">
          <h4>{team.name}</h4>
          <div className="tm-sel-meta">
            <i className="ti ti-calendar-event"></i>
            <span>{team.createdAt}</span>
          </div>
        </div>
      </div>

      <div className="tm-sel-divider"></div> 

      <div className="tm-sel-card-bottom">
        <div className="tm-sel-stats">
          <i className="ti ti-users"></i>
          <span>{team.members} Üye</span>
        </div>
        <div className="tm-sel-arrow">
          {/* Bakım modundaysa ok yerine kilit ikonu daha şık durabilir */}
          <i className={`ti ${isMaintenance ? 'ti-lock' : 'ti-chevron-right'}`}></i>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;