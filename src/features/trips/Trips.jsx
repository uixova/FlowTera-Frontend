import React, { useState, useEffect } from 'react'; 
import './trips.css/Trips.css';
import SubNavbar from '../../components/navigation/SubNavbar'; // Merkezi Navbar
import CreateTrip from './modals/CreateTrip';
import TripDetail from './modals/TripDetail';
import tripsDataJSON from './data/trips.json'; 

const Trips = () => {
    // Modal ve veri yönetimi için gerekli state'ler
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Gerçek bir API çağrısı yerine, JSON dosyasından veri çekiyoruz
        const fetchTrips = async () => {
            try {
                setLoading(true);
                const simulateApi = new Promise((resolve) => {
                    setTimeout(() => resolve(tripsDataJSON), 500); 
                });
                // Veriyi aldıktan sonra state'e atıyoruz
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

    // Trip detay modalini açarken seçilen trip bilgisini state'e atıyoruz
    const handleOpenDetail = (trip) => {
        setSelectedTrip(trip);
        setIsDetailOpen(true);
    };

    // Yükleniyor durumunu göstermek için basit bir mesaj veya spinner ekleyebiliriz
    if (loading) return <div className="tr-loading">Seyahatler yükleniyor...</div>;

    return (
        <div className="trips" id="trips">
            <div className="trip-page" id="tripsPage">
                {/* YENİ MERKEZİ NAVBAR */}
                <SubNavbar 
                    title="Trips & Travels"
                    searchPlaceholder="Search trips..."
                    createLabel="New Trip"
                    onCreate={() => setIsCreateOpen(true)}
                    onSearch={(val) => console.log("Trip araması:", val)}
                    buttons={[
                        { 
                            icon: 'ti ti-filter', 
                            tooltip: 'Filter', 
                            onClick: () => console.log("Trip filter open") 
                        }
                    ]}
                />
                
                <hr className="sub-nav-divider" />

                {/* Header Row - Grid yapısı Trips.css'den geliyor */}
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
                
                {/* Seyahat Listesi */}
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
            
            {/* Modallar */}
            <CreateTrip isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            <TripDetail isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} data={selectedTrip} />
        </div>
    );
};

export default Trips;