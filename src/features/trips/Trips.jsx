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
import TripList from './components/TripList'; 

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
    const [isEditMode, setIsEditMode] = useState(false); // Edit modu eklendi

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
        data: trips, loading, loadingMore, hasMore, loadMore, totalCount, refreshData 
    } = usePagination(tripsService.getTripsByTeam, activeTeamId, 20);

    // Filtreleme
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

    // İşlem Fonksiyonları: Detayları Açma
    const handleOpenDetail = (trip) => {
        setSelectedTrip(trip);
        setIsDetailOpen(true);
    };

    // İşlem Fonksiyonları: Düzenleme Modu
    const handleEdit = (e, trip) => {
        e.stopPropagation();
        setSelectedTrip(trip);
        setIsEditMode(true);
        setIsCreateOpen(true);
    };

    // İşlem Fonksiyonları: Veri Silme (Permission check alt bileşende)
    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Bu geziyi silmek istediğinize emin misiniz?")) {
            try {
                await tripsService.deleteTrip(id);
                refreshData();
            } catch (err) {
                console.error("Silme hatası:", err);
            }
        }
    };

    const handleCurrencySelect = (currencyCode) => {
        setSelectedCurrency(currencyCode);
        sessionStorage.setItem('selectedCurrency', currencyCode);
    };

    const filterFooter = (
        <div className="as-filter-footer">
            <button className="btn-clear" onClick={clearFilters}>Tümünü Temizle</button>
            <button className="btn-apply" onClick={() => { applyFilters(); setIsFilterOpen(false); }}>
                Filtreleri Uygula
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
                    onCreate={() => {
                        setIsEditMode(false);
                        setSelectedTrip(null);
                        setIsCreateOpen(true);
                    }}
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
                    <span className="tr-title-span">İşlemler</span>
                </div>
                
                <div className="trip-list-container">
                    {finalFilteredTrips.length > 0 ? (
                        <>
                            {/* Ana liste bileşeni */}
                            <TripList 
                                data={finalFilteredTrips}
                                onOpenDetail={handleOpenDetail}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />

                            <PaginationFooter 
                                hasMore={hasMore}
                                loadingMore={loadingMore}
                                loadMore={loadMore}
                                currentCount={finalFilteredTrips.length} 
                                totalCount={totalCount}
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
            
            <CreateTrip 
                isOpen={isCreateOpen} 
                onClose={() => {
                    setIsCreateOpen(false);
                    setIsEditMode(false);
                    setSelectedTrip(null);
                }} 
                editData={isEditMode ? selectedTrip : null}
                onSuccess={refreshData}
            />

            <TripDetail isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} data={selectedTrip} />

            <CurrencyModal 
                isOpen={isCurrencyOpen} onClose={() => setIsCurrencyOpen(false)} 
                currentCurrency={selectedCurrency} onSelect={handleCurrencySelect} 
            />
        </div>
    );
};

export default Trips;