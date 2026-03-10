import React, { useState, useEffect } from 'react';
import '../teams.css/MemberList.css'
import EditRoleModal from '../modals/TeamEditMember';
import AddMemberModal from '../modals/TeamAddMember';
import TeamLogModal from '../modals/TeamActivityLog'; 
import allMembersData from '../data/teamMembers.json';

// teamId'yi dışarıdan (Selection sayfasından) prop olarak alıyoruz

const TeamMemberList = ({ onBack, onNavigate, teamId = "team-1", teamName = "Main Development Team" }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMembers = async () => {
      setLoading(true);
      
      // API Simülasyonu: await kullanarak senkron hatasını engelliyoruz
      // Veri sanki internetten geliyormuş gibi 100ms gecikme ekledik
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const filtered = allMembersData.filter(m => m.teamId === teamId);
      setMembers(filtered);
      
      setLoading(false);
    };

    getMembers();
  }, [teamId]); // teamId her değiştiğinde bu blok çalışır

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleLogClick = (user) => {
    setSelectedUser(user);
    setIsLogModalOpen(true);
  };

  if (loading) return <div className="loader">Loading members...</div>;

  return (
    <div className="tm-member-list-page">
      <div className="tm-nav">
        <div className="tm-nav-title">
          {/* Takım ismi de dinamik oldu */}
          <h1>{teamName}</h1>
        </div>
        <div className="tm-nav-buttons">
          <div className="tm-search-wrapper">
            <i className="ti ti-search"></i>
            <input type="text" placeholder="Search member or role..." />
          </div>
          <button className="tm-create-team-btn" onClick={onBack}>
            <i className="ti ti-list"></i> My Teams
          </button>
          <button className="tm-add-member-btn" onClick={() => setIsAddModalOpen(true)}>
            <i className="ti ti-user-plus"></i> Quick Add
          </button>
          <button className="tm-settings-btn" onClick={() => onNavigate('settings')}>
            <i className="ti ti-settings"></i> Settings
          </button>
        </div>
      </div>

      <div className="team-grid-container">
        {/* ARTIK ÜYELER JSON'DAN GELİYOR */}
        {members.map(member => (
          <div className="team-card" key={member.id}>
            <div className="tm-card-header">
              <span className={`tm-role-badge ${member.roleClass}`}>{member.role}</span>
              <div className="tm-actions">
                <button className="tm-action-btn" onClick={() => handleEditClick(member)}>
                  <i className="ti ti-edit"></i>
                </button>
                <button className="tm-action-btn delete-btn"><i className="ti ti-user-minus"></i></button>
              </div>
            </div>
            <div className="tm-user-body">
              <img src={member.avatar} alt="User" />
              <h3>{member.name}</h3>
              <p>{member.email}</p>
            </div>
            <div className="tm-user-footer">
              <div className="tm-stat">
                <span className="stat-label">Last Action</span>
                <span className="stat-value">{member.lastAction}</span>
              </div>
              <button className="view-full-logs-btn" onClick={() => handleLogClick(member)}>
                Full Activity Log
              </button>
            </div>
          </div>
        ))}

        <div className="team-card add-member-card" onClick={() => setIsAddModalOpen(true)}>
          <div className="add-icon-wrapper"><i className="ti ti-plus"></i></div>
          <span>New Member</span>
        </div>
      </div>

      {/* MODALLAR */}
      <EditRoleModal 
        key={selectedUser ? `edit-${selectedUser.id}` : 'edit-none'} 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        user={selectedUser}
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