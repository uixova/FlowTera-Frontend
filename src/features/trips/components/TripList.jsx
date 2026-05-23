import React, { useCallback, memo, useMemo } from 'react';
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

const TripRow = memo(({ trip, onOpenDetail, onEdit }) => {
    const { canEdit } = useActionPermissions(trip);
    const { convert, selectedCurrency, symbol } = useCurrency();
    
    const displayAmount = useMemo(() => convert(trip, selectedCurrency), [trip, selectedCurrency, convert]);
    
    const statusKey = trip.statusClass?.toLowerCase() || trip.status?.toLowerCase();
    const statusInfo = useMemo(() => 
        STATUS_MAP[statusKey] || { label: trip.status, cls: `status-${statusKey}` }, 
        [statusKey, trip.status]
    );
    const isPending = statusKey === 'pending';

    const handleRowClick = useCallback((e) => {
        if (isPending && canEdit) {
            onEdit(e, trip);
        } else {
            onOpenDetail(trip);
        }
    }, [isPending, canEdit, trip, onEdit, onOpenDetail]);

    const handleEditClick = useCallback((e) => {
        e.stopPropagation();
        onEdit(e, trip);
    }, [trip, onEdit]);

    return (
        <div className="trip-block" onClick={handleRowClick}>
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

            <span className={`trip-status ${statusInfo.cls}`} title={statusInfo.label}>
                <span className="status-text">{statusInfo.label}</span>
                <span className="status-icon">
                    {statusInfo.cls.includes('approved') || statusInfo.cls.includes('confirmed') ? (
                        <i className="ti ti-circle-check" />
                    ) : statusInfo.cls.includes('pending') ? (
                        <i className="ti ti-clock" />
                    ) : statusInfo.cls.includes('onroad') ? (
                        <i className="ti ti-route" />
                    ) : (
                        <i className="ti ti-circle-x" />
                    )}
                </span>
            </span>

            <div className="ex-row-actions">
                {canEdit && isPending && (
                    <button
                        className="action-btn edit"
                        onClick={handleEditClick}
                        title="Düzenle"
                    >
                        <i className="ti ti-edit" />
                    </button>
                )}
            </div>
        </div>
    );
});

TripRow.displayName = 'TripRow';

const TripList = memo(({ data, onOpenDetail, onEdit, onDelete }) => {
    const { confirmConfig, askConfirm, closeConfirm } = useModal();

    const handleDeleteClick = useCallback((e, trip) => {
        e.stopPropagation();
        askConfirm(
            'Gezi Kaydını Sil',
            `"${trip.title}" başlıklı gezi kaydını silmek istediğinize emin misiniz?`,
            () => onDelete(e, trip.id),
            'danger'
        );
    }, [askConfirm, onDelete]);

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
});

TripList.displayName = 'TripList';

export default TripList;
