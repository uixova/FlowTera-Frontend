import React, { useState, useEffect, useCallback } from 'react';
import Loader from '../../components/common/Loader';
import './history.css/History.css';
import SubNavbar from '../../components/navigation/SubNavbar';
// 1. Servisimizi import ediyoruz
import { historyService } from './services/historyService';

const History = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLog, setActiveLog] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. VERİ YÜKLEME (Expenses'taki gibi loadData mantığı)
  const loadLogs = useCallback(async () => {
    try {
      setLoading(true); // Loader başlasın
      
      // LocalStorage'dan aktif takım ID'sini alıyoruz
      const activeTeamId = localStorage.getItem('tm_selected_id');
      
      // Servis üzerinden teams.json -> history dizisini çekiyoruz
      const data = await historyService.getHistoryByTeam(activeTeamId);
      
      setHistoryData(data);
    } catch (err) {
      console.error("History yüklenirken hata:", err);
    } finally {
      setLoading(false); // Loader kapansın
    }
  }, []);

  // 3. EVENT LISTENER (F5 atmadan güncelleyen kısım)
  useEffect(() => {
    // Sayfa ilk açıldığında veriyi çek
    loadLogs();

    // Takım değiştiğinde çalışacak fonksiyon
    const handleTeamRefresh = () => {
      console.log("History: Takım değişti, loader tetikleniyor...");
      loadLogs(); 
    };

    // Navbar/Sidebar'dan fırlatılan event'i yakala
    window.addEventListener('teamChanged', handleTeamRefresh);
    window.addEventListener('storage', handleTeamRefresh);

    return () => {
      window.removeEventListener('teamChanged', handleTeamRefresh);
      window.removeEventListener('storage', handleTeamRefresh);
    };
  }, [loadLogs]);

  const handleToggle = (id) => {
    setActiveLog(activeLog === id ? null : id);
  };

  const filteredData = historyData.filter(item => 
    item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loader type="butterfly" />;

  return (
    <div className="history-page">
      <SubNavbar 
        pageName="Activity History"
        searchPlaceholder="Search logs..."
        showSearch={true}      
        showCreate={false}      
        onSearch={(val) => setSearchTerm(val)}
        buttons={[
          { 
            icon: 'ti ti-adjustments-horizontal', 
            tooltip: 'Filter Logs', 
            onClick: () => console.log("Filtre açıldı") 
          }
        ]}
      />
      
      <hr className="hi-divider" />

      <div className="history-list-container">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <div 
              key={item.id} 
              className={`history-wrapper ${activeLog === item.id ? 'is-expanded' : ''}`}>
                
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
          ))
        ) : (
          <div className="no-data-info">Bu takıma ait bir aktivite kaydı bulunamadı.</div>
        )}
      </div>
    </div>
  );
};

export default History;