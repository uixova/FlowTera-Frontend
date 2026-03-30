import React from 'react';
import '../settings.css/Profile.css';

const Profile = ({ user }) => {
  if (!user) return null;

  return (
    <div className="st-content-section">
      <div className="st-header-box">
        <h2>Profile Details</h2>
        <p>Personal information and profile identity.</p>
      </div>
      
      <div className="st-card">
        {/* Üst Profil Alanı */}
        <div className="st-user-top">
          <div className="st-avatar-box">
            <img src={user.avatar} alt="Avatar" />
            <div className="st-avatar-badge">
              <i className="ti ti-camera"></i>
            </div>
          </div>
          <div className="st-user-meta">
            <div className="name-row">
                <h4>{user.name}</h4>
                <div className={`status-dot ${user.status}`}></div>
            </div>
            <span>{user.subscription?.plan?.toUpperCase()} ACCOUNT</span>
            </div>
        </div>

        {/* Form Alanı */}
        <div className="st-form-grid">
          {/* Read-Only Alanlar (Tıklanamaz) */}
          <div className="st-input-group static-field">
            <label>User ID</label>
            <div className="static-value">{user.id}</div>
          </div>
          <div className="st-input-group static-field">
            <label>Joined Date</label>
            <div className="static-value">{user.joinedDate}</div>
          </div>

          {/* Düzenlenebilir Alanlar */}
          <div className="st-input-group">
            <label>Full Name</label>
            <input type="text" defaultValue={user.name} placeholder="Your name" />
          </div>
          <div className="st-input-group">
            <label>Username</label>
            <input type="text" defaultValue={user.username} placeholder="username" />
          </div>
          <div className="st-input-group">
            <label>Email Address</label>
            <input type="email" defaultValue={user.email} placeholder="email@example.com" />
          </div>
          <div className="st-input-group">
            <label>Phone Number</label>
            <input type="text" defaultValue={user.phone} placeholder="+90 5XX XXX XX XX" />
          </div>
        </div>
        
        {/* Buton ile form arasına boşluk */}
        <div className="st-form-footer">
            <button className="st-btn-save">Update Profile</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;