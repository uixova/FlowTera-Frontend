import React, { useState, useEffect, useCallback } from 'react'; 
import { createPortal } from 'react-dom';
import './ImageBox.css';

const ImageBox = ({ src, alt, children, onToggle }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Fonksiyonu useCallback ile sarmalıyoruz
    const toggleOpen = useCallback((state) => {
        setIsOpen(state);
        if (onToggle) onToggle(state);
    }, [onToggle]); // onToggle değişirse fonksiyon güncellenir

    // ESC tuşu ile kapanma ve body scroll engelleme için useEffect kullanıyoruz
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') toggleOpen(false);
        };
        
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset'; 
        };
    }, [isOpen, toggleOpen]); 

    return (
        <>
            {/* Tetikleyici Alan */}
            <div className="image-box-trigger" onClick={() => toggleOpen(true)}>
                {children || <img src={src} alt={alt} />}
                <div className="image-box-zoom-overlay">
                    <i className="ti ti-maximize"></i>
                    <span>Tam Faturayı Görüntüleyin</span>
                </div>
            </div>

            {/* Fullscreen Portal */}
            {isOpen && createPortal(
                <div className="image-box-overlay" onClick={() => toggleOpen(false)}>
                    <div className="image-box-top-bar">
                        <span className="image-box-filename">{alt || 'Receipt View'}</span>
                        <button className="image-box-close" onClick={() => toggleOpen(false)}>
                            <i className="ti ti-x"></i>
                            <span>Kapat</span>
                        </button>
                    </div>

                    <div className="image-box-content" onClick={(e) => e.stopPropagation()}>
                        <img src={src} alt={alt} className="image-box-fullscreen" />
                    </div>

                    {alt && <div className="image-box-caption">{alt}</div>}
                </div>,
                document.body
            )}
        </>
    );
};

export default ImageBox;