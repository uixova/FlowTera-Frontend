import React, { useState } from 'react';
import './history.css/History.css'

const History = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const historyData = [
    {
      id: 1,
      role: 'system',
      icon: 'ti-settings-automation',
      iconClass: 'log-system',
      user: 'Flowtera Bot',
      badge: 'System',
      action: 'automatically updated:',
      target: '"Exchange Rates"',
      time: 'Just now',
      tag: 'Updated',
      tagClass: 'hi-tag-alt'
    },
    {
      id: 2,
      role: 'system',
      icon: 'ti-user-plus',
      iconClass: 'log-join',
      user: 'Platform',
      badge: 'System',
      action: 'welcomed a new member:',
      target: '"Arda Yaman"',
      time: '10 mins ago',
      tag: 'Joined',
      tagClass: 'hi-tag-join'
    },
    {
      id: 3,
      role: 'member',
      icon: 'ti-plus',
      iconClass: 'log-expense',
      user: 'Caner Durmuş',
      badge: 'Member',
      action: 'added a new expense:',
      target: '"Fuel for Truck"',
      time: '5 mins ago',
      amount: '-$120.00'
    },
    {
      id: 4,
      role: 'admin',
      icon: 'ti-circle-check',
      iconClass: 'log-trip',
      user: 'Sistem',
      badge: 'Admin',
      action: 'approved the trip:',
      target: '"Istanbul Logistics"',
      time: '2 hours ago',
      tag: 'Confirmed',
      tagClass: 'hi-tag'
    },
    {
      id: 5,
      role: 'moderator',
      icon: 'ti-trash',
      iconClass: 'log-delete',
      user: 'Ece Naz',
      badge: 'Mod',
      action: 'deleted a report:',
      target: '"Old_Backup_01"',
      time: '22/03/2026 18:21',
      tag: 'Deleted',
      tagClass: 'hi-status-red'
    }
  ];

  return (
    <div className="history-page" id="historyPage">
      <div className="hi-nav">
        <div className="hi-nav-title">
          <h1>Activity History</h1>
        </div>
        <div className="hi-nav-buttons">
          <div className="search-wrapper" id="hiSearchWrapper">
            <i className="ti ti-search"></i>
            <input 
              type="text" 
              id="hiSearchInput" 
              placeholder="Search activity logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="hi-filter-btn">
            <i className="ti ti-adjustments-horizontal"></i>
          </button>
          <button className="hi-refresh-btn">
            <i className="ti ti-refresh"></i>
          </button>
        </div>
      </div>
      
      <hr />

      <div className="history-list-container" id="historyListBody">
        {historyData.map((item) => (
          <div key={item.id} className="history-item" data-role={item.role}>
            <div className="hi-status-line"></div>
            <div className={`hi-icon ${item.iconClass}`}>
              <i className={`ti ${item.icon}`}></i>
            </div>
            <div className="hi-content">
              <div className="hi-info">
                <div className="hi-user-wrapper">
                  <span className={`hi-badge ${item.role}`}>{item.badge}</span>
                  <span className="hi-user">{item.user}</span>
                </div>
                <span className="hi-action">{item.action}</span>
                <span className="hi-target">{item.target}</span>
              </div>
              <div className="hi-meta">
                <span className="hi-time">{item.time}</span>
                {item.amount ? (
                  <span className="hi-amount">{item.amount}</span>
                ) : (
                  <span className={item.tagClass}>{item.tag}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;