import React, { useState } from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import '../dashboard.css/CreateReport.css';

const CreateReport = ({ isOpen, onClose, teams = [] }) => {
    // Form verilerini yönetmek istersen burayı kullanabilirsin
    const [reportConfig, setReportConfig] = useState({
        name: '',
        startDate: '',
        endDate: '',
        selectedTeam: 'all'
    });

    // Rapor oluşturma butonu için basit bir handler (gerçek API entegrasyonu burada yapılacak)
    const footer = (
        <button 
            className="st-btn-save" 
            style={{ width: '100%' }}
            onClick={() => console.log("Generating report for:", reportConfig)}
        >
            PDF Raporu Oluştur
        </button>
    );

    return (
        <ActionSidebar
            isOpen={isOpen}
            onClose={onClose}
            title={<h2>Rapor Oluştur</h2>}
            footer={footer}
            width="480px"
        >
            <div className="report-container">
                {/* Rapor Adı */}
                <div className="st-input-group full-width">
                    <label>Report Name</label>
                    <input 
                        type="text" 
                        placeholder="e.g. March 2026 Marketing"
                        onChange={(e) => setReportConfig({...reportConfig, name: e.target.value})}
                    />
                </div>

                {/* Tarih Aralığı */}
                <div className="report-grid-2">
                    <div className="st-input-group">
                        <label>Başlangıç Tarihi</label>
                        <input 
                            type="date" 
                            onChange={(e) => setReportConfig({...reportConfig, startDate: e.target.value})}
                        />
                    </div>
                    <div className="st-input-group">
                        <label>Bitiş Tarihi</label>
                        <input 
                            type="date" 
                            onChange={(e) => setReportConfig({...reportConfig, endDate: e.target.value})}
                        />
                    </div>
                </div>

                {/* Takım Seçimi - Dinamik Kısım */}
                <div className="st-input-group full-width">
                    <label>Takım / Proje Seçin</label>
                    <select 
                        className="st-select"
                        value={reportConfig.selectedTeam}
                        onChange={(e) => setReportConfig({...reportConfig, selectedTeam: e.target.value})}
                    >
                        <option value="all">Tüm Takımlarım</option>
                        
                        {/* Veri Kontrolü: Teams varsa maple, yoksa boş olduğunu belirt */}
                        {teams && teams.length > 0 ? (
                            teams.map((team, index) => (
                                <option key={team.id || index} value={team.id}>
                                    {team.name}
                                </option>
                            ))
                        ) : (
                            <option disabled>Aktif takım bulunmadı</option>
                        )}
                    </select>
                </div>

                {/* Ek Seçenekler */}
                <div className="report-options">
                    <label className="st-checkbox-group">
                        <input type="checkbox" defaultChecked />
                        <span>Fatura Görsellerini / Belgelerini Dahil Et</span>
                    </label>
                    <label className="st-checkbox-group">
                        <input type="checkbox" />
                        <span>E-posta ile bir kopya gönder</span>
                    </label>
                </div>
            </div>
        </ActionSidebar>
    );
};

export default CreateReport;