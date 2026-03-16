import React, { useState, useEffect, useCallback } from 'react'; 
import Loader from '../../components/common/Loader';
import './trips.css/Trips.css';
import SubNavbar from '../../components/navigation/SubNavbar'; 
import CreateTrip from './modals/CreateTrip';
import TripDetail from './modals/TripDetail';
// Servis importu
import { tripsService } from './services/tripsService'; 

const Trips = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    // Veri çekme işlemini ayrı bir fonksiyon olarak tanımlıyoruz
    const fetchTrips = useCallback(async () => {
        try {
            setLoading(true);
            const data = await tripsService.getTrips();
            setTrips(data);
        } catch (error) {
            console.error("Seyahat verileri yüklenemedi:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTrips();
    }, [fetchTrips]);

    const handleOpenDetail = (trip) => {
        setSelectedTrip(trip);
        setIsDetailOpen(true);
    };

    if (loading) return <Loader type="butterfly" />;

    return (
        <div className="trips" id="trips">
            <div className="trip-page" id="tripsPage">
                <SubNavbar 
                    teamName="Software Team" 
                    pageName="Trips & Travels"
                    searchPlaceholder="Search trips..."
                    createLabel="New Trip"
                    onCreate={() => setIsCreateOpen(true)}
                    onSearch={(val) => console.log("Arama:", val)}
                    buttons={[
                        { 
                            icon: 'ti ti-filter', 
                            tooltip: 'Filter', 
                            onClick: () => console.log("Filter open") 
                        }
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
            
            <CreateTrip isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            <TripDetail isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} data={selectedTrip} />
        </div>
    );
};

export default Trips;