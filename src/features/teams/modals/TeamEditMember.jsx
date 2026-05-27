import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import './TeamEditMember.css';
import { teamsService } from '../services/teamsService';
import { useModal } from '../../../hooks/useModal';
import { usePermissions } from '../../../hooks/usePermissions';
import Confirm from '../../../components/overlays/Confirm'; 

const EditRoleModal = ({ isOpen, onClose, user, teamId, onSuccess }) => {
    const { t } = useTranslation('teams.editMember');
    const { t: tBtn } = useTranslation('common.buttons');
    const [selectedRole, setSelectedRole] = useState('member');
    const [isUpdating, setIsUpdating] = useState(false);

    // Yetki yönetimi için yazdığım hook
    const { 
        getFilteredPermissions, 
        restrictedPerms, 
        setRestrictedPerms, 
        toggleRestriction, 
        resetRestrictions 
    } = usePermissions([]);

    // Confirm modal yönetimi için hook u
    const { confirmConfig, askConfirm, closeConfirm } = useModal();

    // Modal açıldığında mevcut rol ve kısıtlamaları yükle
    useEffect(() => {
        if (isOpen && user) {
            const currentRole = user.roleName?.toLowerCase() || 'member';
            const currentRestrictions = user.permissions || [];

            setSelectedRole(currentRole);
            setRestrictedPerms(currentRestrictions); 
        }
    }, [user, isOpen, setRestrictedPerms]);

    // Asıl güncelleme işlemini yapan fonksiyon
    const executeUpdate = useCallback(async () => {
        if (!user?.id || !teamId) return;
        try {
            setIsUpdating(true);
            await teamsService.updateUserRole(user.id, teamId, {
                role: selectedRole,
                restrictions: restrictedPerms,
            });
            if (onSuccess) onSuccess(selectedRole, restrictedPerms);
            onClose();
        } catch (error) {
            console.error("Update error:", error);
        } finally {
            setIsUpdating(false);
        }
    }, [user?.id, teamId, selectedRole, restrictedPerms, onClose, onSuccess]);

    // Güncelleme butonuna basıldığında çalışan kontrol mekanizması
    const handleUpdateAttempt = () => {
        const isPromotingToAdmin = selectedRole === 'admin' && user.roleName?.toLowerCase() !== 'admin';

        if (isPromotingToAdmin) {
            askConfirm(
                t('promote_title'),
                t('promote_confirm', { name: user.name }),
                executeUpdate,
                "warning"
            );
        } else {
            // Admin durumu yoksa direkt güncelle
            executeUpdate();
        }
    };

    const roles = [
        { id: 'admin', title: 'Admin', desc: t('role_admin_desc'), color: 'admin' },
        { id: 'moderator', title: 'Moderator', desc: t('role_moderator_desc'), color: 'moderator' },
        { id: 'member', title: 'Member', desc: t('role_member_desc'), color: 'member' }
    ];

    return (
        <>
            <ActionSidebar
                isOpen={isOpen}
                onClose={onClose}
                title={
                    <div className="tm-modal-user">
                        <div className="role-icon-box"><i className="ti ti-shield-lock"></i></div>
                        <div className="user-meta">
                            <h3>{t('panel_title')}</h3>
                            <p>{user?.name || 'User'} — {user?.roleName || 'Member'}</p>
                        </div>
                    </div>
                }
                footer={
                    <div className="tm-modal-footer-grid" style={{width: '100%', padding: 0, borderTop: 'none'}}>
                        <button className="tm-cancel-btn" onClick={onClose} disabled={isUpdating} style={{flex: 1}}>{tBtn('cancel')}</button>
                        <button className="tm-save-role-btn" onClick={handleUpdateAttempt} disabled={isUpdating} style={{flex: 2}}>
                            {isUpdating ? t('updating') : t('update_btn')}
                        </button>
                    </div>
                }
                width="460px"
            >
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
                                            // Rol admin seçilirse kısıtlamaları otomatik temizle
                                            if(e.target.value === 'admin') resetRestrictions();
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

                                        <div className="role-internal-perms">
                                            {role.id !== 'admin' ? (
                                                getFilteredPermissions(role.id).map(perm => (
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
                                                        {/* restrictedPerms dizisi içindeki ID'yi kontrol edip X işaretini koyuyoruz */}
                                                        <div className={`tm-custom-check ${restrictedPerms.includes(perm.id) ? 'checked' : ''}`}>
                                                            {restrictedPerms.includes(perm.id) && <i className="ti ti-x"></i>}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="admin-notice">
                                                    <i className="ti ti-info-circle"></i> {t('admin_notice')}
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

            <Confirm {...confirmConfig} onClose={closeConfirm} />
        </>
    );
};

export default EditRoleModal;