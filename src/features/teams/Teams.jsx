// src/features/teams/Teams.jsx
import React, { useState } from 'react';
import TeamSelection from './components/TeamSelection';
import CreateTeam from './components/CreateTeam';
import TeamMemberList from './components/TeamMemberList';
import TeamSettings from './components/TeamSettings';
import './teams.css/Team.css'

const Teams = () => {
  const [viewMode, setViewMode] = useState('selection'); 
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  const handleNavigate = (page, teamId = null) => {
    if (teamId) setSelectedTeamId(teamId);
    setViewMode(page);
  };

  return (
    <div className="tm-feature-wrapper">
      {viewMode === 'selection' && (
        <TeamSelection onNavigate={handleNavigate} />
      )}
      
      {viewMode === 'create' && (
        <CreateTeam onBack={() => setViewMode('selection')} />
      )}

      {viewMode === 'main' && (
        <TeamMemberList 
          teamId={selectedTeamId}
          onBack={() => setViewMode('selection')}
          onNavigate={handleNavigate} 
        />
      )}

      {viewMode === 'settings' && (
        <TeamSettings teamId={selectedTeamId} onBack={() => setViewMode('main')} />
      )}
    </div>
  );
};

export default Teams;