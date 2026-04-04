import React, { useState } from 'react';
import '../analysis.css/ExportData.css'

const ExportModal = ({ isOpen, onClose }) => {
  const [format, setFormat] = useState('pdf');

  if (!isOpen) return null;

  {/* İndirme işlemi için örnek bir fonksiyon */}
  const handleDownload = () => {
    console.log(`${format} formatında indiriliyor...`);
    // İndirme mantığı buraya gelecek
    onClose();
  };

  return (
    <div className="modal-overlay" id="exportModalOverlay" onClick={onClose}>
      <div className="export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ex-header">
          <div className="ex-title">
            <i className="ti ti-file-export"></i>
            <span>Rapor Oluştur</span>
          </div>
          <button className="ex-close" onClick={onClose}>
            <i className="ti ti-x"></i>
          </button>
        </div>

        <div className="ex-body">
          {/* İhracat edilecek verinin önizlemesi */}
          <div className="ex-document-preview">
            <div className="ex-doc-header">
              <p>Flowtera finansal raporu</p>
              <span id="exCurrentDate">{new Date().toLocaleDateString('tr-TR')}</span>
            </div>
            <div className="ex-doc-content">
              <div className="doc-line"></div>
              <div className="doc-line short"></div>
              <div className="doc-line"></div>
            </div>
          </div>
          {/* İhracat formatı seçenekleri */}
          <div className="ex-options-grid">
            <label className="ex-option">
              <input 
                type="radio" 
                name="exportFormat" 
                value="pdf" 
                checked={format === 'pdf'} 
                onChange={(e) => setFormat(e.target.value)} 
              />
              <div className="ex-option-card">
                <i className="ti ti-file-type-pdf"></i>
                <span>PDF Dökümanı</span>
              </div>
            </label>
            <label className="ex-option">
              <input 
                type="radio" 
                name="exportFormat" 
                value="excel" 
                checked={format === 'excel'} 
                onChange={(e) => setFormat(e.target.value)} 
              />
              <div className="ex-option-card">
                <i className="ti ti-file-spreadsheet"></i>
                <span>Excel Sheet</span>
              </div>
            </label>
            <label className="ex-option">
              <input 
                type="radio" 
                name="exportFormat" 
                value="csv" 
                checked={format === 'csv'} 
                onChange={(e) => setFormat(e.target.value)} 
              />
              <div className="ex-option-card">
                <i className="ti ti-file-text"></i>
                <span>CSV Dosyası</span>
              </div>
            </label>
          </div>
        </div>

        {/* İndirme ve iptal butonları */}
        <div className="ex-footer">
          <button className="ex-btn cancel" onClick={onClose}>Cancel</button>
          <button className="ex-btn download" onClick={handleDownload}>
            <i className="ti ti-download"></i> İndir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;