import React from 'react';
import '../trips.css/TripDetail.css';

const TripDetail = ({ isOpen, onClose, data }) => {
    // Stage 6: Veri yoksa veya kapalıysa sessizce null dön
    if (!data) return null;

    return (
        <div className={`tr-side-panel-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className={`tr-side-panel-box ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                
                {/* Üst Görsel / Banner Alanı */}
                <div className="tr-panel-header-image">
                    <img 
                        src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=2070&auto=format&fit=crop" 
                        alt="destination" 
                    />
                    <button className="tr-panel-close-btn" onClick={onClose}>
                        <i className="ti ti-x"></i>
                    </button>
                </div>

                <div className="tr-panel-content">
                    {/* Başlık Bölümü */}
                    <div className="tr-panel-title-section">
                        <div className="tr-type-icon">
                            <i className={`ti ${data.icon || 'ti-map-pin'}`}></i>
                        </div>
                        <div className="tr-title-text">
                            <h3>{data.title}</h3>
                            <span className="tr-panel-category">{data.category} • {data.date}</span>
                        </div>
                    </div>

                    {/* Tutar ve Kur Bilgisi (Stats Grid) */}
                    <div className="tr-panel-stats-grid">
                        <div className="tr-stat-item">
                            <label>Estimated Cost</label>
                            <div className="tr-amount-section">
                                <strong>{data.amount} {data.currency}</strong>
                                {data.exchangeRate && (
                                    <span className="tr-currency-freeze">
                                        Rate: 1 {data.currency} = {data.exchangeRate.rate} TRY
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="tr-stat-item">
                            <label>Current Status</label>
                            <span className={`tr-status-badge ${data.statusClass || 'pending'}`}>
                                {data.status}
                            </span>
                        </div>
                    </div>

                    <hr className="tr-divider" />

                    {/* Detay Listesi */}
                    <div className="tr-detail-row">
                        <span><i className="ti ti-map-2"></i> Destination</span>
                        <p>{data.destination}</p>
                    </div>

                    <div className="tr-detail-row">
                        <span><i className="ti ti-car"></i> Vehicle & Duration</span>
                        <p>{data.vehicle} • {data.duration}</p>
                    </div>

                    <div className="tr-detail-row">
                        <span><i className="ti ti-notes"></i> Trip Description</span>
                        <p className="tr-desc-text">
                            {data.desc || "No additional notes for this trip."}
                        </p>
                    </div>

                    <div className="tr-detail-row">
                        <span><i className="ti ti-fingerprint"></i> Reference ID</span>
                        <p>#{data.id?.toUpperCase() || "TRP-UNKNOWN"}</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="tr-panel-footer">
                    <button className="tr-action-btn primary">
                        <i className="ti ti-edit"></i> Edit Trip Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TripDetail;