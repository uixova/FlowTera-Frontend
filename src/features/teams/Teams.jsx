import React, { useState } from 'react';
import TeamSelection from './components/TeamSelection';
import CreateTeamPanel from './components/CreateTeamPanel';
import TeamMemberList from './components/TeamMemberList';
import TeamSettings from './components/TeamSettings';
import './teams.css/Team.css'

const Teams = () => {
  const [viewMode, setViewMode] = useState('selection'); 
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleNavigate = (page, teamId = null) => {
    if (page === 'CreateTeamPanel') {
      setIsCreateOpen(true);
      return;
    }

    if (teamId) setSelectedTeamId(teamId);
    setViewMode(page);
  };

  return (
    <div className="tm-feature-wrapper">
      {/* SEÇİM SAYFASI */}
      {viewMode === 'selection' && (
        <TeamSelection onNavigate={handleNavigate} />
      )}
      
      {/* LİSTE SAYFASI */}
      {viewMode === 'main' && (
        <TeamMemberList 
          teamId={selectedTeamId}
          onBack={() => setViewMode('selection')}
          onNavigate={handleNavigate} 
        />
      )}

      {/* AYARLAR SAYFASI */}
      {viewMode === 'settings' && (
        <TeamSettings teamId={selectedTeamId} onBack={() => setViewMode('main')} />
      )}

      {/* GLOBAL PANEL */}
      <CreateTeamPanel 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
      />
    </div>
  );
};

export default Teams;