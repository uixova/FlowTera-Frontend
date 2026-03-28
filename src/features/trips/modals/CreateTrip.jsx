import React from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import '../trips.css/CreateTrip.css'; 

const CreateTrip = ({ isOpen, onClose }) => {
  // Trip Plan Verilerini Kaydetmek İçin Form Submit Handler'ı
  const handleSubmit = (e) => {
    e.preventDefault();

    // Form Verilerini Alıyoruz (Inputlara 'name' ekledik ki FormData çalışsın)
    const formData = new FormData(e.target);
    
    // Veri Paketini Hazırlıyoruz
    const finalTripData = {
      id: `tr-${Math.floor(Math.random() * 10000)}`, 
      title: formData.get('trInpTitle'),
      category: formData.get('trInpCategory'),
      vehicle: formData.get('trInpVehicle'),
      destination: formData.get('trInpDestination'),
      startDate: formData.get('trInpStartDate'), 
      endDate: formData.get('trInpEndDate'),     
      amount: formData.get('trInpCost'),
      currency: formData.get('trInpCurrency'),
      desc: formData.get('trInpDescription'),
      status: "Pending", 
      statusClass: "status-pending",
    };

    console.log("Flowtera API - Trip Plan Ready:", finalTripData);
    
    // İşlem bittiğinde kapat
    onClose();
  };

  // Sidebar başlığı için özel içerik (Icon + Başlık + Alt Başlık)
  const sidebarTitle = (
    <div className="tr-create-title">
      <div className="tr-title-icon">
        <i className="ti ti-plane-arrival"></i>
      </div>
      <div className="tr-title-text">
        <span>Plan New Trip</span>
        <small>Fill in the details to create a route</small>
      </div>
    </div>
  );

  // Footer kısmında iptal ve oluştur butonları
  const sidebarFooter = (
    <div className="tr-create-footer-alt" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
      <button type="button" className="tr-btn-secondary" onClick={onClose}>Cancel</button>
      <button type="submit" form="newTripForm" className="tr-btn-primary" id="trSaveBtn">
        <i className="ti ti-plus"></i>
        Create Trip Plan
      </button>
    </div>
  );

  return (
    <ActionSidebar
      isOpen={isOpen}
      onClose={onClose}
      title={sidebarTitle}
      footer={sidebarFooter}
      width="480px"
    >
      <div className="tr-create-body-internal">
        <form id="newTripForm" className="tr-create-form" onSubmit={handleSubmit}>
          
          <div className="tr-form-section">
            <label className="tr-section-label">General Information</label>
            
            <div className="tr-input-group">
              <label htmlFor="trInpTitle">Trip Purpose</label>
              <div className="tr-input-wrapper">
                  <i className="ti ti-flag"></i>
                  <input name="trInpTitle" type="text" id="trInpTitle" placeholder="e.g. Business Meeting in Berlin" required />
              </div>
            </div>

            {/* Kategori ve Araç Seçimi Yan Yana */ }
            <div className="tr-form-row">
              <div className="tr-input-group">
                <label htmlFor="trInpCategory">Category</label>
                <select name="trInpCategory" id="trInpCategory">
                  <option value="Business">Business</option>
                  <option value="Vacation">Vacation</option>
                  <option value="Event">Event</option>
                </select>
              </div>
              <div className="tr-input-group">
                <label htmlFor="trInpVehicle">Vehicle</label>
                <select name="trInpVehicle" id="trInpVehicle">
                  <option value="Plane">Plane</option>
                  <option value="Train">Train</option>
                  <option value="Car">Car</option>
                  <option value="Bus">Bus</option>
                </select>
              </div>
            </div>

            <div className="tr-input-group">
              <label htmlFor="trInpDestination">Destination</label>
              <div className="tr-input-wrapper">
                  <i className="ti ti-map-pin"></i>
                  <input name="trInpDestination" type="text" id="trInpDestination" placeholder="Berlin, Germany" required />
              </div>
            </div>
          </div>

          <div className="tr-form-section">
            <label className="tr-section-label">Timeline & Budget</label>
            
            <div className="tr-form-row">
              <div className="tr-input-group">
                <label htmlFor="trInpStartDate">Start Date</label>
                <input name="trInpStartDate" type="date" id="trInpStartDate" required />
              </div>
              <div className="tr-input-group">
                <label htmlFor="trInpEndDate">End Date</label>
                <input name="trInpEndDate" type="date" id="trInpEndDate" required />
              </div>
            </div>

            {/* Maliyet ve Para Birimi Girişi */}
            <div className="tr-input-group">
              <label htmlFor="trInpCost">Estimated Cost</label>
              <div className="tr-amount-container">
                <input name="trInpCost" type="number" id="trInpCost" placeholder="0.00" step="0.01" />
                <select name="trInpCurrency" id="trInpCurrency" className="tr-currency-select">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="TRY">TRY (₺)</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Trip Description */}
          <div className="tr-input-group full">
            <label htmlFor="trInpDescription">Trip Description</label>
            <textarea name="trInpDescription" id="trInpDescription" placeholder="Provide detailed info..." required></textarea>
          </div>
        </form>
      </div>
    </ActionSidebar>
  );
};

export default CreateTrip;