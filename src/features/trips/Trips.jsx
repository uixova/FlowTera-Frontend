import React, { useState, useEffect } from 'react'; 
import './trips.css/Trips.css';
import CreateTrip from './modals/CreateTrip';
import TripDetail from './modals/TripDetail';
import tripsDataJSON from './data/trips.json'; 

const Trips = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                setLoading(true);
                
                // --- API SİMÜLASYONU ---
                // Backend hazır olduğunda bura fetch('/api/trips') ile değişicek
                const simulateApi = new Promise((resolve) => {
                    setTimeout(() => resolve(tripsDataJSON), 500); 
                });

                const data = await simulateApi;
                setTrips(data);

            } catch (error) {
                console.error("Seyahat verileri yüklenemedi:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrips();
    }, []);

    const handleOpenDetail = (trip) => {
        setSelectedTrip(trip);
        setIsDetailOpen(true);
    };

    if (loading) return <div className="tr-loading">Seyahatler yükleniyor...</div>;

    return (
        <div className="trips" id="trips">
            <div className="trip-page" id="tripsPage">
                <div className="tr-nav">
                    <div className="tr-nav-title">
                        <h1>Trips & Travels</h1>
                    </div>
                    <div className="tr-nav-buttons">
                        <div className="search-wrapper">
                            <i className="ti ti-search"></i>
                            <input type="text" placeholder="Search trips..." />
                        </div>
                        <button id="trCreateTrip" onClick={() => setIsCreateOpen(true)}>
                            New Trip
                        </button>
                        <button className="tr-filter-btn"><i className="ti ti-filter"></i></button>
                    </div>
                </div>
                
                <hr />

                {/* Header Row */}
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
                            <div 
                                key={trip.id} 
                                className="trip-block" 
                                onClick={() => handleOpenDetail(trip)}
                            >
                                <input 
                                    type="checkbox" 
                                    className="select-trip" 
                                    onClick={(e) => e.stopPropagation()} 
                                />
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
                                <span className="tr-amount">{trip.amount}</span>
                                <span className="trip-duration">{trip.duration}</span>
                                <span className={`trip-status ${trip.statusClass}`}>
                                    {trip.status}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="no-data-msg">Kayıtlı seyahat bulunamadı.</div>
                    )}
                </div>
            </div>
            
            <CreateTrip 
                isOpen={isCreateOpen} 
                onClose={() => setIsCreateOpen(false)} 
            />

            <TripDetail 
                isOpen={isDetailOpen} 
                onClose={() => setIsDetailOpen(false)} 
                data={selectedTrip} 
            />
        </div>
    );
};

export default Trips;