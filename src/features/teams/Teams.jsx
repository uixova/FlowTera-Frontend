import React, { useState, useEffect, useMemo } from 'react';
import Loader from '../../components/common/Loader';
import TeamSelection from './components/TeamSelection';
import CreateTeamPanel from './components/CreateTeamPanel';
import TeamMemberList from './components/TeamMemberList';
import TeamSettings from './components/TeamSettings';
import { teamsService, teamMembersCache } from './services/teamsService'; 
import { useAuth } from '../../context/AuthContext'; 
import './teams.css/Team.css';

const Teams = () => {
  const { currentUser, loading: authLoading } = useAuth(); 
  
  const [teams, setTeams] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [switchingTeam, setSwitchingTeam] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(() => localStorage.getItem('tm_selected_id') || null);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('tm_selected_id') ? 'main' : 'selection');

  // Takımları Çekme 
  useEffect(() => {
    const fetchTeams = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        const data = await teamsService.getTeams(currentUser);
        setTeams(data || []);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [currentUser]); 

  // Takım Değişimi Dinleyicisi
  useEffect(() => {
    const handleTeamChange = (e) => {
      const newTeamId = String(e.detail.teamId);
      if (newTeamId !== String(selectedTeamId)) {
        setSwitchingTeam(true); 
        setSelectedTeamId(newTeamId);
        setViewMode('main');
        setTimeout(() => setSwitchingTeam(false), 800); 
      }
    };
    window.addEventListener('teamChanged', handleTeamChange);
    return () => window.removeEventListener('teamChanged', handleTeamChange);
  }, [selectedTeamId]);

  const activeTeam = useMemo(() => {
    if (!selectedTeamId || teams.length === 0) return null;
    return teams.find(t => String(t.id) === String(selectedTeamId)) || null;
  }, [teams, selectedTeamId]);

  useEffect(() => {
    if (selectedTeamId) {
      localStorage.setItem('tm_selected_id', selectedTeamId);
      localStorage.setItem('tm_view_mode', viewMode);
    } else {
      localStorage.removeItem('tm_selected_id');
      localStorage.setItem('tm_view_mode', 'selection');
    }
  }, [selectedTeamId, viewMode]);

  const handleNavigate = (page, teamId = null) => {
    if (page === 'CreateTeamPanel') {
      setIsCreateOpen(true);
      return;
    }
    
    if (teamId) {
      const normalizedId = String(teamId);
      // Eğer geçilecek takım zaten cache'de varsa loader'ı HİÇ açma
      const isCached = teamMembersCache.has(normalizedId);
      
      if (!isCached) {
        setSwitchingTeam(true);
      }
      
      setSelectedTeamId(normalizedId);
      setViewMode(page);
      
      // Loader açıksa kapat
      if (!isCached) {
        setTimeout(() => setSwitchingTeam(false), 500);
      }
    } else {
      if (page === 'selection') setSelectedTeamId(null);
      setViewMode(page);
    }
  };

  if (authLoading || (loading && teams.length === 0)) {
    return <div className="full-screen-loader"><Loader type="butterfly" /></div>;
  }

  return (
    <div className="tm-feature-wrapper">
      {(viewMode === 'selection' || !activeTeam) ? (
        <TeamSelection teams={teams} loading={loading} onNavigate={handleNavigate} />
      ) : (
        <>
          {viewMode === 'main' && (
            <TeamMemberList 
              team={activeTeam} 
              onBack={() => handleNavigate('selection')}
              onNavigate={handleNavigate} 
              parentLoading={switchingTeam}
            />
          )}
          {viewMode === 'settings' && (() => {
            const roleObj = currentUser?.role?.find(r => String(r.teamId) === String(selectedTeamId));
            const isDenied = Array.isArray(roleObj?.permissions) && roleObj.permissions.includes('team_settings');
            if (isDenied) {
                setTimeout(() => handleNavigate('main'), 0);
                return null;
            }
            return <TeamSettings team={activeTeam} onBack={() => setViewMode('main')} />;
          })()}
        </>
      )}

      <CreateTeamPanel 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSuccess={async () => {
          const data = await teamsService.getTeams(currentUser);
          setTeams(data || []);
        }}
      />
    </div>
  );
};

export default Teams;