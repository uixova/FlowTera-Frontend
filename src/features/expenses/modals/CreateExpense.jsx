import React, { useState, useEffect } from 'react'; 
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import { expenseService } from '../services/expenseService'; 
import { archiveService } from '../../archive/services/archiveServices';
import './CreateExpense.css';

const CreateExpense = ({ isOpen, onClose, editData, onSuccess }) => {
    const isEdit = !!editData;
    const displayDate = editData ? editData.date : new Date().toLocaleDateString('tr-TR');

    // Dosya ve Yükleme Durumu State'leri
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal her açıldığında veya editData değiştiğinde state'leri temizle/doldur
    useEffect(() => {
        if (isOpen) {
            setSelectedFile(null);
            setPreviewUrl(isEdit && editData.receipt ? editData.receipt : null);
        }
    }, [isOpen, isEdit, editData]);

    // Dosya Seçme Fonksiyonu 
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); // Yükleme başladı

        const formData = new FormData(e.target);
        const now = new Date(); 
        const activeTeamId = localStorage.getItem('tm_selected_id');

        const finalExpenseData = {
            title: formData.get('exInpTitle'),
            category: formData.get('exInpCategory'),
            merchant: formData.get('exInpMerchant'),
            paymentMethod: formData.get('exInpMethod'), 
            amount: formData.get('exInpAmount'), 
            currency: formData.get('exInpCurrency'),
            isReported: e.target.exInpReport.checked,
            teamId: activeTeamId, // Filtreleme için ekledik
            
            id: isEdit ? editData.id : `exp-${Math.floor(Math.random() * 10000)}`,
            status: isEdit ? editData.status : "Pending",
            timestamp: isEdit ? editData.timestamp : now.toISOString(),
            date: isEdit ? editData.date : now.toLocaleDateString('tr-TR'),
            desc: isEdit ? editData.desc : "New expense entry via Flowtera UI",
            icon: isEdit ? editData.icon : "ti-receipt",
            // Dosya veya Önizleme
            receipt: selectedFile || previewUrl 
        };

        try {
            if (isEdit) {
                await expenseService.updateExpense(finalExpenseData.id, finalExpenseData);
            } else {
                await expenseService.createExpense(finalExpenseData);
            }

            // ARŞİV CACHE TEMİZLEME
            archiveService.clearCache();

            if(onSuccess) onSuccess(); 
            onClose(); 
        } catch (error) {
            console.error("İşlem başarısız:", error);
            // Hata durumunda modal kapanmasın ki kullanıcı düzeltme yapabilsin
        } finally {
            setIsSubmitting(false);
        }
    };

    // Sidebar başlığı dinamikleşti
    const sidebarTitle = (
        <div className="ex-panel-title">
            <i className={`ti ${isEdit ? 'ti-edit' : 'ti-plus'}`}></i>
            <span>{isEdit ? 'Gideri Güncelle' : 'Yeni Harcama Ekle'}</span>
        </div>
    );

    // Footer buton yazısı dinamikleşti
    const sidebarFooter = (
        <div className="ex-panel-footer-alt" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
            <button type="button" className="ex-panel-btn cancel" onClick={onClose} disabled={isSubmitting}>İptal Et</button>
            <button type="submit" form="newExpenseForm" className="ex-panel-btn save" disabled={isSubmitting}>
                {isSubmitting ? 'Bekleyin...' : (isEdit ? 'Değişiklikleri Kaydet' : 'Gider Oluştur')}
            </button>
        </div>
    );

    return (
        <ActionSidebar
            isOpen={isOpen}
            onClose={onClose}
            title={sidebarTitle}
            footer={sidebarFooter}
            width="460px"
        >
            <div className="ex-panel-body-internal">
                <div className="ex-modal-info-bar">
                    <div className="info-item">
                        <i className="ti ti-calendar-event"></i>
                        <span>{displayDate}</span>
                    </div>
                    <div className="info-item">
                        <i className="ti ti-shield-check"></i>
                        <span>Durum: {isEdit ? editData.status : 'Beklemede'}</span>
                    </div>
                </div>

                <form id="newExpenseForm" onSubmit={handleSubmit} className="ex-panel-form">
                    <div className="ex-input-group full">
                        <label htmlFor="exInpTitle">Detay / Başlık</label>
                        <input 
                            name="exInpTitle" 
                            type="text" 
                            id="exInpTitle" 
                            placeholder="Sunucu Bakımı" 
                            defaultValue={isEdit ? editData.title : ''} 
                            required 
                        />
                    </div>

                    <div className="ex-input-row">
                        <div className="ex-input-group">
                            <label htmlFor="exInpCategory">Kategori</label>
                            <select name="exInpCategory" id="exInpCategory" defaultValue={isEdit ? editData.category : 'Food'}>
                                <option value="Food">Yiyecek ve İçecek</option>
                                <option value="Transport">Ulaşım</option>
                                <option value="Accommodation">Konaklama</option>
                                <option value="Health">Sağlık</option>
                                <option value="Entertainment">Eğlence</option>
                            </select>
                        </div>
                        <div className="ex-input-group">
                            <label htmlFor="exInpMerchant">İşletme</label>
                            <input 
                                name="exInpMerchant" 
                                type="text" 
                                id="exInpMerchant" 
                                placeholder="Amazon, Starbucks" 
                                defaultValue={isEdit ? editData.merchant : ''}
                            />
                        </div>
                    </div>

                    <div className="ex-input-group full">
                        <label htmlFor="exInpMethod">Ödeme Yöntemi</label>
                        <select 
                            name="exInpMethod" 
                            id="exInpMethod" 
                            key={editData?.id} 
                            defaultValue={isEdit ? editData.paymentMethod : 'Cash'}
                        >
                            <option value="Cash">Nakit</option>
                            <option value="Credit Card">Kredi Kartı</option>
                            <option value="Bank Transfer">Banka Transferi</option>
                        </select>
                    </div>

                    <div className="ex-input-group full">
                        <label>Fatura / Belge</label>
                        <div 
                            className={`ex-simple-upload ${previewUrl ? 'has-preview' : ''}`} 
                            onClick={() => document.getElementById('exInpReceipt').click()}
                        >
                            {previewUrl ? (
                                <div className="receipt-preview-box" style={{ width: '100%', height: '100px', overflow: 'hidden', borderRadius: '8px' }}>
                                    <img src={previewUrl} alt="Fatura" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div className="preview-overlay">Değiştir</div>
                                </div>
                            ) : (
                                <div className="upload-placeholder">
                                    <i className="ti ti-file-upload"></i>
                                    <span>{isEdit && editData.receipt ? 'Dosyayı Değiştir' : 'Fatura Ekle'}</span>
                                </div>
                            )}
                            <input 
                                type="file" 
                                id="exInpReceipt" 
                                hidden 
                                accept=".pdf, .jpg, .jpeg, .png, .webp" 
                                onChange={handleFileChange} 
                            />
                        </div>
                    </div>

                    <div className="ex-input-group full">
                        <label htmlFor="exInpAmount">Miktar ve Para Birimi</label>
                        <div className="ex-amount-wrapper">
                            <input 
                                name="exInpAmount" 
                                type="number" 
                                id="exInpAmount" 
                                placeholder="0.00" 
                                step="0.01" 
                                defaultValue={isEdit ? editData.amount : ''}
                                required 
                            />
                            <select name="exInpCurrency" id="exInpCurrency" className="ex-currency-select" defaultValue={isEdit ? editData.currency : 'USD'}>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="TRY">TRY (₺)</option>
                            </select>
                        </div>
                    </div>

                    <div className="report-toggle-wrapper">
                        <span>Aylık rapor eklensin mi?</span>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                name="exInpReport" 
                                id="exInpReport" 
                                defaultChecked={isEdit ? editData.isReported : true} 
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </form>
            </div>
        </ActionSidebar>
    );
};

export default CreateExpense;