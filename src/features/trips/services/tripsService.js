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
            const createdBy = trip.createdBy;
            const ownerId =
                createdBy?.id ??
                trip.userId ??
                trip.ownerId ??
                trip.createdById ??
                null;

            const createdByName = createdBy?.name;
            const owner = ownerId ? users.find(u => String(u.id) === String(ownerId)) : null;
            const isDeleted = Boolean(owner?.isDeleted);
            
            return {
                ...trip,
                // createdBy varsa onu kullan, yoksa user.json'dan owner'ı ararız.
                userName: isDeleted
                    ? "DeletedUser"
                    : (createdByName || owner?.name || "Unknown Traveller"),
                userAvatar: isDeleted ? null : (owner?.avatar || null),
                userPlan: isDeleted ? 'free' : (owner?.subscription?.plan || 'free')
            };
        });
    },

    // Takım ID'sine göre seyahatleri getir
    getTripsByTeam: async (teamId, page = 1, limit = 20) => {
        try {
            await randomDelay(400, 1000);
            if (!teamId) return { data: [], hasMore: false };

            const allTrips = await api.trips.getAll(); 
            if (!allTrips) return { data: [], hasMore: false };

            // Önce takıma göre filtrele
            const filtered = allTrips.filter(trip => 
                String(trip.teamId).trim() === String(teamId).trim()
            );

            // Sayfalama (Pagination)
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedData = filtered.slice(startIndex, endIndex);

            // Daha fazla veri var mı?
            const hasMore = filtered.length > endIndex;

            // Kullanıcı bilgilerini zenginleştir
            const enrichedData = await tripsService.enrichTripsWithUserData(paginatedData);

            return {
                data: enrichedData,
                hasMore: hasMore,
                totalCount: filtered.length
            };
        } catch (error) {
            console.error("Trips Service Error:", error);
            throw error;
        }
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

    // Yeni bir seyahat oluşturma (Simülasyon)
    createTrip: async (tripData) => {
        await randomDelay(600, 1200);
        // Gerçek API'de burada api.post() olur
        // tripData içinde userId'nin geldiğinden emin olmalıyız
        console.log("[API CREATE] New Trip:", tripData);

        return { success: true, data: tripData };
    }
};