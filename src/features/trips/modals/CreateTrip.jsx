import React, { useState, useEffect } from 'react'; 
import './CreateTrip.css'; 
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import { useTimeAgo } from '../../../hooks/useTimeAgo';
import { tripsService } from '../services/tripsService';
import { archiveService } from '../../archive/services/archiveServices';


const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  if (dateStr.includes('-')) return dateStr; 
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month}-${day}`;
};

const CreateTrip = ({ isOpen, onClose, editData, onSuccess }) => {
  const isEditMode = !!editData;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    trInpTitle: '',
    trInpCategory: 'Business',
    trInpVehicle: 'Plane',
    trInpDestination: '',
    trInpStartDate: '',
    trInpEndDate: '',
    trInpCost: '',
    trInpCurrency: 'USD',
    trInpDescription: ''
  });

  // Modal açıldığında veya veri geldiğinde state yönetimi
  useEffect(() => {
    if (isOpen && editData) {
      setFormData({
        trInpTitle: editData.title || '',
        trInpCategory: editData.category || 'Business',
        trInpVehicle: editData.vehicle || 'Plane',
        trInpDestination: editData.destination || '',
        trInpStartDate: formatDateForInput(editData.startDate),
        trInpEndDate: formatDateForInput(editData.endDate),
        trInpCost: editData.amount || '',
        trInpCurrency: editData.currency || 'USD',
        trInpDescription: editData.desc || ''
      });
    } else if (!isOpen) {
      // Modal kapandığında formu sıfırla
      setFormData({
        trInpTitle: '', trInpCategory: 'Business', trInpVehicle: 'Plane',
        trInpDestination: '', trInpStartDate: '', trInpEndDate: '',
        trInpCost: '', trInpCurrency: 'USD', trInpDescription: ''
      });
    }
  }, [isOpen, editData]);

  const timeAgoDisplay = useTimeAgo(editData?.date);

  // Tüm form alanlarındaki değişiklikleri yakalar.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Veriyi paketler ve servise gönderir.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const activeTeamId = localStorage.getItem('tm_selected_id');

    const finalTripData = {
      id: isEditMode ? editData.id : `tr-${Math.floor(Math.random() * 10000)}`,
      teamId: activeTeamId,
      title: formData.trInpTitle,
      category: formData.trInpCategory,
      vehicle: formData.trInpVehicle,
      destination: formData.trInpDestination,
      startDate: formData.trInpStartDate,
      endDate: formData.trInpEndDate,
      amount: Number(formData.trInpCost),
      currency: formData.trInpCurrency,
      desc: formData.trInpDescription,
      status: isEditMode ? editData.status : "Pending",
      statusClass: isEditMode ? editData.statusClass : "pending",
      date: isEditMode ? editData.date : new Date().toLocaleDateString('tr-TR')
    };

    try {
      if (isEditMode) {
        await tripsService.updateTrip(editData.id, finalTripData);
      } else {
        await tripsService.createTrip(finalTripData);
      }
    
      // ARŞİV CACHE TEMİZLEME
      archiveService.clearCache(); 

      if (onSuccess) onSuccess(); 
      onClose(); 
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  

  // Sidebar Başlık Yapısı
  const sidebarTitle = (
    <div className="tr-create-title">
      <div className="tr-title-icon">
        <i className={`ti ${isEditMode ? 'ti-edit' : 'ti-plane-arrival'}`}></i>
      </div>
      <div className="tr-title-text">
        <span>{isEditMode ? 'Gezi Planını Düzenle' : 'Yeni Gezi Planla'}</span>
        <small>{isEditMode ? `Son güncelleme: ${timeAgoDisplay}` : 'Bir rota oluşturmak için detayları doldurun'}</small>
      </div>
    </div>
  );

  // Sidebar Alt Buton Grubu
  const sidebarFooter = (
    <div className="tr-create-footer-alt" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
      <button type="button" className="tr-btn-secondary" onClick={onClose} disabled={isSubmitting}>İptal</button>
      <button type="submit" form="newTripForm" className="tr-btn-primary" disabled={isSubmitting}>
        <i className={`ti ${isEditMode ? 'ti-check' : 'ti-plus'}`}></i>
        {isSubmitting ? 'Kaydediliyor...' : (isEditMode ? 'Güncelle' : 'Gezi Planı Oluştur')}
      </button>
    </div>
  );

  return (
    <ActionSidebar isOpen={isOpen} onClose={onClose} title={sidebarTitle} footer={sidebarFooter} width="480px">
      <div className="tr-create-body-internal">
        <form id="newTripForm" className="tr-create-form" onSubmit={handleSubmit}>
          {/* Form içeriği */}
          <div className="tr-form-section">
            <label className="tr-section-label">Genel Bilgiler</label>
            <div className="tr-input-group">
              <label htmlFor="trInpTitle">Seyahat Amacı</label>
              <div className="tr-input-wrapper">
                  <i className="ti ti-flag"></i>
                  <input name="trInpTitle" type="text" value={formData.trInpTitle} onChange={handleChange} placeholder="İş toplantısı..." required />
              </div>
            </div>

            <div className="tr-form-row">
              <div className="tr-input-group">
                <label htmlFor="trInpCategory">Kategori</label>
                <select name="trInpCategory" value={formData.trInpCategory} onChange={handleChange}>
                  <option value="Business">İş Gezisi</option>
                  <option value="Vacation">Tatil</option>
                  <option value="Event">Etkinlik</option>
                </select>
              </div>
              <div className="tr-input-group">
                <label htmlFor="trInpVehicle">Araç</label>
                <select name="trInpVehicle" value={formData.trInpVehicle} onChange={handleChange}>
                  <option value="Plane">Uçak</option>
                  <option value="Train">Tren</option>
                  <option value="Car">Araba</option>
                  <option value="Bus">Otobüs</option>
                </select>
              </div>
            </div>

            <div className="tr-input-group">
              <label htmlFor="trInpDestination">Varış Noktası</label>
              <div className="tr-input-wrapper">
                  <i className="ti ti-map-pin"></i>
                  <input name="trInpDestination" type="text" value={formData.trInpDestination} onChange={handleChange} placeholder="Berlin, Germany" required />
              </div>
            </div>
          </div>

          <div className="tr-form-section">
            <label className="tr-section-label">Zaman Çizelgesi ve Bütçe</label>
            <div className="tr-form-row">
              <div className="tr-input-group">
                <label htmlFor="trInpStartDate">Başlangıç Tarihi</label>
                <input name="trInpStartDate" type="date" value={formData.trInpStartDate} onChange={handleChange} required />
              </div>
              <div className="tr-input-group">
                <label htmlFor="trInpEndDate">Bitiş Tarihi</label>
                <input name="trInpEndDate" type="date" value={formData.trInpEndDate} onChange={handleChange} required />
              </div>
            </div>

            <div className="tr-input-group">
              <label htmlFor="trInpCost">Tahmini Gider</label>
              <div className="tr-amount-container">
                <input name="trInpCost" type="number" value={formData.trInpCost} onChange={handleChange} placeholder="0.00" step="0.01" />
                <select name="trInpCurrency" value={formData.trInpCurrency} onChange={handleChange} className="tr-currency-select">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="TRY">TRY (₺)</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="tr-input-group full">
            <label htmlFor="trInpDescription">Gezi Açıklaması</label>
            <textarea name="trInpDescription" value={formData.trInpDescription} onChange={handleChange} placeholder="Detaylı bilgi verin..." required></textarea>
          </div>
        </form>
      </div>
    </ActionSidebar>
  );
};

export default CreateTrip;