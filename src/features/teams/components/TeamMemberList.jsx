import React, { useState, useEffect, useCallback } from 'react';
import Loader from '../../../components/common/Loader';
import '../teams.css/MemberList.css'
import SubNavbar from '../../../components/navigation/SubNavbar';
import EditRoleModal from '../modals/TeamEditMember';
import AddMemberModal from '../modals/TeamAddMember';
import TeamLogModal from '../modals/TeamActivityLog'; 
import { teamsService } from '../services/teamsService'; 
import { useAuth } from '../../../context/AuthContext';

// Yeni eklenen servis
import { notificationService } from '../../../services/notificationService';

// Modalları ve Hook'u ekledik
import { useModal } from '../../../hooks/useModal';
import Confirm from '../../../components/modals/Confirm';
import Alert from '../../../components/modals/Alert';

const teamMembersCache = new Map();
const teamMembersRequestCache = new Map();

const TeamMemberList = ({ team, onBack, onNavigate, parentLoading }) => {
  const teamId = team?.id;
  const teamName = team?.name || "Takım Detayları";
  const { currentUserId, roleNameForTeam, currentUser, loading: authLoading } = useAuth();
  
  const { 
    alertConfig, showAlert, closeAlert,
    confirmConfig, askConfirm, closeConfirm 
  } = useModal();

  const canManageMembers = !authLoading && !!currentUser && String(currentUser?.isDeleted) !== 'true' && roleNameForTeam(teamId) === 'Admin';

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [members, setMembers] = useState(() => {
    if (!teamId) return [];
    return teamMembersCache.get(String(teamId)) || [];
  });

  // LOADER FIX: Eğer parent zaten yüklüyorsa veya cache'de veri varsa loading true başlamasın
  const [loading, setLoading] = useState(() => {
    if (parentLoading) return false; 
    const cached = teamMembersCache.get(String(teamId));
    return !cached; 
  });

  const fetchMembers = useCallback(async (isCancelled) => {
    if (!teamId) return;
    const normalizedTeamId = String(teamId);
    
    const cachedMembers = teamMembersCache.get(normalizedTeamId);
    if (cachedMembers) {
      if (!isCancelled) {
        setMembers(cachedMembers);
        setLoading(false); // Veri varsa loader'ı kapat
      }
      return;
    }

    try {
      if (!isCancelled) {
        // Eğer parentLoading varsa, içerdeki loader'ı asla başlatma
        if (!parentLoading) setLoading(true);
      }
      
      let pendingRequest = teamMembersRequestCache.get(normalizedTeamId);
      if (!pendingRequest) {
        pendingRequest = teamsService.getTeamMembers(teamId);
        teamMembersRequestCache.set(normalizedTeamId, pendingRequest);
      }
      
      const data = await pendingRequest;
      teamMembersCache.set(normalizedTeamId, data);
      
      if (!isCancelled) setMembers(data || []);
    } catch (error) {
      console.error("Error loading members:", error);
    } finally {
      teamMembersRequestCache.delete(normalizedTeamId);
      if (!isCancelled) setLoading(false);
    }
  }, [teamId, parentLoading]); // parentLoading bağımlılığını ekledik

  useEffect(() => {
    let isCancelled = false;
    fetchMembers(isCancelled);
    return () => { isCancelled = true; };
  }, [fetchMembers]);

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
    } catch (err) {
      console.error("Silme hatası:", err);
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

  // AYRILMA VE YETKİ DEVRİ MANTIĞI 
  const handleLeaveTeam = () => {
    const myRole = roleNameForTeam(teamId);
    // Diğer aktif adminleri bul
    const otherAdmins = members.filter(m => m.roleName === 'Admin' && String(m.id) !== String(currentUserId));
    const hasOtherAdmins = otherAdmins.length > 0;

    // KURAL: Eğer tek adminsem ve başkaları varsa çıkamam
    if (myRole === 'Admin' && !hasOtherAdmins) {
      if (members.length > 1) {
        showAlert(
          "Yetki Devri Gerekli",
          "Takımın tek admini sizsiniz. Ayrılmadan önce başka bir üyeye Admin yetkisi devretmelisiniz.",
          "warning"
        );
        return;
      } else {
        // Takımda sadece ben varsam takımı silme onayı iste
        askConfirm(
          "Takımı Kapat",
          "Bu takımın tek üyesi sizsiniz. Ayrılırsanız takım kalıcı olarak silinecektir. Onaylıyor musunuz?",
          async () => {
            await teamsService.deleteTeam(teamId);
            onBack();
          },
          "danger"
        );
        return;
      }
    }

    // Normal ayrılma süreci
    const confirmMessage = myRole === 'Admin' 
      ? "Takımdan ayrılmak istediğinize emin misiniz? Admin yetkiniz sonlanacaktır."
      : "Takımdan ayrılma isteğiniz yöneticilere iletilecektir. Onaylıyor musunuz?";

    askConfirm(
      "Takımdan Ayrıl",
      confirmMessage,
      async () => {
        try {
          if (myRole === 'Admin') {
            await teamsService.removeMember(teamId, currentUserId);
            showAlert("Ayrıldınız", "Takımdan başarıyla ayrıldınız.", "success");
            onBack();
          } else {
            // Member ise istek gönderir
            await notificationService.sendLeaveRequest(teamId, currentUserId);
            showAlert("İstek Gönderildi", "Ayrılma isteğiniz adminlere iletildi.", "info");
          }
        } catch (err) {
          console.log(err)
          showAlert("Hata", "İşlem sırasında bir hata oluştu.", "error");
        }
      }
    );
  };
  // --- AYRILMA VE YETKİ DEVRİ MANTIĞI BİTİŞ ---

  const canManageMembersSafe = canManageMembers;

  useEffect(() => {
    if (!canManageMembersSafe) {
      setIsEditModalOpen(false);
      setIsAddModalOpen(false);
      setIsLogModalOpen(false);
      setSelectedUser(null);
    }
  }, [canManageMembersSafe]);

  // RENDER KONTROLÜ: Eğer parent yüklüyorsa veya cache'de zaten veri varsa loader gösterme mk
  if (!parentLoading && loading && members.length === 0) {
    return <Loader type="butterfly" />;
  }

  return (
    <div className="tm-member-list-page">
      <SubNavbar 
        title={teamName}
        searchPlaceholder="Üye ara..."
        createLabel="Hızlı Ekleme"
        showSearch={true}
        showCreate={canManageMembersSafe}
        onCreate={() => setIsAddModalOpen(true)}
        onSearch={(val) => console.log("Member search:", val)}
        buttons={[
          { icon: 'ti ti-list', tooltip: 'Takımım', onClick: onBack },
          ...(canManageMembersSafe ? [{ icon: 'ti ti-settings', tooltip: 'Ayarlar', onClick: () => onNavigate('settings') }] : [])
        ]}
      />

      <hr />

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
                  {/* Kendi kartımdaysam Ayrıl butonu (Admin olmasam da görünür) */}
                  {isMe && (
                    <button 
                      className="tm-action-btn leave-btn" 
                      onClick={handleLeaveTeam}
                      title="Takımdan Ayrıl"
                    >
                      <i className="ti ti-logout"></i>
                    </button>
                  )}

                  {/* Başkasını yönetme (Sadece Adminler için) */}
                  {canManageMembersSafe && member.roleName !== 'Admin' && !isMe && (
                    <>
                      <button 
                        className="tm-action-btn" 
                        onClick={() => handleEditClick(member)}
                        disabled={member.isDeleted}
                      >
                        <i className="ti ti-edit"></i>
                      </button>
                      <button 
                        className="tm-action-btn delete-btn"
                        disabled={member.isDeleted}
                        onClick={() => handleDeleteClick(member)}
                      >
                        <i className="ti ti-user-minus"></i>
                      </button>
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
                {!member.isDeleted && (canManageMembersSafe || isMe) && (
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
                {canManageMembersSafe && (
                  <button className="view-full-logs-btn" onClick={() => handleLogClick(member)}>
                    Tam Geçmiş Kaydı
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {canManageMembersSafe && (
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