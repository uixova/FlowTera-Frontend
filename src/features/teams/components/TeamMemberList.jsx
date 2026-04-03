import React, { useState, useEffect, useCallback } from 'react';
import Loader from '../../../components/common/Loader';
import '../teams.css/MemberList.css'
import SubNavbar from '../../../components/navigation/SubNavbar';
import EditRoleModal from '../modals/TeamEditMember';
import AddMemberModal from '../modals/TeamAddMember';
import TeamLogModal from '../modals/TeamActivityLog'; 
import { teamsService } from '../services/teamsService'; 
import { useAuth } from '../../../hooks/useAuth';

// teamId'yi dışarıdan (Selection sayfasından) prop olarak alıyoruz
// RAM üzerinde tutulan cache: Sayfa yenilenene kadar veriyi burada saklarız
const teamMembersCache = new Map();
const teamMembersRequestCache = new Map();

const TeamMemberList = ({ team, onBack, onNavigate }) => {
  const teamId = team?.id;
  const teamName = team?.name || "Team Details";
  const { currentUserId, roleNameForTeam, currentUser, loading: authLoading } = useAuth();
  
  // Yetki kontrolü: Admin mi ve silinmemiş mi?
  const canManageMembers = !authLoading && !!currentUser && String(currentUser?.isDeleted) !== 'true' && roleNameForTeam(teamId) === 'Admin';

  // Modal State'leri
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Üyeler state'i - Başlangıçta cache'de varsa oradan alıyoruz
  const [members, setMembers] = useState(() => {
    if (!teamId) return [];
    return teamMembersCache.get(String(teamId)) || [];
  });
  
  const [loading, setLoading] = useState(() => members.length === 0);

  // Takım üyelerini yüklemek için useEffect kullanıyoruz
  const fetchMembers = useCallback(async (isCancelled) => {
    if (!teamId) return;

    const normalizedTeamId = String(teamId);

    // 1. Önce RAM üzerindeki cache'e bakıyoruz (Hızlı yükleme için)
    const cachedMembers = teamMembersCache.get(normalizedTeamId);
    if (cachedMembers) {
      if (!isCancelled) {
        setMembers(cachedMembers);
        setLoading(false);
      }
      return;
    }

    // 2. Cache yoksa API'ye gidiyoruz (LocalStorage'ı artık kullanmıyoruz)
    try {
      if (!isCancelled) {
        setLoading(true);
        setMembers([]);
      }

      // Çakışan istekleri önlemek için request cache kontrolü
      let pendingRequest = teamMembersRequestCache.get(normalizedTeamId);
      if (!pendingRequest) {
        pendingRequest = teamsService.getTeamMembers(teamId);
        teamMembersRequestCache.set(normalizedTeamId, pendingRequest);
      }

      const data = await pendingRequest;

      // RAM cache'e yazıyoruz
      teamMembersCache.set(normalizedTeamId, data);

      if (!isCancelled) {
        setMembers(data || []);
      }
    } catch (error) {
      console.error("Üyeler yüklenirken hata:", error);
    } finally {
      teamMembersRequestCache.delete(normalizedTeamId);
      if (!isCancelled) {
        setLoading(false);
      }
    }
  }, [teamId]);

  useEffect(() => {
    let isCancelled = false;
    fetchMembers(isCancelled);
    
    return () => {
      isCancelled = true;
    };
  }, [fetchMembers]); // fetchMembers değiştikçe (teamId değiştikçe) çalışır

  // Üye düzenleme butonuna tıklandığında açılan fonksiyon
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  // Aktivite loglarını göstermek için kullanıcı seçildiğinde açılan fonksiyon
  const handleLogClick = (user) => {
    setSelectedUser(user);
    setIsLogModalOpen(true);
  };

  // auth bilgisi gelene kadar aksiyonları kapat (flicker olmasın diye)
  const canManageMembersSafe = canManageMembers;

  useEffect(() => {
    if (!canManageMembersSafe) {
      setIsEditModalOpen(false);
      setIsAddModalOpen(false);
      setIsLogModalOpen(false);
      setSelectedUser(null);
    }
  }, [canManageMembersSafe]);

  // Yükleniyor durumunu göstermek için basit bir loader
  if (loading) return <Loader type="butterfly" />;

  return (
    <div className="tm-member-list-page">
      <SubNavbar 
        title={teamName}
        searchPlaceholder="Search member..."
        createLabel="Quick Add"
        showSearch={true}
        showCreate={canManageMembersSafe}
        onCreate={() => setIsAddModalOpen(true)}
        onSearch={(val) => console.log("Üye arama:", val)}
        buttons={[
          { 
            icon: 'ti ti-list', 
            tooltip: 'My Teams', 
            onClick: onBack 
          },
          ...(canManageMembersSafe
            ? [{
                icon: 'ti ti-settings', 
                tooltip: 'Settings', 
                onClick: () => onNavigate('settings') 
              }]
            : [])
        ]}
      />

      <hr />

      <div className="team-grid-container">
        {/* ÜYELER JSON'DAN GELİYOR */}
        {members.map(member => (
          <div className="team-card" key={member.id}>
            <div className="tm-card-header">
              {/* member.role yerine member.roleName kullanıyoruz */}
              <span className={`tm-role-badge ${member.roleName?.toLowerCase()}`}>
                {member.roleName}
              </span>
              {canManageMembersSafe && (
                <div className="tm-actions">
                  <button 
                    className="tm-action-btn" 
                    onClick={() => handleEditClick(member)}
                    disabled={member.isDeleted}
                    title={member.isDeleted ? 'Deleted user cannot be edited' : 'Edit member'}
                  >
                    <i className="ti ti-edit"></i>
                  </button>
                  <button 
                    className="tm-action-btn delete-btn"
                    disabled={member.isDeleted}
                    title={member.isDeleted ? 'Deleted user cannot be deleted' : 'Delete member'}
                  >
                    <i className="ti ti-user-minus"></i>
                  </button>
                </div>
              )}
            </div>
    
            <div className="tm-user-body">
              {member.isDeleted ? (
                <div className="tm-user-avatar-deleted" aria-hidden="true">
                  <i className="ti ti-trash"></i>
                </div>
              ) : (
                <img src={member.avatar} alt={member.name} />
              )}
              <h3>{member.name}</h3>
              {!member.isDeleted &&
                (canManageMembersSafe ||
                  (currentUserId && String(currentUserId) === String(member.id))) && (
                  <p>{member.email}</p>
                )}
            </div>
    
            <div className="tm-user-footer">
              <div className="tm-stat">
                <span className="stat-label">Last Login</span>
                {/* user.json'daki lastLogin verisini daha okunaklı basıyoruz */}
                <span className="stat-value">
                    {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString('tr-TR') : 'Never'}
                </span>
              </div>
              {canManageMembersSafe && (
                <button 
                  className="view-full-logs-btn" 
                  onClick={() => handleLogClick(member)}
                >
                  Full Activity Log
                </button>
              )}
            </div>
          </div>
        ))}

          {/* Yeni Üye Ekleme Kartı */}
        {canManageMembersSafe && (
          <div className="team-card add-member-card" onClick={() => setIsAddModalOpen(true)}>
            <div className="add-icon-wrapper"><i className="ti ti-plus"></i></div>
            <span>New Member</span>
          </div>
        )}
      </div>

      {/* Modallar */}
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
    </div>
  );
};

export default TeamMemberList;