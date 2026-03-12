import React, { useState } from 'react';
import '../teams.css/Modals.css'
import '../teams.css/AddMember.css';

const AddMemberModal = ({ isOpen, onClose }) => {
  const [identifier, setIdentifier] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');

  const handleAddMember = () => {
    if(!identifier) return alert("Lütfen bir ID veya E-posta gir!");
    
    console.log("Flowtera Davet Gönderiliyor:", { identifier, role: selectedRole });
    // API isteği buraya gelecek
    onClose();
    setIdentifier(''); // Formu temizle
  };

  return (
    <>
      {/* Arka plan karartma */}
      <div 
        className={`adm-side-overlay ${isOpen ? 'is-active' : ''}`} 
        onClick={onClose} 
      />

      <div className={`adm-side-panel ${isOpen ? 'is-open' : ''}`}>
        <div className="adm-panel-header">
          <div className="adm-header-left">
            <div className="adm-icon-circle">
              <i className="ti ti-user-plus"></i>
            </div>
            <div className="adm-header-text">
              <h3>Add New Member</h3>
              <p>Invite someone to Flowtera team</p>
            </div>
          </div>
          <button className="adm-panel-close" onClick={onClose}>
            <i className="ti ti-x"></i>
          </button>
        </div>

        <div className="adm-panel-body">
          {/* Giriş Alanı */}
          <div className="adm-input-group">
            <label>User ID or Email Address</label>
            <div className="adm-input-wrapper">
              <i className="ti ti-mail"></i>
              <input 
                type="text" 
                placeholder="example@flowtera.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <small className="adm-helper-text">Person will receive an invitation link.</small>
          </div>

          {/* Rol Seçimi */}
          <div className="adm-role-section">
            <label>Assign Team Role</label>
            <div className="adm-role-list">
              {[
                { id: 'admin', name: 'Admin', desc: 'Full access to all settings and data.', color: 'admin' },
                { id: 'moderator', name: 'Moderator', desc: 'Can manage members and trips.', color: 'moderator' },
                { id: 'member', name: 'Member', desc: 'Can view and add their own logs.', color: 'member' }
              ].map((role) => (
                <label key={role.id} className="adm-role-card">
                  <input 
                    type="radio" 
                    name="newMemberRole"
                    value={role.id}
                    checked={selectedRole === role.id}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  />
                  <div className="adm-role-content">
                    <div className="adm-role-info">
                      <span className={`adm-role-name ${role.color}`}>{role.name}</span>
                      <span className="adm-role-desc">{role.desc}</span>
                    </div>
                    <div className="adm-check-icon">
                      <i className="ti ti-check"></i>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="adm-panel-footer">
          <button className="adm-btn-cancel" onClick={onClose}>Discard</button>
          <button className="adm-btn-invite" onClick={handleAddMember}>
            Send Invitation
          </button>
        </div>
      </div>
    </>
  );
};

export default AddMemberModal;