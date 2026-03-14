import React, { useState } from 'react';
import TeamSelection from './components/TeamSelection';
import CreateTeamPanel from './components/CreateTeamPanel';
import TeamMemberList from './components/TeamMemberList';
import TeamSettings from './components/TeamSettings';
import './teams.css/Team.css'

const Teams = () => {
  // viewMode: 'selection' | 'main' | 'settings'
  const [viewMode, setViewMode] = useState('selection'); 
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  // onNavigate fonksiyonu, alt sayfalardan ana sayfaya geçişi sağlar
  const handleNavigate = (page, teamId = null) => {
    if (page === 'CreateTeamPanel') {
      setIsCreateOpen(true);
      return;
    }
    // Eğer teamId sağlanırsa, onu state'e kaydet ve ardından viewMode'u değiştir
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