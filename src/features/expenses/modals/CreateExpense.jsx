import React from 'react';
import '../expenses.css/CreateExpense.css';

const CreateExpense = ({ isOpen, onClose }) => {
    const displayDate = new Date().toLocaleDateString('tr-TR');
    // Form submit handler
    const handleSubmit = (e) => {
        e.preventDefault();
        // Form verilerini al
        const formData = new FormData(e.target);
        // Şu an için sadece console.log ile gösteriyoruz, ileride API entegrasyonu yapılacak
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
        // API'ye gönderilecek veriyi konsola yazdır
        console.log("Flowtera API'ye giden veri:", finalExpenseData);
        // OnSave callback'i varsa çağır
        {/ if (onSave) onSave(finalExpenseData); /}
        
        onClose();
    };

    return (
        <div className={`ex-side-panel-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div 
                className={`ex-side-panel-box ${isOpen ? 'open' : ''}`} 
                onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="ex-panel-header">
                    <div className="ex-panel-title">
                        <i className="ti ti-plus"></i>
                        <span>Add New Expense</span>
                    </div>
                    <button className="ex-panel-close-btn" onClick={onClose}>
                        <i className="ti ti-x"></i>
                    </button>
                </div>

                <div className="ex-panel-content">
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
                        {/* Category ve Merchant */}
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
                        {/* Payment Method */}
                        <div className="ex-input-group full">
                            <label htmlFor="exInpMethod">Payment Method</label>
                            <select name="exInpMethod" id="exInpMethod">
                                <option value="Cash">Cash</option>
                                <option value="Credit Card">Credit Card</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                            </select>
                        </div>
                        {/* Dosya Yükleme Alanı */}
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
                        {/* Amount ve Currency */}
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
                        {/* Raporlama Toggle'ı */}
                        <div className="report-toggle-wrapper">
                            <span>Add to Monthly Report?</span>
                            <label className="switch">
                                <input type="checkbox" name="exInpReport" id="exInpReport" defaultChecked />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="ex-panel-footer">
                    <button type="button" className="ex-panel-btn cancel" onClick={onClose}>Cancel</button>
                    <button type="submit" form="newExpenseForm" className="ex-panel-btn save">Create Expense</button>
                </div>
            </div>
        </div>
    );
};

export default CreateExpense;