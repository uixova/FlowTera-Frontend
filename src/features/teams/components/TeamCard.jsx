import React from 'react';
import { useTranslation } from 'react-i18next';
import './TeamCard.css';

const TeamCard = ({ team, onSelect }) => {
    const { t, i18n } = useTranslation('teams');
    const { t: tList } = useTranslation('teams.list');
    const isMaintenance = team.settings?.status === 'maintenance';
    const dateLocale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

    return (
        <div
            className={`tm-sel-card ${isMaintenance ? 'maintenance-mode' : ''}`}
            onClick={onSelect}
        >
            {isMaintenance && (
                <div className="tm-maintenance-badge">
                    <i className="ti ti-tool" />
                    <span>{t('maintenance_badge')}</span>
                </div>
            )}

            <div className="tm-sel-card-top">
                <img
                    src={team.image}
                    alt={team.name}
                    className="tm-sel-avatar"
                    style={{ filter: isMaintenance ? 'grayscale(100%) opacity(0.6)' : 'none' }}
                />
                <div className="tm-sel-info">
                    <h4>{team.name}</h4>
                    <div className="tm-sel-meta">
                        <i className="ti ti-calendar-event" />
                        <span>
                            {team.createdAt
                                ? new Date(team.createdAt).toLocaleDateString(dateLocale)
                                : '—'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="tm-sel-divider" />

            <div className="tm-sel-card-bottom">
                <div className="tm-sel-stats">
                    <i className="ti ti-users" />
                    <span>{team.members} {tList('member_count_label')}</span>
                </div>
                <div className="tm-sel-arrow">
                    <i className={`ti ${isMaintenance ? 'ti-lock' : 'ti-chevron-right'}`} />
                </div>
            </div>
        </div>
    );
};

export default TeamCard;
