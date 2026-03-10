import React, { useState, useEffect } from 'react';
import '../teams.css/TeamEdit.css';

const EditRoleModal = ({ isOpen, onClose, user }) => {
  const [selectedRole, setSelectedRole] = useState(user?.role?.toLowerCase() || 'member');

  // User verisi değiştiğinde veya modal açıldığında state'i senkronize et
  useEffect(() => {
    if (isOpen && user?.role) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedRole(user.role.toLowerCase());
    }
    }, [user, isOpen]);

  // 2. CONDITIONAL RENDER: Hook'lardan sonra gelmeli.
  if (!isOpen) return null;

  const handleUpdate = () => {
    console.log(`${user?.name} için yeni rol: ${selectedRole}`);
    onClose(); 
  };

  return (
    <div className="tm-modal-overlay" id="tmEditRoleModal" style={{ display: 'flex' }}>
      <div className="tm-modal-container role-modal">
        <div className="tm-modal-header">
          <div className="tm-modal-user">
            <div className="role-icon-box">
              <i className="ti ti-shield-lock"></i>
            </div>
            <div className="user-meta">
              <h3>Edit Member Role</h3>
              <p id="editRoleTargetUser">
                {user?.name || 'Unknown User'} - {user?.team || 'No Team'}
              </p>
            </div>
          </div>
          <button className="tm-modal-close" onClick={onClose}>
            <i className="ti ti-x"></i>
          </button>
        </div>

        <div className="tm-modal-body">
          <div className="role-selection-list">
            {/* Admin Option */}
            <label className={`role-option ${selectedRole === 'admin' ? 'active' : ''}`}>
              <input 
                type="radio" 
                name="userRole" 
                value="admin" 
                checked={selectedRole === 'admin'}
                onChange={(e) => setSelectedRole(e.target.value)}
              />
              <div className="role-card-content">
                <div className="role-info">
                  <span className="role-name admin">Admin</span>
                  <span className="role-desc">Full access to all settings, members and financial logs.</span>
                </div>
                {selectedRole === 'admin' && <i className="ti ti-check"></i>}
              </div>
            </label>

            {/* Moderator Option */}
            <label className={`role-option ${selectedRole === 'moderator' ? 'active' : ''}`}>
              <input 
                type="radio" 
                name="userRole" 
                value="moderator"
                checked={selectedRole === 'moderator'}
                onChange={(e) => setSelectedRole(e.target.value)}
              />
              <div className="role-card-content">
                <div className="role-info">
                  <span className="role-name moderator">Moderator</span>
                  <span className="role-desc">Can manage members and view reports, but cannot delete the team.</span>
                </div>
                {selectedRole === 'moderator' && <i className="ti ti-check"></i>}
              </div>
            </label>

            {/* Member Option */}
            <label className={`role-option ${selectedRole === 'member' ? 'active' : ''}`}>
              <input 
                type="radio" 
                name="userRole" 
                value="member"
                checked={selectedRole === 'member'}
                onChange={(e) => setSelectedRole(e.target.value)}
              />
              <div className="role-card-content">
                <div className="role-info">
                  <span className="role-name member">Member</span>
                  <span className="role-desc">Standard access. Can add expenses and view their own data.</span>
                </div>
                {selectedRole === 'member' && <i className="ti ti-check"></i>}
              </div>
            </label>
          </div>
        </div>

        <div className="tm-modal-footer">
          <button className="tm-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="tm-save-role-btn" onClick={handleUpdate}>
            Update Role
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRoleModal;