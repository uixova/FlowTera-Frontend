import React, { useState, useEffect, useMemo } from 'react';
import Loader from '../../components/common/Loader';
import TeamSelection from './components/TeamSelection';
import CreateTeamPanel from './components/CreateTeamPanel';
import TeamMemberList from './components/TeamMemberList';
import TeamSettings from './components/TeamSettings';
import { teamsService } from './services/teamsService'; 
import './teams.css/Team.css';

const Teams = () => {
  const getRandomDelay = (min = 250, max = 700) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const [teams, setTeams] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [switchingTeam, setSwitchingTeam] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Başlangıç durumlarını belirle 
  const [selectedTeamId, setSelectedTeamId] = useState(() => {
    return localStorage.getItem('tm_selected_id') || null;
  });

  const [viewMode, setViewMode] = useState(() => {
    // Eğer localStorage'da bir ID varsa direkt 'main' başlasın
    return localStorage.getItem('tm_selected_id') ? 'main' : 'selection';
  });

  // Veriyi çekme
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const data = await teamsService.getTeams();
        setTeams(data || []);
      } catch (error) {
        console.error("Takımlar yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  // LocalStorage değişimini dinleme (Navbar'dan takım değiştirme durumunu yakalamak için)
  useEffect(() => {
    const handleManualStorageChange = () => {
      const updatedId = localStorage.getItem('tm_selected_id');
      const updatedView = localStorage.getItem('tm_view_mode') || 'main';
      
      if (updatedId !== selectedTeamId) {
        setSelectedTeamId(updatedId);
        setViewMode(updatedView);
      }
    };

    window.addEventListener('storage', handleManualStorageChange);
    window.addEventListener('teamChanged', handleManualStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleManualStorageChange);
      window.removeEventListener('teamChanged', handleManualStorageChange);
    };
  }, [selectedTeamId]);

  // Seçilen takım bilgisi (ID'ye göre) - useMemo ile optimize ediyoruz
  const activeTeam = useMemo(() => {
    if (!selectedTeamId || teams.length === 0) return null;
    return teams.find(t => String(t.id) === String(selectedTeamId)) || null;
  }, [teams, selectedTeamId]);

  // Eğer takım bulunamazsa seçime geri yolla
  useEffect(() => {
    if (!loading && selectedTeamId && !activeTeam) {
      setSelectedTeamId(null);
      setViewMode('selection');
      localStorage.removeItem('tm_selected_id');
      localStorage.removeItem('tm_selected_name');
    }
  }, [loading, activeTeam, selectedTeamId]);

  // Sayfa yapısı ve navigasyon için gereken LocalStorage senkronizasyonu
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

    // Takım değişikliğini bildir
    window.dispatchEvent(
      new CustomEvent('teamChanged', {
        detail: {
          teamId: selectedTeamId ? String(selectedTeamId) : null,
          viewMode
        }
      })
    );
  }, [activeTeam?.name, selectedTeamId, viewMode]);

  // Navigasyon fonksiyonu
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

  if (loading || switchingTeam) {
    return (
      <div className="full-screen-loader">
        <Loader type="butterfly" />
      </div>
    );
  }

  return (
    <div className="tm-feature-wrapper">
      {/* SEÇİM EKRANI */}
      {(viewMode === 'selection' || !activeTeam) && (
        <TeamSelection 
          teams={teams} 
          onNavigate={handleNavigate} 
        />
      )}
    
      {/* TAKIM İÇERİĞİ */}
      {viewMode === 'main' && activeTeam && (
        <TeamMemberList 
          team={activeTeam} 
          onBack={() => {
            setSelectedTeamId(null);
            setViewMode('selection');
          }}
          onNavigate={handleNavigate} 
        />
      )}

      {/* AYARLAR */}
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