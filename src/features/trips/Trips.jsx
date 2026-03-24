import React, { useState, useEffect, useCallback } from 'react'; 
import Loader from '../../components/common/Loader';
import './trips.css/Trips.css';
import SubNavbar from '../../components/navigation/SubNavbar'; 
import CreateTrip from './modals/CreateTrip';
import TripDetail from './modals/TripDetail';
import CurrencyModal from '../../components/modals/CurrencyModal';
// Servis importu
import { tripsService } from './services/tripsService'; 

const Trips = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
            return sessionStorage.getItem('selectedCurrency') || 'USD';
        });
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    // Veri çekme işlemini ayrı bir fonksiyon olarak tanımlıyoruz
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            // 1. LocalStorage'dan ID'yi çek
            const activeTeamId = localStorage.getItem('tm_selected_id');
            
            // 2. Filtreli veriyi getir
            const data = await tripsService.getTripsByTeam(activeTeamId);
            setTrips(data);
        } catch (error) {
            console.error("Seyahat verileri yüklenemedi:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Bileşen yüklendiğinde seyahat verilerini çekiyoruz
    useEffect(() => {
        loadData();

        const handleTeamRefresh = () => {
            loadData();
        };

        window.addEventListener('teamChanged', handleTeamRefresh);
        window.addEventListener('storage', handleTeamRefresh);

        return () => {
            window.removeEventListener('teamChanged', handleTeamRefresh);
            window.removeEventListener('storage', handleTeamRefresh);
        };
    }, [loadData]);

    // Seyahat detayını açan fonksiyon
    const handleOpenDetail = (trip) => {
        setSelectedTrip(trip);
        setIsDetailOpen(true);
    };

    // Para birimi seçildiğinde çağrılacak fonksiyon
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

                    {/* Seyahat başlıkları ve listeleme bölümü */}
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
                
                {/* Seyahat listesi */}
                <div className="trip-list-container">
                    {trips.length > 0 ? (
                        trips.map((trip) => (
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
                        ))
                    ) : (
                        <div className="no-data-info">Henüz seyahat kaydı bulunmuyor.</div>
                    )}
                </div>
            </div>
            
            {/* Modallar */}
            <CreateTrip isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            <TripDetail isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} data={selectedTrip} />
                
                {/* Para Birimi Seçim Modalı */}
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