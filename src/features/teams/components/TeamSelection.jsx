import React, { useState, useEffect } from 'react';
import TeamCard from './TeamCard';
// JSON verisini import ediyoruz
import teamsData from '../data/teams.json'; 

const TeamSelection = ({ onNavigate }) => {
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchTeams = async () => {
    try {
      setLoading(true);
      
      // API simülasyonu: 500ms bekleme ekliyoruz
      // Gerçek API'ye geçtiğinde sadece alttaki satırı 
      // const response = await fetch('/api/teams'); ile değiştireceksin.
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTeams(teamsData);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchTeams();
}, []);

  // Arama filtresi (JSON'dan gelen teams dizisi üzerinden çalışır)
  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loader">Loading Organizations...</div>;

  return (
    <div className="tm-selection-page">
      <div className="tm-sel-header">
        <div className="tm-sel-actions">
          <h1>Select Organization</h1>
          <div className="tm-sel-nav-buttons">
            <div className="search-wrapper">
              <i className="ti ti-search"></i>
              <input 
                type="text" 
                className="tm-search-input"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="tm-btn-gradient" onClick={() => onNavigate('create')} >
              <i className="ti ti-category-plus"></i> Create Team
            </button>
          </div>
        </div>
      </div>
      
      <hr />

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