import React, { useState } from 'react';
import '../settings.css/Security.css';

const Security = () => {
  const [twoFA, setTwoFA] = useState(false);

  return (
    <div className="st-content-section">
      <div className="st-header-box">
        <h2>Security & Privacy</h2>
        <p>Manage your account password, authentication and privacy data.</p>
      </div>

      {/* Password Change Card */}
      <div className="st-card security-card">
        <div className="security-header">
            <i className="ti ti-key"></i>
            <h4>Change Password</h4>
        </div>
        <div className="st-form-grid">
          <div className="st-input-group">
            <label>Current Password</label>
            <input type="password" placeholder="••••••••" />
          </div>
          <div className="st-input-group">
            <label>New Password</label>
            <input type="password" placeholder="Min. 8 characters" />
          </div>
        </div>
        <button className="st-btn-save security-btn">Update Password</button>
      </div>

      {/* 2FA & Privacy Settings */}
      <div className="security-row-grid">
        <div className="st-card security-mini-card">
            <div className="security-toggle-header">
                <div className="info">
                    <h4>Two-Factor Authentication</h4>
                    <p>Add an extra layer of security.</p>
                </div>
                <label className="st-switch">
                  <input 
                    type="checkbox" 
                    checked={twoFA} 
                    onChange={() => setTwoFA(!twoFA)} 
                  />
                  <span className="st-slider"></span>
                </label>
            </div>
            <div className={`two-fa-status ${twoFA ? 'active' : ''}`}>
                {twoFA ? 'Protected by Authenticator' : 'Not configured'}
            </div>
        </div>

        <div className="st-card security-mini-card">
            <div className="security-toggle-header">
                <div className="info">
                    <h4>Privacy Mode</h4>
                    <p>Hide your trip details from reports.</p>
                </div>
                <label className="st-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="st-slider"></span>
                </label>
            </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="st-danger-zone">
        <div className="danger-header">
            <h4>Danger Zone</h4>
            <p>Once you delete your account, there is no going back. Please be certain.</p>
        </div>
        <button className="st-btn-delete">Delete My Flowtera Account</button>
      </div>
    </div>
  );
};

export default Security;