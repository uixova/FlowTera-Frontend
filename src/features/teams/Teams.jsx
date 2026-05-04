import React, { useState, useEffect, useMemo } from 'react';
import Loader from '../../components/common/Loader';
import TeamSelection from './components/TeamSelection';
import CreateTeamPanel from './components/CreateTeamPanel';
import TeamMemberList from './components/TeamMemberList';
import TeamSettings from './components/TeamSettings';
import { teamsService, teamMembersCache } from './services/teamsService'; 
import { useAuth } from '../../context/AuthContext'; 
import { useTeam } from '../../context/TeamContext';
import './Teams.css';

const Teams = () => {
  const { currentUser, loading: authLoading } = useAuth(); 
  const { selectedTeamId, selectTeam, clearTeam } = useTeam(); 
  
  const [teams, setTeams] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [switchingTeam, setSwitchingTeam] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // viewMode artık localStorage'dan değil, selectedTeamId varsa 'main' yoksa 'selection' olarak başlıyor
  const [viewMode, setViewMode] = useState(selectedTeamId ? 'main' : 'selection');

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

  // Takım Değişimi Takibi (Context ID'si değişirse viewMode'u güncelle)
  useEffect(() => {
    if (selectedTeamId) {
      setViewMode('main');
    } else {
      setViewMode('selection');
    }
  }, [selectedTeamId]);

  const activeTeam = useMemo(() => {
    if (!selectedTeamId || teams.length === 0) return null;
    return teams.find(t => String(t.id) === String(selectedTeamId)) || null;
  }, [teams, selectedTeamId]);

  // Yönlendirme ve Takım Seçme Mantığı
  const handleNavigate = (page, teamId = null) => {
    if (page === 'CreateTeamPanel') {
      setIsCreateOpen(true);
      return;
    }
    
    if (teamId) {
      const normalizedId = String(teamId);
      const isCached = teamMembersCache.has(normalizedId);
      
      if (!isCached) setSwitchingTeam(true);
      
      selectTeam(normalizedId); // Context üzerinden seçiyoruz
      setViewMode(page);
      
      if (!isCached) {
        setTimeout(() => setSwitchingTeam(false), 500);
      }
    } else {
      if (page === 'selection') {
        clearTeam(); // Context üzerinden temizliyoruz
      }
      setViewMode(page);
    }
  };

  if (authLoading || (loading && teams.length === 0)) {
    return <div className="full-screen-loader"><Loader type="butterfly" /></div>;
  }

  return (
    <div className="tm-feature-wrapper">
      {/* SEÇİM EKRANI: Takım seçilmemişse veya viewMode 'selection' ise */}
      {(viewMode === 'selection' || !activeTeam) ? (
        <TeamSelection 
          teams={teams} 
          loading={loading} 
          onNavigate={handleNavigate} 
        />
      ) : (
        <>
          {/* TAKIM İÇİ: Üye Listesi (Main) */}
          {viewMode === 'main' && (
            <TeamMemberList 
              team={activeTeam} 
              onBack={() => handleNavigate('selection')}
              onNavigate={handleNavigate} 
              parentLoading={switchingTeam}
            />
          )}

          {/* TAKIM İÇİ: Ayarlar */}
          {viewMode === 'settings' && (() => {
            const roleObj = currentUser?.role?.find(r => String(r.teamId) === String(selectedTeamId));
            const isDenied = Array.isArray(roleObj?.permissions) && roleObj.permissions.includes('team_settings');
            
            if (isDenied) {
                // Yetki yoksa main'e salla
                setTimeout(() => setViewMode('main'), 0);
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