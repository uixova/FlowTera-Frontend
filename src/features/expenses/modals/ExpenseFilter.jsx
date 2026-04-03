import React from 'react';

const ExpenseFilter = ({ filters, setFilters }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="filter-sidebar-content">
            {/* Category Seçimi */}
            <div className="filter-input-group">
                <label>Category</label>
                <select name="category" value={filters.category} onChange={handleChange}>
                    <option value="">All Categories</option>
                    <option value="Travel">Travel</option>
                    <option value="Food & Drink">Food & Drink</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Transport">Transport</option>
                    <option value="Entertainment">Entertainment</option>
                </select>
            </div>

            {/* Status Seçimi */}
            <div className="filter-input-group">
                <label>Status</label>
                <select name="status" value={filters.status} onChange={handleChange}>
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {/* Payment Method Seçimi */}
            <div className="filter-input-group">
                <label>Payment Method</label>
                <select name="paymentMethod" value={filters.paymentMethod} onChange={handleChange}>
                    <option value="">All Methods</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                </select>
            </div>

            {/* Amount Aralığı (Min - Max) */}
            <div className="filter-amount-row">
                <div className="filter-input-group">
                    <label>Min Amount</label>
                    <input 
                        type="number" 
                        name="minAmount"
                        placeholder="0" 
                        value={filters.minAmount}
                        onChange={handleChange}
                    />
                </div>
                <div className="filter-input-group max-amount">
                    <label>Max Amount</label>
                    <input 
                        type="number" 
                        name="maxAmount"
                        placeholder="Max" 
                        value={filters.maxAmount}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default ExpenseFilter;