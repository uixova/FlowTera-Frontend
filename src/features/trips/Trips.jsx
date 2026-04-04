import React, { useEffect, useState } from 'react'; 
import Loader from '../../components/common/Loader';
import './trips.css/Trips.css';
import SubNavbar from '../../components/navigation/SubNavbar'; 
import CreateTrip from './modals/CreateTrip';
import TripDetail from './modals/TripDetail';
import CurrencyModal from '../../components/modals/CurrencyModal';
import PaginationFooter from '../../components/common/PaginationFooter';
import ActionSidebar from '../../components/navigation/ActionSidebar';
import TripFilter from './modals/TripFilter';

// Servis ve Hook importları
import { tripsService } from './services/tripsService'; 
import { usePagination } from '../../hooks/usePagination';
import { useFilter } from '../../hooks/useFilter';

const Trips = () => {
    // UI STATELERİ
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        return sessionStorage.getItem('selectedCurrency') || 'USD';
    });

    const [activeTeamId, setActiveTeamId] = useState(() => localStorage.getItem('tm_selected_id'));

    // Takım Senkronizasyonu
    useEffect(() => {
        const syncSelectedTeam = () => {
            const nextTeamId = localStorage.getItem('tm_selected_id');
            setActiveTeamId(prevId => String(prevId || '') === String(nextTeamId || '') ? prevId : nextTeamId);
        };
        window.addEventListener('teamChanged', syncSelectedTeam);
        window.addEventListener('storage', syncSelectedTeam);
        return () => {
            window.removeEventListener('teamChanged', syncSelectedTeam);
            window.removeEventListener('storage', syncSelectedTeam);
        };
    }, []);
    
    // Veri Çekme
    const { 
        data: trips, 
        loading, 
        loadingMore, 
        hasMore, 
        loadMore,
        totalCount
    } = usePagination(tripsService.getTripsByTeam, activeTeamId, 20);

    // Filtreleme işlemi için özel hook kullanımı
    const {
        searchTerm, setSearchTerm,
        tempFilters, setTempFilters,
        filteredData: finalFilteredTrips,
        applyFilters, clearFilters
    } = useFilter(
        trips || [],
        { 
            category: '', vehicle: '', status: '',
            minDuration: '', maxDuration: '', 
            startDate: '', endDate: '' 
        },
        ['title', 'destination']
    );

    // Helper Fonksiyonlar
    const handleOpenDetail = (trip) => {
        setSelectedTrip(trip);
        setIsDetailOpen(true);
    };

    // Para Birimi Seçimi
    const handleCurrencySelect = (currencyCode) => {
        setSelectedCurrency(currencyCode);
        sessionStorage.setItem('selectedCurrency', currencyCode);
    };

    // Sidebar Butonları
    const filterFooter = (
        <div className="as-filter-footer">
            <button className="btn-clear" onClick={clearFilters}>Clear All</button>
            <button className="btn-apply" onClick={() => { applyFilters(); setIsFilterOpen(false); }}>
                Apply Filters
            </button>
        </div>
    );

    if (loading) return <Loader type="butterfly" />;

    return (
        <div className="trips" id="trips">
            <div className="trip-page" id="tripsPage">
                <SubNavbar 
                    pageName="Geziler ve Seyahatler"
                    searchPlaceholder="Gezi ara..."
                    searchValue={searchTerm}
                    showCurrency={true}
                    createLabel="Gezi Oluştur"
                    onSearch={(val) => setSearchTerm(val)} 
                    onCreate={() => setIsCreateOpen(true)}
                    buttons={[
                        { icon: 'ti ti-coins', label: selectedCurrency, onClick: () => setIsCurrencyOpen(true) },
                        { icon: 'ti ti-adjustments-horizontal', tooltip: 'Filter', onClick: () => setIsFilterOpen(true) }
                    ]}
                />
                
                <hr className="sub-nav-divider" />

                <div className="trip-title-nav">
                    <input type="checkbox" id="selectAllTrips" />
                    <span className="tr-title-span">Gezi Detayları</span>
                    <span className="tr-title-span">Kategori</span>
                    <span className="tr-title-span">Varış Noktası</span>
                    <span className="tr-title-span">Araç</span>
                    <span className="tr-title-span">Tahmini Gider</span>
                    <span className="tr-title-span">Süre</span>
                    <span className="tr-title-span">İşlem Durumu</span>
                </div>
                
                <div className="trip-list-container">
                    {finalFilteredTrips.length > 0 ? (
                        <>
                            {finalFilteredTrips.map((trip) => (
                                <div key={trip.id} className="trip-block" onClick={() => handleOpenDetail(trip)}>
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
                                        <span className="tr-list-symbol">{trip.currencySymbol}</span>
                                        <span className="tr-list-amount-val">{Number(trip.amount).toFixed(2)}</span>
                                        <span className="tr-list-currency">{trip.currency}</span>
                                    </div>
                                    <span className="trip-duration">{trip.duration}</span>
                                    <span className={`trip-status status-${trip.statusClass}`}>{trip.status}</span>
                                </div>
                            ))}

                            <PaginationFooter 
                                hasMore={hasMore}
                                loadingMore={loadingMore}
                                loadMore={loadMore}
                                currentCount={finalFilteredTrips.length} 
                                totalCount={searchTerm || Object.values(tempFilters).some(x => x) ? finalFilteredTrips.length : totalCount}
                                label="trips"
                            />
                        </>
                    ) : (
                        <div className="no-data-info">
                            {searchTerm || Object.values(tempFilters).some(x => x) 
                                ? "Kriterlere uygun seyahat bulunamadı." 
                                : "Henüz seyahat kaydı bulunmuyor."}
                        </div>
                    )}
                </div>
            </div>

            <ActionSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter Trips" footer={filterFooter}>
                <TripFilter filters={tempFilters} setFilters={setTempFilters} />
            </ActionSidebar>
            
            {/* Diğer Modallar */}
            <CreateTrip isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            <TripDetail isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} data={selectedTrip} />
            <CurrencyModal 
                isOpen={isCurrencyOpen} onClose={() => setIsCurrencyOpen(false)} 
                currentCurrency={selectedCurrency} onSelect={handleCurrencySelect} 
            />
        </div>
    );
};

export default Trips;