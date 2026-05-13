import React, { useState, useEffect, useMemo } from 'react';
import Loader from '../../../components/ui/Loader';
import './TeamMemberList.css'
import SubNavbar from '../../../components/navigation/SubNavbar';
import EditRoleModal from '../modals/TeamEditMember';
import AddMemberModal from '../modals/TeamAddMember';
import TeamLogModal from '../modals/TeamActivityLog'; 
import { teamsService, teamMembersCache, teamMembersRequestCache } from '../services/teamsService';
import { useAuth } from '../../../context/AuthContext';
import { notificationService } from '../../../services/notificationService';
import { useModal } from '../../../hooks/useModal';
import { usePermissions } from '../../../hooks/usePermissions'; 
import Confirm from '../../../components/overlays/Confirm';
import Alert from '../../../components/overlays/Alert';

const TeamMemberList = ({ team, onBack, onNavigate, parentLoading }) => {
  const teamId = team?.id;
  const teamName = team?.name || "Takım Detayları";
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

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
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
      const updatedMembers = members.filter(m => m.id !== user.id);
      setMembers(updatedMembers);
      teamMembersCache.set(String(teamId), updatedMembers);
      closeConfirm();
      showAlert("Başarılı", `${user.name} takımdan başarıyla çıkarıldı.`, "success");
    } catch (error) {
      console.error("Silme hatası:", error);
      showAlert("Hata", "Üye çıkarılırken bir sorun oluştu.", "error");
    }
  };

  const handleDeleteClick = (user) => {
    askConfirm(
      "Üyeyi Çıkar",
      `${user.name} isimli üyeyi takımdan çıkarmak istediğinize emin misiniz?`,
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
        showAlert("Yetki Devri Gerekli", "Takımın tek admini sizsiniz. Ayrılmadan önce başka bir üyeye Admin yetkisi devretmelisiniz.", "warning");
        return;
      } else {
        askConfirm("Takımı Kapat", "Bu takımın tek üyesi sizsiniz. Ayrılırsanız takım kalıcı olarak silinecektir.", async () => {
          await teamsService.deleteTeam(teamId);
          onBack();
        }, "danger");
        return;
      }
    }

    const confirmMessage = myRole === 'Admin' 
      ? "Takımdan ayrılmak istediğinize emin misiniz? Admin yetkiniz sonlanacaktır."
      : "Takımdan ayrılmak istediğinize emin misiniz?";

    askConfirm("Takımdan Ayrıl", confirmMessage, async () => {
        try {
          if (canFreeExit) {
            await teamsService.removeMember(teamId, currentUserId);
            showAlert("Ayrıldınız", "Takımdan başarıyla ayrıldınız.", "success");
            onBack();
          } else {
            await notificationService.sendLeaveRequest(teamId, currentUserId);
            showAlert("İstek Gönderildi", "Ayrılma isteğiniz adminlere iletildi.", "info");
          }
        } catch {
          showAlert("Hata", "İşlem sırasında bir hata oluştu.", "error");
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
        searchPlaceholder="Üye ara..."
        createLabel="Hızlı Ekleme"
        showSearch={true}
        showCreate={canAddMember} 
        onCreate={() => setIsAddModalOpen(true)}
        onSearch={(val) => console.log("Member search:", val)}
        buttons={[
          { icon: 'ti ti-list', tooltip: 'Takımım', onClick: onBack },
          ...(canManageSettings ? [{ icon: 'ti ti-settings', tooltip: 'Ayarlar', onClick: () => onNavigate('settings') }] : [])
        ]}
      />

      <hr className='sub-nav-divider' />

      <div className="team-grid-container">
        {members.map(member => {
          const isMe = String(member.id) === String(currentUserId);
          return (
            <div className="team-card" key={member.id}>
              <div className="tm-card-header">
                <span className={`tm-role-badge ${member.roleName?.toLowerCase()}`}>
                  {member.roleName}
                </span>
                <div className="tm-actions">
                  {isMe && (
                    <button className="tm-action-btn leave-btn" onClick={handleLeaveTeam} title="Takımdan Ayrıl">
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
                  <img src={member.avatar} alt={member.name} />
                )}
                <h3>{member.name}</h3>
                {!member.isDeleted && (isAdmin || isMe) && (
                  <p>{member.email}</p>
                )}
              </div>
              <div className="tm-user-footer">
                <div className="tm-stat">
                  <span className="stat-label">Son Giriş</span>
                  <span className="stat-value">
                      {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString('tr-TR') : 'Never'}
                  </span>
                </div>
                {canViewLogs && !member.isDeleted && (
                  <button className="view-full-logs-btn" onClick={() => handleLogClick(member)}>
                    Tam Geçmiş Kaydı
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {canAddMember && (
          <div className="team-card add-member-card" onClick={() => setIsAddModalOpen(true)}>
            <div className="add-icon-wrapper"><i className="ti ti-plus"></i></div>
            <span>Yeni Üye</span>
          </div>
        )}
      </div>

      <EditRoleModal 
        key={selectedUser ? `edit-${selectedUser.id}` : 'edit-none'} 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        user={selectedUser}
        teamId={teamId}
      />
      <AddMemberModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <TeamLogModal 
        key={selectedUser ? `log-${selectedUser.id}` : 'log-none'}
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)} 
        user={selectedUser} 
        teamId={teamId}
      />
      <Confirm {...confirmConfig} onClose={closeConfirm} />
      <Alert {...alertConfig} onClose={closeAlert} />
    </div>
  );
};

export default TeamMemberList;