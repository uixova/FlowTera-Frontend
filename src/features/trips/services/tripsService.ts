import { api, restFetch } from '../../../api/api';
import { Trip, User } from '@/types/types';
import { dataEvents } from '../../../hooks/useDataRefresh';

export interface EnrichedTrip extends Trip {
    userName: string;
    userAvatar: string | null;
    userPlan: string;
}

interface TripFetchResult {
    data: EnrichedTrip[];
    hasMore: boolean;
    totalCount: number;
}

const extractList = <T>(response: any): T[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    return [];
};

export const tripsService = {

    // Seyahatleri kullanıcı verisiyle zenginleştir
    enrichTripsWithUserData: async (trips: Trip[]): Promise<EnrichedTrip[]> => {
        if (!trips?.length) return [];

        const usersResponse = await api.users.getAll({ pageSize: 1000 });
        const users         = extractList<User>(usersResponse);

        return trips.map(trip => {
            const ownerId =
                trip.createdBy?.id ??
                (trip as any).userId ??
                (trip as any).ownerId ??
                (trip as any).createdById ??
                null;

            const owner     = ownerId ? users.find(u => String(u.id) === String(ownerId)) : null;
            const isDeleted = Boolean(owner?.isDeleted);

            return {
                ...trip,
                userName:   isDeleted ? 'DeletedUser' : (trip.createdBy?.name || owner?.name || 'Unknown Traveller'),
                userAvatar: isDeleted ? null           : (owner?.avatar ?? null),
                userPlan:   isDeleted ? 'free'         : (owner?.subscription?.plan ?? 'free'),
            };
        });
    },

    // Takım bazında seyahatleri getir (backend paginate eder)
    getTripsByTeam: async (teamId: string, page = 1, limit = 20): Promise<TripFetchResult> => {
        if (!teamId) return { data: [], hasMore: false, totalCount: 0 };

        const response = await api.trips.getAll({ teamId, page, pageSize: limit });
        const trips    = extractList<Trip>(response);
        const total    = (response as any)?.total ?? trips.length;
        const enriched = await tripsService.enrichTripsWithUserData(trips);

        return {
            data:       enriched,
            hasMore:    (response as any)?.hasMore ?? page * limit < total,
            totalCount: total,
        };
    },

    // Tekil seyahat getir
    getTripById: async (tripId: string): Promise<EnrichedTrip | null> => {
        if (!tripId) return null;
        try {
            const result   = await restFetch<{ status: string; data: Trip }>(`/trips/${tripId}`);
            const trip     = (result as any).data ?? result;
            const enriched = await tripsService.enrichTripsWithUserData([trip as Trip]);
            return enriched[0] ?? null;
        } catch { return null; }
    },

    // Yeni seyahat oluştur
    createTrip: async (tripData: Partial<Trip>): Promise<{ success: boolean; data: Partial<Trip> }> => {
        try {
            const result = await restFetch<{ status: string; data: Trip }>(
                `/trips`, { method: 'POST', body: tripData }
            );
            api.trips.invalidate();
            dataEvents.notify();
            return { success: true, data: (result as any).data ?? tripData };
        } catch {
            return { success: false, data: tripData };
        }
    },

    // Seyahat güncelle
    updateTrip: async (id: string, tripData: Partial<Trip>): Promise<{ success: boolean }> => {
        try {
            await restFetch(`/trips/${id}`, { method: 'PUT', body: tripData });
            api.trips.invalidate();
            dataEvents.notify();
            return { success: true };
        } catch {
            return { success: false };
        }
    },

    // Seyahat sil
    deleteTrip: async (id: string): Promise<{ success: boolean }> => {
        try {
            await restFetch(`/trips/${id}`, { method: 'DELETE' });
            api.trips.invalidate();
            dataEvents.notify();
            return { success: true };
        } catch {
            return { success: false };
        }
    },
};
