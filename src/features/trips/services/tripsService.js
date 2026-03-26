import { api } from '../../../services/api';

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
            // userId'ye göre gerçek kullanıcıyı bul
            const owner = users.find(u => String(u.id) === String(trip.userId));
            
            return {
                ...trip,
                // Kullanıcı ismini ve avatarını user.json'dan çekiyoruz
                userName: owner ? owner.name : "Unknown Traveller",
                userAvatar: owner ? owner.avatar : null,
                userPlan: owner ? owner.subscription?.plan : 'free'
            };
        });
    },

    // Takım ID'sine göre seyahatleri getir
    getTripsByTeam: async (teamId) => {
        try {
            await randomDelay(400, 1000);
            if (!teamId) return [];

            const allTrips = await api.trips.getAll(); 
            if (!allTrips) return [];

            // Takıma göre filtrele
            const teamTrips = allTrips.filter(trip => 
                String(trip.teamId).trim() === String(teamId).trim()
            );

            // Kullanıcı bilgilerini içine bas ve döndür
            return await tripsService.enrichTripsWithUserData(teamTrips);
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