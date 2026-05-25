import React, { useEffect, useState, useMemo, useRef } from 'react';
import Loader from '../../components/ui/Loader';
import './Trips.css';
import SubNavbar from '../../components/navigation/SubNavbar';
import CreateTrip from './modals/CreateTrip';
import TripDetail from './modals/TripDetail';
import CurrencyModal from '../../components/overlays/currency/CurrencyModal';
import PaginationFooter from '../../components/ui/PaginationFooter';
import ActionSidebar from '../../components/navigation/ActionSidebar';
import TripFilter from './modals/TripFilter';
import TripList from './components/TripList';
import Alert from '../../components/overlays/Alert';
import Confirm from '../../components/overlays/Confirm';

import { tripsService } from './services/tripsService';
import { archiveService } from '../archive/services/archiveServices';
import { usePagination } from '../../hooks/usePagination';
import { useFilter } from '../../hooks/useFilter';
import { useCurrency } from '../../context/CurrencyContext';
import { useModal } from '../../hooks/useModal';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useTeam } from '../../context/TeamContext';
import { isDemoUser } from '../../utils/demo';

const Trips = () => {
    const { alertConfig, confirmConfig, showAlert, askConfirm, closeAlert, closeConfirm } = useModal();
    const { selectedCurrency, updateCurrency }   = useCurrency();
    const { activeTeam, selectedTeamId }         = useTeam();
    const { currentUser }                        = useAuth();
    const isDemo = isDemoUser(currentUser?.email);
    const { hasPermission }                      = usePermissions();

    const [isCreateOpen,  setIsCreateOpen]  = useState(false);
    const [isDetailOpen,  setIsDetailOpen]  = useState(false);
    const [isFilterOpen,  setIsFilterOpen]  = useState(false);
    const [isCurrencyOpen,setIsCurrencyOpen]= useState(false);
    const [isEditMode,    setIsEditMode]    = useState(false);
    const [selectedTrip,  setSelectedTrip]  = useState(null);

    const prevTeamIdRef = useRef(selectedTeamId);

    const currentUserRoleObj = useMemo(() => {
        if (!currentUser || !selectedTeamId) return null;
        return currentUser.role?.find(r => String(r.teamId) === String(selectedTeamId));
    }, [currentUser, selectedTeamId]);

    const canCreateTrip = hasPermission(currentUserRoleObj, 'trip_create');

    useEffect(() => {
        const teamChanged    = prevTeamIdRef.current !== selectedTeamId;
        const savedSelection = sessionStorage.getItem('selectedCurrency');

        if (teamChanged) {
            if (activeTeam?.settings?.currency) {
                updateCurrency(activeTeam.settings.currency);
                sessionStorage.removeItem('selectedCurrency');
            }
            prevTeamIdRef.current = selectedTeamId;
        } else if (!savedSelection && activeTeam?.settings?.currency) {
            updateCurrency(activeTeam.settings.currency);
        }
    }, [selectedTeamId, activeTeam?.settings?.currency, updateCurrency]);

    const {
        data: trips, loading, loadingMore, hasMore, loadMore, totalCount, refreshData
    } = usePagination(tripsService.getTripsByTeam, selectedTeamId, 20);

    const {
        searchTerm, setSearchTerm,
        tempFilters, setTempFilters,
        filteredData: filteredTrips,
        applyFilters, clearFilters
    } = useFilter(
        trips || [],
        { category: '', vehicle: '', status: '', minDuration: '', maxDuration: '', startDate: '', endDate: '' },
        ['title', 'destination']
    );

    const handleDelete = async (e, id) => {
        try {
            await tripsService.deleteTrip(id);
            refreshData();
            showAlert('Silindi', 'Seyahat kaydı başarıyla silindi.', 'success');
        } catch (err) {
            console.error(err);
            showAlert('Hata', 'Silme işlemi başarısız oldu.', 'error');
        }
    };

    const handleSuccess = () => {
        setIsCreateOpen(false);
        setIsEditMode(false);
        setSelectedTrip(null);
        setTimeout(() => refreshData(), 0);
    };

    const handleDeleteTrip = () => {
        askConfirm(
            'Seyahati Sil',
            'Bu seyahat kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
            async () => {
                try {
                    await tripsService.deleteTrip(selectedTrip.id);
                    archiveService.invalidate();
                    setIsCreateOpen(false);
                    setIsEditMode(false);
                    setSelectedTrip(null);
                    showAlert('Silindi', 'Seyahat kaydı başarıyla silindi.', 'success');
                    setTimeout(() => refreshData(), 0);
                } catch (err) {
                    console.error('Silme başarısız:', err);
                    showAlert('Hata', 'Seyahat silinirken bir hata oluştu.', 'error');
                }
            },
            'danger'
        );
    };

    if (loading) return <Loader type="butterfly" />;

    const filterFooter = (
        <div className="as-filter-footer">
            <button className="btn-clear" onClick={clearFilters}>Tümünü Temizle</button>
            <button className="btn-apply" onClick={() => { applyFilters(); setIsFilterOpen(false); }}>
                Filtreleri Uygula
            </button>
        </div>
    );

    return (
        <div className="trips">
            <div className="trip-page">
                <SubNavbar
                    pageName="Geziler ve Seyahatler"
                    searchPlaceholder="Gezi ara..."
                    searchValue={searchTerm}
                    showCurrency={true}
                    showCreate={canCreateTrip}
                    createLabel="Gezi Oluştur"
                    onSearch={(val) => setSearchTerm(val)}
                    onCreate={() => {
                        if (isDemo) {
                            showAlert("Demo Modu", "Gezi eklemek için kayıt olun veya giriş yapın.", "info");
                            return;
                        }
                        setIsEditMode(false);
                        setSelectedTrip(null);
                        setIsCreateOpen(true);
                    }}
                    buttons={[
                        {
                            icon: 'ti ti-coins',
                            label: selectedCurrency,
                            className: 'currency-btn-trigger',
                            onClick: () => setIsCurrencyOpen(true),
                        },
                        {
                            icon: 'ti ti-adjustments-horizontal',
                            onClick: () => setIsFilterOpen(true),
                        },
                    ]}
                />

                <hr className="sub-nav-divider" />

                <div className="trip-table-wrapper">
                    <div className="trip-title-nav">
                        <span className="tr-title-span">Gezi Detayları</span>
                        <span className="tr-title-span">Kategori</span>
                        <span className="tr-title-span">Varış Noktası</span>
                        <span className="tr-title-span">Araç</span>
                        <span className="tr-title-span">Tahmini Gider</span>
                        <span className="tr-title-span">Süre</span>
                        <span className="tr-title-span">Durum</span>
                        <span className="tr-title-span" />
                    </div>

                    {filteredTrips.length > 0 ? (
                        <>
                            <TripList
                                data={filteredTrips}
                                onOpenDetail={(trip) => { setSelectedTrip(trip); setIsDetailOpen(true); }}
                                onEdit={(e, trip) => {
                                    e?.stopPropagation();
                                    setSelectedTrip(trip);
                                    setIsEditMode(true);
                                    setIsCreateOpen(true);
                                }}
                            />
                            <PaginationFooter
                                hasMore={hasMore}
                                loadingMore={loadingMore}
                                loadMore={loadMore}
                                currentCount={filteredTrips.length}
                                totalCount={totalCount}
                                label="trips"
                            />
                        </>
                    ) : (
                        <div className="no-data-info">
                            {searchTerm || Object.values(tempFilters).some(Boolean)
                                ? 'Kriterlere uygun seyahat bulunamadı.'
                                : 'Henüz seyahat kaydı bulunmuyor.'}
                        </div>
                    )}
                </div>
            </div>

            <ActionSidebar
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                title={<h2>Filtrele</h2>}
                footer={filterFooter}
            >
                <TripFilter filters={tempFilters} setFilters={setTempFilters} />
            </ActionSidebar>

            <CreateTrip
                isOpen={isCreateOpen}
                onClose={() => { setIsCreateOpen(false); setIsEditMode(false); setSelectedTrip(null); }}
                editData={isEditMode ? selectedTrip : null}
                onSuccess={handleSuccess}
                onDelete={handleDeleteTrip}
            />

            <TripDetail
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                data={selectedTrip}
                onSuccess={handleSuccess}
                onDelete={handleDelete}
            />

            <CurrencyModal
                isOpen={isCurrencyOpen}
                onClose={() => setIsCurrencyOpen(false)}
                currentCurrency={selectedCurrency}
                teamDefaultCurrency={activeTeam?.settings?.currency || ''}
                onSelect={(curr) => updateCurrency(curr)}
            />

            <Alert {...alertConfig} onClose={closeAlert} />
            <Confirm {...confirmConfig} onClose={closeConfirm} />
        </div>
    );
};

export default Trips;