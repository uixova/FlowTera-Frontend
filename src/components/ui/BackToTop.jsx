import React, { useState, useEffect, useRef } from 'react';
import './BackToTop.css';

const BackToTop = ({ scrollContainerSelector = null, scrollThreshold = 400 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        let target = window;

        if (scrollContainerSelector) {
            target = document.querySelector(scrollContainerSelector);
            if (!target) return;
            scrollContainerRef.current = target;
        }

        const handleScroll = () => {
            const scrollY = scrollContainerSelector 
                ? target.scrollTop 
                : window.scrollY;
            setIsVisible(scrollY > scrollThreshold);
        };

        target.addEventListener('scroll', handleScroll);
        return () => target.removeEventListener('scroll', handleScroll);
    }, [scrollContainerSelector, scrollThreshold]);

    const scrollToTop = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (!isVisible) return null;

    return (
        <button 
            className="back-to-top"
            onClick={scrollToTop}
            aria-label="En üste dön"
        >
            <i className="ti ti-arrow-up" />
        </button>
    );
};

export default BackToTop;
