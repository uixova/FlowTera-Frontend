import React, { useState } from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import '../dashboard.css/CreateReport.css';

const CreateReport = ({ isOpen, onClose, teams = [] }) => {
    const [reportConfig, setReportConfig] = useState({
        name: '',
        startDate: '',
        endDate: '',
        selectedTeam: 'all'
    });

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
                    <label>Rapor Adı</label>
                    <input 
                        type="text" 
                        placeholder="Örn: Mart 2026 Pazarlama Raporu"
                        value={reportConfig.name}
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

                {/* Takım Seçimi - Dinamik Liste */}
                <div className="st-input-group full-width">
                    <label>Takım / Proje Seçin</label>
                    <select 
                        className="st-select"
                        value={reportConfig.selectedTeam}
                        onChange={(e) => setReportConfig({...reportConfig, selectedTeam: e.target.value})}
                    >
                        <option value="all">Tüm Takımlarım</option>
                        
                        {/* Gelen teams array'ini güvenli şekilde mapliyoruz */}
                        {teams && teams.length > 0 ? (
                            teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))
                        ) : (
                            <option disabled>Üye olduğunuz takım bulunamadı</option>
                        )}
                    </select>
                </div>

                {/* Ek Seçenekler */}
                <div className="report-options">
                    <label className="st-checkbox-group">
                        <input 
                            type="checkbox" 
                            defaultChecked 
                            onChange={(e) => setReportConfig({...reportConfig, includeDocs: e.target.checked})}
                        />
                        <span>Fatura Görsellerini / Belgelerini Dahil Et</span>
                    </label>
                    <label className="st-checkbox-group">
                        <input 
                            type="checkbox" 
                            onChange={(e) => setReportConfig({...reportConfig, sendEmail: e.target.checked})}
                        />
                        <span>E-posta ile bir kopya gönder</span>
                    </label>
                </div>
            </div>
        </ActionSidebar>
    );
};

export default CreateReport;