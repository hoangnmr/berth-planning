import React from 'react';
import './ConfirmModal.css';

/**
 * Professional inline confirmation component
 * Non-popup style with overlay and centered card
 */
function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Xác nhận', 
  cancelText = 'Hủy', 
  onConfirm, 
  onCancel,
  confirmButtonClass = 'btn-confirm-primary'
}) {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="confirm-overlay" onClick={handleOverlayClick}>
      <div className="confirm-card">
        <div className="confirm-header">
          <h3 className="confirm-title">{title}</h3>
        </div>
        <div className="confirm-body">
          <p className="confirm-message">{message}</p>
        </div>
        <div className="confirm-footer">
          <button 
            className="btn-cancel" 
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`btn-confirm ${confirmButtonClass}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
