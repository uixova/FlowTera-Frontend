import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../utils/dateFormat';

export const useTimeAgo = (dateString: string | null | undefined): string => {
    const { t, i18n } = useTranslation('common.time');
    const [timeAgo, setTimeAgo] = useState<string>('');

    useEffect(() => {
        const calculateTime = () => {
            if (!dateString) {
                setTimeAgo('');
                return;
            }

            // DD/MM/YYYY → YYYY-MM-DD
            let formattedDate = dateString;
            if (dateString.includes('/') && dateString.split('/').length === 3) {
                const [day, month, year] = dateString.split('/');
                formattedDate = `${year}-${month}-${day}`;
            }

            const now = new Date();
            const createdDate = new Date(formattedDate);

            if (isNaN(createdDate.getTime())) {
                setTimeAgo(t('invalid_date'));
                return;
            }

            const diffInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);

            if (diffInSeconds < 0) {
                setTimeAgo(t('soon'));
                return;
            }

            if (diffInSeconds < 60) {
                setTimeAgo(t('just_now'));
            } else if (diffInSeconds < 3600) {
                const mins = Math.floor(diffInSeconds / 60);
                setTimeAgo(t('minutes_ago', { count: mins }));
            } else if (diffInSeconds < 86400) {
                const hours = Math.floor(diffInSeconds / 3600);
                setTimeAgo(t('hours_ago', { count: hours }));
            } else if (diffInSeconds < 2592000) {
                const days = Math.floor(diffInSeconds / 86400);
                if (days === 1) {
                    setTimeAgo(t('yesterday'));
                } else {
                    setTimeAgo(t('days_ago', { count: days }));
                }
            } else {
                setTimeAgo(formatDate(createdDate));
            }
        };

        calculateTime();
        const interval = setInterval(calculateTime, 60000);
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateString, i18n.language]);

    return timeAgo;
};
