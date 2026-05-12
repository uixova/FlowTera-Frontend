import React from 'react';
import ImageBox from '../../../components/overlays/imageBox/ImageBox';

// Status string'ini normalize eder — "On Road" → "onroad"
const normalizeStatus = (status = '') =>
    status.toLowerCase().replace(/\s+/g, '');

const ArchiveGrid = ({ items, symbol }) => (
    <div className="arc-grid">
        {items.map(item => {
            const statusClass = normalizeStatus(item.status);
            const isExpense   = item._type === 'expense';
            const icon        = item.icon ? `ti ${item.icon}` : (isExpense ? 'ti ti-credit-card' : 'ti ti-plane-departure');

            return (
                <div key={item.id} className={`arc-card status-${statusClass}`}>

                    {/* Görsel — ImageBox ile lightbox'a bağlı */}
                    <div className="arc-card-image">
                        <span className={`arc-type-badge ${item._type}`}>
                            {isExpense ? 'Harcama' : 'Seyahat'}
                        </span>

                        {item.image ? (
                            <ImageBox src={item.image} alt={item.title}>
                                <img src={item.image} alt={item.title} loading="lazy" />
                            </ImageBox>
                        ) : (
                            <div className="arc-card-image-placeholder">
                                <i className={icon} />
                            </div>
                        )}
                    </div>

                    {/* Kart gövdesi */}
                    <div className="arc-card-body">
                        <div className="arc-card-top">
                            <span className="arc-card-title">{item.title}</span>
                            <span className="arc-card-amount">
                                {item.currencySymbol || symbol}{item.amount?.toLocaleString('tr-TR')}
                            </span>
                        </div>

                        <div className="arc-card-meta">
                            <span className="arc-card-category">
                                {item.category}
                            </span>
                            {/* Seyahatlerde destinasyon göster */}
                            {item.destination && (
                                <span className="arc-card-category">
                                    <i className="ti ti-map-pin" style={{ fontSize: '0.6rem', marginRight: '2px' }} />
                                    {item.destination}
                                </span>
                            )}
                            {/* Harcamalarda merchant göster */}
                            {item.merchant && (
                                <span className="arc-card-category">{item.merchant}</span>
                            )}
                        </div>

                        <div className="arc-card-footer">
                            <span className="arc-card-user">
                                <i className="ti ti-user" />
                                {item.createdBy?.name ?? item.user ?? '—'}
                            </span>
                            <span className="arc-card-date">{item.date}</span>
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
);

export default ArchiveGrid;