import React, { useState, useEffect } from 'react';
import TeamCard from './TeamCard';
import SubNavbar from '../../../components/navigation/SubNavbar';
import { teamsService } from '../services/teamsService'; 

const TeamSelection = ({ onNavigate }) => {
  // Takım verilerini ve arama durumunu yönetmek için state'ler
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Bileşen yüklendiğinde takımları API'den çekmek için useEffect kullanımı
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        // API'den takımları çekme simülasyonu
        setLoading(true);
        const data = await teamsService.getTeams(); 
        setTeams(data);
      } catch (error) {
        console.error("Takımlar yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    // Takımları çek
    fetchTeams();
  }, []);

  // Arama terimine göre takımları filtreleme
  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Yükleniyor durumunu göstermek için basit bir loader
  if (loading) return <div className="loader">Loading Organizations...</div>;

  return (
    <div className="tm-selection-page">
      <SubNavbar 
        title="Select Organization"
        searchPlaceholder="Search teams..."
        createLabel="Create Team"
        showSearch={true}
        showCreate={true}
        onSearch={(val) => setSearchTerm(val)}
        onCreate={() => onNavigate('CreateTeamPanel')}
      />
      
      <hr />
      
      {/* Takım kartlarını göstermek için grid yapısı */}
      <div className="tm-sel-grid">
        {filteredTeams.length > 0 ? (
          filteredTeams.map(team => (
            <TeamCard 
              key={team.id} 
              team={team} 
              onSelect={() => onNavigate('main', team.id)} 
            />
          ))
        ) : (
          <div className="no-results">No teams found matching your search.</div>
        )}
      </div>
    </div>
  );
};

export default TeamSelection;