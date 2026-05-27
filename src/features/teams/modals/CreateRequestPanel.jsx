import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import { notificationService } from '../../../services/notificationService';
import { useModal } from '../../../hooks/useModal';
import Confirm from '../../../components/overlays/Confirm';
import Alert from '../../../components/overlays/Alert';
import './CreateRequestPanel.css';

const CreateRequestPanel = ({ isOpen, onClose, teamId }) => {
    const { t } = useTranslation('teams.requestPanel');
    const { t: tModals } = useTranslation('common.modals');
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
                type:     "request",
                teamId:   teamId || null,
                category: formData.category,
                title:    formData.title,
                detail:   formData.detail,
            };

            const success = await notificationService.createRequest(requestPayload);
            if (success) {
                setFormData({ category: 'personal', title: '', detail: '' });
                onClose();
            }
        } catch {
            showAlert(tModals('error'), t('send_error'), "danger");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (!formData.title.trim() || !formData.detail.trim()) {
            showAlert(t('missing_fields_title'), t('missing_fields_msg'), "warning");
            return;
        }

        askConfirm(
            t('confirm_title'),
            t('confirm_msg'),
            executeSubmit,
            "info"
        );
    };

    return (
        <>
            <ActionSidebar
                isOpen={isOpen}
                onClose={onClose}
                title={t('panel_title')}
                width="460px"
                footer={
                    <div className="crp-panel-footer">
                        <button className="crp-btn-cancel" onClick={onClose} disabled={loading}>{t('cancel_btn')}</button>
                        <button className="crp-btn-submit" onClick={handleSubmit} disabled={loading}>
                            {loading ? <i className="ti ti-loader-2 spin"></i> : t('submit_btn')}
                        </button>
                    </div>
                }
            >
                <div className="crp-panel-body">
                    <div className="crp-desc-box">
                        <i className="ti ti-info-circle"></i>
                        <p>{t('desc_info')}</p>
                    </div>

                    <div className="crp-input-group">
                        <label>{t('category_label')}</label>
                        <div className="crp-select-wrapper">
                            <i className="ti ti-category"></i>
                            <select name="category" value={formData.category} onChange={handleChange}>
                                <option value="personal">{t('cat_personal')}</option>
                                <option value="expense">{t('cat_expense')}</option>
                                <option value="trip">{t('cat_trip')}</option>
                                <option value="team">{t('cat_team')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="crp-input-group">
                        <label>{t('title_label')}</label>
                        <input
                            type="text"
                            name="title"
                            className="crp-standard-input"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder={t('title_placeholder')}
                            autoComplete="off"
                        />
                    </div>

                    <div className="crp-input-group">
                        <label>{t('detail_label')}</label>
                        <textarea
                            name="detail"
                            className="crp-textarea"
                            value={formData.detail}
                            onChange={handleChange}
                            placeholder={t('detail_placeholder')}
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
