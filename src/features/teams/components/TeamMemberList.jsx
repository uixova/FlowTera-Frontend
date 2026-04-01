import React, { useState, useEffect } from 'react';
import Loader from '../../../components/common/Loader';
import '../teams.css/MemberList.css'
import SubNavbar from '../../../components/navigation/SubNavbar';
import EditRoleModal from '../modals/TeamEditMember';
import AddMemberModal from '../modals/TeamAddMember';
import TeamLogModal from '../modals/TeamActivityLog'; 
import { teamsService } from '../services/teamsService'; 

// teamId'yi dışarıdan (Selection sayfasından) prop olarak alıyoruz
const teamMembersCache = new Map();
const teamMembersRequestCache = new Map();
const getMembersStorageKey = (teamId) => `tm_team_members_cache_${teamId}`;

const TeamMemberList = ({ team, onBack, onNavigate }) => {
  const teamId = team?.id;
  const teamName = team?.name || "Team Details";
  // Modal State'leri
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [members, setMembers] = useState(() => {
    if (!teamId) return [];
    try {
      const raw = localStorage.getItem(getMembersStorageKey(String(teamId)));
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => members.length === 0);

  // Takım üyelerini yüklemek için useEffect kullanıyoruz
  useEffect(() => {
    let isCancelled = false;

    const fetchMembers = async () => {
        if (!teamId) return;

        const normalizedTeamId = String(teamId);
        const cachedMembers = teamMembersCache.get(normalizedTeamId);
        if (cachedMembers) {
          if (!isCancelled) {
            setMembers(cachedMembers);
            setLoading(false);
          }
          return;
        }

        try {
          const raw = localStorage.getItem(getMembersStorageKey(normalizedTeamId));
          const parsed = raw ? JSON.parse(raw) : [];
          if (Array.isArray(parsed) && parsed.length > 0) {
            teamMembersCache.set(normalizedTeamId, parsed);
            if (!isCancelled) {
              setMembers(parsed);
              setLoading(false);
            }
            return;
          }
        } catch {
          // Storage parse hatasında servise düşer
        }

        try {
            if (!isCancelled) {
              setLoading(true);
              setMembers([]);
            }

            let pendingRequest = teamMembersRequestCache.get(normalizedTeamId);
            if (!pendingRequest) {
              pendingRequest = teamsService.getTeamMembers(teamId);
              teamMembersRequestCache.set(normalizedTeamId, pendingRequest);
            }

            const data = await pendingRequest;
            teamMembersCache.set(normalizedTeamId, data);
            localStorage.setItem(getMembersStorageKey(normalizedTeamId), JSON.stringify(data || []));
            if (!isCancelled) {
              setMembers(data);
            }
        } catch (error) {
            console.error("Üyeler yüklenirken hata:", error);
        } finally {
            teamMembersRequestCache.delete(normalizedTeamId);
            if (!isCancelled) {
              setLoading(false);
            }
        }
    };

    fetchMembers();
    return () => {
      isCancelled = true;
    };
  }, [teamId]); // teamId değiştiğinde tekrar çalışır

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

  // Yükleniyor durumunu göstermek için basit bir loader
  if (loading) return <Loader type="butterfly" />;

  return (
    <div className="tm-member-list-page">
      <SubNavbar 
        title={teamName}
        searchPlaceholder="Search member..."
        createLabel="Quick Add"
        showSearch={true}
        showCreate={true}
        onCreate={() => setIsAddModalOpen(true)}
        onSearch={(val) => console.log("Üye arama:", val)}
        buttons={[
          { 
            icon: 'ti ti-list', 
            tooltip: 'My Teams', 
            onClick: onBack 
          },
          { 
            icon: 'ti ti-settings', 
            tooltip: 'Settings', 
            onClick: () => onNavigate('settings') 
          }
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
              <div className="tm-actions">
                <button className="tm-action-btn" onClick={() => handleEditClick(member)}>
                  <i className="ti ti-edit"></i>
                </button>
                <button className="tm-action-btn delete-btn"><i className="ti ti-user-minus"></i></button>
              </div>
            </div>
    
            <div className="tm-user-body">
              <img src={member.avatar} alt={member.name} />
              <h3>{member.name}</h3>
              <p>{member.email}</p>
            </div>
    
            <div className="tm-user-footer">
              <div className="tm-stat">
                <span className="stat-label">Last Login</span>
                {/* user.json'daki lastLogin verisini daha okunaklı basıyoruz */}
                <span className="stat-value">
                    {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString('tr-TR') : 'Never'}
                </span>
              </div>
              <button 
                className="view-full-logs-btn" 
                onClick={() => handleLogClick(member)}
              >
                Full Activity Log
              </button>
            </div>
          </div>
        ))}

          {/* Yeni Üye Ekleme Kartı */}
        <div className="team-card add-member-card" onClick={() => setIsAddModalOpen(true)}>
          <div className="add-icon-wrapper"><i className="ti ti-plus"></i></div>
          <span>New Member</span>
        </div>
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