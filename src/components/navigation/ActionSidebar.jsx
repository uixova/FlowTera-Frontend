import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import './ActionSidebar.css';

const ActionSidebar = memo(({
    isOpen,
    onClose,
    title,
    children,
    footer,
    width = '520px',
}) => {
    const [mounted, setMounted] = useState(isOpen);
    const [isAnimating, setIsAnimating] = useState(false);
    const panelRef = useRef(null);

    if (isOpen && !mounted) {
        setMounted(true);
    }

    const handleEsc = useCallback((e) => {
        if (e.key === 'Escape' && isOpen) onClose();
    }, [isOpen, onClose]);

    useEffect(() => {
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [handleEsc]);

    useEffect(() => {
        let timer;
        
        if (isOpen) {
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollBarWidth}px`;
            
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setIsAnimating(true));
            });
        } else if (mounted) {
            requestAnimationFrame(() => {
                setIsAnimating(false);
            });
            
            timer = setTimeout(() => {
                setMounted(false);
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
            }, 400);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isOpen, mounted]);

    if (!mounted) return null;

    return createPortal(
        <div className={`as-wrapper ${isAnimating ? 'is-active' : ''}`} role="dialog" aria-modal="true">
            <div className="as-overlay" onClick={onClose} />
            <div 
                className="as-panel" 
                ref={panelRef}
                style={{ '--as-width': width }}
            >
                <div className="as-header">
                    <div className="as-header-content">
                        {typeof title === 'string' ? <h2>{title}</h2> : title}
                    </div>
                    <button className="as-close-circle" onClick={onClose} aria-label="Kapat">
                        <i className="ti ti-x"></i>
                    </button>
                </div>
                <div className="as-body custom-scroll">
                    <div className="as-content-motion">
                        {children}
                    </div>
                </div>
                {footer && (
                    <div className="as-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
});

export default ActionSidebar;