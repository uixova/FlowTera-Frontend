import React, { useState, useMemo } from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import '../dashboard.css/CreateReport.css';
import { useAuth } from '../../../context/AuthContext'; // Kullanıcı mailini göstermek için

const CreateReport = ({ isOpen, onClose, teams = [], selectedTeamId }) => {
    const { currentUser } = useAuth(); // Mevcut kullanıcının bilgileri
    
    const activeTeamName = useMemo(() => {
        const team = teams.find(t => String(t.id) === String(selectedTeamId));
        return team ? team.name : "Seçili Takım";
    }, [teams, selectedTeamId]);

    const [reportConfig, setReportConfig] = useState({
        name: '',
        startDate: '',
        endDate: '',
        includeDocs: true
    });

    const setQuickDate = (days) => {
        const end = new Date().toISOString().split('T')[0];
        const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        setReportConfig({ ...reportConfig, startDate: start, endDate: end });
    };

    const footer = (
        <button 
            className="generate-report-btn mail-mode"
            onClick={() => console.log("E-postaya gönderiliyor:", currentUser?.email, reportConfig)}
        >
            <i className="ti ti-mail-fast"></i>
            Raporu E-postama Gönder
        </button>
    );

    return (
        <ActionSidebar
            isOpen={isOpen}
            onClose={onClose}
            title={<h2>Dijital Rapor Hazırlayıcı</h2>}
            footer={footer}
            width="500px"
        >
            <div className="report-wrapper">
                {/* Alıcı Bilgilendirme Kartı */}
                <div className="mail-info-banner">
                    <div className="banner-icon"><i className="ti ti-info-circle"></i></div>
                    <p>Hazırlanan rapor <strong>{currentUser?.email}</strong> adresine anlık olarak gönderilecektir.</p>
                </div>

                <div className="report-info-card">
                    <div className="info-icon"><i className="ti ti-briefcase"></i></div>
                    <div className="info-text">
                        <span>Seçili Takım</span>
                        <strong>{activeTeamName}</strong>
                    </div>
                </div>

                <div className="report-section">
                    <label className="section-label">Rapor İsmi</label>
                    <div className="input-with-icon">
                        <i className="ti ti-file-text"></i>
                        <input 
                            type="text" 
                            placeholder="Rapor başlığı giriniz..."
                            value={reportConfig.name}
                            onChange={(e) => setReportConfig({...reportConfig, name: e.target.value})}
                        />
                    </div>
                </div>

                <div className="report-section">
                    <div className="section-header">
                        <label className="section-label">Zaman Aralığı</label>
                        <div className="quick-dates">
                            <span onClick={() => setQuickDate(7)}>7G</span>
                            <span onClick={() => setQuickDate(30)}>30G</span>
                            <span onClick={() => setQuickDate(90)}>90G</span>
                        </div>
                    </div>
                    <div className="report-grid-2">
                        <div className="date-input-box">
                            <small>Başlangıç</small>
                            <input type="date" value={reportConfig.startDate} onChange={(e) => setReportConfig({...reportConfig, startDate: e.target.value})} />
                        </div>
                        <div className="date-input-box">
                            <small>Bitiş</small>
                            <input type="date" value={reportConfig.endDate} onChange={(e) => setReportConfig({...reportConfig, endDate: e.target.value})} />
                        </div>
                    </div>
                </div>

                <div className="report-section">
                    <label className="section-label">İçerik Tercihleri</label>
                    <div 
                        className={`option-item standalone ${reportConfig.includeDocs ? 'active' : ''}`}
                        onClick={() => setReportConfig({...reportConfig, includeDocs: !reportConfig.includeDocs})}
                    >
                        <div className="option-info">
                            <i className="ti ti-camera"></i>
                            <div>
                                <p>Fatura Kanıtlarını Ekle</p>
                                <small>Tüm döküman görselleri PDF sonuna eklenir.</small>
                            </div>
                        </div>
                        <div className="custom-switch"></div>
                    </div>
                </div>
            </div>
        </ActionSidebar>
    );
};

export default CreateReport;