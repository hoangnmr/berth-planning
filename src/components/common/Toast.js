import React, { useEffect } from 'react';
import './Toast.css';

function Toast({ message, type = 'info', onClose, duration = 2500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast toast-${type}`}>{message}</div>
  );
}

export default Toast;
