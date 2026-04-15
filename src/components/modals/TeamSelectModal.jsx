import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teamsService } from '../../features/teams/services/teamsService'; 
import { useAuth } from '../../context/AuthContext'; 
import '../components.css/TeamSelectModal.css'; 

const TeamSelectModal = ({ isOpen, onClose, onSelectTeam, currentTeamId }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [teams, setTeams] = useState(() => {
    try {
      const raw = localStorage.getItem('tm_teams_cache');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Modal her açıldığında veriyi servisten çek
  useEffect(() => {
    if (isOpen && currentUser) {
      let isCancelled = false;
      const fetchTeams = async () => {
        try {
          const data = await teamsService.getTeams(currentUser); 
          if (!isCancelled) {
            setTeams(data || []);
            localStorage.setItem('tm_teams_cache', JSON.stringify(data || []));
          }
        } catch (error) {
          console.error("Teams fetch error:", error);
        }
      };
      
      fetchTeams();
      return () => { isCancelled = true; };
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleCreateNew = () => {
    onClose();
    navigate('/team');
  };

  const handleSelect = (teamId) => {
    const selectedTeam = teams.find((team) => String(team.id) === String(teamId));
    localStorage.setItem('tm_selected_id', String(teamId));
    localStorage.setItem('tm_selected_name', selectedTeam?.name || '');

    window.dispatchEvent(
      new CustomEvent('teamChanged', {
        detail: { teamId: String(teamId), teamName: selectedTeam?.name || '' }
      })
    );
    
    onSelectTeam(teamId);
    onClose();
  };

  return (
    <>
      <div className="team-dropdown-overlay" onClick={onClose}></div>
      
      <div className="team-dropdown-modal" onClick={(e) => e.stopPropagation()}>
        <div className="team-modal-header">
          <span>Aktif Takımlar</span>
        </div>

        <div className="team-dropdown-list">
          {teams.length > 0 ? (
            teams.map((team) => (
              <button 
                key={team.id} 
                className={`team-dropdown-option ${String(team.id) === String(currentTeamId) ? 'active' : ''}`}
                onClick={() => handleSelect(team.id)}
              >
                <div className="team-dropdown-icon">
                  {(team.image || team.logo) ? (
                    <img src={team.image || team.logo} alt={team.name} />
                  ) : (
                    <span>{team.name ? team.name[0].toUpperCase() : '?'}</span>
                  )}
                </div>

                <span className="team-name-text">{team.name}</span>

                {String(team.id) === String(currentTeamId) && (
                  <i className="ti ti-check check-active-icon"></i>
                )}
              </button>
            ))
          ) : (
            <div className="no-teams-info" style={{ padding: '10px', fontSize: '0.8rem', color: '#555' }}>
              Takım bulunamadı.
            </div>
          )}
        </div>

        <div className="team-dropdown-footer">
          <button className="add-team-small-btn" onClick={handleCreateNew}>
            <i className="ti ti-plus"></i>
            Yeni Takım Oluştur
          </button>
        </div>
      </div>
    </>
  );
};

export default TeamSelectModal;