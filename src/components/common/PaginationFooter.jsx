import React from 'react';

const PaginationFooter = ({ hasMore, loadingMore, loadMore, currentCount, label = "items" }) => {
    
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
                Showing {currentCount} {label}
            </div>
        </div>
    );
};

export default PaginationFooter;