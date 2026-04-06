import React, { useState, useEffect } from 'react';

// Định nghĩa các berth với vị trí tuyệt đối
const BERTH_DEFINITIONS = [
  { id: 'K12C', name: 'K12C', start: 10, end: 199, refStart: 10 }, // Hệ quy chiếu riêng
  { id: 'K12A', name: 'K12A', start: 229, end: 361, refStart: 229 }, // K12A+K12+K12B dùng chung refStart
  { id: 'K12', name: 'K12', start: 361, end: 549, refStart: 231 },   // refStart riêng cho K12
  { id: 'K12B', name: 'K12B', start: 549, end: 753, refStart: 229 }, // refStart chung với K12A
  { id: 'TT2', name: 'TT2', start: 773, end: 995, refStart: 773 },   // Hệ quy chiếu riêng
];

const formatDateTimeLocal = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const tzoffset = d.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(d - tzoffset)).toISOString().slice(0, 16);
  return localISOTime;
};

const getDefaultDateTimeLocal = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01T00:00`;
};


function DetailPanel({ ship, onClose, onUpdate = () => {}, onToast }) {
  // Vị trí đầu tiên của từng bến (chỉ dùng trong DetailPanel)
  const FIRST_POS_BY_BERTH = {
    K12C: 0,
    K12A: 0,
    K12: 130,
    K12B: 320,
    TT2: 0,
  };

  // Tính toán vị trí start và end theo hệ quy chiếu của berth
  const calculatePositions = () => {
    // Ưu tiên dùng start/end từ ship nếu có
    if (ship.start !== null && ship.start !== undefined && ship.end !== null && ship.end !== undefined) {
      return { start: Number(ship.start), end: Number(ship.end) };
    }
    
    // Nếu không có start/end từ ship, tính từ style
    if (!ship.style || !ship.style.left || !ship.style.width) return { start: 0, end: 0 };
    
    // Parse left từ calc() expression, cho phép số âm
    const leftMatch = ship.style.left.match(/calc\((-?\d+)\s*\/\s*(\d+)\s*\*\s*100%\)/);
    const widthMatch = ship.style.width.match(/calc\((\d+)\s*\/\s*(\d+)\s*\*\s*100%\)/);
    
    if (leftMatch && widthMatch) {
      const absoluteStart = parseInt(leftMatch[1]);
      const width = parseInt(widthMatch[1]);
      const absoluteEnd = absoluteStart + width;
      
      // Chuyển đổi sang hệ quy chiếu của berth
      // Cho phép giá trị âm (ló tàu)
      let relativeStart = 0;
      let relativeEnd = 0;
      
      // Tìm berth definition dựa trên berthName
      const berthDef = BERTH_DEFINITIONS.find(b => b.id === ship.berthName);
      if (berthDef) {
        // Sử dụng refStart thay vì start để K12A, K12, K12B dùng chung hệ quy chiếu
        relativeStart = absoluteStart - berthDef.refStart;
        relativeEnd = absoluteEnd - berthDef.refStart;
      }
      
      return { start: relativeStart, end: relativeEnd };
    }
    
    return { start: 0, end: 0 };
  };
  
  const { start: calculatedStart, end: calculatedEnd } = calculatePositions();

  const [form, setForm] = useState({
    name: ship.name || '',
    dwt: ship.dwt || '',
    loa: ship.loa || '',
    beam: ship.beam || '',
    cargoType: ship.cargoType || '',
    cargo: ship.cargo || '',
    berthName: ship.berthName || '',
    mandra: ship.mandra || '',
    start: calculatedStart,
    end: calculatedEnd,
    eta: ship.eta ? formatDateTimeLocal(ship.eta) : getDefaultDateTimeLocal(),
    etd: ship.etd ? formatDateTimeLocal(ship.etd) : getDefaultDateTimeLocal(),
  });

  // Khi user chọn bến, tự động cập nhật start/end theo FIRST_POS_BY_BERTH và LOA (chỉ khi tàu chưa có start/end)
  useEffect(() => {
    if (form.berthName && FIRST_POS_BY_BERTH.hasOwnProperty(form.berthName) && 
        (ship.start === null || ship.start === undefined) && 
        (ship.end === null || ship.end === undefined)) {
      const newStart = FIRST_POS_BY_BERTH[form.berthName];
      const loa = Number(form.loa) || 0;
      setForm(prev => ({
        ...prev,
        start: newStart,
        end: newStart + loa
      }));
    }
    // Nếu chưa chọn bến hoặc tàu đã có start/end, không thay đổi
  }, [form.berthName, ship.start, ship.end]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newForm = { ...form, [name]: value };
    const loa = Number(newForm.loa || ship.loa || 0);
    if (name === 'start' && loa) {
      newForm.end = Number(value) + loa;
    }
    if (name === 'end' && loa) {
      newForm.start = Number(value) - loa;
    }
    // If LOA changed, keep start unchanged and update end = start + loa
    if (name === 'loa') {
      const newLoa = Number(value || 0);
      const curStart = Number(newForm.start || 0);
      newForm.end = curStart + newLoa;
    }
    setForm(newForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Kiểm tra ràng buộc ETD > ETA
    if (form.eta && form.etd) {
      const etaDate = new Date(form.eta);
      const etdDate = new Date(form.etd);
      if (etdDate <= etaDate) {
        if (onToast) onToast('ETD phải lớn hơn ETA!', 'error');
        return;
      }
    }
    // Nếu start/end được thay đổi, tính lại style.left/width
    let newStyle = { ...ship.style };
    let newStart = Number(form.start);
    let newEnd = Number(form.end);
    if (!isNaN(newStart) && !isNaN(newEnd) && form.berthName) {
      // Tìm refStart của berth (dùng form.berthName thay vì ship.berthName)
      const berthDef = BERTH_DEFINITIONS.find(b => b.id === form.berthName);
      if (berthDef) {
        const absStart = berthDef.refStart + newStart;
        const absEnd = berthDef.refStart + newEnd;
        const width = absEnd - absStart;
        newStyle.left = `calc(${absStart}/1005*100%)`;
        newStyle.width = `calc(${width}/1005*100%)`;
      }
    }
    if (onUpdate) onUpdate({ ...ship, ...form, style: newStyle });
  };

  return (
    <div className="panel detail-panel">
      {/* Header của Panel */}
      <div className="detail-panel-header">
        <h2>Thông Tin Chi Tiết Tàu</h2>
        <button className="btn-close-panel" onClick={onClose}>
          &times;
        </button>
      </div>

      {/* Form chứa thông tin chi tiết */}
  <form className="form-container" onSubmit={handleSubmit}>
        
        {/* (SỬA LỖI 3) Gỡ bỏ form-row và IMO */}
        <div className="form-group">
          <label>Tên tàu</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>DWT</label>
            <input type="number" name="dwt" value={form.dwt} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>LOA (m)</label>
            <input type="number" name="loa" value={form.loa} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>BEAM (m)</label>
            <input type="number" name="beam" value={form.beam} onChange={handleChange} />
          </div>
        </div>
         <div className="form-row">
          <div className="form-group">
            <label>Loại hàng</label>
            <select name="cargoType" value={form.cargoType} onChange={handleChange}>
              <option>Container</option>
              <option>Sắt thép</option>
              <option>Hàng khác</option>
            </select>
          </div>
          <div className="form-group">
            <label>Số lượng</label>
            <input type="text" name="cargo" value={form.cargo} onChange={handleChange} />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Cầu bến</label>
            {/* (SỬA LỖI 1) Đọc giá trị 'berthName' từ ship */}
            <select name="berthName" value={form.berthName} onChange={handleChange}>
              <option value="">-- Chọn bến --</option>
              <option value="K12C">K12C</option>
              <option value="K12A">K12A</option>
              <option value="K12">K12</option>
              <option value="K12B">K12B</option>
              <option value="TT2">TT2</option>
            </select>
          </div>
          <div className="form-group">
            <label>Mạn cập</label>
            <select name="mandra" value={form.mandra} onChange={handleChange}>
              <option value="">-- Chọn mạn --</option>
              <option value="left">Mạn trái</option>
              <option value="right">Mạn phải</option>
            </select>
          </div>
        </div>

        {/* Vị trí bắt đầu và kết thúc */}
        <div className="form-row">
          <div className="form-group">
            <label>Vị trí bắt đầu (m)</label>
            <input type="number" name="start" value={form.start} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Vị trí kết thúc (m)</label>
            <input type="number" name="end" value={form.end} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label>Ngày cập (ETA)</label>
          <input type="datetime-local" name="eta" value={form.eta} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Ngày rời (ETD)</label>
          <input type="datetime-local" name="etd" value={form.etd} onChange={handleChange} />
        </div>
        
        <button className="btn-primary" style={{marginTop: '10px'}} type="submit">
          Cập Nhật Kế Hoạch
        </button>
      </form>
    </div>
  );
}

export default DetailPanel;