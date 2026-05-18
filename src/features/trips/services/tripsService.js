import { api } from '../../../api/api';

// Paginated veya düz array'den veriyi güvenle çıkar
const extractList = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    return [];
};

export const tripsService = {

    // Seyahatleri kullanıcı verileriyle zenginleştir
    enrichTripsWithUserData: async (trips) => {
        if (!trips?.length) return trips ?? [];

        const usersResponse = await api.users.getAll({ pageSize: 1000 });
        const users = extractList(usersResponse);

        return trips.map(trip => {
            const ownerId =
                trip.createdBy?.id ??
                trip.userId ??
                trip.ownerId ??
                trip.createdById ??
                null;

            const owner = ownerId
                ? users.find(u => String(u.id) === String(ownerId))
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

    // Takım ID'sine göre seyahatleri getir 
    getTripsByTeam: async (teamId, page = 1, limit = 20) => {
        if (!teamId) return { data: [], hasMore: false, totalCount: 0 };

        // Backend hazır olduğunda teamId filtresi
        // sunucu tarafına taşınacak: api.trips.getAll({ teamId, page, pageSize: limit })
        const response = await api.trips.getAll({ pageSize: 2000 });
        const allTrips = extractList(response);

        if (!allTrips.length) return { data: [], hasMore: false, totalCount: 0 };

        const filtered = allTrips.filter(
            trip => String(trip.teamId).trim() === String(teamId).trim()
        );

        // Servis katmanında sayfalama - Mock için tabiki
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

    // Seyahat ID'sine göre tek seyahati getir
    getTripById: async (tripId) => {
        const response = await api.trips.getAll({ pageSize: 2000 });
        const allTrips = extractList(response);

        const trip = allTrips.find(t => String(t.id) === String(tripId));
        if (!trip) return null;

        const enriched = await tripsService.enrichTripsWithUserData([trip]);
        return enriched[0] ?? null;
    },

    // Yeni seyahat oluşturma (simülasyon)
    createTrip: async (tripData) => {
        // Gelecekte: return await api.fetch('TRIPS', {}, { method: 'POST', body: tripData });
        console.log("[API CREATE] New Trip Payload:", tripData);
        return { success: true, data: tripData };
    },

    // Seyahat güncelleme (simülasyon)
    updateTrip: async (id, tripData) => {
        // Gelecekte: return await api.fetch('TRIPS', {}, { method: 'PUT', body: tripData });
        console.log(`[API UPDATE] Trip ID: ${id}`, tripData);
        return { success: true };
    },

    // Seyahat silme
    deleteTrip: async (id) => {
        // Gelecekte: return await api.trips.delete(id);
        console.log(`${id} ID'li seyahat siliniyor.`);
        return { success: true };
    }
};