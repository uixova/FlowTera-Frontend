import React from 'react';
import '../teams.css/TeamCard.css'

const TeamCard = ({ team, onSelect }) => {
  return (
    <div 
      className={`tm-sel-card ${team.active ? 'active' : ''}`} 
      onClick={onSelect}
    >
      {/* Takım görseli ve temel bilgileri */}
      <div className="tm-sel-card-top">
        <img 
          src={team.image} 
          alt={team.name} 
          className="tm-sel-avatar" 
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
      {/* Son işlem bilgisi - Örnek olarak sabit bir metin */}
      <div className="tm-sel-card-bottom">
        <div className="tm-sel-stats">
          <i className="ti ti-users"></i>
          <span>{team.members} Members</span>
        </div>
        <div className="tm-sel-arrow">
          <i className="ti ti-chevron-right"></i>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;