import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface Props {
  eyebrow: string; title: string; onClose: () => void; children: ReactNode;
  footer?: ReactNode; size?: 'md' | 'lg' | 'xl'; tabs?: ReactNode;
}

/** Reference-style pop-up: blue header, red close button, cream body, optional footer. */
export function Modal({ eyebrow, title, onClose, children, footer, size = 'lg', tabs }: Props) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <motion.div className="overlay" onMouseDown={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
      <motion.div role="dialog" aria-modal="true" aria-label={title} className={`modal ${size}`}
        onMouseDown={(e) => e.stopPropagation()}
        initial={{ y: 28, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.2 }}>
        <header className="modal-head">
          <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>
          <button className="close-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </header>
        {tabs && <div className="modal-tabs">{tabs}</div>}
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-foot">{footer}</footer>}
      </motion.div>
    </motion.div>
  );
}
