import React from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import '../expenses.css/CreateExpense.css';

const CreateExpense = ({ isOpen, onClose }) => {
    const displayDate = new Date().toLocaleDateString('tr-TR');

    // Form submit handler
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Form verilerini al
        const formData = new FormData(e.target);
        const now = new Date(); 

        // API'ye gönderilecek nihai veri yapısı
        const finalExpenseData = {
            id: `exp-${Math.floor(Math.random() * 10000)}`, 
            title: formData.get('exInpTitle'),
            category: formData.get('exInpCategory'),
            merchant: formData.get('exInpMerchant'),
            paymentMethod: formData.get('exInpMethod'),
            amount: formData.get('exInpAmount'), 
            currency: formData.get('exInpCurrency'),
            status: "Pending",
            timestamp: now.toISOString(), 
            date: now.toLocaleDateString('tr-TR'),
            isReported: e.target.exInpReport.checked,
            desc: "New expense entry via Flowtera UI",
            icon: "ti-receipt"
        };

        // Konsola yazdırarak API'ye giden veri yapısını görebiliriz
        console.log("Data going to the Flowtera API:", finalExpenseData);
        
        // Modal'ı kapat
        onClose();
    };

    // Sidebar başlığı için özel içerik (Icon + Başlık)
    const sidebarTitle = (
        <div className="ex-panel-title">
            <i className="ti ti-plus"></i>
            <span>Yeni Harcama Ekle</span>
        </div>
    );

    // Footer kısmında iptal ve oluştur butonları
    const sidebarFooter = (
        <div className="ex-panel-footer-alt" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
            <button type="button" className="ex-panel-btn cancel" onClick={onClose}>İptal Et</button>
            <button type="submit" form="newExpenseForm" className="ex-panel-btn save">Gider Oluştur</button>
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
                {/* Üst Bilgi Barı */}
                <div className="ex-modal-info-bar">
                    <div className="info-item">
                        <i className="ti ti-calendar-event"></i>
                        <span>{displayDate}</span>
                    </div>
                    <div className="info-item">
                        <i className="ti ti-shield-check"></i>
                        <span>Durum: Beklemede</span>
                    </div>
                </div>

                <form id="newExpenseForm" onSubmit={handleSubmit} className="ex-panel-form">
                    <div className="ex-input-group full">
                        <label htmlFor="exInpTitle">Detay / Başlık</label>
                        <input name="exInpTitle" type="text" id="exInpTitle" placeholder="Sunucu Bakımı" required />
                    </div>

                    <div className="ex-input-row">
                        <div className="ex-input-group">
                            <label htmlFor="exInpCategory">Kategori</label>
                            <select name="exInpCategory" id="exInpCategory">
                                <option value="Food">Yiyecek ve İçecek</option>
                                <option value="Transport">Ulaşım</option>
                                <option value="Accommodation">Konaklama</option>
                                <option value="Health">Sağlık</option>
                                <option value="Entertainment">Eğlence</option>
                            </select>
                        </div>
                        <div className="ex-input-group">
                            <label htmlFor="exInpMerchant">İşletme</label>
                            <input name="exInpMerchant" type="text" id="exInpMerchant" placeholder="Amazon, Starbucks" />
                        </div>
                    </div>

                    <div className="ex-input-group full">
                        <label htmlFor="exInpMethod">Ödeme Yöntemi</label>
                        <select name="exInpMethod" id="exInpMethod">
                            <option value="Cash">Nakit</option>
                            <option value="Credit Card">Kredi Kartı</option>
                            <option value="Bank Transfer">Banka Transferi</option>
                        </select>
                    </div>

                    <div className="ex-input-group full">
                        <label>Fatura / Belge</label>
                        <div 
                            className="ex-simple-upload" 
                            onClick={() => document.getElementById('exInpReceipt').click()}
                        >
                            <div className="upload-placeholder">
                                <i className="ti ti-file-upload"></i>
                                <span>Fatura Ekle</span>
                            </div>
                            <input type="file" id="exInpReceipt" hidden accept=".pdf, .jpg, .jpeg, .png, .webp" />
                        </div>
                    </div>

                    {/* Amount ve Currency'nin yan yana olduğu özel bir grup */ }
                    <div className="ex-input-group full">
                        <label htmlFor="exInpAmount">Miktar ve Para Birimi</label>
                        <div className="ex-amount-wrapper">
                            <input name="exInpAmount" type="number" id="exInpAmount" placeholder="0.00" step="0.01" required />
                            <select name="exInpCurrency" id="exInpCurrency" className="ex-currency-select">
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="TRY">TRY (₺)</option>
                            </select>
                        </div>
                    </div>

                    {/* Raporlama toggle'ı */ }
                    <div className="report-toggle-wrapper">
                        <span>Aylık rapor eklensin mi?</span>
                        <label className="switch">
                            <input type="checkbox" name="exInpReport" id="exInpReport" defaultChecked />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </form>
            </div>
        </ActionSidebar>
    );
};

export default CreateExpense;