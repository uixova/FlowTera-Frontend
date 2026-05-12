import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { teamsService } from '../../../features/teams/services/teamsService';
import { useAuth } from '../../../context/AuthContext';
import { useTeam } from '../../../context/TeamContext';
import './TeamSelectModal.css';

const TeamSelectModal = ({ isOpen, onClose, currentTeamId }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { selectTeam } = useTeam();
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

  const handleSelect = async (teamId) => {
    const stringId = String(teamId);
    const selectedTeam = teams.find(t => String(t.id) === stringId);

    const userRoleInfo = currentUser?.role?.find(r => String(r.teamId) === stringId);
    const nextRole = userRoleInfo?.roleName;
    const nextPlan = selectedTeam?.plan;

    const path = window.location.pathname;
    if (['/analysis', '/requests'].includes(path) && nextRole !== 'Admin') {
      navigate('/home');
    } else if (path === '/archive' && nextPlan !== 'enterprise') {
      navigate('/home');
    }

    selectTeam(stringId);
    onClose();
  };

  return createPortal(
    <>
      <div className="team-dropdown-overlay" onClick={onClose} />
      <div className="team-dropdown-modal" onClick={(e) => e.stopPropagation()}>
        <div className="team-modal-header">
          <span className="team-modal-header-label">Aktif Takımlar</span>
          <span className="team-modal-header-count">{teams.length}</span>
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
            <div className="team-no-data">Takım bulunamadı.</div>
          )}
        </div>

        <div className="team-dropdown-footer">
          <button
            className="add-team-small-btn"
            onClick={() => { onClose(); navigate('/team'); }}
          >
            <i className="ti ti-plus"></i>
            Yeni Takım Oluştur
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};

export default TeamSelectModal;