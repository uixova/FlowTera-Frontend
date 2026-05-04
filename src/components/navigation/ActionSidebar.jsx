import React, { useState, useEffect, useLayoutEffect, useCallback, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import './ActionSidebar.css';

const getPortalRoot = () => {
  let el = document.getElementById('sidebar-portal');
  if (!el) {
    el = document.createElement('div');
    el.id = 'sidebar-portal';
    document.body.appendChild(el);
  }
  return el;
};

const ActionSidebar = memo(({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = '460px',
}) => {
  const rafRef   = useRef(null);
  const timerRef = useRef(null);
  const panelRef = useRef(null);

  const [phase, setPhase] = useState(null);

  // Açma / Kapama
  useLayoutEffect(() => {
    if (isOpen) {
      rafRef.current = requestAnimationFrame(() => {
        setPhase(false);

        rafRef.current = requestAnimationFrame(() => {
          setPhase(true);
        });
      });
    } else {
      cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        setPhase(false);

        timerRef.current = setTimeout(() => {
          setPhase(null);
        }, 380); 
      });
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
    };
  }, [isOpen]);

  // Esc tuşu
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  // Body scroll lock (layout shift sıfır)
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    const prev    = document.body.style.cssText;
    document.body.style.cssText =
      `overflow:hidden;position:fixed;top:-${scrollY}px;left:0;right:0;`;
    return () => {
      document.body.style.cssText = prev;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // Overlay tıklaması 
  const handleOverlayClick = useCallback(
    (e) => { if (e.target === e.currentTarget) onClose(); },
    [onClose]
  );

  if (phase === null) return null;

  return createPortal(
    <>
      <div
        className={`as-overlay${phase ? ' is-active' : ''}`}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Panel'}
        className={`as-panel${phase ? ' is-open' : ''}`}
        style={{ '--sidebar-width': width }}
      >
        <div className="as-header">
          <div className="as-header-content">{title}</div>
          <button
            className="as-close-btn"
            onClick={onClose}
            aria-label="Kapat"
            type="button"
          >
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        <div className="as-body custom-scroll">
          {children}
        </div>

        {footer && (
          <div className="as-footer">
            {footer}
          </div>
        )}
      </div>
    </>,
    getPortalRoot()
  );
});

ActionSidebar.displayName = 'ActionSidebar';
export default ActionSidebar;