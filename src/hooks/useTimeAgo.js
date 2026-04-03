import { useState, useEffect } from 'react';

export const useTimeAgo = (dateString) => {
    const [timeAgo, setTimeAgo] = useState('');

    useEffect(() => {
        const calculateTime = () => {
            if (!dateString) return;

            const now = new Date();
            const createdDate = new Date(dateString);

            // Geçersiz tarih kontrolü (NaN önleyici)
            if (isNaN(createdDate.getTime())) {
                setTimeAgo('Invalid date');
                return;
            }

            const diffInSeconds = Math.floor((now - createdDate) / 1000);

            if (diffInSeconds < 0) {
                setTimeAgo('Just now');
                return;
            }

            if (diffInSeconds < 60) {
                setTimeAgo('Just now');
            } else if (diffInSeconds < 3600) {
                const mins = Math.floor(diffInSeconds / 60);
                setTimeAgo(`${mins} mins ago`);
            } else if (diffInSeconds < 86400) {
                const hours = Math.floor(diffInSeconds / 3600);
                setTimeAgo(`${hours} hours ago`);
            } else {
                const days = Math.floor(diffInSeconds / 86400);
                setTimeAgo(`${days} days ago`);
            }
        };

        calculateTime();
        
        // Zamanın akışına göre güncellenmesi için interval
        const interval = setInterval(calculateTime, 60000);
        return () => clearInterval(interval);
    }, [dateString]);

    return timeAgo;
};