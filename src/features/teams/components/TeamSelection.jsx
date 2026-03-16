import React, { useState } from 'react';
import Loader from '../../../components/common/Loader';
import TeamCard from './TeamCard';
import SubNavbar from '../../../components/navigation/SubNavbar';

// Artık teams ve loading proplarını üst bileşenden (Teams.jsx) alıyoruz
const TeamSelection = ({ onNavigate, teams, loading }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Arama terimine göre takımları filtreleme
    const filteredTeams = teams.filter(team => 
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Yükleniyor durumu (Veri üstten gelene kadar)
    if (loading) return <Loader type="butterfly" />;

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
            
            <hr className="sub-nav-divider" />
            
            <div className="tm-sel-grid">
                {filteredTeams.length > 0 ? (
                    filteredTeams.map(team => (
                        <TeamCard 
                            key={team.id} 
                            team={team} 
                            // Takım seçildiğinde hem 'main' moduna geç hem de ID'yi gönder
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