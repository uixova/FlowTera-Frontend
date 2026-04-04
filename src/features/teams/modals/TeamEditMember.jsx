import React, { useState, useEffect } from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import '../teams.css/TeamEdit.css';
import { teamsService } from '../services/teamsService'; 

const EditRoleModal = ({ isOpen, onClose, user, teamId }) => {
    const [selectedRole, setSelectedRole] = useState('member');
    const [restrictedPerms, setRestrictedPerms] = useState([]); // Kısıtlanan yetkiler
    const [isUpdating, setIsUpdating] = useState(false);

    // Yetki listesi (Sabit)
    const permissionsList = [
        { id: 'trip_create', name: 'Create Trip', desc: 'Allows starting new trips' },
        { id: 'exp_delete', name: 'Delete Expense', desc: 'Allows removing log entries' },
        { id: 'team_manage', name: 'Manage Team', desc: 'Allows inviting/removing users' }
    ];

    // Modal açıldığında mevcut rol ve kısıtlamaları yükle
    useEffect(() => {
        if (isOpen && user) {
            setSelectedRole(user.roleName?.toLowerCase() || 'member');
            setRestrictedPerms(user.restrictions || []); 
        }
    }, [user, isOpen]);

    // Kısıtlama toggle fonksiyonu
    const toggleRestriction = (id) => {
        setRestrictedPerms(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Güncelleme işlemi
    const handleUpdate = async () => {
        if (!user?.id || !teamId) return;
        try {
            // API çağrısı yaparak rol ve kısıtlamaları güncelleyoruz
            setIsUpdating(true);
            await teamsService.updateUserRole(user.id, teamId, {
                role: selectedRole,
                restrictions: restrictedPerms
            });
            onClose(); 
        } catch (error) {
            console.error("Update error:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Rol seçenekleri
    const roles = [
        { id: 'admin', title: 'Admin', desc: 'Full access to all settings.', color: 'admin' },
        { id: 'moderator', title: 'Moderator', desc: 'Can manage members and reports.', color: 'moderator' },
        { id: 'member', title: 'Member', desc: 'Standard access. Personal logs only.', color: 'member' }
    ];

    return (
        <ActionSidebar
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="tm-modal-user">
                    <div className="role-icon-box"><i className="ti ti-shield-lock"></i></div>
                    <div className="user-meta">
                        <h3>Üye Rolünü Düzenle</h3>
                        <p>{user?.name || 'User'} — {user?.roleName || 'Member'}</p>
                    </div>
                </div>
            }
            footer={
                <div className="tm-modal-footer-grid" style={{width: '100%', padding: 0, borderTop: 'none'}}>
                    <button className="tm-cancel-btn" onClick={onClose} disabled={isUpdating} style={{flex: 1}}>Cancel</button>
                    <button className="tm-save-role-btn" onClick={handleUpdate} disabled={isUpdating} style={{flex: 2}}>
                        {isUpdating ? 'Güncelleniyor...' : 'Güncelle'}
                    </button>
                </div>
            }
            width="460px"
        >
            {/* Rol seçim kartları */}
            <div className="tm-modal-body-internal">
                <div className="role-selection-list">
                    {roles.map((role) => (
                        <div key={role.id} className="role-option-wrapper">
                            <label className={`role-option-label ${selectedRole === role.id ? 'active' : ''}`}>
                                <input 
                                    type="radio" name="userRole" value={role.id}
                                    checked={selectedRole === role.id}
                                    onChange={(e) => {
                                        setSelectedRole(e.target.value);
                                        if(e.target.value === 'admin') setRestrictedPerms([]);
                                    }}
                                    hidden
                                />
                                <div className="role-card-content">
                                    <div className="role-header-part">
                                        <div className="role-info">
                                            <span className={`role-name ${role.color}`}>{role.title}</span>
                                            <span className="role-desc">{role.desc}</span>
                                        </div>
                                        <div className="role-check-indicator">
                                            <i className="ti ti-check"></i>
                                        </div>
                                    </div>

                                    {/* Akordeon Kısmı */}
                                    <div className="role-internal-perms">
                                        {role.id !== 'admin' ? (
                                            permissionsList.map(perm => (
                                                <div 
                                                    key={perm.id} className="tm-perm-row"
                                                    onClick={(e) => {
                                                        e.preventDefault(); e.stopPropagation();
                                                        toggleRestriction(perm.id);
                                                    }}
                                                >
                                                    <div className="tm-perm-text">
                                                        <span>{perm.name}</span>
                                                        <small>{perm.desc}</small>
                                                    </div>
                                                    <div className={`tm-custom-check ${restrictedPerms.includes(perm.id) ? 'checked' : ''}`}>
                                                        {restrictedPerms.includes(perm.id) && <i className="ti ti-x"></i>}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="admin-notice">
                                                <i className="ti ti-info-circle"></i> Yöneticiler kısıtlanamaz.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </ActionSidebar>
    );
};

export default EditRoleModal;