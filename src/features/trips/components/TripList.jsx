import React from 'react';
import { useActionPermissions } from '../../../hooks/useActionPermissions';
import { useCurrency } from '../../../context/CurrencyContext';
import { useModal } from '../../../hooks/useModal';
import Confirm from '../../../components/modals/Confirm';

// onDeleteClick prop'unu buraya eklemeyi unutmuşuz!
const TripRow = ({ trip, onOpenDetail, onEdit, onDeleteClick }) => {
    const { canEdit, canDelete } = useActionPermissions(trip);
    const { convert, selectedCurrency, symbol } = useCurrency();
        const displayAmount = convert(trip, selectedCurrency);

    return (
        <div className="trip-block" onClick={() => onOpenDetail(trip)}>
            <div className="trip-block-details">
                <span className="trip-icon"><i className={`ti ${trip.icon}`}></i></span>
                <div className="trip-details-text">
                    <span className="trip-date">{trip.date}</span>
                    <span className="trip-title">{trip.title}</span>
                </div>
            </div>
            <span className="trip-category">{trip.category}</span>
            <span className="trip-destination">{trip.destination}</span>
            <span className="trip-vehicle">{trip.vehicle}</span>
            <div className="tr-list-amount-wrapper">
                <span className="tr-list-symbol">{symbol}</span>
                <span className="tr-list-amount-val">{Number(displayAmount).toFixed(2)}</span>
                <span className="tr-list-currency">{selectedCurrency}</span>
            </div>
            <span className="trip-duration">{trip.duration}</span>
            <span className={`trip-status status-${trip.statusClass?.toLowerCase()}`}>{trip.status}</span>

            <div className="ex-row-actions">
                {canEdit && (
                    <button className="action-btn edit" onClick={(e) => onEdit(e, trip)}>
                        <i className="ti ti-edit"></i>
                    </button>
                )}
                {canDelete && (
                    <button className="action-btn delete" onClick={(e) => onDeleteClick(e, trip)}>
                        <i className="ti ti-trash"></i>
                    </button>
                )}
            </div>
        </div>
    );
};

const TripList = ({ data, onOpenDetail, onEdit, onDelete }) => {
    const { confirmConfig, askConfirm, closeConfirm } = useModal();

    const handleDeleteClick = (e, trip) => {
        // Tıklamanın satıra (detay paneline) yayılmasını engeller
        e.stopPropagation(); 
        
        askConfirm(
            "Gezi Kaydını Sil",
            `"${trip.title}" başlıklı gezi kaydını silmek istediğinize emin misiniz?`,
            () => onDelete(e, trip.id), 
            "danger"
        );
    };

    return (
        <div className="trip-list-container">
            {data.map((trip) => (
                <TripRow 
                    key={trip.id} 
                    trip={trip} 
                    onOpenDetail={onOpenDetail} 
                    onEdit={onEdit} 
                    onDeleteClick={handleDeleteClick} 
                />
            ))}

            <Confirm {...confirmConfig} onClose={closeConfirm} />
        </div>
    );
};

export default TripList;