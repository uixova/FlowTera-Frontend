import React, { useState } from 'react';
import Loader from '../../../components/common/Loader';
import TeamCard from './TeamCard';
import SubNavbar from '../../../components/navigation/SubNavbar';
import { useAuth } from '../../../hooks/useAuth'; 

const TeamSelection = ({ onNavigate, teams, loading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const { roleNameForTeam } = useAuth(); // Yetki kontrolü için hook

    const filteredTeams = teams.filter(team => 
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // TAKIM SEÇİM BARİKATI
    const handleTeamAction = (team) => {
        const userRole = roleNameForTeam(team.id);
        const isMaintenance = team.settings?.status === 'maintenance';

        // Mantık: Eğer takım bakımda ise VE kullanıcı Admin değilse girişi engelle
        if (isMaintenance && userRole !== 'Admin') {
            alert(
                `⛔ ERİŞİM ENGELİ: ${team.name.toUpperCase()}\n\n` +
                `Bu takım şu anda teknik bir bakım çalışması nedeniyle geçici olarak erişime kapatılmıştır.\n\n` +
                `Lütfen daha sonra tekrar deneyiniz veya takım yöneticinizle iletişime geçiniz.`
            );
            return; // Fonksiyondan çık, içeri alma
        }

        // Eğer bakımda değilse veya kullanıcı Admin ise içeri al
        onNavigate('main', team.id);
    };

    if (loading) return <Loader type="butterfly" />;

    return (
        <div className="tm-selection-page">
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
                            // Artık doğrudan onNavigate değil, bizim kontrol fonksiyonumuzu çağırıyor
                            onSelect={() => handleTeamAction(team)} 
                        />
                    ))
                ) : (
                    <div className="no-results">Aramanızla eşleşen takım bulunamadı.</div>
                )}
            </div>
        </div>
    );
};

export default TeamSelection;