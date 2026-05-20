import { api } from '../../../api/api';
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

    enrichTripsWithUserData: async (trips: Trip[]): Promise<EnrichedTrip[]> => {
        if (!trips?.length) return [];

        const usersResponse = await api.users.getAll({ pageSize: 1000 });
        const users = extractList<User>(usersResponse);

        return trips.map(trip => {
            const ownerId =
                trip.createdBy?.id ??
                (trip as any).userId ??
                (trip as any).ownerId ??
                (trip as any).createdById ??
                null;

            const owner = ownerId
                ? users.find((u: User) => String(u.id) === String(ownerId))
                : null;

            const isDeleted = Boolean(owner?.isDeleted);

            return {
                ...trip,
                userName: isDeleted
                    ? "DeletedUser"
                    : (trip.createdBy?.name || owner?.name || "Unknown Traveller"),
                userAvatar: isDeleted ? null : (owner?.avatar ?? null),
                userPlan: isDeleted ? 'free' : (owner?.subscription?.plan ?? 'free')
            };
        });
    },

    getTripsByTeam: async (teamId: string, page: number = 1, limit: number = 20): Promise<TripFetchResult> => {
        if (!teamId) return { data: [], hasMore: false, totalCount: 0 };

        const response = await api.trips.getAll({ pageSize: 2000 });
        const allTrips = extractList<Trip>(response);

        if (!allTrips.length) return { data: [], hasMore: false, totalCount: 0 };

        const filtered = allTrips.filter(
            trip => String(trip.teamId).trim() === String(teamId).trim()
        );

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = filtered.slice(startIndex, endIndex);

        const enrichedData = await tripsService.enrichTripsWithUserData(paginatedData);

        return {
            data: enrichedData,
            hasMore: filtered.length > endIndex,
            totalCount: filtered.length
        };
    },

    getTripById: async (tripId: string): Promise<EnrichedTrip | null> => {
        if (!tripId) return null;

        const response = await api.trips.getAll({ pageSize: 2000 });
        const allTrips = extractList<Trip>(response);

        const trip = allTrips.find(t => String(t.id) === String(tripId));
        if (!trip) return null;

        const enriched = await tripsService.enrichTripsWithUserData([trip]);
        return enriched[0] ?? null;
    },

    // --- VERİ DEĞİŞTİREN İŞLEMLERDE NOTIFYCHANGE TETİKLENDİ ---
    createTrip: async (tripData: Partial<Trip>): Promise<{ success: boolean; data: Partial<Trip> }> => {
        console.log("[API CREATE] New Trip Payload:", tripData);
        dataEvents.notify(); // 🚀 Sistem artık seyahat eklendiğinden haberdar
        return { success: true, data: tripData };
    },

    updateTrip: async (id: string, tripData: Partial<Trip>): Promise<{ success: boolean }> => {
        console.log(`[API UPDATE] Trip ID: ${id}`, tripData);
        dataEvents.notify(); // 🚀
        return { success: true };
    },

    deleteTrip: async (id: string): Promise<{ success: boolean }> => {
        console.log(`${id} ID'li seyahat siliniyor.`);
        dataEvents.notify(); // 🚀
        return { success: true };
    }
};