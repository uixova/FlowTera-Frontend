import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation('trips.list');
    const { t: tBtn } = useTranslation('common.buttons');
    const { t: tModals } = useTranslation('common.modals');
    const { t: tErrors } = useTranslation('common.errors');
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
            showAlert(tModals('success'), t('delete_success'), 'success');
        } catch (err) {
            console.error(err);
            showAlert(tModals('error'), t('delete_error'), 'error');
        }
    };

    const handleSuccess = () => {
        setIsCreateOpen(false);
        setIsEditMode(false);
        setSelectedTrip(null);
        showAlert(tModals('success'), t('success_generic'), 'success');
        setTimeout(() => refreshData(), 0);
    };

    const handleDeleteTrip = () => {
        askConfirm(
            t('delete_title'),
            t('delete_confirm_msg'),
            async () => {
                try {
                    await tripsService.deleteTrip(selectedTrip.id);
                    archiveService.invalidate();
                    setIsCreateOpen(false);
                    setIsEditMode(false);
                    setSelectedTrip(null);
                    showAlert(tModals('success'), t('delete_success'), 'success');
                    setTimeout(() => refreshData(), 0);
                } catch (err) {
                    console.error('Silme başarısız:', err);
                    showAlert(tModals('error'), t('delete_error'), 'error');
                }
            },
            'danger'
        );
    };

    if (loading) return <Loader type="butterfly" />;

    const filterFooter = (
        <div className="as-filter-footer">
            <button className="btn-clear" onClick={clearFilters}>{tBtn('reset')}</button>
            <button className="btn-apply" onClick={() => { applyFilters(); setIsFilterOpen(false); }}>
                {tBtn('apply')}
            </button>
        </div>
    );

    return (
        <div className="trips">
            <div className="trip-page">
                <SubNavbar
                    pageName={t('page_title')}
                    searchPlaceholder={t('search_placeholder')}
                    searchValue={searchTerm}
                    showCurrency={true}
                    showCreate={canCreateTrip}
                    createLabel={tBtn('create_trip')}
                    onSearch={(val) => setSearchTerm(val)}
                    onCreate={() => {
                        if (isDemo) {
                            showAlert(tErrors('demo_mode'), t('demo_create'), "info");
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
                        <span className="tr-title-span">{t('col_details')}</span>
                        <span className="tr-title-span">{t('col_category')}</span>
                        <span className="tr-title-span">{t('col_destination')}</span>
                        <span className="tr-title-span">{t('col_vehicle')}</span>
                        <span className="tr-title-span">{t('col_amount')}</span>
                        <span className="tr-title-span">{t('col_duration')}</span>
                        <span className="tr-title-span">{t('col_status')}</span>
                        <span className="tr-title-span" />
                    </div>

                    {filteredTrips.length > 0 ? (
                        <>
                            <TripList
                                data={filteredTrips}
                                onOpenDetail={(trip) => { setSelectedTrip(trip); setIsDetailOpen(true); }}
                                onEdit={(e, trip) => {
                                    e?.stopPropagation();
                                    if (isDemo) {
                                        showAlert(tErrors('demo_mode'), t('demo_edit'), "info");
                                        return;
                                    }
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
                                ? t('no_trips')
                                : t('no_trips_sub')}
                        </div>
                    )}
                </div>
            </div>

            <ActionSidebar
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                title={<h2>{tBtn('filter')}</h2>}
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