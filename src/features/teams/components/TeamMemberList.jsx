import i18n from '../../../locales/i18n';
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../../components/ui/Loader';
import './TeamMemberList.css'
import SubNavbar from '../../../components/navigation/SubNavbar';
import EditRoleModal from '../modals/TeamEditMember';
import AddMemberModal from '../modals/TeamAddMember';
import TeamLogModal from '../modals/TeamActivityLog';
import CreateRequestPanel from '../modals/CreateRequestPanel';

import { teamsService, teamMembersCache, teamMembersRequestCache } from '../services/teamsService';
import { useAuth } from '../../../context/AuthContext';
import { notificationService } from '../../../services/notificationService';
import { useModal } from '../../../hooks/useModal';
import { usePermissions } from '../../../hooks/usePermissions'; 

import Confirm from '../../../components/overlays/Confirm';
import Alert from '../../../components/overlays/Alert';

const TeamMemberList = ({ team, onBack, onNavigate, parentLoading }) => {
  const { t } = useTranslation('teams.members');
  const { t: tBtn } = useTranslation('common.buttons');
  const { t: tModals } = useTranslation('common.modals');
  const teamId = team?.id;
  const teamName = team?.name || t('team_details');
  const { currentUserId, currentUser } = useAuth();
  const { hasPermission } = usePermissions();
  
  const { alertConfig, showAlert, closeAlert, confirmConfig, askConfirm, closeConfirm } = useModal();

  const currentUserRoleObj = useMemo(() => {
    if (!currentUser || !teamId) return null;
    return currentUser.role?.find(r => String(r.teamId) === String(teamId));
  }, [currentUser, teamId]);

  const canAddMember = useMemo(() => hasPermission(currentUserRoleObj, 'member_add'), [hasPermission, currentUserRoleObj]);
  const canRemoveMember = useMemo(() => hasPermission(currentUserRoleObj, 'member_remove'), [hasPermission, currentUserRoleObj]);
  const canManageSettings = useMemo(() => hasPermission(currentUserRoleObj, 'team_settings'), [hasPermission, currentUserRoleObj]);
  const canViewLogs = useMemo(() => hasPermission(currentUserRoleObj, 'view_user_log'), [hasPermission, currentUserRoleObj]);
  const canFreeExit = useMemo(() => hasPermission(currentUserRoleObj, 'free_exit'), [hasPermission, currentUserRoleObj]);
  
  const isAdmin = currentUserRoleObj?.roleName?.toLowerCase() === 'admin';

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [members, setMembers] = useState(() => {
    if (!teamId) return null;
    return teamMembersCache.get(String(teamId)) ?? null;
  });

  useEffect(() => {
    if (!teamId) return;
    let isCancelled = false;

    const loadMembers = async () => {
      const normalizedId = String(teamId);
      
      try {
        let pendingRequest = teamMembersRequestCache.get(normalizedId);
        if (!pendingRequest) {
          pendingRequest = teamsService.getTeamMembers(teamId);
          teamMembersRequestCache.set(normalizedId, pendingRequest);
        }
        
        const data = await pendingRequest;
        
        if (!isCancelled) {
          teamMembersCache.set(normalizedId, data);
          setMembers(data || []);
        }
      } catch (error) {
        console.error("Error:", error);
        if (!isCancelled) setMembers([]);
      } finally {
        teamMembersRequestCache.delete(normalizedId);
      }
    };

    loadMembers();
    return () => { isCancelled = true; };
  }, [teamId]);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleLogClick = (user) => {
    setSelectedUser(user);
    setIsLogModalOpen(true);
  };

  const executeDeleteMember = async (user) => {
    try {
      const result = await teamsService.removeMember(teamId, user.id);
      if (!result.success) {
        showAlert(tModals('error'), t('remove_error'), "error");
        return;
      }
      const updatedMembers = members.filter(m => m.id !== user.id);
      setMembers(updatedMembers);
      teamMembersCache.set(String(teamId), updatedMembers);
      closeConfirm();
      showAlert(tModals('success'), t('remove_success', { name: user.name }), "success");
    } catch (error) {
      console.error("Silme hatası:", error);
      showAlert(tModals('error'), t('remove_error'), "error");
    }
  };

  const handleDeleteClick = (user) => {
    askConfirm(
      t('remove_member_title'),
      t('remove_member_confirm', { name: user.name }),
      () => executeDeleteMember(user),
      "danger"
    );
  };

  const handleLeaveTeam = () => {
    const myRole = currentUserRoleObj?.roleName;
    const otherAdmins = members.filter(m => m.roleName === 'Admin' && String(m.id) !== String(currentUserId));
    const hasOtherAdmins = otherAdmins.length > 0;

    if (myRole === 'Admin' && !hasOtherAdmins) {
      if (members.length > 1) {
        showAlert(t('authority_required'), t('authority_required_msg'), "warning");
        return;
      } else {
        askConfirm(t('close_team_title'), t('close_team_msg'), async () => {
          await teamsService.deleteTeam(teamId);
          onBack();
        }, "danger");
        return;
      }
    }

    const confirmMessage = myRole === 'Admin'
      ? t('leave_confirm_admin')
      : t('leave_confirm');

    askConfirm(t('leave_title'), confirmMessage, async () => {
        try {
          if (canFreeExit) {
            await teamsService.removeMember(teamId, currentUserId);
            showAlert(tModals('success'), t('leave_success'), "success");
            onBack();
          } else {
            await notificationService.sendLeaveRequest(teamId, currentUserId);
            showAlert(tModals('info'), t('leave_request_sent'), "info");
          }
        } catch {
          showAlert(tModals('error'), t('action_error'), "error");
        }
      }
    );
  };

  // Bu koşul artık kusursuz çalışacak
  if (parentLoading || members === null) {
    return <div className="full-screen-loader"><Loader type="butterfly" /></div>;
  }

  return (
    <div className="tm-member-list-page">
      <SubNavbar
        title={teamName}
        searchPlaceholder={t('search_placeholder')}
        createLabel={t('invite_member')}
        showSearch={true}
        showCreate={canAddMember}
        onCreate={() => setIsAddModalOpen(true)}
        onSearch={(val) => setSearchQuery(val)}
        buttons={[
          {
            icon: 'ti ti-list',
            tooltip: t('team_list_tooltip'),
            onClick: onBack
          },
            ...(canManageSettings ? [{ icon: 'ti ti-settings', tooltip: t('settings_tooltip'), onClick: () => onNavigate('settings') }] : []),
          {
            icon: 'ti ti-file-plus',
            label: t('create_request'),
            isSpecial: true,
            tooltip: t('create_request_tooltip'),
            onClick: () => setIsRequestModalOpen(true)
          }
        ]}
      />

      <hr className='sub-nav-divider' />

      <div className="team-grid-container">
        {(searchQuery
          ? members.filter(m =>
              m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              m.roleName?.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : members
        ).map(member => {
          const isMe = String(member.id) === String(currentUserId);
          return (
            <div className="team-card" key={member.id}>
              <div className="tm-card-header">
                <span className={`tm-role-badge ${member.roleName?.toLowerCase()}`}>
                  {member.roleName}
                </span>
                <div className="tm-actions">
                  {isMe && (
                    <button className="tm-action-btn leave-btn" onClick={handleLeaveTeam} title={t('leave_team_tooltip')}>
                      <i className="ti ti-logout"></i>
                    </button>
                  )}
                  {!isMe && member.roleName !== 'Admin' && (
                    <>
                      {isAdmin && (
                        <button className="tm-action-btn" onClick={() => handleEditClick(member)} disabled={member.isDeleted}>
                            <i className="ti ti-edit"></i>
                        </button>
                      )}
                      {/* Moderatör başka bir moderatörü çıkaramaz — sadece Admin çıkarabilir */}
                      {canRemoveMember && (isAdmin || member.roleName !== 'Moderator') && (
                        <button className="tm-action-btn delete-btn" disabled={member.isDeleted} onClick={() => handleDeleteClick(member)}>
                          <i className="ti ti-user-minus"></i>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="tm-user-body">
                {member.isDeleted ? (
                  <div className="tm-user-avatar-deleted" aria-hidden="true"><i className="ti ti-trash"></i></div>
                ) : (
                  <img src={member.avatar || '/Logo.png'} alt={member.name} onError={(e) => { e.currentTarget.src = '/Logo.png'; }} />
                )}
                <h3>{member.name}</h3>
                {!member.isDeleted && (isAdmin || isMe) && (
                  <p>{member.email}</p>
                )}
              </div>
              <div className="tm-user-footer">
                <div className="tm-stat">
                  <span className="stat-label">{t('last_login')}</span>
                  <span className="stat-value">
                      {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US') : t('never_logged')}
                  </span>
                </div>
                {canViewLogs && !member.isDeleted && (
                  <button className="view-full-logs-btn" onClick={() => handleLogClick(member)}>
                    {tBtn('view')}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {canAddMember && (
          <div className="team-card add-member-card" onClick={() => setIsAddModalOpen(true)}>
            <div className="add-icon-wrapper"><i className="ti ti-plus"></i></div>
            <span>{t('invite_member')}</span>
          </div>
        )}
      </div>

      <EditRoleModal
        key={selectedUser ? `edit-${selectedUser.id}` : 'edit-none'}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        teamId={teamId}
        onSuccess={(updatedRole, updatedRestrictions) => {
          if (!selectedUser) return;
          const updated = (members || []).map(m =>
            m.id === selectedUser.id
              ? { ...m, roleName: updatedRole, permissions: updatedRestrictions }
              : m
          );
          setMembers(updated);
          teamMembersCache.set(String(teamId), updated);
        }}
      />
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        teamId={teamId}
        onSuccess={(newMember) => {
          if (newMember) {
            const updated = [...(members || []), newMember];
            setMembers(updated);
            teamMembersCache.set(String(teamId), updated);
          }
        }}
      />
      <TeamLogModal 
        key={selectedUser ? `log-${selectedUser.id}` : 'log-none'}
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)} 
        user={selectedUser} 
        teamId={teamId}
      />
      <CreateRequestPanel
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        teamId={teamId}
      />
      <Confirm {...confirmConfig} onClose={closeConfirm} />
      <Alert {...alertConfig} onClose={closeAlert} />
    </div>
  );
};

export default TeamMemberList;