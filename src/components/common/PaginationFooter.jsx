import React from 'react';

const PaginationFooter = ({ hasMore, loadingMore, loadMore, currentCount, totalCount, label = "items" }) => {
    const safeCurrentCount = Number(currentCount) || 0;
    const safeTotalCount = Number.isFinite(Number(totalCount)) ? Number(totalCount) : safeCurrentCount;
    
    return (
        <div className="pagination-footer">
            {hasMore && (
                <button 
                    className="load-more-btn" 
                    onClick={loadMore} 
                    disabled={loadingMore}
                >
                    {loadingMore ? (
                        <><i className="ti ti-loader-2 animate-spin"></i> Loading...</>
                    ) : (
                        <>Show More <i className="ti ti-chevron-down"></i></>
                    )}
                </button>
            )}
            <div className="pagination-info">
                Showing {safeCurrentCount} / {safeTotalCount} {label}
            </div>
        </div>
    );
};

export default PaginationFooter;