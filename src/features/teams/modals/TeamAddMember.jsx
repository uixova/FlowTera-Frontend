import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import { useModal } from '../../../hooks/useModal';
import { usePermissions } from '../../../hooks/usePermissions';
import { teamsService } from '../services/teamsService';
import Confirm from '../../../components/overlays/Confirm';
import Alert from '../../../components/overlays/Alert';
import './TeamAddMember.css';

const AddMemberModal = ({ isOpen, onClose, teamId, onSuccess }) => {
  const { t } = useTranslation('teams.addMember');
  const { t: tBtn } = useTranslation('common.buttons');
  const { t: tPerm } = useTranslation('teams.permissions');
  const [identifier, setIdentifier] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    getFilteredPermissions,
    restrictedPerms,
    toggleRestriction,
    resetRestrictions,
  } = usePermissions([]);

  const { confirmConfig, askConfirm, closeConfirm, alertConfig, showAlert, closeAlert } = useModal();

  const roles = [
    { id: 'admin',     name: 'Admin',     descKey: 'role_admin_desc',     color: 'admin' },
    { id: 'moderator', name: 'Moderator', descKey: 'role_moderator_desc', color: 'moderator' },
    { id: 'member',    name: 'Member',    descKey: 'role_member_desc',    color: 'member' },
  ];

  const resetForm = () => {
    setIdentifier('');
    setSelectedRole('');
    resetRestrictions();
  };

  const executeInvite = async () => {
    if (!teamId) {
      showAlert(t('alert_err_title'), t('alert_err_no_team'), "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await teamsService.inviteMember(teamId, identifier, selectedRole, restrictedPerms);
      if (!result.success) {
        showAlert(t('alert_err_title'), result.message || t('alert_err_invite_fail'), "error");
        return;
      }
      showAlert(t('alert_success_title'), t('alert_success_msg'), "success");
      if (onSuccess) onSuccess(null);
      resetForm();
      onClose();
    } catch {
      showAlert(t('alert_err_title'), t('alert_err_invite'), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteAttempt = () => {
    if (!identifier.trim()) {
      showAlert(t('alert_missing_title'), t('alert_missing_msg'), "warning");
      return;
    }
    if (!selectedRole) {
      showAlert(t('alert_role_title'), t('alert_role_msg'), "info");
      return;
    }

    if (selectedRole === 'admin') {
      askConfirm(
        t('confirm_admin_title'),
        t('confirm_admin_msg', { identifier }),
        executeInvite,
        "warning"
      );
    } else {
      executeInvite();
    }
  };

  return (
    <>
      <ActionSidebar
        isOpen={isOpen}
        onClose={onClose}
        title={t('title')}
        width="460px"
        footer={
          <div className="adm-panel-footer">
            <button className="adm-btn-cancel" onClick={onClose} disabled={isSubmitting}>{tBtn('cancel')}</button>
            <button className="adm-btn-invite" onClick={handleInviteAttempt} disabled={isSubmitting}>
              {isSubmitting ? <i className="ti ti-loader-2 spin"></i> : tBtn('invite')}
            </button>
          </div>
        }
      >
        <div className="adm-panel-body-internal">
          <div className="adm-input-group">
            <label>{t('email_label')}</label>
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
            <label>{t('role_label')}</label>
            <div className="adm-role-list">
              {roles.map((role) => (
                <div key={role.id} className="adm-role-group">
                  <label className={`adm-role-card ${selectedRole === role.id ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="roleOption"
                      hidden
                      checked={selectedRole === role.id}
                      onChange={() => {
                        setSelectedRole(role.id);
                        resetRestrictions();
                      }}
                    />
                    <div className="adm-role-content">
                      <div className="adm-role-header-part">
                        <div className="adm-role-info">
                          <span className={`adm-role-name ${role.color}`}>{role.name}</span>
                          <span className="adm-role-desc">{t(role.descKey)}</span>
                        </div>
                        <div className="adm-check-icon">
                          <i className="ti ti-check"></i>
                        </div>
                      </div>

                      <div className="adm-internal-perms">
                        {role.id !== 'admin' ? (
                          getFilteredPermissions(role.id).map(perm => (
                            <div
                              key={perm.id}
                              className="adm-perm-row"
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
                              <i className="ti ti-info-circle"></i> {tPerm('admin_full_access')}
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

      <Confirm {...confirmConfig} onClose={closeConfirm} />
      <Alert {...alertConfig} onClose={closeAlert} />
    </>
  );
};

export default AddMemberModal;
