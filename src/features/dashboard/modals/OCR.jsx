import React, { useState, useRef, useEffect } from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import './OCR.css';

const OCRSidebar = ({ isOpen, onClose }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [currency, setCurrency] = useState('TRY');
    const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
    const [category, setCategory] = useState('Yemekler ve Eğlence');
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    
    // Yukarı açılma kontrolü için state'ler
    const [currencyUp, setCurrencyUp] = useState(false);
    const [categoryUp, setCategoryUp] = useState(false);

    const currencyRef = useRef(null);
    const categoryRef = useRef(null);

    const currencyOptions = ['TRY', 'USD', 'EUR', 'GBP'];
    const categoryOptions = [
        'Yemekler ve Eğlence', 'Seyahat', 'Ofis Malzemeleri', 
        'Yazılım & Lisans', 'Ulaşım', 'Pazarlama', 'Kira & Altyapı'
    ];

    // Optimize edilmiş hızlı pozisyon kontrolü
    const checkSpace = (ref, setter) => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            setter(spaceBelow < 220); // 220px güvenli sınır
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (currencyRef.current && !currencyRef.current.contains(event.target)) setIsCurrencyOpen(false);
            if (categoryRef.current && !categoryRef.current.contains(event.target)) setIsCategoryOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setSelectedImage(URL.createObjectURL(file));
    };

    const footer = selectedImage && (
        <button className="st-btn-save" style={{ width: '100%' }}>
            <i className="ti ti-check"></i> Onayla ve Kaydet
        </button>
    );

    return (
        <ActionSidebar
            isOpen={isOpen}
            onClose={onClose}
            title={<h2 className="ocr-sidebar-title">Akıllı OCR Tarama</h2>}
            footer={footer}
            width="520px"
        >
            <div className="ocr-wrapper">
                {!selectedImage ? (
                    <div className="ocr-dropzone hm-card-style" onClick={() => document.getElementById('ocr-file').click()}>
                        <input type="file" id="ocr-file" hidden onChange={handleFileChange} accept="image/*" />
                        <i className="ti ti-cloud-upload"></i>
                        <h3 className="dropzone-title">Fişinizi buraya bırakın ya da <span>göz atın</span></h3>
                        <small className="dropzone-subtitle">JPG, PNG veya PDF (Max 5MB)</small>
                    </div>
                ) : (
                    <div className="ocr-preview-container hm-card-style">
                        <img src={selectedImage} alt="Receipt Preview" />
                        <button className="ocr-remove-btn" onClick={() => setSelectedImage(null)}>
                            <i className="ti ti-trash"></i> Yeniden Yükle
                        </button>
                    </div>
                )}

                <div className="ocr-info-banner hm-card-style">
                    <div className="ocr-banner-icon"><i className="ti ti-sparkles"></i></div>
                    <span>Yapay zeka verileri otomatik olarak çıkardı. Lütfen kontrol edin.</span>
                </div>

                {selectedImage && (
                    <div className="ocr-results-form hm-card-style">
                        <div className="st-form-grid">
                            <div className="st-input-group full-width">
                                <label>İşletme / Mağaza</label>
                                <div className="input-wrapper">
                                    <i className="ti ti-building-store input-icon"></i>
                                    <input type="text" defaultValue="Starbucks Coffee" />
                                </div>
                            </div>

                            <div className="st-input-group">
                                <label>Toplam Tutar</label>
                                <div className="input-wrapper">
                                    <i className="ti ti-receipt-2 input-icon"></i>
                                    <input type="number" defaultValue="14.50" />
                                </div>
                            </div>

                            {/* Para Birimi Dropdown */}
                            <div className="st-input-group" ref={currencyRef}>
                                <label>Para Birimi</label>
                                <div className="custom-select-wrapper">
                                    <i className="ti ti-currency-dollar input-icon"></i>
                                    <div className={`custom-select-box ${isCurrencyOpen ? 'active' : ''}`} 
                                         onClick={() => { checkSpace(currencyRef, setCurrencyUp); setIsCurrencyOpen(!isCurrencyOpen); }}>
                                        <span className="selected-value">{currency}</span>
                                        <i className="ti ti-chevron-down arrow-icon"></i>
                                    </div>
                                    <div className={`custom-dropdown-list custom-scroll ${isCurrencyOpen ? 'show' : ''} ${currencyUp ? 'open-up' : ''}`}>
                                        {currencyOptions.map(opt => (
                                            <div key={opt} className={`dropdown-item ${currency === opt ? 'selected' : ''}`} 
                                                 onClick={() => { setCurrency(opt); setIsCurrencyOpen(false); }}>
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="st-input-group">
                                <label>İşlem Tarihi</label>
                                <div className="input-wrapper">
                                    <i className="ti ti-calendar input-icon"></i>
                                    <input type="date" defaultValue="2026-03-30" />
                                </div>
                            </div>

                            {/* Kategori Dropdown */}
                            <div className="st-input-group" ref={categoryRef}>
                                <label>Kategori</label>
                                <div className="custom-select-wrapper">
                                    <i className="ti ti-category input-icon"></i>
                                    <div className={`custom-select-box ${isCategoryOpen ? 'active' : ''}`} 
                                         onClick={() => { checkSpace(categoryRef, setCategoryUp); setIsCategoryOpen(!isCategoryOpen); }}>
                                        <span className="selected-value">{category}</span>
                                        <i className="ti ti-chevron-down arrow-icon"></i>
                                    </div>
                                    <div className={`custom-dropdown-list custom-scroll ${isCategoryOpen ? 'show' : ''} ${categoryUp ? 'open-up' : ''}`}>
                                        {categoryOptions.map(opt => (
                                            <div key={opt} className={`dropdown-item ${category === opt ? 'selected' : ''}`} 
                                                 onClick={() => { setCategory(opt); setIsCategoryOpen(false); }}>
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ActionSidebar>
    );
};

export default OCRSidebar;