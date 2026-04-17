import React, { useState } from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import { useModal } from '../../../hooks/useModal'; 
import { usePermissions } from '../../../hooks/usePermissions'; 
import Confirm from '../../../components/modals/Confirm'; 
import Alert from '../../../components/modals/Alert'; 
import '../teams.css/AddMember.css';

const AddMemberModal = ({ isOpen, onClose }) => {
  const [identifier, setIdentifier] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  
  // Yetki yönetimi için yazdığımız hook'u çağırıyoruz
  const { 
    getFilteredPermissions, // Filtreleme fonksiyonunu hook'tan alıyoruz
    restrictedPerms,  
    toggleRestriction,
    resetRestrictions 
  } = usePermissions([]);

  // Modal yönetimi 
  const { confirmConfig, askConfirm, closeConfirm, alertConfig, showAlert, closeAlert } = useModal();

  // Sabit roller (Burada durabilir veya ileride hook içine de alınabilir)
  const roles = [
    { id: 'admin', name: 'Admin', desc: 'Full access, no restrictions.', color: 'admin' },
    { id: 'moderator', name: 'Moderator', desc: 'Management and monitoring.', color: 'moderator' },
    { id: 'member', name: 'Member', desc: 'Personal logs only.', color: 'member' }
  ];

  const executeInvite = () => {
    console.log("Flowtera API Invitation:", {
      id: identifier,
      role: selectedRole,
      blocked: restrictedPerms // Hook'tan gelen kısıtlı yetkiler
    });
    
    setIdentifier('');
    setSelectedRole('');
    resetRestrictions(); // State'i hook üzerinden sıfırlıyoruz
    onClose();
  };

  const handleInviteAttempt = () => {
    if (!identifier) {
        showAlert("Eksik Bilgi", "Lütfen bir Email veya Kullanıcı ID'si giriniz.", "warning");
        return;
    }
    if (!selectedRole) {
        showAlert("Rol Seçimi", "Lütfen kullanıcı için bir rol belirleyiniz.", "info");
        return;
    }

    if (selectedRole === 'admin') {
      askConfirm(
        "Yönetici Daveti",
        `"${identifier}" adresine yönetici daveti göndermek üzeresiniz. Bu kullanıcı kabul ettiğinde takım üzerinde tam yetkiye sahip olacaktır. Onaylıyor musunuz?`,
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
        title="Add New Member" 
        width="460px"
        footer={
          <div className="adm-panel-footer" style={{width: '100%', padding: 0, borderTop: 'none'}}>
            <button className="adm-btn-cancel" onClick={onClose} style={{flex: 1}}>Vazgeç</button>
            <button className="adm-btn-invite" onClick={handleInviteAttempt} style={{flex: 2}}>
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
                          <span className="adm-role-desc">{role.desc}</span>
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

      {/* Modallar */}
      <Confirm {...confirmConfig} onClose={closeConfirm} />
      <Alert {...alertConfig} onClose={closeAlert} />
    </>
  );
};

export default AddMemberModal;