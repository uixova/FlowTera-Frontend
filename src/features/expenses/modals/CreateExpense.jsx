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
        console.log("Flowtera API'ye giden veri:", finalExpenseData);
        
        // Modal'ı kapat
        onClose();
    };

    // Sidebar başlığı için özel içerik (Icon + Başlık)
    const sidebarTitle = (
        <div className="ex-panel-title">
            <i className="ti ti-plus"></i>
            <span>Add New Expense</span>
        </div>
    );

    // Footer kısmında iptal ve oluştur butonları
    const sidebarFooter = (
        <div className="ex-panel-footer-alt" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
            <button type="button" className="ex-panel-btn cancel" onClick={onClose}>Cancel</button>
            <button type="submit" form="newExpenseForm" className="ex-panel-btn save">Create Expense</button>
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
                        <span>Status: Pending</span>
                    </div>
                </div>

                <form id="newExpenseForm" onSubmit={handleSubmit} className="ex-panel-form">
                    <div className="ex-input-group full">
                        <label htmlFor="exInpTitle">Detail / Title</label>
                        <input name="exInpTitle" type="text" id="exInpTitle" placeholder="e.g. Server Maintenance" required />
                    </div>

                    <div className="ex-input-row">
                        <div className="ex-input-group">
                            <label htmlFor="exInpCategory">Category</label>
                            <select name="exInpCategory" id="exInpCategory">
                                <option value="Food">Food & Drink</option>
                                <option value="Transport">Transport</option>
                                <option value="Accommodation">Accommodation</option>
                                <option value="Health">Health</option>
                                <option value="Entertainment">Entertainment</option>
                            </select>
                        </div>
                        <div className="ex-input-group">
                            <label htmlFor="exInpMerchant">Merchant</label>
                            <input name="exInpMerchant" type="text" id="exInpMerchant" placeholder="Amazon, Starbucks" />
                        </div>
                    </div>

                    <div className="ex-input-group full">
                        <label htmlFor="exInpMethod">Payment Method</label>
                        <select name="exInpMethod" id="exInpMethod">
                            <option value="Cash">Cash</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                    </div>

                    <div className="ex-input-group full">
                        <label>Receipt / Document</label>
                        <div 
                            className="ex-simple-upload" 
                            onClick={() => document.getElementById('exInpReceipt').click()}
                        >
                            <div className="upload-placeholder">
                                <i className="ti ti-file-upload"></i>
                                <span>Upload Receipt</span>
                            </div>
                            <input type="file" id="exInpReceipt" hidden accept=".pdf, .jpg, .jpeg, .png, .webp" />
                        </div>
                    </div>

                    {/* Amount ve Currency'nin yan yana olduğu özel bir grup */ }
                    <div className="ex-input-group full">
                        <label htmlFor="exInpAmount">Amount & Currency</label>
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
                        <span>Add to Monthly Report?</span>
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