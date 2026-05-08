import React from 'react';
import { useActionPermissions } from '../../../hooks/useActionPermissions';
import { useCurrency } from '../../../context/CurrencyContext';
import { useModal } from '../../../hooks/useModal';
import Confirm from '../../../components/overlays/Confirm';

const STATUS_MAP = {
    approved:  { label: 'Onaylandı', cls: 'status-approved' },
    confirmed: { label: 'Onaylandı', cls: 'status-confirmed' },
    pending:   { label: 'Beklemede', cls: 'status-pending'   },
    onroad:    { label: 'Yolda',     cls: 'status-onroad'    },
    rejected:  { label: 'Reddedildi',cls: 'status-rejected'  },
};

const TripRow = ({ trip, onOpenDetail, onEdit, onDeleteClick }) => {
    const { canEdit, canDelete }                = useActionPermissions(trip);
    const { convert, selectedCurrency, symbol } = useCurrency();
    const displayAmount                         = convert(trip, selectedCurrency);
    const statusKey                             = trip.statusClass?.toLowerCase() || trip.status?.toLowerCase();
    const statusInfo                            = STATUS_MAP[statusKey] || { label: trip.status, cls: `status-${statusKey}` };

    return (
        <div className="trip-block" onClick={() => onOpenDetail(trip)}>
            <div className="trip-block-details">
                <span className="trip-icon">
                    <i className={`ti ${trip.icon || 'ti-plane-departure'}`} />
                </span>
                <div className="trip-details-text">
                    <span className="trip-date">{trip.date}</span>
                    <span className="trip-title" title={trip.title}>{trip.title}</span>
                </div>
            </div>

            <span className="trip-category">{trip.category}</span>
            <span className="trip-destination">{trip.destination}</span>
            <span className="trip-vehicle">{trip.vehicle}</span>

            <div className="tr-list-amount-wrapper">
                <span className="tr-list-symbol">{symbol}</span>
                <span className="tr-list-amount-val">{(Number(displayAmount) || 0).toFixed(2)}</span>
                <span className="tr-list-currency">{selectedCurrency}</span>
            </div>

            <span className="trip-duration">{trip.duration}</span>

            <span className={`trip-status ${statusInfo.cls}`}>
                {statusInfo.label}
            </span>

            <div className="ex-row-actions">
                {canEdit && (
                    <button
                        className="action-btn edit"
                        onClick={(e) => { e.stopPropagation(); onEdit(e, trip); }}
                        title="Düzenle"
                    >
                        <i className="ti ti-edit" />
                    </button>
                )}
                {canDelete && (
                    <button
                        className="action-btn delete"
                        onClick={(e) => onDeleteClick(e, trip)}
                        title="Sil"
                    >
                        <i className="ti ti-trash" />
                    </button>
                )}
            </div>
        </div>
    );
};

const TripList = ({ data, onOpenDetail, onEdit, onDelete }) => {
    const { confirmConfig, askConfirm, closeConfirm } = useModal();

    const handleDeleteClick = (e, trip) => {
        e.stopPropagation();
        askConfirm(
            'Gezi Kaydını Sil',
            `"${trip.title}" başlıklı gezi kaydını silmek istediğinize emin misiniz?`,
            () => onDelete(e, trip.id),
            'danger'
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