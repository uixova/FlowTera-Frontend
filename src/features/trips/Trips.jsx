import React, { useEffect, useState } from 'react'; 
import Loader from '../../components/common/Loader';
import './trips.css/Trips.css';
import SubNavbar from '../../components/navigation/SubNavbar'; 
import CreateTrip from './modals/CreateTrip';
import TripDetail from './modals/TripDetail';
import CurrencyModal from '../../components/modals/CurrencyModal';
import PaginationFooter from '../../components/common/PaginationFooter';

// Servis ve Hook importları
import { tripsService } from './services/tripsService'; 
import { usePagination } from '../../hooks/usePagination';

const Trips = () => {
    // UI STATELERİ
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        return sessionStorage.getItem('selectedCurrency') || 'USD';
    });

    // VERİ YÖNETİMİ (HOOK)
    const [activeTeamId, setActiveTeamId] = useState(() => localStorage.getItem('tm_selected_id'));

    useEffect(() => {
        const syncSelectedTeam = () => {
            const nextTeamId = localStorage.getItem('tm_selected_id');
            setActiveTeamId(prevTeamId =>
                String(prevTeamId || '') === String(nextTeamId || '') ? prevTeamId : nextTeamId
            );
        };

        window.addEventListener('teamChanged', syncSelectedTeam);
        window.addEventListener('storage', syncSelectedTeam);

        return () => {
            window.removeEventListener('teamChanged', syncSelectedTeam);
            window.removeEventListener('storage', syncSelectedTeam);
        };
    }, []);
    
    // tripsService.getTripsByTeam'i hook'a bağlıyoruz.
    const { 
        data: trips, 
        loading, 
        loadingMore, 
        hasMore, 
        loadMore,
        totalCount
    } = usePagination(tripsService.getTripsByTeam, activeTeamId, 20);

    // YARDIMCI FONKSİYONLAR 
    const handleOpenDetail = (trip) => {
        setSelectedTrip(trip);
        setIsDetailOpen(true);
    };

    const handleCurrencySelect = (currencyCode) => {
        setSelectedCurrency(currencyCode);
        sessionStorage.setItem('selectedCurrency', currencyCode);
    };

    if (loading) return <Loader type="butterfly" />;

    return (
        <div className="trips" id="trips">
            <div className="trip-page" id="tripsPage">
                <SubNavbar 
                    pageName="Trips & Travels"
                    searchPlaceholder="Search trips..."
                    showCurrency={true}
                    createLabel="New Trips"
                    onCreate={() => setIsCreateOpen(true)}
                    buttons={[
                        { 
                            icon: 'ti ti-coins', 
                            label: selectedCurrency, 
                            onClick: () => setIsCurrencyOpen(!isCurrencyOpen) 
                        },
                        { icon: 'ti ti-filter', tooltip: 'Filter' }
                    ]}
                />
                
                <hr className="sub-nav-divider" />

                <div className="trip-title-nav">
                    <input type="checkbox" id="selectAllTrips" />
                    <span className="tr-title-span">Trip Details</span>
                    <span className="tr-title-span">Category</span>
                    <span className="tr-title-span">Destination</span>
                    <span className="tr-title-span">Vehicle</span>
                    <span className="tr-title-span">Est. Cost</span>
                    <span className="tr-title-span">Duration</span>
                    <span className="tr-title-span">Status</span>
                </div>
                
                {/* Trip Listesi */}
                <div className="trip-list-container">
                    {trips.length > 0 ? (
                        <>
                            {trips.map((trip) => (
                                <div key={trip.id} className="trip-block" onClick={() => handleOpenDetail(trip)}>
                                    <input type="checkbox" onClick={(e) => e.stopPropagation()} />
                                    
                                    <div className="trip-block-details">
                                        <span className="trip-icon">
                                            <i className={`ti ${trip.icon}`}></i>
                                        </span>
                                        <div className="trip-details-text">
                                            <span className="trip-date">{trip.date}</span>
                                            <span className="trip-title">{trip.title}</span>
                                        </div>
                                    </div>

                                    <span className="trip-category">{trip.category}</span>
                                    <span className="trip-destination">{trip.destination}</span>
                                    <span className="trip-vehicle">{trip.vehicle}</span>

                                    <div className="tr-list-amount-wrapper">
                                        <span className="tr-list-symbol">{trip.currencySymbol}</span>
                                        <span className="tr-list-amount-val">{Number(trip.amount).toFixed(2)}</span>
                                        <span className="tr-list-currency">{trip.currency}</span>
                                    </div>

                                    <span className="trip-duration">{trip.duration}</span>
                    
                                    <span className={`trip-status status-${trip.statusClass}`}>
                                        {trip.status}
                                    </span>
                                </div>
                            ))}

                            {/* Pagination Footer*/}
                            <PaginationFooter 
                                hasMore={hasMore}
                                loadingMore={loadingMore}
                                loadMore={loadMore}
                                currentCount={trips.length} 
                                totalCount={totalCount}
                                label="trips"
                            />
                        </>
                    ) : (
                        <div className="no-data-info">Henüz seyahat kaydı bulunmuyor.</div>
                    )}
                </div>
            </div>
            
            <CreateTrip isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            <TripDetail 
                isOpen={isDetailOpen} 
                onClose={() => setIsDetailOpen(false)} 
                data={selectedTrip} 
                onReopen={() => setIsDetailOpen(true)} 
            />
            <CurrencyModal 
                isOpen={isCurrencyOpen} 
                onClose={() => setIsCurrencyOpen(false)} 
                currentCurrency={selectedCurrency}
                onSelect={handleCurrencySelect}
            />
        </div>
    );
};

export default Trips;