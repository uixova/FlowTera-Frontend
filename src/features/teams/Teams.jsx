import React, { useState, useEffect, useMemo } from 'react';
import Loader from '../../components/common/Loader';
import TeamSelection from './components/TeamSelection';
import CreateTeamPanel from './components/CreateTeamPanel';
import TeamMemberList from './components/TeamMemberList';
import TeamSettings from './components/TeamSettings';
import { teamsService } from './services/teamsService'; 
import './teams.css/Team.css';

const Teams = () => {
  const [teams, setTeams] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Başlangıç durumlarını belirle
  const [selectedTeamId, setSelectedTeamId] = useState(() => {
    return localStorage.getItem('tm_selected_id') || null;
  });

  const [viewMode, setViewMode] = useState(() => {
    // Eğer localStorage'da bir ID varsa direkt 'main' (takım içeriği) başlasın
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

  // Hem tarayıcının kendi storage event'ini (farklı sekmeler için) 
  // hem de bizim Navbar'dan gönderdiğimiz manuel event'i dinle
  window.addEventListener('storage', handleManualStorageChange);
  
  return () => window.removeEventListener('storage', handleManualStorageChange);
  }, [selectedTeamId]);

  // Seçilen takım bilgisi (ID'ye göre) - useMemo ile optimize ediyoruz
  const activeTeam = useMemo(() => {
    if (!selectedTeamId || teams.length === 0) return null;
    return teams.find(t => String(t.id) === String(selectedTeamId)) || null;
  }, [teams, selectedTeamId]);

  // Eğer takım bulunamazsa (silinmişse vb.) seçime geri yolla
  useEffect(() => {
    if (!loading && selectedTeamId && !activeTeam) {
      setSelectedTeamId(null);
      setViewMode('selection');
      localStorage.removeItem('tm_selected_id');
    }
  }, [loading, activeTeam, selectedTeamId]);

  // LocalStorage senkronizasyonu
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
    if (teamId) setSelectedTeamId(String(teamId));
    setViewMode(page);
  };

  if (loading) {
    return (
      <div className="full-screen-loader">
        <Loader type="butterfly" />
      </div>
    );
  }

  return (
    <div className="tm-feature-wrapper">
      {/* SEÇİM EKRANI: Mod selection ise VEYA aktif bir takım seçili değilse */}
      {(viewMode === 'selection' || !activeTeam) && (
        <TeamSelection 
          teams={teams} 
          onNavigate={handleNavigate} 
        />
      )}
    
      {/* TAKIM İÇERİĞİ: Bir takım seçiliyse ve mod main ise */}
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