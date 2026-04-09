import { api } from '../../../api/api';

const randomDelay = (min = 200, max = 800) => {
    const ms = Math.floor(Math.random() * (max - min + 1) + min);
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const tripsService = {
    // Yardımcı Fonksiyon: Seyahatleri kullanıcı verileriyle eşleştirir
    enrichTripsWithUserData: async (trips) => {
        const users = await api.users.getAll();
        if (!users || !trips) return trips;

        return trips.map(trip => {
            const ownerId = trip.createdBy?.id ?? trip.userId ?? trip.ownerId ?? trip.createdById ?? null;
            const owner = ownerId ? users.find(u => String(u.id) === String(ownerId)) : null;
            const isDeleted = Boolean(owner?.isDeleted);
            
            return {
                ...trip,
                userName: isDeleted ? "DeletedUser" : (trip.createdBy?.name || owner?.name || "Unknown Traveller"),
                userAvatar: isDeleted ? null : (owner?.avatar || null),
                userPlan: isDeleted ? 'free' : (owner?.subscription?.plan || 'free')
            };
        });
    },

    // Takım ID'sine göre seyahatleri getir
    getTripsByTeam: async (teamId, page = 1, limit = 20) => {
        await randomDelay(400, 1000);
        if (!teamId) return { data: [], hasMore: false };

        const allTrips = await api.trips.getAll(); 
        if (!allTrips) return { data: [], hasMore: false };

        const filtered = allTrips.filter(trip => 
            String(trip.teamId).trim() === String(teamId).trim()
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

    // Seyahat ID'sine göre tek bir seyahati getir
    getTripById: async (tripId) => {
        await randomDelay(200, 500);
        const allTrips = await api.trips.getAll();
        const trip = allTrips?.find(t => String(t.id) === String(tripId));
        
        if (!trip) return null;

        // Tek bir seyahat için de kullanıcı verisini ekle
        const enriched = await tripsService.enrichTripsWithUserData([trip]);
        return enriched[0];
    },

    // Yeni bir seyahat oluşturma
    createTrip: async (tripData) => {
        await randomDelay(600, 1200);
        
        // Gelecekte api.trips.post(tripData) buraya gelecek
        console.log("[API CREATE] New Trip Payload:", tripData);
        return { success: true, data: tripData };
    },

    // Güncelleme fonksiyonu 
    updateTrip: async (id, tripData) => {
        await randomDelay(400, 800);
        console.log(`[API UPDATE] Trip ID: ${id}`, tripData);
        return { success: true };
    }
};