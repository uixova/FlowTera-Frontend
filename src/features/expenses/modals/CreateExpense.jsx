import React from 'react'; 
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import '../expenses.css/CreateExpense.css';

const CreateExpense = ({ isOpen, onClose, editData, onSuccess }) => {
    // Eğer editData varsa 'Güncelle', yoksa 'Oluştur' modundayız
    const isEdit = !!editData;
    const displayDate = editData ? editData.date : new Date().toLocaleDateString('tr-TR');

    // Form submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const now = new Date(); 

        const finalExpenseData = {
            title: formData.get('exInpTitle'),
            category: formData.get('exInpCategory'),
            merchant: formData.get('exInpMerchant'),
            // Select name ile uyumlu olduğundan emin ol
            paymentMethod: formData.get('exInpMethod'), 
            amount: formData.get('exInpAmount'), 
            currency: formData.get('exInpCurrency'),
            isReported: e.target.exInpReport.checked,
            
            id: isEdit ? editData.id : `exp-${Math.floor(Math.random() * 10000)}`,
            status: isEdit ? editData.status : "Pending", // Status'ü koru
            timestamp: isEdit ? editData.timestamp : now.toISOString(),
            date: isEdit ? editData.date : now.toLocaleDateString('tr-TR'),
            desc: isEdit ? editData.desc : "New expense entry via Flowtera UI",
            icon: isEdit ? editData.icon : "ti-receipt"
        };

        console.log("Final Data:", finalExpenseData);
        // İşlem bitince
        if(onSuccess) onSuccess();
        onClose();
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
            <button type="button" className="ex-panel-btn cancel" onClick={onClose}>İptal Et</button>
            <button type="submit" form="newExpenseForm" className="ex-panel-btn save">
                {isEdit ? 'Değişiklikleri Kaydet' : 'Gider Oluştur'}
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
                            key={editData?.id} // Veri değiştiğinde select'in re-render olması için gerekli
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
                            className="ex-simple-upload" 
                            onClick={() => document.getElementById('exInpReceipt').click()}
                        >
                            <div className="upload-placeholder">
                                <i className="ti ti-file-upload"></i>
                                <span>{isEdit && editData.receipt ? 'Dosyayı Değiştir' : 'Fatura Ekle'}</span>
                            </div>
                            <input type="file" id="exInpReceipt" hidden accept=".pdf, .jpg, .jpeg, .png, .webp" />
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