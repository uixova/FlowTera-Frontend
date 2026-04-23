import { api } from '../../../api/api'; 

export const paymentService = {
    // Ödemeyi işle
    processPayment: async (paymentData, userId, planId) => {
        try {
            console.log(`${userId} için ${planId} ödemesi alınıyor...`);
            
            // Simüle bir istek atıyoruz
            const response = await api.plans.getAll(); 
            
            if (!response) throw new Error("Plan verileri doğrulanamadı.");

            // Backend simülasyonu
            return { 
                success: true, 
                message: "Abonelik aktif edildi!",
                details: paymentData.number.slice(-4) // Güvenlik için son 4 haneyi döndür
            };
        } catch (error) {
            console.error("Ödeme İşlem Hatası:", error.message);
            return { success: false, message: "Ödeme başarısız: " + error.message };
        }
    },

    // Yeni kullanıcı için ön kayıt doğrulaması
    validateRegistrationPayment: async (tempId) => {
        try {
            console.log(`Geçici kayıt ID doğrulanıyor: ${tempId}`);
            
            // Burada api çağrısı yapılabilir
            // const check = await api.get(`/validate/${tempId}`);
            
            return { valid: true };
        } catch (error) {
            console.error("Doğrulama hatası:", error);
            return { valid: false };
        }
    }
};