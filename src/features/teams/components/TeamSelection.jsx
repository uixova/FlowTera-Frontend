import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TeamCard from './TeamCard';
import SubNavbar from '../../../components/navigation/SubNavbar';
import { useAuth } from '../../../context/AuthContext';
import { useModal } from '../../../hooks/useModal';
import Alert from '../../../components/overlays/Alert';

const TeamSelection = ({ onNavigate, teams, loading }) => {
    const { t } = useTranslation('teams');
    const { t: tBtn } = useTranslation('common.buttons');
    const { t: tCommon } = useTranslation('common.buttons');
    const [searchTerm, setSearchTerm] = useState('');
    const { roleNameForTeam } = useAuth();

    const { alertConfig, showAlert, closeAlert } = useModal();

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleTeamAction = (team) => {
        const userRole = roleNameForTeam(team.id);
        const isMaintenance = team.settings?.status === 'maintenance';

        if (isMaintenance && userRole !== 'Admin') {
            showAlert(
                t('access_blocked'),
                `"${team.name.toUpperCase()}" ${t('maintenance_msg')}`,
                "warning"
            );
            return;
        }

        onNavigate('main', team.id);
    };

    return (
        <div className={`tm-selection-page ${loading ? 'updating-data' : ''}`}>
            <SubNavbar
                title={t('select_org')}
                searchPlaceholder={t('search_placeholder')}
                createLabel={tBtn('create_team')}
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
                        {loading ? tBtn('loading') : t('no_results')}
                    </div>
                )}
            </div>

            <Alert {...alertConfig} onClose={closeAlert} />
        </div>
    );
};

export default TeamSelection;
