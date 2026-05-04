import React from 'react';
import ImageBox from '../../../components/modals/imageBox/ImageBox';
import { useCurrency } from '../../../context/CurrencyContext';
import './Galery.css'; 

const Galery = ({ data }) => {
    const { symbol } = useCurrency();

    if (!data || data.length === 0) {
        return (
            <div className="empty-state">
                <i className="ti ti-photo-off"></i>
                <p>Arşivde kayıtlı fatura görseli bulunamadı.</p>
            </div>
        );
    }

    return (
        <div className="invoice-grid">
            {data.map((item) => (
                <div key={item.id} className="invoice-card-mini">
                    <ImageBox src={item.image} alt={item.title}>
                        <div className="mini-receipt-preview">
                            <img src={item.image} alt={item.title} loading="lazy" />
                        </div>
                    </ImageBox>

                    <div className="mini-info">
                        <div className="mini-header">
                            <strong>{item.title || item.merchant || 'İsimsiz Fatura'}</strong>
                            <span className="mini-date">{item.date}</span>
                        </div>
                        <div className="mini-footer">
                            <span className="mini-amount">
                                {item.currencySymbol || symbol}{item.amount}
                            </span>
                            <span className="category-tag">{item.category}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Galery;