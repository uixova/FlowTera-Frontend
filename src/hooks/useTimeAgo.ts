import { useState, useEffect } from 'react';

export const useTimeAgo = (dateString: string | null | undefined): string => {
    const [timeAgo, setTimeAgo] = useState<string>('');

    useEffect(() => {
        const calculateTime = () => {
            if (!dateString) {
                setTimeAgo('');
                return;
            }

            // DD/MM/YYYY formatını YYYY-MM-DD'ye çevirerek güvenli hale getiriyoruz
            let formattedDate = dateString;
            if (dateString.includes('/') && dateString.split('/').length === 3) {
                const [day, month, year] = dateString.split('/');
                formattedDate = `${year}-${month}-${day}`;
            }

            const now = new Date();
            const createdDate = new Date(formattedDate);

            if (isNaN(createdDate.getTime())) {
                setTimeAgo('Geçersiz tarih');
                return;
            }

            // İki tarihi birbirinden çıkarırken .getTime() kullanarak TS'nin hata vermesini önlüyoruz
            const diffInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);

            if (diffInSeconds < 0) {
                // Gelecek bir tarihse 
                setTimeAgo('Yakında');
                return;
            }

            if (diffInSeconds < 60) {
                setTimeAgo('Az önce');
            } else if (diffInSeconds < 3600) {
                const mins = Math.floor(diffInSeconds / 60);
                setTimeAgo(`${mins} dk önce`);
            } else if (diffInSeconds < 86400) {
                const hours = Math.floor(diffInSeconds / 3600);
                setTimeAgo(`${hours} sa önce`);
            } else if (diffInSeconds < 2592000) { // 30 güne kadar
                const days = Math.floor(diffInSeconds / 86400);
                setTimeAgo(days === 1 ? 'Dün' : `${days} gün önce`);
            } else {
                // Çok eskiyse direkt tarihi göster
                setTimeAgo(dateString);
            }
        };

        calculateTime();
        const interval = setInterval(calculateTime, 60000);
        return () => clearInterval(interval);
    }, [dateString]);

    return timeAgo;
};