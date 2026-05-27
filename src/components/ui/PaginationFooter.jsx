import React from 'react';
import { useTranslation } from 'react-i18next';

const PaginationFooter = ({ hasMore, loadingMore, loadMore, currentCount, totalCount, label }) => {
    const { t } = useTranslation('common.buttons');
    const safeCurrentCount = Number(currentCount) || 0;
    const safeTotalCount = Number.isFinite(Number(totalCount)) ? Number(totalCount) : safeCurrentCount;
    const itemLabel = label ?? t('all');

    return (
        <div className="pagination-footer">
            {hasMore && (
                <button className="load-more-btn" onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? (
                        <><i className="ti ti-loader-2 animate-spin" /> {t('loading')}</>
                    ) : (
                        <>{t('show_more')} <i className="ti ti-chevron-down" /></>
                    )}
                </button>
            )}
            <div className="pagination-info">
                {safeCurrentCount} / {safeTotalCount} {itemLabel}
            </div>
        </div>
    );
};

export default PaginationFooter;