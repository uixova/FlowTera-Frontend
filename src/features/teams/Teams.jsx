import React, { useState, useEffect, useMemo } from 'react';
import Loader from '../../components/common/Loader';
import TeamSelection from './components/TeamSelection';
import CreateTeamPanel from './components/CreateTeamPanel';
import TeamMemberList from './components/TeamMemberList';
import TeamSettings from './components/TeamSettings';
import { teamsService } from './services/teamsService'; 
import { useAuth } from '../../context/AuthContext'; 
import './teams.css/Team.css';

const Teams = () => {
  const getRandomDelay = (min = 250, max = 700) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  // Context'ten global auth bilgisini çekiyoruz
  const { currentUser, loading: authLoading } = useAuth(); 

  const [teams, setTeams] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [switchingTeam, setSwitchingTeam] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [selectedTeamId, setSelectedTeamId] = useState(() => {
    return localStorage.getItem('tm_selected_id') || null;
  });

  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('tm_selected_id') ? 'main' : 'selection';
  });

  useEffect(() => {
    const fetchTeams = async () => {
      // Global auth loading bitmeden veya user gelmeden API'ye gitmiyoruz
      if (authLoading || !currentUser) return;

      try {
        setLoading(true);
        const data = await teamsService.getTeams(currentUser); 
        setTeams(data || []);
      } catch (error) {
        console.error("Takımlar çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeams();
  }, [currentUser, authLoading]); // Context'teki değişimleri izle

  // Seçili takımı bulma mantığı
  const activeTeam = useMemo(() => {
    if (!selectedTeamId || teams.length === 0) return null;
    return teams.find(t => String(t.id) === String(selectedTeamId)) || null;
  }, [teams, selectedTeamId]);

  // LocalStorage ve Event senkronizasyonu
  useEffect(() => {
    if (selectedTeamId) {
      localStorage.setItem('tm_selected_id', selectedTeamId);
      localStorage.setItem('tm_view_mode', viewMode);
      if (activeTeam?.name) {
        localStorage.setItem('tm_selected_name', activeTeam.name);
      }
    } else {
      localStorage.removeItem('tm_selected_id');
      localStorage.setItem('tm_view_mode', 'selection');
      localStorage.removeItem('tm_selected_name');
    }

    window.dispatchEvent(
      new CustomEvent('teamChanged', {
        detail: { teamId: selectedTeamId ? String(selectedTeamId) : null, viewMode }
      })
    );
  }, [activeTeam?.name, selectedTeamId, viewMode]);

  const handleNavigate = async (page, teamId = null) => {
    if (page === 'CreateTeamPanel') {
      setIsCreateOpen(true);
      return;
    }

    if (page === 'main' && teamId) {
      setSwitchingTeam(true);
      await new Promise(resolve => setTimeout(resolve, getRandomDelay()));
      setSelectedTeamId(String(teamId));
      setViewMode('main');
      setSwitchingTeam(false);
      return;
    }

    if (teamId) setSelectedTeamId(String(teamId));
    setViewMode(page);
  };

  // Render Kararı
  if (authLoading || (loading && teams.length === 0) || switchingTeam) {
    return (
      <div className="full-screen-loader">
        <Loader type="butterfly" />
      </div>
    );
  }

  return (
    <div className="tm-feature-wrapper">
      {(viewMode === 'selection' || !activeTeam) && (
        <TeamSelection 
          teams={teams} 
          loading={loading} 
          onNavigate={handleNavigate} 
        />
      )}
    
      {viewMode === 'main' && activeTeam && (
        <TeamMemberList 
          team={activeTeam} 
          parentLoading={loading} 
          onBack={() => {
            setSelectedTeamId(null);
            setViewMode('selection');
          }}
          onNavigate={handleNavigate} 
        />
      )}

      {viewMode === 'settings' && activeTeam && (
        <TeamSettings team={activeTeam} onBack={() => setViewMode('main')} />
      )}

      <CreateTeamPanel 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
      />
    </div>
  );
};

export default Teams;