import React, { useState } from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import '../teams.css/AddMember.css';

const AddMemberModal = ({ isOpen, onClose }) => {
  const [identifier, setIdentifier] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [restrictedPerms, setRestrictedPerms] = useState([]);

  const permissionsList = [
    { id: 'trip_create', name: 'Create Trip', desc: 'Allows starting new trips' },
    { id: 'exp_delete', name: 'Delete Expense', desc: 'Allows removing log entries' },
    { id: 'team_manage', name: 'Manage Team', desc: 'Allows inviting/removing users' }
  ];

  const roles = [
    { id: 'admin', name: 'Admin', desc: 'Full access, no restrictions.', color: 'admin' },
    { id: 'moderator', name: 'Moderator', desc: 'Management and monitoring.', color: 'moderator' },
    { id: 'member', name: 'Member', desc: 'Personal logs only.', color: 'member' }
  ];

  const toggleRestriction = (id) => {
    setRestrictedPerms(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleInvite = () => {
    if(!selectedRole) return alert("Please select a role!");
    console.log("Flowtera API Invitation:", {
      id: identifier,
      role: selectedRole,
      blocked: restrictedPerms
    });
    onClose();
    // Reset form
    setIdentifier('');
    setSelectedRole('');
    setRestrictedPerms([]);
  };

  return (
    <ActionSidebar 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Add New Member" 
      width="460px"
      footer={
        <div className="adm-panel-footer" style={{width: '100%', padding: 0, borderTop: 'none'}}>
          <button className="adm-btn-cancel" onClick={onClose} style={{flex: 1}}>Gönderme</button>
          <button className="adm-btn-invite" onClick={handleInvite} style={{flex: 2}}>
            İstek Gönder
          </button>
        </div>
      }
    >
      <div className="adm-panel-body-internal">
        <div className="adm-input-group">
          <label>Email veya Kullanıcı ID'si</label>
          <div className="adm-input-wrapper">
            <i className="ti ti-mail"></i>
            <input 
              type="text" 
              value={identifier} 
              onChange={(e) => setIdentifier(e.target.value)} 
              placeholder="user@flowtera.com" 
            />
          </div>
        </div>

        <div className="adm-role-section">
          <label>Rol ve Kısıtlamaları Seç</label>
          <div className="adm-role-list">
            {roles.map((role) => (
              <div key={role.id} className="adm-role-group">
                <label className="adm-role-card" style={{ margin: 0 }}>
                  <input 
                    type="radio" 
                    name="roleOption" 
                    hidden 
                    checked={selectedRole === role.id} 
                    onChange={() => {
                      setSelectedRole(role.id);
                      setRestrictedPerms([]); 
                    }}
                  />
                  <div className="adm-role-content">
                    <div className="adm-role-header-part">
                      <div className="adm-role-info">
                        <span className={`adm-role-name ${role.color}`}>{role.name}</span>
                        <span className="adm-role-desc">{role.desc}</span>
                      </div>
                      <div className="adm-check-icon">
                        <i className="ti ti-check"></i>
                      </div>
                    </div>

                    <div className="adm-internal-perms">
                      {role.id !== 'admin' ? (
                        permissionsList.map(perm => (
                          <div 
                            key={perm.id} 
                            className="adm-perm-row"
                            // Satıra tıklayınca checkbox'ı tetikle
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleRestriction(perm.id);
                            }}
                          >
                            <div className="adm-perm-text">
                              <span>{perm.name}</span>
                              <small>{perm.desc}</small>
                            </div>
                            <div className={`adm-custom-check ${restrictedPerms.includes(perm.id) ? 'checked' : ''}`}>
                              {restrictedPerms.includes(perm.id) && <i className="ti ti-x"></i>}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ paddingTop: '10px' }}>
                          <small style={{ color: '#555', fontStyle: 'italic' }}>
                            <i className="ti ti-info-circle"></i> Yönetici pozisyonları tam yetkiye sahip.
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ActionSidebar>
  );
};

export default AddMemberModal;