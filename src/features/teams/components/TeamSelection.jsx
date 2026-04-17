import React, { useState } from 'react';
import TeamCard from './TeamCard';
import SubNavbar from '../../../components/navigation/SubNavbar';
import { useAuth } from '../../../context/AuthContext';
import { useModal } from '../../../hooks/useModal'; 
import Alert from '../../../components/modals/Alert'; 

const TeamSelection = ({ onNavigate, teams, loading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const { roleNameForTeam } = useAuth();
    
    const { alertConfig, showAlert, closeAlert } = useModal();

    const filteredTeams = teams.filter(team => 
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // TAKIM SEÇİM BARİKATI
    const handleTeamAction = (team) => {
        const userRole = roleNameForTeam(team.id);
        const isMaintenance = team.settings?.status === 'maintenance';

        if (isMaintenance && userRole !== 'Admin') {
            showAlert(
                "Erişim Engeli",
                `"${team.name.toUpperCase()}" şu anda teknik bir bakım çalışması nedeniyle erişime kapatılmıştır. Lütfen daha sonra tekrar deneyiniz.`,
                "warning" 
            );
            return;
        }

        onNavigate('main', team.id);
    };

    return (
        <div className={`tm-selection-page ${loading ? 'updating-data' : ''}`}>
            <SubNavbar 
                title="Select Organization"
                searchPlaceholder="Takım ara..."
                createLabel="Takım Oluştur"
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
                            onSelect={() => handleTeamAction(team)} 
                        />
                    ))
                ) : (
                    <div className="no-results">
                        {loading ? 'Yükleniyor...' : 'Aramanızla eşleşen takım bulunamadı.'}
                    </div>
                )}
            </div>

            <Alert {...alertConfig} onClose={closeAlert} />
        </div>
    );
};

export default TeamSelection;