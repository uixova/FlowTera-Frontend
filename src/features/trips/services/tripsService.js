import tripsDataJSON from '../data/trips.json';

const randomDelay = (min = 200, max = 800) => {
    const ms = Math.floor(Math.random() * (max - min + 1) + min);
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const tripsService = {
    // Tüm seyahatleri getir
    getTrips: async () => {
        await randomDelay(400, 1000); 
        return tripsDataJSON;
    },

    // Detaylı seyahat bilgisini getir (İleride gerekirse ID ile tekil çekmek için)
    getTripById: async (tripId) => {
        await randomDelay(200, 500);
        return tripsDataJSON.find(t => t.id === tripId);
    },

    // Yeni seyahat oluşturma simülasyonu
    createTrip: async (tripData) => {
        await randomDelay(600, 1200);
        console.log("API: Seyahat oluşturuldu", tripData);
        return { success: true, data: tripData };
    }
};