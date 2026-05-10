import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { clamp } from '../utils/formatters';

export const IconButton = ({ label, children, className = '', ...props }) => (
  <button aria-label={label} title={label} className={`icon-button ${className}`} {...props}>
    {children}
  </button>
);

export const ProgressBar = ({ value, tone = 'normal' }) => (
  <div className="progress-track" aria-hidden="true">
    <div className={`progress-fill ${tone}`} style={{ width: `${clamp(value, 0, 100)}%` }} />
  </div>
);

export const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen ? (
      <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
        <motion.div
          className="modal-panel"
          initial={{ y: 28, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 28, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="modal-header">
            <h2>{title}</h2>
            <IconButton label="Close" onClick={onClose}>
              <X size={19} />
            </IconButton>
          </div>
          {children}
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);
