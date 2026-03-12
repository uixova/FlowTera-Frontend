import React, { useState, useEffect } from 'react';
import './history.css/History.css';
import jsonData from './data/log.json'

const History = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLog, setActiveLog] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        
        // --- API SİMÜLASYONU ---
        // internetten geliyormuş gibi 500ms gecikmeyle yüklüyoruz
        const simulateApi = new Promise((resolve) => {
          setTimeout(() => resolve(jsonData), 500);
        });

        const data = await simulateApi;
        setHistoryData(data);

      } catch (err) {
        console.error("Sistem hatası:", err.message);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const handleToggle = (id) => {
    setActiveLog(activeLog === id ? null : id);
  };

  const filteredData = historyData.filter(item => 
    item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="hi-loading">Sistem yükleniyor...</div>;

  return (
    <div className="history-page">
      <div className="hi-nav">
        <div className="hi-nav-title">
          <h1>Activity History</h1>
        </div>
        <div className="hi-nav-buttons">
          <div className="search-wrapper">
            <i className="ti ti-search"></i>
            <input 
              type="text" 
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="hi-filter-btn"><i className="ti ti-adjustments-horizontal"></i></button>
        </div>
      </div>
      
      <hr className="hi-divider" />

      <div className="history-list-container">
        {filteredData.map((item) => (
          <div 
            key={item.id} 
            className={`history-wrapper ${activeLog === item.id ? 'is-expanded' : ''}`}
          >
            <div className="history-item" data-role={item.role} onClick={() => handleToggle(item.id)}>
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
                  <i className="ti ti-chevron-down hi-chevron"></i>
                </div>
              </div>
            </div>

            {/* Dinamik Detay Paneli */}
            <div className="history-accordion-content">
              <div className="hi-det-inner">
                <div className="hi-det-grid">
                  {item.details && Object.entries(item.details).map(([key, value]) => (
                    <div className="hi-det-box" key={key}>
                      <span className="hi-det-label">{key.replace(/_/g, ' ').toUpperCase()}</span>
                      <span className="hi-det-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;