import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teamsService } from '../../features/teams/services/teamsService'; 
import { useAuth } from '../../context/AuthContext'; 
import '../components.css/TeamSelectModal.css'; 

const TeamSelectModal = ({ isOpen, onClose, onSelectTeam, currentTeamId }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    if (isOpen && currentUser) {
      const fetchTeams = async () => {
        try {
          const data = await teamsService.getTeams(currentUser); 
          setTeams(data || []);
        } catch (error) {
          console.error("Teams fetch error:", error);
        }
      };
      fetchTeams();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSelect = (teamId) => {
    const stringId = String(teamId);
    const selectedTeam = teams.find(t => String(t.id) === stringId);
    
    // AuthContext'teki rol dizisinden bu takımın rolünü bul
    const userRoleInfo = currentUser?.role?.find(r => String(r.teamId) === stringId);
    const nextRole = userRoleInfo?.roleName;
    const nextPlan = selectedTeam?.plan; // Takım objesinden gelen plan

    // LocalStorage güncellemeleri
    localStorage.setItem('tm_selected_id', stringId);
    localStorage.setItem('tm_selected_name', selectedTeam?.name || '');

    // ANLIK ROTA KORUMASI
    const path = window.location.pathname;
    const adminRoutes = ['/analysis', '/requests'];
    
    if (adminRoutes.includes(path) && nextRole !== 'Admin') {
      navigate('/home');
    } else if (path === '/archive' && nextPlan !== 'enterprise') {
      navigate('/home');
    }

    // Event ve State tetikleme
    window.dispatchEvent(
      new CustomEvent('teamChanged', {
        detail: { teamId: stringId, teamName: selectedTeam?.name || '' }
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
          <button className="add-team-small-btn" onClick={() => { onClose(); navigate('/team'); }}>
            <i className="ti ti-plus"></i>
            Yeni Takım Oluştur
          </button>
        </div>
      </div>
    </>
  );
};

export default TeamSelectModal;