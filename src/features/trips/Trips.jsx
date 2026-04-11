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
import Alert from '../../components/modals/Alert';

// Servis ve Hook importları
import { tripsService } from './services/tripsService'; 
import { usePagination } from '../../hooks/usePagination';
import { useFilter } from '../../hooks/useFilter';
import { useCurrency } from '../../context/CurrencyContext';
import { useModal } from '../../hooks/useModal';

const Trips = () => {
    // UI STATELERİ
    const { alertConfig, showAlert, closeAlert } = useModal();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const { selectedCurrency, updateCurrency } = useCurrency();
    const [activeTeamId, setActiveTeamId] = useState(() => localStorage.getItem('tm_selected_id'));
    const [teamDefaultCurrency, setTeamDefaultCurrency] = useState('');

    // TAKIM VE KUR SENKRONİZASYONU (BUG FIXED)
    useEffect(() => {
        const syncSelectedTeam = () => {
            const nextTeamId = localStorage.getItem('tm_selected_id');
            
            // Eğer takım ID'si aynıysa, efekti durdur (Seçilen kuru ezmemek için)
            if (String(nextTeamId) === String(activeTeamId) && teamDefaultCurrency !== '') {
                return;
            }

            setActiveTeamId(nextTeamId);

            // Takım değiştiyse, o takımın default para birimini ayarla
            const rawCache = localStorage.getItem('tm_teams_cache');
            if (rawCache && nextTeamId) {
                try {
                    const teams = JSON.parse(rawCache);
                    const currentTeam = teams.find(t => String(t.id) === String(nextTeamId));
                    if (currentTeam?.settings?.currency) {
                        setTeamDefaultCurrency(currentTeam.settings.currency);
                        // Sadece takım değiştiğinde (ilk yükleme dahil) context'i güncelle
                        updateCurrency(currentTeam.settings.currency);
                    }
                } catch (e) { console.error("Cache parse error:", e); }
            }
        };

        syncSelectedTeam();
        
        window.addEventListener('teamChanged', syncSelectedTeam);
        window.addEventListener('storage', syncSelectedTeam);
        return () => {
            window.removeEventListener('teamChanged', syncSelectedTeam);
            window.removeEventListener('storage', syncSelectedTeam);
        };
    }, [activeTeamId, teamDefaultCurrency, updateCurrency]); 

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

    const handleDelete = async (e, id) => {
        try {
            await tripsService.deleteTrip(id);
            refreshData(); 
            showAlert("Başarılı", "Seyahat kaydı kalıcı olarak silindi.", "success");
        } catch (err) { 
            console.error("Silme hatası:", err); 
            showAlert("Hata", "Silme işlemi başarısız oldu.", "error");
        }
    };

    const handleSuccess = () => {
        // Önce modalı kapat ki kullanıcı kurtulsun, sonra arkada veriyi yenile
        setIsCreateOpen(false);
        setIsEditMode(false);
        setSelectedTrip(null);
        
        // Listeyi yenilemeyi bir sonraki tick'e atalım
        setTimeout(() => {
            refreshData();
        }, 0);
    };

    const handleCurrencySelect = (currencyCode) => {
        updateCurrency(currencyCode);
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
                        { 
                            icon: 'ti ti-coins', 
                            label: selectedCurrency, 
                            className: 'currency-btn-trigger',
                            onClick: () => setIsCurrencyOpen(true) 
                        },
                        { 
                            icon: 'ti ti-adjustments-horizontal', 
                            tooltip: 'Filter', 
                            onClick: () => setIsFilterOpen(true) 
                        }
                    ]}
                />
                
                <hr className="sub-nav-divider" />

                <div className="trip-title-nav">
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
                            <TripList 
                                data={finalFilteredTrips}
                                onOpenDetail={(trip) => { setSelectedTrip(trip); setIsDetailOpen(true); }}
                                onEdit={(e, trip) => {
                                    e.stopPropagation();
                                    setSelectedTrip(trip);
                                    setIsEditMode(true);
                                    setIsCreateOpen(true);
                                }}
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
                onSuccess={handleSuccess}
            />

            <TripDetail isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} data={selectedTrip} />

            <CurrencyModal 
                isOpen={isCurrencyOpen} 
                onClose={() => setIsCurrencyOpen(false)} 
                currentCurrency={selectedCurrency} 
                teamDefaultCurrency={teamDefaultCurrency}
                onSelect={handleCurrencySelect} 
            />

            <Alert {...alertConfig} onClose={closeAlert} />
        </div>
    );
};

export default Trips;