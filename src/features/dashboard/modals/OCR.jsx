import React, { useState } from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import '../dashboard.css/OCR.css';

const OCRSidebar = ({ isOpen, onClose }) => {
    const [selectedImage, setSelectedImage] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(URL.createObjectURL(file));
        }
    };

    const footer = selectedImage && (
        <button className="st-btn-save" style={{ width: '100%' }}>
            Confirm & Save Expense
        </button>
    );

    return (
        <ActionSidebar
            isOpen={isOpen}
            onClose={onClose}
            title={<h2>Smart OCR Scan</h2>}
            footer={footer}
            width="520px"
        >
            <div className="ocr-wrapper">
                {/* Yükleme Alanı */}
                {!selectedImage ? (
                    <div className="ocr-dropzone" onClick={() => document.getElementById('ocr-file').click()}>
                        <input type="file" id="ocr-file" hidden onChange={handleFileChange} accept="image/*" />
                        <i className="ti ti-cloud-upload"></i>
                        <p>Drop your receipt here or <span>browse</span></p>
                        <small>Supports JPG, PNG, PDF (Max 5MB)</small>
                    </div>
                ) : (
                    <div className="ocr-preview-container">
                        <img src={selectedImage} alt="Receipt Preview" />
                        <button className="ocr-remove-btn" onClick={() => setSelectedImage(null)}>
                            <i className="ti ti-trash"></i> Retake
                        </button>
                    </div>
                )}

                <div className="ocr-info-banner">
                    <i className="ti ti-sparkles"></i>
                    <span>AI is scanning your receipt to extract data automatically.</span>
                </div>

                {/* Görsel Yüklendiyse Çıkan Veriler */}
                {selectedImage && (
                    <div className="ocr-results-form st-form-grid">
                        <div className="st-input-group full-width">
                            <label>Merchant / Store</label>
                            <input type="text" defaultValue="Starbucks Coffee" />
                        </div>
                        <div className="st-input-group">
                            <label>Total Amount</label>
                            <input type="text" defaultValue="14.50" />
                        </div>
                        <div className="st-input-group">
                            <label>Currency</label>
                            <input type="text" defaultValue="USD" />
                        </div>
                        <div className="st-input-group">
                            <label>Date</label>
                            <input type="date" defaultValue="2026-03-30" />
                        </div>
                        <div className="st-input-group">
                            <label>Category</label>
                            <select className="st-select">
                                <option>Meals & Entertainment</option>
                                <option>Travel</option>
                                <option>Office Supplies</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </ActionSidebar>
    );
};

export default OCRSidebar;