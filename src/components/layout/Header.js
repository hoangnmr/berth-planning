import React, { useState, useRef, useEffect } from 'react';
import ConfirmModal from '../common/ConfirmModal';

function ChangePasswordModal({ show, onClose, onChangePassword, error, passwordFields }) {
  return show ? (
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
        minWidth: "340px",
        textAlign: "center"
      }}>
        <h2 style={{marginBottom: "18px"}}>Đổi mật khẩu đăng nhập</h2>
        <div style={{marginBottom: "12px", textAlign: "left"}}>
          <label style={{fontWeight: 500}}>Mật khẩu cũ:</label>
          <input
            type="password"
            value={passwordFields.old}
            onChange={e => onChangePassword('old', e.target.value)}
            style={{fontSize: "16px", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc", width: "100%", marginTop: "4px"}}
            autoFocus
          />
        </div>
        <div style={{marginBottom: "12px", textAlign: "left"}}>
          <label style={{fontWeight: 500}}>Mật khẩu mới:</label>
          <input
            type="password"
            value={passwordFields.new}
            onChange={e => onChangePassword('new', e.target.value)}
            style={{fontSize: "16px", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc", width: "100%", marginTop: "4px"}}
          />
        </div>
        <div style={{marginBottom: "12px", textAlign: "left"}}>
          <label style={{fontWeight: 500}}>Xác nhận mật khẩu mới:</label>
          <input
            type="password"
            value={passwordFields.confirm}
            onChange={e => onChangePassword('confirm', e.target.value)}
            style={{fontSize: "16px", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc", width: "100%", marginTop: "4px"}}
          />
        </div>
        <button
          style={{fontSize: "16px", padding: "8px 24px", borderRadius: "6px", background: "#1976d2", color: "#fff", border: "none", cursor: "pointer", marginRight: "8px"}}
          onClick={() => onChangePassword('submit')}
        >Đổi mật khẩu</button>
        <button
          style={{fontSize: "16px", padding: "8px 24px", borderRadius: "6px", background: "#eee", color: "#333", border: "none", cursor: "pointer"}}
          onClick={onClose}
        >Hủy</button>
        {error && (
          <div style={{color: "#d32f2f", marginTop: "10px"}}>{error}</div>
        )}
      </div>
    </div>
  ) : null;
}

function Header({ numDays, onDayChange, startDate, onStartDateChange, onSavePlan, onOpenPlan, onClearPlan, onImportPlan, onExportPDF, onExportDetailedReport }) {
  // Password change modal state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changeError, setChangeError] = useState("");
  const [passwordFields, setPasswordFields] = useState({ old: "", new: "", confirm: "" });
  // Handler for password modal fields
  const handleChangePasswordField = (field, value) => {
    if (field === 'submit') {
      const { old, new: newPw, confirm } = passwordFields;
      if (old !== getCurrentPassword()) {
        setChangeError("Mật khẩu cũ không đúng!");
        return;
      }
      if (!newPw || !confirm) {
        setChangeError("Vui lòng nhập đầy đủ mật khẩu mới!");
        return;
      }
      if (newPw !== confirm) {
        setChangeError("Mật khẩu mới không khớp!");
        return;
      }
      setCurrentPassword(newPw);
      setShowChangePassword(false);
      setPasswordFields({ old: "", new: "", confirm: "" });
      setChangeError("");
      alert("Đổi mật khẩu thành công!");
    } else {
      setPasswordFields(prev => ({ ...prev, [field]: value }));
      setChangeError("");
    }
  };
  // Get/set password from localStorage, fallback to default
  const DEFAULT_PASSWORD = "HoangTT@2025";
  const getCurrentPassword = () => {
    return localStorage.getItem("plannerPassword") || DEFAULT_PASSWORD;
  };
  const setCurrentPassword = (pw) => {
    localStorage.setItem("plannerPassword", pw);
  };
  const dayOptions = [1, 7, 10, 15, 30, 35, 40, 45, 60];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const menuRef = useRef(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const adjustDate = (days) => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + days);
    onStartDateChange(newDate);
  };

  const handleDateInputChange = (e) => {
    const newDate = new Date(e.target.value + 'T00:00:00');
    if (!isNaN(newDate.getTime())) {
      onStartDateChange(newDate);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {showImportConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} onClick={() => { setShowImportConfirm(false); setIsMenuOpen(false); }} />
          <div style={{ background: '#fff', padding: 20, borderRadius: 8, width: 460, zIndex: 10000, boxShadow: '0 6px 24px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0 }}>Xác nhận</h3>
            <p>Bạn có chắc muốn xóa kế hoạch hiện tại trước khi import? Hành động này sẽ xóa toàn bộ kế hoạch đang có.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button onClick={() => { setShowImportConfirm(false); setIsMenuOpen(false); }} style={{ padding: '8px 12px', borderRadius: 6, background: '#eee', border: 'none' }}>Hủy</button>
              <button onClick={() => { if (onClearPlan) onClearPlan(true); if (onImportPlan) onImportPlan(); setShowImportConfirm(false); setIsMenuOpen(false); }} style={{ padding: '8px 12px', borderRadius: 6, background: '#dc2626', color: '#fff', border: 'none' }}>Xóa và Import</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showClearConfirm}
        title="Xác nhận"
        message={<>Bạn có chắc muốn xóa toàn bộ kế hoạch không? Hành động này sẽ xóa toàn bộ kế hoạch đang có.</>}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={() => { if (onClearPlan) onClearPlan(); setShowClearConfirm(false); }}
        onCancel={() => { setShowClearConfirm(false); }}
        confirmButtonClass="btn-confirm-primary"
      />
      {showChangePassword && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9998,
            pointerEvents: "none"
          }}
        >
          <div
            style={{
              width: "100vw",
              height: "100vh",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              background: "rgba(0,0,0,0.18)",
              pointerEvents: "none"
            }}
          />
        </div>
      )}
      <header className="app-header" style={showChangePassword ? { position: 'relative', zIndex: 10000 } : {}}>
        <h1>HỆ THỐNG QUẢN LÝ CẦU BẾN (Berth Planning)</h1>
        <ChangePasswordModal
          show={showChangePassword}
          onClose={() => { setShowChangePassword(false); setChangeError(""); setPasswordFields({ old: "", new: "", confirm: "" }); }}
          onChangePassword={handleChangePasswordField}
          error={changeError}
          passwordFields={passwordFields}
        />
        <div className="header-buttons">
          {/* Bộ chọn ngày bắt đầu */}
          <div className="date-selector-wrapper">
            <label>Ngày bắt đầu:</label>
            <button 
              className="btn-date-nav" 
              onClick={() => adjustDate(-1)}
              title="Giảm 1 ngày"
            >
              <span role="img" aria-label="left">◀</span>
            </button>
            <input 
              type="date" 
              value={formatDate(startDate)}
              onChange={handleDateInputChange}
              className="date-input"
            />
            <button 
              className="btn-date-nav" 
              onClick={() => adjustDate(1)}
              title="Tăng 1 ngày"
            >
              <span role="img" aria-label="right">▶</span>
            </button>
          </div>

          <div className="day-selector-wrapper">
            <label htmlFor="day-select">Hiển thị:</label>
            <select 
              id="day-select" 
              value={numDays}
              onChange={(e) => onDayChange(e.target.value)}
            >
              {dayOptions.map(day => (
                <option key={day} value={day}>{day} ngày</option>
              ))}
            </select>
          </div>

          {/* Nút bánh răng và menu dropdown */}
          <div className="options-menu-wrapper" ref={menuRef}>
            <button className="btn-icon btn-options" title="Tùy chọn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2, 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
            {isMenuOpen && (
              <div className="options-menu">
                {/* Group 1: Open / Save */}
                <div>
                  <button onClick={() => { onOpenPlan(); setIsMenuOpen(false); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  Mở Kế hoạch
                </button>
                <button onClick={() => { onSavePlan(); setIsMenuOpen(false); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                  Lưu Kế hoạch
                </button>
                </div>
                <div className="menu-divider"></div>
                {/* Group 2: Import (Excel) */}
                <div>
                  <button onClick={() => { setShowImportConfirm(true); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline></svg>
                    Import kế hoạch từ EXCEL
                  </button>
                </div>
                <div className="menu-divider"></div>
                {/* Group 3: Exports */}
                <div>
                <button onClick={() => { onExportPDF(); setIsMenuOpen(false); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  Xuất PDF
                </button>
                <button onClick={() => { if (onExportDetailedReport) { onExportDetailedReport(); } setIsMenuOpen(false); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"></path><path d="M16 3v4H8V3"></path><rect x="7" y="11" width="10" height="6" rx="1"></rect></svg>
                  Xuất Báo cáo chi tiết
                </button>
                </div>
                <div className="menu-divider"></div>
                {/* <div className="menu-divider"></div>
                <button onClick={() => { setShowChangePassword(true); setIsMenuOpen(false); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  Đổi mật khẩu
                </button>
                <div className="menu-divider"></div> */}
                <button className="menu-item-danger" onClick={() => { setShowClearConfirm(true); setIsMenuOpen(false); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  Xóa Kế hoạch
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}

export default Header;