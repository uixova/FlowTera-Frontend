import React from 'react';
import '../trips.css/CreateTrip.css'; 

const CreateTrip = ({ isOpen, onClose }) => {
  // Trip Plan Verilerini Kaydetmek İçin Form Submit Handler'ı
  const handleSubmit = (e) => {
    e.preventDefault();

    // Form Verilerini Alıyoruz
    const formData = new FormData(e.target);
    
    // Veri Paketini Hazırlıyoruz
    const finalTripData = {
      id: `tr-${Math.floor(Math.random() * 10000)}`, 
      title: formData.get('trInpTitle'),
      category: formData.get('trInpCategory'),
      vehicle: formData.get('trInpVehicle'),
      destination: formData.get('trInpDestination'),
      startDate: formData.get('trInpStartDate'), // Kullanıcının seçtiği tarih
      endDate: formData.get('trInpEndDate'),     // Kullanıcının seçtiği tarih
      amount: formData.get('trInpCost'),
      currency: formData.get('trInpCurrency'),
      desc: formData.get('trInpDescription'),
      status: "Pending", // Yeni plan her zaman Pending başlar
      statusClass: "status-pending",
      // Backend tarafında otomatik tarih eklenecek buraya sadece data gidiyor
    };

    console.log("Flowtera API - Trip Plan Ready:", finalTripData);
    
    // if (onSave) onSave(finalTripData);

    onClose();
  };

  return (
    <div className={`tr-create-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className={`tr-create-panel ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="tr-create-header">
          <div className="tr-create-title">
            <div className="tr-title-icon">
              <i className="ti ti-plane-arrival"></i>
            </div>
            <div className="tr-title-text">
              <span>Plan New Trip</span>
              <small>Fill in the details to create a route</small>
            </div>
          </div>
          <button className="tr-create-close" onClick={onClose}>
            <i className="ti ti-x"></i>
          </button>
        </div>

        {/* Body / Form */}
        <div className="tr-create-body">
          <form id="newTripForm" className="tr-create-form" onSubmit={handleSubmit}>
            
            <div className="tr-form-section">
              <label className="tr-section-label">General Information</label>
              {/* Trip Amacı, Kategori, Araç Türü, Varış Noktası */}
              <div className="tr-input-group">
                <label htmlFor="trInpTitle">Trip Purpose</label>
                <div className="tr-input-wrapper">
                   <i className="ti ti-flag"></i>
                   <input type="text" id="trInpTitle" placeholder="e.g. Business Meeting in Berlin" required />
                </div>
              </div>

              {/* Kategori, Araç Türü, Varış Noktası - İki Sütunlu Düzen */ }
              <div className="tr-form-row">
                <div className="tr-input-group">
                  <label htmlFor="trInpCategory">Category</label>
                  <select id="trInpCategory">
                    <option value="Business">Business</option>
                    <option value="Vacation">Vacation</option>
                    <option value="Event">Event</option>
                  </select>
                </div>
                <div className="tr-input-group">
                  <label htmlFor="trInpVehicle">Vehicle</label>
                  <select id="trInpVehicle">
                    <option value="Plane">Plane</option>
                    <option value="Train">Train</option>
                    <option value="Car">Car</option>
                    <option value="Bus">Bus</option>
                  </select>
                </div>
              </div>

              {/* Varış Noktası */}
              <div className="tr-input-group">
                <label htmlFor="trInpDestination">Destination</label>
                <div className="tr-input-wrapper">
                   <i className="ti ti-map-pin"></i>
                   <input type="text" id="trInpDestination" placeholder="Berlin, Germany" required />
                </div>
              </div>
            </div>

            <div className="tr-form-section">
              <label className="tr-section-label">Timeline & Budget</label>
              
              {/* Başlangıç ve Bitiş Tarihi - İki Sütunlu Düzen */ }
              <div className="tr-form-row">
                <div className="tr-input-group">
                  <label htmlFor="trInpStartDate">Start Date</label>
                  <input type="date" id="trInpStartDate" required />
                </div>
                <div className="tr-input-group">
                  <label htmlFor="trInpEndDate">End Date</label>
                  <input type="date" id="trInpEndDate" required />
                </div>
              </div>

              {/* Tutar ve Kur Bilgisi */}
              <div className="tr-input-group">
                <label htmlFor="trInpCost">Estimated Cost</label>
                <div className="tr-amount-container">
                  <input type="number" id="trInpCost" placeholder="0.00" step="0.01" />
                  <select id="trInpCurrency" className="tr-currency-select">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="TRY">TRY (₺)</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Trip Açıklaması */}
            <div className="tr-input-group full">
              <label htmlFor="trInpDescription">Trip Description</label>
              <textarea id="trInpDescription" placeholder="Provide detailed info about the trip goals, stay, etc..." required></textarea>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="tr-create-footer">
          <button className="tr-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="tr-btn-primary" id="trSaveBtn">
            <i className="ti ti-plus"></i>
            Create Trip Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;