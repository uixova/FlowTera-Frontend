import React, { useState, useEffect } from 'react';
import '../teams.css/TeamEdit.css';
import { teamsService } from '../services/teamsService'; 

const EditRoleModal = ({ isOpen, onClose, user }) => {
    // Local State
    const [selectedRole, setSelectedRole] = useState('member');
    const [isUpdating, setIsUpdating] = useState(false);

    // User prop'u güncellendiğinde veya modal açıldığında seçili rolü güncelle
    useEffect(() => {
        if (isOpen && user?.role) {
            setSelectedRole(user.role.toLowerCase());
        }
    }, [user, isOpen]);

    // Conditional Render
    if (!isOpen) return null;

    // Rol güncelleme işlemi
    const handleUpdate = async () => {
        if (!user?.id) return;

        try {
            setIsUpdating(true);
            
            // Servis katmanı üzerinden güncelleme (API simülasyonu)
            await teamsService.updateUserRole(user.id, selectedRole);
            
            onClose(); 
        } catch (error) {
            console.error("Rol güncellenirken hata oluştu:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Rol konfigürasyonu 
    const roles = [
        {
            id: 'admin',
            title: 'Admin',
            desc: 'Full access to all settings, members and financial logs.',
            color: 'admin'
        },
        {
            id: 'moderator',
            title: 'Moderator',
            desc: 'Can manage members and view reports, but cannot delete the team.',
            color: 'moderator'
        },
        {
            id: 'member',
            title: 'Member',
            desc: 'Standard access. Can add expenses and view their own data.',
            color: 'member'
        }
    ];

    return (
        // Modal Overlay
        <div className="tm-modal-overlay" id="tmEditRoleModal" style={{ display: 'flex' }} onClick={onClose}>
            <div className="tm-modal-container role-modal" onClick={(e) => e.stopPropagation()}>
                
                <div className="tm-modal-header">
                    <div className="tm-modal-user">
                        <div className="role-icon-box">
                            <i className="ti ti-shield-lock"></i>
                        </div>
                        <div className="user-meta">
                            <h3>Edit Member Role</h3>
                            <p id="editRoleTargetUser">
                                {user?.name || 'Unknown User'} — {user?.team || 'No Team'}
                            </p>
                        </div>
                    </div>
                    <button className="tm-modal-close" onClick={onClose} disabled={isUpdating}>
                        <i className="ti ti-x"></i>
                    </button>
                </div>

                {/* Rol Seçimi Listesi */}
                <div className="tm-modal-body">
                    <div className="role-selection-list">
                        {/* Roller arasında seçim yapılacak kartlar */}
                        {roles.map((role) => (
                            <label 
                                key={role.id} 
                                className={`role-option ${selectedRole === role.id ? 'active' : ''} ${isUpdating ? 'disabled' : ''}`}
                            >
                                <input 
                                    type="radio" 
                                    name="userRole" 
                                    value={role.id}
                                    checked={selectedRole === role.id}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    disabled={isUpdating}
                                />
                                <div className="role-card-content">
                                    <div className="role-info">
                                        <span className={`role-name ${role.color}`}>{role.title}</span>
                                        <span className="role-desc">{role.desc}</span>
                                    </div>
                                    {selectedRole === role.id && <i className="ti ti-check"></i>}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Modal Footer - İşlem Butonları */}
                <div className="tm-modal-footer">
                    <button 
                        className="tm-cancel-btn" 
                        onClick={onClose} 
                        disabled={isUpdating}
                    >
                        Cancel
                    </button>
                    <button 
                        className="tm-save-role-btn" 
                        onClick={handleUpdate} 
                        disabled={isUpdating}
                    >
                        {isUpdating ? 'Updating...' : 'Update Role'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditRoleModal;