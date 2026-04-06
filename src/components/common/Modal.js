import React from 'react';

/**
 * Unified Modal Component for all confirmation dialogs
 * Provides consistent UI across the application
 */
function Modal({
  isOpen,
  title,
  children,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  confirmButtonClass = 'btn-confirm-danger',
  footer // Custom footer content, if provided, overrides default buttons
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.25)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#fff",
        padding: "32px 24px 24px 24px",
        borderRadius: "12px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
        minWidth: "320px",
        textAlign: "center",
        maxWidth: "90vw",
        maxHeight: "90vh",
        overflow: "auto"
      }}>
        {title && <h2 style={{marginBottom: "18px"}}>{title}</h2>}
        <div style={{marginBottom: "18px"}}>
          {children}
        </div>
        {footer ? (
          footer
        ) : (
          <div style={{display: "flex", justifyContent: "center", gap: "8px"}}>
            {onConfirm && (
              <button
                style={{
                  fontSize: "16px",
                  padding: "8px 24px",
                  borderRadius: "6px",
                  background: confirmButtonClass === 'btn-confirm-danger' ? "#d9534f" : "#28a745",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer"
                }}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            )}
            {onCancel && (
              <button
                style={{
                  fontSize: "16px",
                  padding: "8px 24px",
                  borderRadius: "6px",
                  background: "#eee",
                  color: "#333",
                  border: "none",
                  cursor: "pointer"
                }}
                onClick={onCancel}
              >
                {cancelText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;