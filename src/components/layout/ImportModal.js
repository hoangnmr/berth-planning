import React, { useState, useEffect } from 'react';
import { checkOverlapAndGap } from '../../utils/styleCalculators';
import { CARGO_COLORS, normalizeCargoType } from '../../utils/constants';

const getColorClasses = (cargoType) => {
  const normalizedType = normalizeCargoType(cargoType);
  const colors = CARGO_COLORS[normalizedType];
  return { bar: colors.bar, fill: colors.cardFill };
};

function ImportModal({ show, rows = [], onClose, onImportSelected, berthedShips = [], startDate, validBerths = [] }) {
  const [localRows, setLocalRows] = useState([]);
  const [selectAll, setSelectAll] = useState(true);


  useEffect(() => {
    const initial = (rows || []).map(r => ({ ...r, include: r.errors.length === 0 }));
    setLocalRows(initial);
    setSelectAll(initial.length > 0 && initial.every(r => r.include));
  }, [rows]);

  const translateIssue = (msg) => {
    const m = String(msg || '').toLowerCase();
    if (m.includes('missing name')) return 'Thiếu tên tàu';
    if (m.includes('invalid eta')) return 'ETA không hợp lệ';
    if (m.includes('invalid etd')) return 'ETD không hợp lệ';
    if (m.includes('missing cargotype') || m.includes('missing cargo')) return 'Thiếu loại hàng';
    if (m.includes('missing position')) return 'Thiếu vị trí; sẽ tự gán trên bến';
    if (m.includes('missing')) return 'Thiếu dữ liệu';
    if (m.includes('invalid')) return 'Dữ liệu không hợp lệ';
    return msg;
  };

  const toggleInclude = (idx) => {
    const copy = [...localRows];
    copy[idx].include = !copy[idx].include;
    setLocalRows(copy);
    setSelectAll(copy.every(r => r.include));
  };

  const toggleSelectAll = () => {
    const target = !selectAll;
    const copy = localRows.map(r => ({ ...r, include: target && r.errors.length === 0 }));
    setLocalRows(copy);
    setSelectAll(target);
  };

  // validate a parsed row and return {errors,warnings,conflict}
  // eslint-disable-next-line no-unused-vars
  const validateRow = (parsed) => {
    const errors = [];
    const warnings = [];
    let conflict = null;
    if (!parsed.name) errors.push('Missing name');
    if (!parsed.cargoType) warnings.push('Missing cargoType');
    if (parsed.eta && isNaN(new Date(parsed.eta).getTime())) errors.push('Invalid ETA');
    if (parsed.etd && isNaN(new Date(parsed.etd).getTime())) errors.push('Invalid ETD');
    const berth = parsed.berthName ? String(parsed.berthName).trim() : '';
    if (berth && !validBerths.includes(berth)) warnings.push('Invalid berth; will be moved to waiting');
    if (berth && validBerths.includes(berth) && parsed.eta && parsed.etd && !isNaN(new Date(parsed.eta).getTime()) && !isNaN(new Date(parsed.etd).getTime())) {
      try {
        const res = checkOverlapAndGap(parsed, berthedShips, startDate);
        if (res && res.overlap) {
          errors.push(`Overlap with ${res.overlapShip?.name || 'existing ship'}`);
          if (res.overlapShip) conflict = { name: res.overlapShip.name, eta: res.overlapShip.eta, etd: res.overlapShip.etd };
        }
      } catch (e) {
        console.warn('Overlap check failed in modal', e);
      }
    }
    return { errors, warnings, conflict };
  };

  // eslint-disable-next-line no-unused-vars
  const toInputDateTime = (d) => {
    if (!d) return '';
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt.getTime())) return '';
    const pad = n => n.toString().padStart(2, '0');
    const yyyy = dt.getFullYear();
    const mm = pad(dt.getMonth() + 1);
    const dd = pad(dt.getDate());
    const hh = pad(dt.getHours());
    const min = pad(dt.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const handleImportSelected = () => {
    const selected = localRows.filter(r => r.include).map(r => ({ ...r.parsed, _importMeta: { errors: r.errors, warnings: r.warnings, conflict: r.conflict } }));
    onImportSelected && onImportSelected(selected);
  };


  if (!show) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '90%', maxWidth: 1100, background: '#fff', borderRadius: 8, padding: 16, maxHeight: '85vh', overflow: 'auto' }}>
  <h3>Xem trước nhập kế hoạch ({rows.length} tàu)</h3>
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <button
              onClick={toggleSelectAll}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: '#fff',
                color: '#0f172a',
                fontWeight: 500
              }}
              title={selectAll ? 'Bỏ chọn tất cả hàng' : 'Chọn tất cả hàng'}
            >
              {selectAll ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #fca5a5',
                background: '#fff5f5',
                color: '#b91c1c',
                minWidth: 92
              }}
            >Hủy</button>

            <button
              onClick={handleImportSelected}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: 'none',
                background: '#2563eb',
                color: '#fff',
                boxShadow: '0 2px 6px rgba(37,99,235,0.12)',
                minWidth: 140
              }}
            >Nhập mục đã chọn</button>

            {/* 'Nhập tất cả hợp lệ' button removed per request */}
          </div>
        </div>

  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 3px' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}></th>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Tên tàu</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Trạng thái</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Bến</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Start (m)</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>End (m)</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>ETA</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>ETD</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Loại hàng (số lượng)</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Xung đột</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Kiểm tra</th>
            </tr>
          </thead>
          <tbody>
            {localRows.map((r, idx) => {
              const { fill: fillClass } = getColorClasses(r.parsed.cargoType);
              const rowStyle = r.errors && r.errors.length ? { background: '#fff5f5' } : {};
              return (
                <tr key={idx} className={fillClass} style={rowStyle}>
                  <td style={{ padding: 6, textAlign: 'center' }}>
                    {(() => {
                      const hasOverlap = Array.isArray(r.errors) && r.errors.some(e => String(e).toLowerCase().includes('overlap'));
                      const hasInvalidBerth = Array.isArray(r.warnings) && r.warnings.some(w => String(w).toLowerCase().includes('invalid berth'));
                      const autoMove = hasOverlap || hasInvalidBerth;
                      return (<input type="checkbox" checked={!!r.include} disabled={r.errors.length>0 && !autoMove} onChange={() => toggleInclude(idx)} />);
                    })()}
                  </td>
                  <td style={{ padding: 6 }}>
                    {(() => {
                      const { bar: barClass } = getColorClasses(r.parsed.cargoType);
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className={`card-color-bar ${barClass}`} style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2 }}></span>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontWeight: 600 }}>{r.parsed.name}</div>
                            <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280' }}>
                              {r.parsed.dwt ? <span style={{ marginRight: 12 }}>DWT: {r.parsed.dwt}</span> : null}
                              {r.parsed.loa ? <span>LOA: {r.parsed.loa} m</span> : null}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                  <td style={{ padding: 6 }}>{r.parsed.status}</td>
                  <td style={{ padding: 6 }}>{r.parsed.berthName || ''}</td>
                  <td style={{ padding: 6 }}>{r.parsed.start !== undefined && r.parsed.start !== null ? String(r.parsed.start) : ''}</td>
                  <td style={{ padding: 6 }}>{r.parsed.end !== undefined && r.parsed.end !== null ? String(r.parsed.end) : ''}</td>
                  <td style={{ padding: 6 }}>{r.parsed.eta ? (new Date(r.parsed.eta)).toLocaleString() : ''}</td>
                  <td style={{ padding: 6 }}>{r.parsed.etd ? (new Date(r.parsed.etd)).toLocaleString() : ''}</td>
                  <td style={{ padding: 6 }}>{(r.parsed.cargoType ? String(r.parsed.cargoType) : '') + (r.parsed.cargo ? (' - ' + String(r.parsed.cargo)) : '')}</td>
                  <td style={{ padding: 6 }}>
                    {r.conflict ? (
                      <div style={{ color: '#b91c1c' }}>
                        <div>{r.conflict.name}</div>
                        {r.conflict.eta ? <div style={{ fontSize: 12, color: '#6b7280' }}>{(new Date(r.conflict.eta)).toLocaleString()}</div> : null}
                        {r.conflict.etd ? <div style={{ fontSize: 12, color: '#6b7280' }}>{(new Date(r.conflict.etd)).toLocaleString()}</div> : null}
                      </div>
                    ) : null}
                  </td>
                  <td style={{ padding: 6 }}>
                    {(() => {
                      const hasOverlap = Array.isArray(r.errors) && r.errors.some(e => String(e).toLowerCase().includes('overlap'));
                      const hasInvalidBerth = Array.isArray(r.warnings) && r.warnings.some(w => String(w).toLowerCase().includes('invalid berth'));
                      const autoMove = hasOverlap || hasInvalidBerth;
                      if (autoMove) {
                        // show yellow note explaining why it will be moved to waiting
                        const reason = hasOverlap ? (r.conflict?.name ? `Chồng lấn với ${r.conflict.name}` : r.errors.join('; ')) : 'Bến không hợp lệ';
                        return (<div style={{ background: '#fff7ed', padding: 8, borderRadius: 6, color: '#92400e' }}>Sẽ chuyển vào danh sách chờ: {reason}</div>);
                      }
                      if (r.errors.length > 0) {
                        return (<div style={{ color: '#b91c1c' }}>{r.errors.map((e,i) => <div key={i}>{translateIssue(e)}</div>)}</div>);
                      }
                      if (r.warnings.length > 0) {
                        return (<div style={{ color: '#b45309' }}>{r.warnings.map(w => translateIssue(w)).join('; ')}</div>);
                      }
                      return (<div style={{ color: '#16a34a' }}>OK</div>);
                    })()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ImportModal;
