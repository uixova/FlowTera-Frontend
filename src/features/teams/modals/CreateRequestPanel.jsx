import React, { useState } from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import { notificationService } from '../../../services/notificationService'; 
import { useModal } from '../../../hooks/useModal';
import Confirm from '../../../components/overlays/Confirm';
import Alert from '../../../components/overlays/Alert';
import './CreateRequestPanel.css';

const CreateRequestPanel = ({ isOpen, onClose, user, teamId }) => {
    const [loading, setLoading] = useState(false);
    const { confirmConfig, askConfirm, closeConfirm, alertConfig, showAlert, closeAlert } = useModal();
    
    const [formData, setFormData] = useState({
        category: 'personal', 
        title: '',
        detail: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const executeSubmit = async () => {
        setLoading(true);
        try {
            const requestPayload = {
                id: `nt_req_${Date.now()}`, 
                type: "request",
                teamId: teamId || "global",
                category: formData.category,
                user: user?.name || "Bilinmeyen Kullanıcı",
                title: formData.title,
                detail: formData.detail,
                date: new Date().toISOString(),
                status: "pending",
                path: `/${formData.category}` 
            };

            const success = await notificationService.createRequest(requestPayload);
            if (success) {
                setFormData({ category: 'personal', title: '', detail: '' });
                onClose();
            }
        } catch {
            showAlert("Hata", "Talep gönderilemedi.", "danger");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (!formData.title.trim() || !formData.detail.trim()) {
            showAlert("Eksik Alan", "Lütfen başlık ve detay kısımlarını doldurun.", "warning");
            return;
        }

        askConfirm(
            "Talebi Onayla",
            "Talebiniz ilgili yöneticilere iletilecektir. Emin misiniz?",
            executeSubmit,
            "info"
        );
    };

    return (
        <>
            <ActionSidebar 
                isOpen={isOpen} 
                onClose={onClose} 
                title="Yeni Talep Oluştur"
                width="460px"
                footer={
                    <div className="crp-panel-footer" style={{display: 'flex', gap: '12px', width: '100%'}}>
                        <button className="crp-btn-cancel" onClick={onClose} disabled={loading}>Vazgeç</button>
                        <button className="crp-btn-submit" onClick={handleSubmit} disabled={loading}>
                            {loading ? <i className="ti ti-loader-2 spin"></i> : 'Talebi İlet'}
                        </button>
                    </div>
                }
            >
                <div className="crp-panel-body">
                    <div className="crp-desc-box">
                        <i className="ti ti-info-circle"></i>
                        <p>Maaş, izin veya donanım taleplerinizi buradan iletebilirsiniz.</p>
                    </div>

                    <div className="crp-input-group">
                        <label>Talep Türü</label>
                        <div className="crp-select-wrapper">
                            <i className="ti ti-category"></i>
                            <select name="category" value={formData.category} onChange={handleChange}>
                                <option value="personal">Kişisel (Zam, İzin, Avans)</option>
                                <option value="expense">Harcama Onayı</option>
                                <option value="trip">Seyahat İzni</option>
                                <option value="team">Ekip / Donanım Talebi</option>
                            </select>
                        </div>
                    </div>

                    <div className="crp-input-group">
                        <label>Başlık</label>
                        <input 
                            type="text"
                            name="title"
                            className="crp-standard-input"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Örn: 2026 Yılı Yıllık İzin Talebi"
                            autoComplete="off"
                        />
                    </div>

                    <div className="crp-input-group">
                        <label>Detaylar ve Gerekçe</label>
                        <textarea
                            name="detail"
                            className="crp-textarea"
                            value={formData.detail}
                            onChange={handleChange}
                            placeholder="Talebinizin detaylarını buraya yazın..."
                        />
                    </div>
                </div>
            </ActionSidebar>

            <Confirm {...confirmConfig} onClose={closeConfirm} />
            <Alert {...alertConfig} onClose={closeAlert} />
        </>
    );
};

export default CreateRequestPanel;