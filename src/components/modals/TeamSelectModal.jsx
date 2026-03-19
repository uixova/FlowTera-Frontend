import React from 'react';
import { useNavigate } from 'react-router-dom'; // Yönlendirme için ekledik
import '../components.css/TeamSelectModal.css'; 
import teamsData from '../../features/teams/data/teams.json'; 

const TeamSelectModal = ({ isOpen, onClose, onSelectTeam, currentTeam }) => {
  const navigate = useNavigate(); // Hook'u tanımladık

  if (!isOpen) return null;

  const handleCreateNew = () => {
    onClose(); // Önce modalı kapat
    navigate('/team'); // Sonra teams sayfasına yönlendir (Path ismin farklıysa burayı düzelt)
  };

  return (
    <>
      <div className="team-dropdown-overlay" onClick={onClose}></div>
      
      <div className="team-dropdown-modal" onClick={(e) => e.stopPropagation()}>
        <div className="team-modal-header">
          <span>Active Teams</span>
        </div>

        <div className="team-dropdown-list">
          {teamsData.map((team) => (
            <button 
              key={team.id} 
              className={`team-dropdown-option ${team.name === currentTeam ? 'active' : ''}`}
              onClick={() => {
                onSelectTeam(team.name);
                onClose();
              }}
            >
              <div className="team-dropdown-icon">
                {team.logo ? <img src={team.logo} alt="" /> : team.name[0]}
              </div>
              <span className="team-name-text">{team.name}</span>
              {team.name === currentTeam && <i className="ti ti-check check-active-icon"></i>}
            </button>
          ))}
        </div>

        <div className="team-dropdown-footer">
           {/* Tıklama olayını buraya bağladık */}
           <button className="add-team-small-btn" onClick={handleCreateNew}>
             <i className="ti ti-plus"></i>
             Create New Team
           </button>
        </div>
      </div>
    </>
  );
};

export default TeamSelectModal;