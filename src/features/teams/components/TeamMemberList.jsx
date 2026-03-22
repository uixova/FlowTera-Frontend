import React, { useState, useEffect } from 'react';
import Loader from '../../../components/common/Loader';
import '../teams.css/MemberList.css'
import SubNavbar from '../../../components/navigation/SubNavbar';
import EditRoleModal from '../modals/TeamEditMember';
import AddMemberModal from '../modals/TeamAddMember';
import TeamLogModal from '../modals/TeamActivityLog'; 
import { teamsService } from '../services/teamsService'; 

// teamId'yi dışarıdan (Selection sayfasından) prop olarak alıyoruz

const TeamMemberList = ({ team, onBack, onNavigate }) => {
  const teamId = team?.id;
  const teamName = team?.name || "Team Details";
  // Modal State'leri
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Takım üyelerini yüklemek için useEffect kullanıyoruz
  useEffect(() => {
    const fetchMembers = async () => {
        // Eğer teamId yoksa servise hiç gitme
        if (!teamId) {
            console.error("TeamMemberList: teamId tanımsız!");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await teamsService.getTeamMembers(teamId);
            setMembers(data);
        } catch (error) {
            console.error("Üyeler yüklenirken hata:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchMembers();
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
  if (loading) return <Loader type="dots" />;

  return (
    <div className="tm-member-list-page">
      <SubNavbar 
        title={teamName} // Dinamik takım ismi
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