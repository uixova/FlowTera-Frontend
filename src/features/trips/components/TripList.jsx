import React from 'react';
import { useActionPermissions } from '../../../hooks/useActionPermissions';
import { useCurrency } from '../../../context/CurrencyContext';

const TripRow = ({ trip, onOpenDetail, onEdit, onDelete }) => {
    const { canEdit, canDelete } = useActionPermissions(trip);
    const { convertAmount, selectedCurrency, symbol } = useCurrency();

    const displayAmount = convertAmount(trip);

    return (
        <div className="trip-block" onClick={() => onOpenDetail(trip)}>
            <input type="checkbox" onClick={(e) => e.stopPropagation()} />
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
                    <button className="action-btn delete" onClick={(e) => onDelete(e, trip.id)}>
                        <i className="ti ti-trash"></i>
                    </button>
                )}
            </div>
        </div>
    );
};

const TripList = ({ data, onOpenDetail, onEdit, onDelete }) => {
    return (
        <div className="trip-list-container">
            {data.map((trip) => (
                <TripRow 
                    key={trip.id} 
                    trip={trip} 
                    onOpenDetail={onOpenDetail} 
                    onEdit={onEdit} 
                    onDelete={onDelete} 
                />
            ))}
        </div>
    );
};

export default TripList;