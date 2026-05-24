import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { clamp } from '../utils/formatters';

export const IconButton = ({ label, children, className = '', ...props }) => {
  const classes = ['btn-icon'];
  if (className.includes('danger')) classes.push('danger');
  // Preserve any additional classes that aren't 'danger'
  const extra = className
    .split(' ')
    .filter((c) => c && c !== 'danger' && c !== 'btn-icon')
    .join(' ');
  if (extra) classes.push(extra);

  return (
    <button
      aria-label={label}
      title={label}
      className={classes.join(' ')}
      {...props}
    >
      {children}
    </button>
  );
};

export const ProgressBar = ({ value, tone = 'normal' }) => {
  const toneClass =
    tone === 'warning' || tone === 'watch'
      ? 'warning'
      : tone === 'danger' || tone === 'alert'
        ? 'danger'
        : '';

  return (
    <div className="progress-track" aria-hidden="true">
      <div
        className={`progress-fill ${toneClass}`}
        style={{ width: `${clamp(value, 0, 100)}%` }}
      />
    </div>
  );
};

export const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen ? (
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={onClose}
      >
        <motion.div
          className="modal-sheet"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="modal-sheet-handle" />
          <div className="modal-sheet-header">
            <h2 className="modal-sheet-title">{title}</h2>
            <button className="btn-icon" aria-label="Close" onClick={onClose}>
              <X size={19} />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);
