import React, { useState } from 'react';
import './ExportData.css';

const ExportModal = ({ isOpen, onClose }) => {
    const [format, setFormat] = useState('pdf');

    if (!isOpen) return null;

    const handleDownload = () => {
        console.log(`${format} formatında indiriliyor...`);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="export-modal" onClick={(e) => e.stopPropagation()}>

                <div className="ex-header">
                    <div className="ex-title">
                        <div className="ex-title-icon">
                            <i className="ti ti-file-export" />
                        </div>
                        <span>Rapor Oluştur</span>
                    </div>
                    <button className="ex-close" onClick={onClose}>
                        <i className="ti ti-x" />
                    </button>
                </div>

                <div className="ex-body">
                    <div className="ex-document-preview">
                        <div className="ex-doc-header">
                            <span>Flowtera finansal raporu</span>
                            <span>{new Date().toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="doc-line" />
                        <div className="doc-line short" />
                        <div className="doc-line" />
                    </div>

                    <div className="ex-options-grid">
                        {[
                            { value: 'pdf',   icon: 'ti-file-type-pdf',    label: 'PDF Dökümanı' },
                            { value: 'excel', icon: 'ti-file-spreadsheet',  label: 'Excel Sheet'  },
                            { value: 'csv',   icon: 'ti-file-text',         label: 'CSV Dosyası'  },
                        ].map(opt => (
                            <label key={opt.value} className="ex-option">
                                <input
                                    type="radio"
                                    name="exportFormat"
                                    value={opt.value}
                                    checked={format === opt.value}
                                    onChange={(e) => setFormat(e.target.value)}
                                />
                                <div className="ex-option-card">
                                    <i className={`ti ${opt.icon}`} />
                                    <span>{opt.label}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="ex-footer">
                    <button className="ex-btn cancel" onClick={onClose}>İptal</button>
                    <button className="ex-btn download" onClick={handleDownload}>
                        <i className="ti ti-download" /> İndir
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ExportModal;