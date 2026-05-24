import { api, restFetch } from '../../../api/api';
import { Trip } from '@/types/types';
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

    // Takım bazında seyahatleri getir — backend EnrichedTrip döner
    getTripsByTeam: async (teamId: string, page = 1, limit = 20): Promise<TripFetchResult> => {
        if (!teamId) return { data: [], hasMore: false, totalCount: 0 };

        const response = await api.trips.getAll({ teamId, page, pageSize: limit });
        const trips    = extractList<EnrichedTrip>(response);
        const total    = (response as any)?.total ?? trips.length;

        return {
            data:       trips,
            hasMore:    (response as any)?.hasMore ?? page * limit < total,
            totalCount: total,
        };
    },

    // Tekil seyahat getir
    getTripById: async (tripId: string): Promise<EnrichedTrip | null> => {
        if (!tripId) return null;
        try {
            const result = await restFetch<{ status: string; data: EnrichedTrip }>(`/trips/${tripId}`);
            return (result as any).data ?? null;
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
