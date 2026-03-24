import tripsDataJSON from '../data/trips.json';

const randomDelay = (min = 200, max = 800) => {
    const ms = Math.floor(Math.random() * (max - min + 1) + min);
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const tripsService = {
    // Takım ID'sine göre seyahatleri getir
    getTripsByTeam: async (teamId) => {
        try {
            await randomDelay(400, 1000);
            if (!teamId) return [];

            // teamId'yi String yaparak garantiye alıyoruz
            return tripsDataJSON.filter(trip => 
                String(trip.teamId).trim() === String(teamId).trim()
            );
        } catch (error) {
            console.error("Trips Service Error:", error);
            throw error;
        }
    },

    // Seyahat ID'sine göre tek bir seyahati getir
    getTripById: async (tripId) => {
        await randomDelay(200, 500);
        return tripsDataJSON.find(t => t.id === tripId);
    },

    // Yeni bir seyahat oluştur (Simülasyon)
    createTrip: async (tripData) => {
        await randomDelay(600, 1200);
        return { success: true, data: tripData };
    }
};