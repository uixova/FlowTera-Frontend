import React, { useState } from 'react';
import '../teams.css/AddMember.css'

const AddMemberModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [identifier, setIdentifier] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');

  const handleAddMember = () => {
    console.log("Davet Gönderiliyor:", { identifier, role: selectedRole });
    // API isteği buraya gelecek knk
    onClose();
  };

  return (
    <div id="tmAddMemberModal" className="adm-modal-overlay" style={{ display: 'flex' }}>
      <div className="adm-modal-box">
        <div className="adm-modal-header">
          <div className="adm-header-left">
            <div className="adm-icon-circle">
              <i className="ti ti-user-plus"></i>
            </div>
            <div className="adm-header-text">
              <h3>Add New Member</h3>
              <p>Invite a person to your organization</p>
            </div>
          </div>
          <button className="adm-close-btn" onClick={onClose}>
            <i className="ti ti-x"></i>
          </button>
        </div>

        <div className="adm-modal-body">
          <div className="adm-input-group">
            <label>User ID or Email Address</label>
            <div className="adm-input-wrapper">
              <i className="ti ti-at"></i>
              <input 
                type="text" 
                id="tmNewMemberId"
                placeholder="User id or Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          <div className="adm-role-section">
            <label>Assign Initial Role</label>
            <div className="adm-role-list">
              {/* Admin */}
              <label className="adm-role-card">
                <input 
                  type="radio" 
                  name="newMemberRole"
                  value="admin"
                  checked={selectedRole === 'admin'}
                  onChange={(e) => setSelectedRole(e.target.value)}
                />
                <div className="adm-role-content">
                  <div className="adm-role-info">
                    <span className="adm-role-name admin">Admin</span>
                    <span className="adm-role-desc">Full administrative privileges.</span>
                  </div>
                  <div className="adm-check-icon">
                    <i className="ti ti-check"></i>
                  </div>
                </div>
              </label>

              {/* Moderator */}
              <label className="adm-role-card">
                <input 
                  type="radio" 
                  name="newMemberRole"
                  value="moderator"
                  checked={selectedRole === 'moderator'}
                  onChange={(e) => setSelectedRole(e.target.value)}
                />
                <div className="adm-role-content">
                  <div className="adm-role-info">
                    <span className="adm-role-name moderator">Moderator</span>
                    <span className="adm-role-desc">Can manage members and view reports.</span>
                  </div>
                  <div className="adm-check-icon">
                    <i className="ti ti-check"></i>
                  </div>
                </div>
              </label>

              {/* Member */}
              <label className="adm-role-card">
                <input 
                  type="radio" 
                  name="newMemberRole"
                  value="member"
                  checked={selectedRole === 'member'}
                  onChange={(e) => setSelectedRole(e.target.value)}
                />
                <div className="adm-role-content">
                  <div className="adm-role-info">
                    <span className="adm-role-name member">Member</span>
                    <span className="adm-role-desc">Standard member with basic access.</span>
                  </div>
                  <div className="adm-check-icon">
                    <i className="ti ti-check"></i>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="adm-modal-footer">
          <button className="adm-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="adm-btn-primary" id="confirmAddMemberBtn" onClick={handleAddMember}>
            Add to Team
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;