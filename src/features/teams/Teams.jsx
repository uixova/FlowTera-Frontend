import React, { useState, useEffect, useMemo } from 'react';
import Loader from '../../components/common/Loader';
import TeamSelection from './components/TeamSelection';
import CreateTeamPanel from './components/CreateTeamPanel';
import TeamMemberList from './components/TeamMemberList';
import TeamSettings from './components/TeamSettings';
import { teamsService } from './services/teamsService'; 
import './teams.css/Team.css';

const Teams = () => {
  // Takım verisi ve yükleniyor durumu
  const [teams, setTeams] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Görünüm yönetimi: 'selection', 'main', 'settings'
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('tm_view_mode') || 'selection'); 
  const [selectedTeamId, setSelectedTeamId] = useState(() => {
    const savedId = localStorage.getItem('tm_selected_id');
    return (savedId && savedId !== "null") ? savedId : null;
  });
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Veriyi çekme işlemi
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        // Yükleniyor durumunu başlat
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

  // Seçili takımı güvenli bir şekilde hesapla
  const activeTeam = useMemo(() => {
    if (!selectedTeamId || teams.length === 0) return null;
    return teams.find(t => String(t.id) === String(selectedTeamId)) || null;
  }, [teams, selectedTeamId]);

  // Tercihleri LocalStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('tm_view_mode', viewMode);
    if (selectedTeamId) {
      localStorage.setItem('tm_selected_id', selectedTeamId);
    } else {
      localStorage.removeItem('tm_selected_id');
    }
  }, [viewMode, selectedTeamId]);

  // Sayfa navigasyon yönetimi
  const handleNavigate = (page, teamId = null) => {
    if (page === 'CreateTeamPanel') {
      setIsCreateOpen(true);
      return;
    }
    if (teamId) setSelectedTeamId(String(teamId));
    setViewMode(page);
  };

  // Yükleme ekranı
  if (loading) {
    return (
      <div className="full-screen-loader">
        <Loader type="butterfly" />
      </div>
    );
  }

  return (
    <div className="tm-feature-wrapper">
      {/* SEÇİM SAYFASI: viewMode 'selection' ise veya seçili takım bir şekilde bulunamadıysa göster */}
      {(viewMode === 'selection' || !activeTeam) && (
        <TeamSelection 
          teams={teams} 
          onNavigate={handleNavigate} 
        />
      )}
    
      {/* ÜYE LİSTESİ: Ana görünüm */}
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

      {/* AYARLAR SAYFASI */}
      {viewMode === 'settings' && activeTeam && (
        <TeamSettings team={activeTeam} onBack={() => setViewMode('main')} />
      )}

      {/* YENİ TAKIM OLUŞTURMA PANELİ (MODAL) */}
      <CreateTeamPanel 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
      />
    </div>
  );
};

export default Teams;