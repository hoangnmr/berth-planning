
import React, { useState, useEffect, useRef } from 'react';
import Toast from './components/common/Toast';
import ConfirmModal from './components/common/ConfirmModal';
import './App.css';
import Header from './components/layout/Header';
import ImportModal from './components/layout/ImportModal';
import * as XLSX from 'xlsx';
import { exportPlanToPDF } from './services/fileService';
import { generateFileName } from './utils/dateHelpers';
import { BERTH_REFERENCES } from './utils/constants';
import { computeBerthUtilization } from './utils/berthUtilization';
import ControlPanel from './components/layout/ControlPanel';
import DetailPanel from './components/layout/DetailPanel'; // Import Panel mới
import BerthPlanner from './components/planner/BerthPlanner';

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

function App() {
  // Modal xác nhận xóa tàu
  const [confirmRemove, setConfirmRemove] = useState({ show: false, ship: null });
  // Modal xác nhận xóa tàu khỏi waiting list
  const [confirmDeleteWaiting, setConfirmDeleteWaiting] = useState({ show: false, ship: null });
  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  // SHA-256 hash of default password (not reversible)
  const DEFAULT_PASSWORD_HASH = "745427de3e6ddb3e9f059de3da1e24ba4d3ba5f3bd61da3ce7f371bd97f25cc3";
  const hashPassword = async (pw) => {
    const msgBuffer = new TextEncoder().encode(pw);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };
  const getCurrentPasswordHash = () => {
    return localStorage.getItem("plannerPasswordHash") || DEFAULT_PASSWORD_HASH;
  };
  const setCurrentPasswordHash = async (pw) => {
    const hash = await hashPassword(pw);
    localStorage.setItem("plannerPasswordHash", hash);
  };
  const verifyPassword = async (pw) => {
    const hash = await hashPassword(pw);
    return hash === getCurrentPasswordHash();
  };
  // Cờ để ngăn useEffect lọc tàu khi đang khôi phục kế hoạch
  const isRestoringPlan = useRef(false);
  // Highlight tàu chồng lấn
  const [highlightedShips, setHighlightedShips] = useState([]);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  // Import modal state
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importRows, setImportRows] = useState([]);
  // Valid berth names for import - others will be cleared and treated as waiting
  const VALID_BERTHS = ['K12C', 'K12A', 'K12', 'K12B', 'TT2'];
  // Hàm mở file kế hoạch và khôi phục trạng thái
  const handleOpenPlan = async () => {
    try {
      // Tạo input file động
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const text = await file.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          setToast({ message: 'File không hợp lệ!', type: 'error' });
          return;
        }
        // Khôi phục state
        if (Array.isArray(data.cranes)) {
          cranePositionsRef.current = data.cranes;
        }
        if (Array.isArray(data.berthedShips)) {
          isRestoringPlan.current = true;
          setBerthedShips(data.berthedShips.map(ship => ({
            ...ship,
            eta: ship.eta ? new Date(ship.eta) : null,
            etd: ship.etd ? new Date(ship.etd) : null
          })));
        }
        if (Array.isArray(data.waitingShips)) {
          setWaitingShips(data.waitingShips.map(ship => ({
            ...ship,
            eta: ship.eta ? new Date(ship.eta) : null,
            etd: ship.etd ? new Date(ship.etd) : null
          })));
        }
        if (data.startDate) {
          setStartDate(new Date(data.startDate));
        }
        if (data.numDays) {
          setNumDays(data.numDays);
        }
        setToast({ message: 'Đã mở và khôi phục kế hoạch thành công!', type: 'success' });
      };
      input.click();
    } catch (err) {
      setToast({ message: 'Lỗi khi mở file kế hoạch!', type: 'error' });
    }
  };

  // Hàm import kế hoạch từ file Excel (.xlsx)
  const handleImportPlan = async () => {
    // helper: robustly parse various Excel/JS date representations into JS Date or null
    const parseImportedDate = (v) => {
      if (v === undefined || v === null || v === '') return null;
      // already a Date
      if (v instanceof Date && !isNaN(v.getTime())) return v;
      // number (Excel serial) -> try SheetJS helper
      if (typeof v === 'number' && typeof XLSX !== 'undefined' && XLSX.SSF && XLSX.SSF.parse_date_code) {
        try {
          const dc = XLSX.SSF.parse_date_code(v);
          if (!dc) return null;
          // dc: {y,m,d,H,M,S, etc}
          return new Date(dc.y, (dc.m || 1) - 1, dc.d || 1, dc.H || 0, dc.M || 0, Math.floor(dc.S || 0));
        } catch (e) {
          // fallback to Excel epoch conversion
          const excelEpoch = new Date(Date.UTC(1899, 11, 30));
          const days = Math.floor(v);
          const ms = Math.round((v - days) * 24 * 60 * 60 * 1000);
          return new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000 + ms);
        }
      }
      // numeric-like string? try to coerce
      if (typeof v === 'string') {
        const s = v.trim();
        if (!s) return null;
        // if purely digits (maybe Excel serial stored as string)
        if (/^\d+(?:\.\d+)?$/.test(s)) {
          const n = Number(s);
          return parseImportedDate(n);
        }
        // try native Date parse
        const d1 = new Date(s);
        if (!isNaN(d1.getTime())) return d1;
        // try common dd/mm/yyyy or dd-mm-yyyy
        const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
        if (m) {
          const day = Number(m[1]);
          const month = Number(m[2]);
          let year = Number(m[3]);
          if (year < 100) year += 2000;
          const hour = m[4] ? Number(m[4]) : 0;
          const minute = m[5] ? Number(m[5]) : 0;
          const second = m[6] ? Number(m[6]) : 0;
          return new Date(year, month - 1, day, hour, minute, second);
        }
        // try ISO-like
        const iso = Date.parse(s);
        if (!isNaN(iso)) return new Date(iso);
      }
      return null;
    };
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          const data = await file.arrayBuffer();
          // read with cellDates so SheetJS will emit Date objects for date-formatted cells
          const wb = XLSX.read(data, { type: 'array', cellDates: true });
          const sheetName = wb.SheetNames.includes('Ships') ? 'Ships' : wb.SheetNames[0];
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });

          // Parse rows first into parsed objects
          const parsedRows = rows.map((r, idx) => {
            const norm = {};
            Object.keys(r).forEach(k => { norm[k.trim().toLowerCase()] = r[k]; });
            const name = norm['name'] || norm['tên tàu'] || norm['tentau'] || '';
            const id = norm['id'] || ('X' + Date.now() + '_' + idx);
            // status: normalize to uppercase, accept various headers
            const statusRaw = norm['status'] || norm['trạng thái'] || norm['trangthai'] || '';
            const status = statusRaw ? String(statusRaw).trim().toUpperCase() : '';
            // berthName: normalize, accept various headers, case-insensitive comparison later
            let berthName = norm['berthname'] || norm['berth'] || norm['bến'] || norm['ben'] || '';
            berthName = berthName ? String(berthName).trim().toUpperCase() : '';
            // positions: accept various headers, normalize to number or undefined
            const startRaw = norm['startposition'] || norm['start'] || norm['startpos'] || norm['vị trí bắt đầu'] || norm['vitribatdau'];
            const endRaw = norm['endposition'] || norm['end'] || norm['endpos'] || norm['vị trí kết thúc'] || norm['vitriketthuc'];
            const start = (startRaw !== undefined && startRaw !== null && String(startRaw).trim() !== '') ? Number(startRaw) : undefined;
            const end = (endRaw !== undefined && endRaw !== null && String(endRaw).trim() !== '') ? Number(endRaw) : undefined;
            const eta = parseImportedDate(norm['eta'] || norm['etb'] || norm['ngày đến'] || norm['ngayden']);
            const etd = parseImportedDate(norm['etd'] || norm['etc'] || norm['ngày đi'] || norm['ngaydi']);
            // cargo fields: accept various headers, normalize cargoType to UPPERCASE
            const cargoTypeRaw = norm['cargotype'] || norm['loại hàng'] || norm['loaihang'] || norm['type'] || '';
            const cargoType = cargoTypeRaw ? String(cargoTypeRaw).trim().toUpperCase() : '';
            const cargo = norm['cargo'] || norm['khối lượng'] || norm['khoiluong'] || norm['lượng hàng'] || norm['luonghang'] || '';
            const dwt = norm['dwt'] || norm['trọng tải'] || norm['trongtai'] ? Number(norm['dwt'] || norm['trọng tải'] || norm['trongtai']) : undefined;
            const loa = norm['loa'] || norm['chiều dài'] || norm['chieudai'] ? Number(norm['loa'] || norm['chiều dài'] || norm['chieudai']) : undefined;
            const beam = norm['beam'] || norm['chiều rộng'] || norm['chieurong'] ? Number(norm['beam'] || norm['chiều rộng'] || norm['chieurong']) : undefined;
            const notes = norm['notes'] || norm['ghi chú'] || norm['ghichu'] || '';
            // mạn cập / side (accept various header names and values) -> normalize to 'left' | 'right' | ''
            const mandraRaw = norm['mandra'] || norm['mạn'] || norm['man'] || norm['mạn cập'] || norm['mancap'] || norm['mancạp'] || norm['side'] || '';
            let mandra = '';
            if (mandraRaw !== undefined && mandraRaw !== null && String(mandraRaw).toString().trim() !== '') {
              const s = String(mandraRaw).trim().toLowerCase();
              if (['left', 'l', 'trái', 'trai', 'port', 'port side', 'p'].includes(s)) mandra = 'left';
              else if (['right', 'r', 'phải', 'phai', 'starboard', 's'].includes(s)) mandra = 'right';
            }
            return { id, name, status, berthName, start, end, eta, etd, cargoType, cargo, dwt, loa, beam, notes, mandra, original: r };
          });

          // Now validate each parsed row against existing berthed ships AND other parsed rows
          const preview = parsedRows.map((parsed, idx) => {
            const errors = [];
            const warnings = [];
            if (!parsed.name) errors.push('Missing name');
            if (!parsed.cargoType) warnings.push('Missing cargoType');
            if (parsed.eta && isNaN(new Date(parsed.eta).getTime())) errors.push('Invalid ETA');
            if (parsed.etd && isNaN(new Date(parsed.etd).getTime())) errors.push('Invalid ETD');
            if (parsed.berthName && (!parsed.start && parsed.start !== 0)) warnings.push('Missing position; will auto-place on berth');

            let conflict = null;
            // Build a collection to check overlaps against: current berthed + other parsed rows (excluding self)
            const others = berthedShips.concat(parsedRows.filter((p, j) => j !== idx));
            // Case-insensitive berth validation
            const isBerthValid = parsed.berthName && VALID_BERTHS.some(vb => vb.toUpperCase() === String(parsed.berthName).trim().toUpperCase());
            if (isBerthValid && parsed.eta && parsed.etd && !isNaN(new Date(parsed.eta).getTime()) && !isNaN(new Date(parsed.etd).getTime())) {
              try {
                const overlapRes = checkOverlapAndGap(parsed, others, startDate);
                if (overlapRes && overlapRes.overlap) {
                  const other = overlapRes.overlapShip;
                  errors.push(`Overlap with ${other?.name || 'existing ship'}`);
                  conflict = other ? { name: other.name, eta: other.eta, etd: other.etd } : { name: 'existing ship' };
                }
              } catch (e) {
                console.warn('Overlap check failed', e);
              }
            }

            return { original: parsed.original, parsed, errors, warnings, conflict };
          });

          setImportRows(preview);
          setImportModalVisible(true);
        } catch (err) {
          console.error('Error parsing XLSX', err);
          setToast({ message: 'Lỗi khi đọc file Excel', type: 'error' });
        }
      };
      input.click();
    } catch (err) {
      console.error('Import error', err);
      setToast({ message: 'Lỗi khi import file Excel', type: 'error' });
    }
  };
  // Ref để lấy vị trí cẩu từ BerthHeader
  const cranePositionsRef = useRef([]);
  // Thêm tàu mới vào waiting list
  const handleAddWaitingShip = (ship) => {
    setWaitingShips(prev => [...prev, ship]);
    setToast({ message: `Đã thêm tàu ${ship.name} vào danh sách chờ.`, type: 'success' });
  };

  // Xóa tàu khỏi waiting list
  const handleDeleteWaitingShip = (ship) => {
    if (!confirmDeleteWaiting.show) {
      setConfirmDeleteWaiting({ show: true, ship });
    }
  };

  const confirmDeleteWaitingShip = () => {
    if (confirmDeleteWaiting.ship) {
      setWaitingShips(prev => prev.filter(s => s.id !== confirmDeleteWaiting.ship.id));
      setToast({ message: `Đã xóa tàu ${confirmDeleteWaiting.ship.name} khỏi danh sách chờ.`, type: 'info' });
    }
    setConfirmDeleteWaiting({ show: false, ship: null });
  };

  const cancelDeleteWaitingShip = () => {
    setConfirmDeleteWaiting({ show: false, ship: null });
  };

  // Cập tàu từ waiting list vào planner
  const handleDockShipFromWaiting = (ship) => {
    // Kiểm tra tàu có đầy đủ thông tin không
    if (!ship.eta || !ship.etd || !ship.berthName || !ship.loa) {
      setToast({ message: `Tàu ${ship.name} chưa đủ thông tin (ETA, ETD, Berth, LOA). Vui lòng cập nhật trước khi cập cầu.`, type: 'error' });
      return;
    }
    
    const refStart = BERTH_REFERENCES[ship.berthName] || 10;

    // Tính start và end theo hệ quy chiếu pitch (relative-to-berth)
    let startRel, endRel;
    if (ship.start !== undefined && ship.start !== null && !isNaN(Number(ship.start))) {
      startRel = Number(ship.start);
      endRel = (ship.end !== undefined && ship.end !== null && !isNaN(Number(ship.end))) ? Number(ship.end) : (startRel + (ship.loa || 100));
    } else {
      // fallback: đặt vào vị trí đầu bến
      startRel = 0;
      endRel = ship.loa || 100;
    }

    const absStart = refStart + startRel;
    const absEnd = refStart + endRel;
    const shipWidth = absEnd - absStart;
    const left = `calc(${absStart}/1005*100%)`;
    const width = `calc(${shipWidth}/1005*100%)`;
    
    // Kiểm tra chồng lấn trước khi thêm vào planner
    const slotHeight = 30;
    const msPerSlot = 12 * 60 * 60 * 1000;
    const startDateMs = startDate.getTime();
    const eta = ship.eta instanceof Date ? ship.eta : new Date(ship.eta);
    const etd = ship.etd instanceof Date ? ship.etd : new Date(ship.etd);
    const topPx = ((eta.getTime() - startDateMs) / msPerSlot) * slotHeight;
    const heightPx = ((etd.getTime() - eta.getTime()) / msPerSlot) * slotHeight;
    const top = `${topPx}px`;
    const height = `${heightPx}px`;
    
    const { overlap, gapWarning, overlapShip } = checkOverlapAndGap(
      { ...ship, loa: ship.loa, berthName: ship.berthName },
      berthedShips,
      left,
      width,
      top,
      height,
      startDateMs
    );
    
    if (overlap) {
      // Highlight both the waiting ship and the existing berthed ship for 3s
      setHighlightedShips([ship.id, overlapShip?.id].filter(Boolean));
      setTimeout(() => setHighlightedShips([]), 3000);
      setToast({ message: `Lỗi: Tàu ${ship.name} bị chồng lấn với tàu ${overlapShip?.name || ''} tại bến ${ship.berthName}. Vui lòng kiểm tra lại thời gian và vị trí!`, type: 'error' });
      return;
    }
    
    const newShip = {
      ...ship,
      eta,
      etd,
      // store relative start/end in ship.start / ship.end
      start: startRel,
      end: endRel,
      style: {
        ...ship.style,
        left,
        width,
        top,
        height,
      },
      gapWarning: gapWarning
    };
    
    setBerthedShips(prev => [...prev, newShip]);
    setWaitingShips(prev => prev.filter(s => s.id !== ship.id));
    setToast({ message: gapWarning
      ? `Cảnh báo: Tàu ${ship.name} được cập cầu nhưng khoảng cách với tàu khác nhỏ hơn 10% LOA tàu lớn hơn!`
      : `Tàu ${ship.name} đã cập cầu thành công.`,
      type: gapWarning ? 'warning' : 'success' });
  };

  const buildDetailedReportHTML = (berthedShips, waitingShips, startDate, numDays) => {
    const liveData = { berthedShips, waitingShips, startDate: startDate.toISOString(), numDays };
    // Compute berth utilization here (server-side) so the generated HTML does not
    // need to call functions that are not available inside the exported page.
    // We build a small HTML fragment `berthUtilization` that will be injected
    // into the exported report. This keeps calculation logic in `computeBerthUtilization`
    // while keeping rendering inside this function.
    const util = computeBerthUtilization(berthedShips.concat(waitingShips), {
      startDate: startDate,
      numDays: numDays,
      order: ['K12C','K12A','K12','K12B','TT2'],
      combinedBerths: ['K12C','K12A','K12','K12B']
    });
    const berthUtilization = (function(){
      let html = '<div style="display:flex;flex-direction:column;gap:6px">';
      // Render all berths except TT2 first (keep configured order)
      const nonTT2 = util.rows.filter(r => r.berth !== 'TT2');
      nonTT2.forEach(r => {
        const label = r.berth;
        html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;border-radius:6px;background:#fff;border:1px solid #eef2f7">'
          + '<div style="font-weight:700;color:#0b5ed7">' + label + '</div>'
          + '<div style="min-width:120px;display:flex;align-items:center;gap:8px">'
          + '<div style="flex:1;background:#eef2f7;height:8px;border-radius:6px;overflow:hidden">'
          + '<div style="height:100%;background:linear-gradient(90deg,#10b981,#34d399);background-color:#10b981;-webkit-print-color-adjust:exact;print-color-adjust:exact;width:' + r.pct + '%"></div>'
          + '</div>'
          + '<div style="width:44px;text-align:right;font-weight:700;color:#0f172a">' + r.pct + '%</div>'
          + '</div>'
          + '</div>';
      });
      // Insert combined 'TÂN THUẬN 1' row next, styled same as others (bold)
      html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;border-radius:6px;background:#fff;border:1px solid #eef2f7">'
        + '<div style="font-weight:700;color:#0b5ed7">' + util.combined.name + '</div>'
        + '<div style="min-width:120px;display:flex;align-items:center;gap:8px">'
        + '<div style="flex:1;background:#eef2f7;height:8px;border-radius:6px;overflow:hidden">'
        + '<div style="height:100%;background:linear-gradient(90deg,#2563eb,#60a5fa);background-color:#2563eb;-webkit-print-color-adjust:exact;print-color-adjust:exact;width:' + util.combined.pct + '%"></div>'
        + '</div>'
        + '<div style="width:44px;text-align:right;font-weight:700;color:#0f172a">' + util.combined.pct + '%</div>'
        + '</div>'
        + '</div>';
      // Then append TT2 (TÂN THUẬN 2) last
      const tt2 = util.rows.find(r => r.berth === 'TT2');
      if (tt2) {
        html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;border-radius:6px;background:#fff;border:1px solid #eef2f7">'
          + '<div style="font-weight:700;color:#0b5ed7">TÂN THUẬN 2</div>'
          + '<div style="min-width:120px;display:flex;align-items:center;gap:8px">'
          + '<div style="flex:1;background:#eef2f7;height:8px;border-radius:6px;overflow:hidden">'
          + '<div style="height:100%;background:linear-gradient(90deg,#10b981,#34d399);background-color:#10b981;-webkit-print-color-adjust:exact;print-color-adjust:exact;width:' + tt2.pct + '%"></div>'
          + '</div>'
          + '<div style="width:44px;text-align:right;font-weight:700;color:#0f172a">' + tt2.pct + '%</div>'
          + '</div>'
          + '</div>';
      }
      html += '</div>';
      return html;
    })();
    const html = `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Báo cáo Tàu - Planner & Waiting List</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels"></script>
  <script>Chart.register(ChartDataLabels);</script>
  <style>
    :root{--brand:#0b5ed7;--muted:#6c757d;--bg:#f7f9fb;--card:#ffffff}
    body{font-family:Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; background:var(--bg); color:#1f2937; margin:0; padding:24px}
    .container{max-width:1200px;margin:0 auto}
    header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
    h1{margin:0;font-size:20px}
    .meta{color:var(--muted);font-size:13px}
    .badges{display:flex;gap:8px;align-items:center}
    .badge{background:var(--card);padding:8px 12px;border-radius:10px;box-shadow:0 1px 3px rgba(16,24,40,.06);font-size:13px}
    .summary{margin:16px 0;display:flex;gap:12px;flex-wrap:wrap}
    .summary .stat{background:linear-gradient(180deg,#fff,#f8fbff);padding:12px 16px;border-radius:8px;box-shadow:0 2px 8px rgba(12,20,60,.06);min-width:140px}
    .controls{display:flex;gap:8px;align-items:center}
    button{background:var(--brand);color:#fff;border:none;padding:8px 12px;border-radius:8px;cursor:pointer}
    button.secondary{background:transparent;color:var(--brand);border:1px solid rgba(11,94,215,.12)}
    .table-wrap{background:var(--card);padding:12px;border-radius:10px;box-shadow:0 2px 12px rgba(12,20,60,.06)}
    table{width:100%;border-collapse:collapse;font-size:13px}
    thead th{position:sticky;top:0;background:#fff;padding:10px;border-bottom:1px solid #eef2f7;text-align:left}
    tbody td{padding:10px;border-bottom:1px solid #f1f5f9}
    tbody tr:nth-child(even){background:#fbfdff}
    .nowrap{white-space:nowrap}
    .muted{color:var(--muted)}
    .badge-status{display:inline-block;padding:4px 8px;border-radius:999px;font-size:12px;color:#fff}
    .st-berthed{background:#0b5ed7}
    .st-waiting{background:#f59e0b}
    .st-none{background:#6c757d}
  /* cargo badge: ensure background color prints and looks consistent */
  .cargo-badge{display:inline-block;padding:6px 8px;border-radius:8px;color:#fff;font-weight:600;font-size:12px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .col-right{text-align:right}
    .small{font-size:12px;color:var(--muted)}
    /* print friendly */
    @media print{
      @page { size: A4 landscape; margin: 10mm; }
      body{padding:0; font-size:12px}
      .container{max-width:none; margin:0}
  /* show header again but hide only the controls to save space */
  header { display: block; }
    /* hide date/time and controls when printing */
    header .badges { display: none; }
  /* keep footer hidden to save vertical space on print */
  footer { display: none; }
      .table-wrap{box-shadow:none;border-radius:0; page-break-inside:avoid}
      /* Force all table columns to be visible in print (override responsive hiding) */
      table thead th, table tbody td { display: table-cell !important; }
      thead th:nth-child(n+8), tbody td:nth-child(n+8) { display: table-cell !important; }
  .charts { page-break-inside:avoid; }
  /* Ensure insights start on the next printed page and stay together with the table */
  .insights { page-break-before: always; page-break-inside: avoid; page-break-after: auto; }
  .table-wrap { page-break-inside: avoid; page-break-before: avoid; }
      .summary { page-break-inside:avoid; }
      .chart-container { page-break-inside:avoid; }
      .insight-card { page-break-inside:avoid; }
      h1 { font-size:18px; }
      .summary .stat { padding:8px 12px; min-width:120px; }
      .badge { padding:6px 10px; font-size:12px; }
      .charts { margin: 10px 0; gap: 10px; }
      .chart-container { padding: 10px; min-width: 250px; }
      .insights { margin: 10px 0; gap: 10px; }
      .insight-card { padding: 10px; min-width: 180px; }
      .table-wrap { padding: 8px; }
      table { font-size:11px; }
      thead th { padding:6px; }
      tbody td { padding:6px; }
    }
    /* responsive */
    @media (max-width:900px){
      table{font-size:12px}
      thead th:nth-child(n+8), tbody td:nth-child(n+8){display:none}
    }
    .charts { margin: 20px 0; display: flex; gap: 20px; flex-wrap: wrap; }
    .chart-container { background: var(--card); padding: 16px; border-radius: 10px; box-shadow: 0 2px 12px rgba(12,20,60,.06); flex: 1; min-width: 300px; }
    .chart-container h3 { margin: 0 0 12px 0; font-size: 16px; }
    .insights { margin: 20px 0; display: flex; gap: 20px; flex-wrap: wrap; }
    .insight-card { background: var(--card); padding: 16px; border-radius: 10px; box-shadow: 0 2px 12px rgba(12,20,60,.06); flex: 1; min-width: 200px; }
    .insight-card h4 { margin: 0 0 8px 0; font-size: 14px; color: var(--brand); }
    .insight-card p { margin: 0; font-size: 13px; }
    /* sortable table headers */
    th.sortable { cursor: pointer; user-select: none; }
    th.sortable .sort-indicator { color: #94a3b8; font-size: 11px; margin-left: 6px; }
    th.sortable.active { color: #0b5ed7; }
    th.sortable.active .sort-indicator { color: #0b5ed7; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1 id="reportTitle">BÁO CÁO CHI TIẾT TÀU</h1>
      </div>
      <div class="badges">
        <div class="badge">Tạo ngày: <span id="genTime" class="muted">--</span></div>
        <div class="controls">
          <button id="btnPrint">In / Print</button>
          <button id="btnCsv" class="secondary">Tải CSV</button>
        </div>
      </div>
    </header>

    <section class="summary" id="summary">
      <!-- summary stats populated by JS -->
    </section>

    <section class="charts" id="charts">
      <!-- charts populated by JS -->
    </section>

    <section class="insights" id="insights">
      <!-- insights populated by JS -->
    </section>

    <div class="table-wrap">
      <table id="shipsTable">
        <thead>
          <tr>
            <th style="width:36px">#</th>
            <th>Name</th>
            <th class="sortable" data-sort="berth">Berth <span class="sort-indicator"></span></th>
            <th class="sortable" data-sort="eta">ETA <span class="sort-indicator"></span></th>
            <th class="sortable" data-sort="etd">ETD <span class="sort-indicator"></span></th>
            <th class="sortable" data-sort="duration">Duration <span class="sort-indicator"></span></th>
            <th class="sortable" data-sort="cargo">Cargo <span class="sort-indicator"></span></th>
            <th class="col-right">DWT</th>
            <th class="small nowrap">LOA × Beam</th>
            <th class="small">Vị trí cập</th>
          </tr>
        </thead>
        <tbody>
          <!-- rows via JS -->
        </tbody>
      </table>
    </div>

    <footer style="margin-top:18px;font-size:12px;color:var(--muted)">
      © Nguyen Hoang &amp; Ban Khai thac | Trung tam DHKT KV TAN THUAN
    </footer>
  </div>

  <script>
    // Embedded live data
    const sampleData = ${JSON.stringify(liveData)};

    // Utilities
    function parseDate(s){
      if(!s) return null;
      const d = new Date(s);
      return isFinite(d) ? d : null;
    }
    function fmtDate(d){
      if(!d) return '-';
      // format: HH:mm | DD/MM/YYYY
      const options = {year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'};
      try{
        const str = d.toLocaleString('vi-VN', options).replace(',', '');
        const parts = str.split(' ');
        if(parts.length === 2){
          return parts[1] + ' | ' + parts[0];
        }
        return str;
      }catch(e){return d.toISOString().replace('T',' ').slice(0,16)}
    }
    function fmtDuration(start, end){
      if(!start || !end) return '-';
      const ms = end - start;
      if(ms <= 0) return '0 giờ';
      const days = Math.floor(ms / (24*3600*1000));
      const hours = Math.floor((ms % (24*3600*1000)) / (3600*1000));
      let parts = [];
      if(days>0) parts.push(days + ' ngày');
      if(hours>0) parts.push(hours + ' giờ');
      if(parts.length===0) return '0 giờ';
      return parts.join(' ');
    }

    function safe(v, fallback='-'){return (v===null||v===undefined||v==='')?fallback:v}
    // format numbers with dot as thousands separator (e.g. 12.345)
    function fmtNumber(v){
      if(v===null||v===undefined||v==='') return '';
      // try parse numeric value from string
      const n = Number(String(v).toString().replace(/[^0-9.-]/g,''));
      if(!isFinite(n)) return String(v);
      try{
        return new Intl.NumberFormat('de-DE').format(n);
      }catch(e){
        return String(n).replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.');
      }
    }

    // cargo type color helper (match planner colors)
    function getCargoColor(type){
      if(!type) return '#6b7280'; // gray
      const t = String(type).toLowerCase();
      if(t.includes('sắt') || t.includes('thép') ) return '#16a34a'; // green
      if(t.includes('cont') || t.includes('container')) return '#f97316'; // orange
      if(t.includes('khác') || t.includes('khac') || t.includes('hàng khác')) return '#2563eb'; // blue
      return '#2563eb';
    }
    // cargo unit helper
    function getCargoUnit(type){
      if(!type) return '';
      const t = String(type).toLowerCase();
      if(t.includes('sắt') || t.includes('thép')) return 'Tấn';
      if(t.includes('cont') || t.includes('container')) return 'cont';
      if(t.includes('khác') || t.includes('khac') || t.includes('hàng khác')) return 'Tấn';
      return '';
    }

    // prepare consolidated list
    function buildList(data){
      const berthed = (data.berthedShips || []).map(s=>({...s, _status:'Berthed'}));
      const waiting = (data.waitingShips || []).map(s=>({...s, _status:'Waiting'}));
      const all = berthed.concat(waiting);
      // parse dates and compute derived fields
      const normalized = all.map(s=>{
        const eta = parseDate(s.eta);
        const etd = parseDate(s.etd);
        const durationMins = (eta && etd) ? Math.max(0, Math.round((etd - eta)/60000)) : null;
        return {...s, _eta:eta, _etd:etd, _duration: fmtDuration(eta,etd), _durationMins: durationMins}
      });
      // sort by ETA ascending; null ETAs at bottom
      normalized.sort((a,b)=>{
        if(a._eta === null && b._eta === null) return 0;
        if(a._eta === null) return 1;
        if(b._eta === null) return -1;
        return a._eta - b._eta;
      });
      return normalized;
    }

    function renderSummary(list){
      const container = document.getElementById('summary');
      const etas = list.filter(s=>s._eta).map(s=>s._eta);
      const earliestETA = etas.length?new Date(Math.min(...etas.map(d=>d.getTime()))):null;
      const latestETA = etas.length?new Date(Math.max(...etas.map(d=>d.getTime()))):null;
      // Set title only. Summary stats are intentionally omitted from this region
      // and will be shown under the 'Tổng số tàu theo loại' chart instead.
      const titleEl = document.getElementById('reportTitle');
      if (titleEl && earliestETA && latestETA) {
        const earliestStr = fmtDate(earliestETA);
        const latestStr = fmtDate(latestETA);
  titleEl.innerHTML = 'BÁO CÁO CHI TIẾT TÀU TỪ <span style="color:#0b5ed7">' + earliestStr + '</span> ĐẾN <span style="color:#0b5ed7">' + latestStr + '</span>';
      }
      // clear old content
      if (container) container.innerHTML = '';
    }

    // Render compact totals under the ship count chart (for print/export)
    function renderChartTotals(list){
      const total = list.length;
      const berthed = list.filter(s=>s._status==='Berthed').length;
      const waiting = list.filter(s=>s._status==='Waiting').length;
      const etas = list.filter(s=>s._eta).map(s=>s._eta);
      const etdMax = list.filter(s=>s._etd).map(s=>s._etd);
      const earliestETA = etas.length?new Date(Math.min(...etas.map(d=>d.getTime()))):null;
      const latestETD = etdMax.length?new Date(Math.max(...etdMax.map(d=>d.getTime()))):null;
      const el = document.getElementById('chartTotals');
      if(!el) return;
      el.innerHTML = '<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;font-size:13px;color:var(--muted)">' +
        '<div><strong>Tổng tàu:</strong> ' + total + '</div>' +
        '<div><strong>Tàu tại cầu:</strong> ' + berthed + '</div>' +
        '<div><strong>Tàu chờ:</strong> ' + waiting + '</div>' +
        '<div><strong>ETA sớm nhất:</strong> ' + (earliestETA?fmtDate(earliestETA):'-') + '</div>' +
        '<div><strong>ETD muộn nhất:</strong> ' + (latestETD?fmtDate(latestETD):'-') + '</div>' +
        '</div>';
    }

    function renderTableRows(list){
      const tbody = document.querySelector('#shipsTable tbody');
      tbody.innerHTML = '';
      list.forEach((s, idx)=>{
        const tr = document.createElement('tr');
            const cargoUnit = getCargoUnit(s.cargoType); // Get cargo unit based on cargo type
            const cargoDisplay = s.cargo ? (' · ' + fmtNumber(s.cargo) + (cargoUnit ? (' ' + cargoUnit) : '')) : ''; // Display cargo amount
            // Build cells using string concatenation to avoid nested template interpolation issues
            const nameCell = '<td><strong>' + safe(s.name) + '</strong></td>';
            const berthCell = '<td>' + safe(s.berthName) + '</td>';
            const etaCell = '<td class="nowrap">' + (s._eta?fmtDate(s._eta):'-') + '</td>';
            const etdCell = '<td class="nowrap">' + (s._etd?fmtDate(s._etd):'-') + '</td>';
            const durCell = '<td>' + safe(s._duration, '-') + '</td>';
            const cargoColor = getCargoColor(s.cargoType);
            const cargoAmount = s.cargo ? (' · ' + fmtNumber(s.cargo)) : '';
            const cargo = '<td><span class="cargo-badge" style="background:' + cargoColor + ';padding:6px 8px;border-radius:8px;color:#fff;font-weight:600;font-size:12px">' + safe(s.cargoType) + '</span> <span class="small muted">' + cargoAmount + '</span></td>';
            const dwtText = (s.dwt || s.dwt === 0) ? fmtNumber(s.dwt) : '-';
            const dwt = '<td class="col-right">' + dwtText + '</td>';
            const dims = '<td class="small nowrap">' + safe(s.loa,'-') + ' × ' + safe(s.beam,'-') + '</td>';
            const posVal = (s.startPosition ?? s.endPosition ?? s.start ?? s.end ?? null) !== null ? (safe(s.startPosition ?? s.start ?? '-', '-') + '/' + safe(s.endPosition ?? s.end ?? '-', '-')) : '-';
            const pos = '<td class="small">' + posVal + '</td>';
            tr.innerHTML = '<td>' + (idx+1) + '</td>' + nameCell + berthCell + etaCell + etdCell + durCell + cargo + dwt + dims + pos;
        tbody.appendChild(tr);
      });
    }

    // Sorting state (live)
    let currentSort = { key: null, dir: 'asc' };
    let currentList = [];

    function sortData(list, key, dir){
      const factor = dir === 'asc' ? 1 : -1;
      return [...list].sort((a,b)=>{
        let va, vb;
        switch(key){
          case 'berth': va = a.berthName||''; vb = b.berthName||''; return va.localeCompare(vb)*factor;
          case 'eta': va = a._eta? a._eta.getTime(): Infinity; vb = b._eta? b._eta.getTime(): Infinity; return (va-vb)*factor;
          case 'etd': va = a._etd? a._etd.getTime(): Infinity; vb = b._etd? b._etd.getTime(): Infinity; return (va-vb)*factor;
          case 'duration': {
            // Prefer precomputed numeric duration if present
            const vaNum = a._durationMins != null ? a._durationMins : Infinity;
            const vbNum = b._durationMins != null ? b._durationMins : Infinity;
            return (vaNum - vbNum) * factor;
          }
          case 'cargo': {
            const parseCargo = (s) => {
              if(!s.cargo) return 0;
              const str = String(s.cargo);
              if(str.includes('/')) { const parts = str.split('/').map(x=> parseFloat(x)||0); return (parts[0]||0)+(parts[1]||0); }
              const n = parseFloat(str.replace(/[^0-9./]/g,''))||0; return n;
            };
            va = parseCargo(a); vb = parseCargo(b); return (va-vb)*factor;
          }
          default: return 0;
        }
      });
    }

    function attachSortHandlers(baseList){
      const headers = document.querySelectorAll('th.sortable');
      headers.forEach(h=>{
        h.addEventListener('click', ()=>{
          const key = h.getAttribute('data-sort');
          let dir = 'asc';
          if(currentSort.key === key){ dir = currentSort.dir === 'asc' ? 'desc' : 'asc'; }
          currentSort = { key, dir };
          headers.forEach(o=>{
            o.classList.remove('active');
            const ind = o.querySelector('.sort-indicator'); if(ind) ind.textContent='';
          });
          h.classList.add('active');
          const indicator = h.querySelector('.sort-indicator'); if(indicator) indicator.textContent = dir==='asc' ? '▲' : '▼';
          currentList = sortData(baseList, key, dir);
          renderTableRows(currentList);
        });
      });
    }

    function downloadCSV(list){
      const headers = ['No','Name','Status','Berth','ETA','ETD','Duration','CargoType','Cargo','DWT','LOA','Beam','Vị trí cập'];
      const rows = list.map((s, idx)=>{
        const pos = (s.startPosition ?? s.endPosition ?? s.start ?? s.end ?? null) !== null ? \`\${s.startPosition ?? s.start ?? ''}/\${s.endPosition ?? s.end ?? ''}\` : '';
        const cargoUnit = getCargoUnit(s.cargoType);
        const cargoCsv = s.cargo ? (fmtNumber(s.cargo) + (cargoUnit ? (' ' + cargoUnit) : '')) : '';
          return [idx+1, s.name||'', s._status||'', s.berthName||'', s._eta?fmtDate(s._eta):'', s._etd?fmtDate(s._etd):'', s._duration||'', s.cargoType||'', cargoCsv, (s.dwt || s.dwt === 0) ? fmtNumber(s.dwt) : '', s.loa||'', s.beam||'', pos];
      });
      const csvContent = [headers].concat(rows).map(r=>r.map(c=>\`"\${String(c).replace(/"/g,'""')}"\`).join(',')).join('\\n');
  // Prefix with UTF-8 BOM so Excel (Windows) recognizes UTF-8 and displays Vietnamese correctly
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], {type: 'text/csv;charset=utf-8;'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = \`ships_report_\${new Date().toISOString().slice(0,19).replace(/[:T]/g,'_')}.csv\`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }

    function renderCharts(list){
      const container = document.getElementById('charts');
      // Group by cargoType (case-insensitive) — use lowercased keys for grouping
      const cargoStats = {};
      list.forEach(s => {
        const typeKey = (s.cargoType || 'Khác').toString().trim().toLowerCase();
        const key = typeKey || 'khác';
        if (!cargoStats[key]) cargoStats[key] = { count: 0, totalCargo: 0 };
        cargoStats[key].count++;
        if (key.includes('container') || key.includes('cont')) {
          // For container, handle import/export
          if (!cargoStats[key].totalCargo || typeof cargoStats[key].totalCargo !== 'object') cargoStats[key].totalCargo = { import: 0, export: 0 };
          const cargoStr = String(s.cargo || '');
          if (cargoStr.includes('/')) {
            const [imp, exp] = cargoStr.split('/').map(x => parseFloat(x.trim()) || 0);
            cargoStats[key].totalCargo.import += imp;
            cargoStats[key].totalCargo.export += exp;
          } else {
            const num = parseFloat(cargoStr) || 0;
            cargoStats[key].totalCargo.import += num;
          }
        } else {
          const cargoNum = parseFloat(s.cargo) || 0;
          // ensure numeric accumulator
          if (!cargoStats[key].totalCargo || typeof cargoStats[key].totalCargo === 'object') cargoStats[key].totalCargo = 0;
          cargoStats[key].totalCargo += cargoNum;
        }
      });
      // Pie chart labels ordered Sắt thép, Container, Khác, then others
      const desiredOrder = ['sắt thép','sắt','thép','container','cont','khác'];
      const countLabels = Object.keys(cargoStats).sort((a,b)=>{
        const al = a.toLowerCase();
        const bl = b.toLowerCase();
        const ai = desiredOrder.findIndex(k=>al.includes(k));
        const bi = desiredOrder.findIndex(k=>bl.includes(k));
        const av = ai === -1 ? 999 : ai;
        const bv = bi === -1 ? 999 : bi;
        if(av === bv) return al.localeCompare(bl);
        return av - bv;
      });
      const countData = countLabels.map(l => cargoStats[l].count);
  // Generate professional cargo summary cards (per-type)
  let cargoSummary = '<div style="display:flex;flex-direction:column;gap:8px">';
      let totalTons = 0; let totalContImp = 0; let totalContExp = 0;
      countLabels.forEach(label => {
        const stat = cargoStats[label];
        const rawLabelLower = label.toLowerCase();
        let prettyLabel = 'HÀNG ' + rawLabelLower.toUpperCase();
        if(rawLabelLower.includes('sắt') || rawLabelLower.includes('thép')) prettyLabel = 'HÀNG SẮT THÉP';
        else if(rawLabelLower.includes('container') || rawLabelLower.includes('cont')) prettyLabel = 'HÀNG CONTAINER';
        else if(rawLabelLower.includes('khác')) prettyLabel = 'HÀNG KHÁC';
        const cardColor = getCargoColor(label);
          if (rawLabelLower.includes('container') || rawLabelLower.includes('cont')) {
          const imp = stat.totalCargo.import || 0;
          const exp = stat.totalCargo.export || 0;
          const contTotal = (imp || 0) + (exp || 0);
          totalContImp += imp; totalContExp += exp;
          cargoSummary += '<div style="display:flex;align-items:center;gap:10px;padding:12px 16px;border:1px solid #e2e8f0;border-radius:12px;background:#ffffff;box-shadow:0 1px 2px rgba(0,0,0,.04);border-left:6px solid '+ cardColor +'">'
            + '<div style="flex:1;display:flex;flex-direction:column;">'
            + '<div style="font-size:12px;font-weight:700;color:#334155;letter-spacing:.4px">'+ prettyLabel +'</div>'
            + '<div style="font-size:14px;font-weight:600;color:#0f172a">Tổng sản lượng: <span style="color:'+ cardColor +'">'+ fmtNumber(imp) +'</span>/<span style="color:#dc2626">'+ fmtNumber(exp) +'</span> <span style="font-size:12px;color:#475569">Cont (Nhập/Xuất)</span> <span style="font-size:12px;color:#f97316;font-weight:700">(Tổng : '+ fmtNumber(contTotal) +' Cont)</span></div>'
            + '</div>'
            + '<div style="text-align:right;font-size:12px;color:#475569">Số tàu: <strong>'+ stat.count +'</strong></div>'
            + '</div>';
        } else {
          const unit = 'Tấn';
          totalTons += (stat.totalCargo || 0);
          cargoSummary += '<div style="display:flex;align-items:center;gap:10px;padding:12px 16px;border:1px solid #e2e8f0;border-radius:12px;background:#ffffff;box-shadow:0 1px 2px rgba(0,0,0,.04);border-left:6px solid '+ cardColor +'">'
            + '<div style="flex:1;display:flex;flex-direction:column;">'
            + '<div style="font-size:12px;font-weight:700;color:#334155;letter-spacing:.4px">'+ prettyLabel +'</div>'
            + '<div style="font-size:14px;font-weight:600;color:#0f172a">Tổng sản lượng: <span style="color:'+ cardColor +'">'+ fmtNumber(stat.totalCargo) +'</span> <span style="font-size:12px;color:#475569">'+ unit +'</span></div>'
            + '</div>'
            + '<div style="text-align:right;font-size:12px;color:#475569">Số tàu: <strong>'+ stat.count +'</strong></div>'
            + '</div>';
        }
      });
      // Totals card removed by request — keep only per-type cards in cargoSummary
      cargoSummary += '</div>';
      
        // Berth-level aggregation (live export)
        const berthStats = {};
        list.forEach(s => {
          // Normalize berth key to uppercase for consistent grouping
          const berthRaw = s.berthName || '';
          const berth = berthRaw ? String(berthRaw).trim().toUpperCase() : 'Chờ';
          if(!berthStats[berth]) berthStats[berth] = { count: 0, tons: 0, contImp: 0, contExp: 0, contCount: 0, steelCount: 0 };
          // total ships per berth
          berthStats[berth].count++;
          const type = (s.cargoType||'').toLowerCase();
          const cargoStr = String(s.cargo||'').trim();
          if(type.includes('cont') || type.includes('container')) {
            berthStats[berth].contCount++;
            if(cargoStr.includes('/')) {
              const [imp,exp] = cargoStr.split('/').map(x=>parseFloat(x)||0);
              berthStats[berth].contImp += imp;
              berthStats[berth].contExp += exp;
            } else {
              const v = parseFloat(cargoStr)||0;
              berthStats[berth].contImp += v;
            }
          } else if(type.includes('sắt') || type.includes('thép') || type.includes('sat') || type.includes('thep')) {
            const v = parseFloat(cargoStr)||0;
            berthStats[berth].tons += v;
            berthStats[berth].steelCount++;
          }
        });
        // Fixed order: K12C, K12A, K12, K12B, TT2, Chờ
        const fixedOrder = ['K12C', 'K12A', 'K12', 'K12B', 'TT2', 'Chờ'];
        const berthData = fixedOrder.map(berth => ({
          berth,
          count: berthStats[berth]?.count || 0,
          tons: berthStats[berth]?.tons || 0,
          steelCount: berthStats[berth]?.steelCount || 0,
          contTotal: (berthStats[berth]?.contImp || 0) + (berthStats[berth]?.contExp || 0),
          contCount: berthStats[berth]?.contCount || 0
        }));

  container.innerHTML = \`
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div class="chart-container">
              <h3>Tổng số tàu theo loại</h3>
              <canvas id="shipCountChart"></canvas>
              <div id="chartTotals" style="margin-top:12px;font-size:13px;color:var(--muted)"></div>
            </div>
            <div class="chart-container" style="display:flex;flex-direction:column;gap:12px;">
              <div>
                <h3>Tổng sản lượng theo loại</h3>
                <div style="padding:16px;">\${cargoSummary}</div>
              </div>
              <div>
                <h3>Hệ số sử dụng cầu bến</h3>
                <div style="padding:16px;">${berthUtilization}</div>
                <div style="margin-top:6px;font-size:12px;color:#475569;line-height:1.1;text-align:left;font-style:italic">
                  ETA - 2, ETD + 2 || 10% LOA || Xà lan : 30% tàu
                </div>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 20px;">
              <div class="chart-container">
                <h3>Thống kê theo bến - Hàng Sắt Thép</h3>
                <canvas id="steelBerthChart"></canvas>
              </div>
              <div class="chart-container">
                <h3>Thống kê theo bến - Hàng Container</h3>
                <canvas id="containerBerthChart"></canvas>
              </div>
            </div>
          </div>
  \`;
      (function(){
        const el = document.getElementById('shipCountChart');
        if(!el) { console.warn('shipCountChart canvas not found'); return; }
        try{
          new Chart(el, {
        type: 'pie',
        data: {
          labels: countLabels,
          datasets: [{
            data: countData,
            backgroundColor: ['#0b5ed7', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            datalabels: {
              color: '#fff',
              font: { size: 12, weight: 'bold' },
              formatter: (value, context) => {
                const label = context.chart.data.labels[context.dataIndex];
                return \`\${label} - \${value} tàu\`;
              }
            }
          }
        }
          });
        }catch(err){ console.error('Error creating shipCountChart', err); }
      })();
      // Steel berth chart
      (function(){
        const el = document.getElementById('steelBerthChart');
        if(!el) { console.warn('steelBerthChart canvas not found'); return; }
        try{
          const berthLabels = berthData.map(b => b.berth);
          const steelData = berthData.map(b => b.tons);
          const shipCountData = berthData.map(b => b.steelCount);
          new Chart(el, {
        type: 'bar',
        data: {
          labels: berthLabels,
          datasets: [
            { 
              label: 'Sản lượng (Tấn)', 
              data: steelData, 
              backgroundColor: '#10b981', 
              yAxisID: 'y', 
              order: 1,
              datalabels: {
                anchor: 'end',
                align: 'end',
                color: '#0f172a',
                offset: -6,
                font: { weight: '700', size: 12 },
                formatter: (value) => fmtNumber(value)
              }
            },
            { 
              label: 'Lượt tàu', 
              data: shipCountData, 
              type: 'line', 
              borderColor: '#0b5ed7', 
              backgroundColor: '#0b5ed7', 
              yAxisID: 'y1', 
              tension: 0.25, 
              pointRadius: 4, 
              order: 0,
              datalabels: {
                anchor: 'start',
                align: 'start',
                color: '#0b5ed7',
                offset: 8,
                font: { weight: '700', size: 12 },
                formatter: (value) => String(value)
              }
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { position: 'bottom' },
            datalabels: { /* global fallback (per-dataset overrides used) */ }
          },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Tấn' } },
            y1: { beginAtZero: true, position: 'right', grid: { display: false }, title: { display: true, text: 'Lượt tàu' }, suggestedMax: Math.max(...shipCountData) + 1 }
          }
        }
          });
        }catch(err){ console.error('Error creating steelBerthChart', err); }
      })();
      // Container berth chart
      (function(){
        const el = document.getElementById('containerBerthChart');
        if(!el) { console.warn('containerBerthChart canvas not found'); return; }
        try{
          const berthLabels = berthData.map(b => b.berth);
          const containerData = berthData.map(b => b.contTotal);
          const shipCountData = berthData.map(b => b.contCount);
          new Chart(el, {
        type: 'bar',
        data: {
          labels: berthLabels,
          datasets: [
            { 
              label: 'Sản lượng (Cont)', 
              data: containerData, 
              backgroundColor: '#f59e0b', 
              yAxisID: 'y', 
              order: 1,
              datalabels: {
                anchor: 'end',
                align: 'end',
                color: '#0f172a',
                offset: -6,
                font: { weight: '700', size: 12 },
                formatter: (value) => fmtNumber(value)
              }
            },
            { 
              label: 'Lượt tàu', 
              data: shipCountData, 
              type: 'line', 
              borderColor: '#0b5ed7', 
              backgroundColor: '#0b5ed7', 
              yAxisID: 'y1', 
              tension: 0.25, 
              pointRadius: 4, 
              order: 0,
              datalabels: {
                anchor: 'start',
                align: 'start',
                color: '#0b5ed7',
                offset: 8,
                font: { weight: '700', size: 12 },
                formatter: (value) => String(value)
              }
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { position: 'bottom' },
            datalabels: { /* global fallback (per-dataset overrides used) */ }
          },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Cont' } },
            y1: { beginAtZero: true, position: 'right', grid: { display: false }, title: { display: true, text: 'Lượt tàu' }, suggestedMax: Math.max(...shipCountData) + 1 }
          }
        }
          });
        }catch(err){ console.error('Error creating containerBerthChart', err); }
      })();
    }

    function renderInsights(list){
      const container = document.getElementById('insights');
      // Find earliest and latest ETD
      const shipsWithETD = list.filter(s => s._etd);
      const earliestRelease = shipsWithETD.length ? shipsWithETD.reduce((min, s) => s._etd < min._etd ? s : min) : null;
      const latestRelease = shipsWithETD.length ? shipsWithETD.reduce((max, s) => s._etd > max._etd ? s : max) : null;
  container.innerHTML = \`
        <div class="insight-card">
          <h4>Tàu giải phóng nhanh nhất</h4>
          <p><strong>\${earliestRelease ? earliestRelease.name : 'N/A'}</strong> - ETA: \${earliestRelease ? fmtDate(earliestRelease._eta) : '-'} - ETD: \${earliestRelease ? fmtDate(earliestRelease._etd) : '-'} - Duration: <span style="font-weight:700;color:#f97316">\${earliestRelease ? earliestRelease._duration : '-'}</span></p>
        </div>
        <div class="insight-card">
          <h4>Tàu giải phóng lâu nhất</h4>
          <p><strong>\${latestRelease ? latestRelease.name : 'N/A'}</strong> - ETA: \${latestRelease ? fmtDate(latestRelease._eta) : '-'} - ETD: \${latestRelease ? fmtDate(latestRelease._etd) : '-'} - Duration: <span style="font-weight:700;color:#f97316">\${latestRelease ? latestRelease._duration : '-'}</span></p>
        </div>
  \`;
    }

    // init
    (function init(){
      document.getElementById('genTime').textContent = new Date().toLocaleString();
      const baseList = buildList(sampleData);
  renderSummary(baseList);
  renderCharts(baseList);
  // render compact totals below the shipCountChart
  try{ renderChartTotals(baseList); }catch(e){/* ignore */}
  renderInsights(baseList);
      // default sort by ETA asc
      currentSort = { key: 'eta', dir: 'asc' };
      const headers = document.querySelectorAll('th.sortable');
      headers.forEach(o=>{ o.classList.remove('active'); const ind=o.querySelector('.sort-indicator'); if(ind) ind.textContent=''; });
      const etaHeader = document.querySelector('th.sortable[data-sort="eta"]');
      if(etaHeader){ etaHeader.classList.add('active'); const ind=etaHeader.querySelector('.sort-indicator'); if(ind) ind.textContent='▲'; }
      currentList = sortData(baseList, 'eta', 'asc');
      renderTableRows(currentList);
      attachSortHandlers(baseList);
      document.getElementById('btnPrint').addEventListener('click', ()=>window.print());
      document.getElementById('btnCsv').addEventListener('click', ()=>downloadCSV(currentList));
    })();
  </script>
</body>
</html>`;
    return html;
  };
  // Xóa tàu khỏi planner (RỜI)
  const handleRemoveShip = (ship) => {
    if (!confirmRemove.show) {
      setConfirmRemove({ show: true, ship });
    }
  };

  const confirmRemoveShip = () => {
    if (confirmRemove.ship) {
      setBerthedShips(prev => prev.filter(s => s.id !== confirmRemove.ship.id));
      setSelectedShip(null);
      setToast({ message: `Tàu ${confirmRemove.ship.name} đã rời cầu.`, type: 'success' });
    }
    setConfirmRemove({ show: false, ship: null });
  };

  const cancelRemoveShip = () => {
    setConfirmRemove({ show: false, ship: null });
  };

  // Chuyển tàu về waiting list (CHỜ)
  const handleMoveToWaiting = (ship) => {
    setBerthedShips(prev => prev.filter(s => s.id !== ship.id));
    // Preserve all fields, only remove planner-specific style fields
    const cleanedShip = {
      ...ship,
      style: ship.style ? { ...ship.style, left: undefined, top: undefined } : undefined
  };
    setWaitingShips(prev => [...prev, cleanedShip]);
    setSelectedShip(null);
    setToast({ message: `Tàu ${ship.name} đã chuyển về danh sách chờ.`, type: 'info' });
  };
  
  // Khôi phục dữ liệu từ localStorage nếu có
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('berthPlannerState');
      if (saved) {
        const data = JSON.parse(saved);
        return {
          berthedShips: (data.berthedShips || []).map(ship => ({
            ...ship,
            eta: ship.eta ? new Date(ship.eta) : null,
            etd: ship.etd ? new Date(ship.etd) : null
          })),
          waitingShips: (data.waitingShips || []).map(ship => ({
            ...ship,
            eta: ship.eta ? new Date(ship.eta) : null,
            etd: ship.etd ? new Date(ship.etd) : null
          })),
          startDate: data.startDate ? new Date(data.startDate) : null,
          numDays: data.numDays || 7,
          cranes: data.cranes || []
        };
      }
    } catch (err) {
      console.error('Lỗi khi đọc localStorage:', err);
    }
    return null;
  };

  const savedState = loadFromLocalStorage();
  
  // Khôi phục crane positions từ localStorage
  useEffect(() => {
    if (savedState?.cranes) {
      cranePositionsRef.current = savedState.cranes;
    }
  }, []); // Chỉ chạy 1 lần khi mount
  
  const [waitingShips, setWaitingShips] = useState(savedState?.waitingShips || []); 
  const [berthedShips, setBerthedShips] = useState(savedState?.berthedShips || []); 
  const [selectedShip, setSelectedShip] = useState(null); // null = không có tàu nào được chọn
  const [activeBerth, setActiveBerth] = useState(null); // Berth đang được highlight khi drag
  const [activeDayIndex, setActiveDayIndex] = useState(null); // Day row đang highlight khi drag
  const [numDays, setNumDays] = useState(savedState?.numDays || 7);
  const [startDate, setStartDate] = useState(() => {
    if (savedState?.startDate) return savedState.startDate;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  });

  // Lưu state vào localStorage mỗi khi thay đổi
  useEffect(() => {
    try {
      const dataToSave = {
        berthedShips,
        waitingShips,
        startDate,
        numDays,
        cranes: cranePositionsRef.current || []
      };
      localStorage.setItem('berthPlannerState', JSON.stringify(dataToSave));
    } catch (err) {
      console.error('Lỗi khi lưu localStorage:', err);
    }
  }, [berthedShips, waitingShips, startDate, numDays]);

  // useEffect để chuyển tàu ra khỏi planner về waiting list nếu không còn trong khung ngày
  useEffect(() => {
    // Dùng một cờ để tránh chạy logic này khi component mới mount lần đầu
    // và state chưa ổn định hoàn toàn.
    const timer = setTimeout(() => {
      const newEndDate = addDays(startDate, parseInt(numDays, 10));
      
      const shipsToMove = [];
      const shipsToKeep = [];

      berthedShips.forEach(ship => {
        const shipEta = ship.eta ? new Date(ship.eta) : null;
        const shipEtd = ship.etd ? new Date(ship.etd) : null;

        // Tàu nằm hoàn toàn ngoài khung ngày (kết thúc trước khi bắt đầu, hoặc bắt đầu sau khi kết thúc)
        if (!shipEta || !shipEtd || shipEtd <= startDate || shipEta >= newEndDate) {
          shipsToMove.push({
            ...ship,
            eta: null,
            etd: null,
            berthName: null,
            mandra: null,
            style: {}
          });
        } else {
          shipsToKeep.push(ship);
        }
      });

      // Nếu có tàu cần di chuyển, cập nhật state
      if (shipsToMove.length > 0) {
        setBerthedShips(shipsToKeep);
        setWaitingShips(prevWaiting => [...prevWaiting, ...shipsToMove]);
        setToast({ message: `${shipsToMove.length} tàu đã được chuyển về danh sách chờ.`, type: 'info' });
      }
    }, 100); // Thêm một khoảng trễ nhỏ để đảm bảo state đã được cập nhật

    return () => clearTimeout(timer);
  }, [startDate, numDays]);

  // Đưa logic lọc vào hàm riêng - BỎ HÀM NÀY vì không còn cần thiết
  // Không còn cần lọc từ initialBerthedShips/initialWaitingShips
  // Vì dữ liệu đã được lưu trong state và localStorage

  // Hàm này gọi khi select thay đổi
  const handleDayChange = (newDayCount) => {
    setNumDays(newDayCount); // Cập nhật state (sẽ tự động lưu vào localStorage)
  };

  const handleStartDateChange = (newDate) => {
    setStartDate(newDate); // Cập nhật state (sẽ tự động lưu vào localStorage)
  };

  const handleSelectShip = (ship) => {
    // Select ship and apply the same highlights as during drag (both axes)
    setSelectedShip(ship);
    if (!ship) {
      setActiveDayIndex(null);
      setActiveBerth(null);
      return;
    }
    // Set active berth (horizontal axis)
    if (ship.berthName) setActiveBerth(ship.berthName);
    // Compute vertical half-day slot overlaps from ship's ETA/ETD relative to startDate
    try {
      const SLOT_HEIGHT = 30; // px per half-day slot
      const DAY_HEIGHT = SLOT_HEIGHT * 2;
      const MS_PER_SLOT = 12 * 60 * 60 * 1000;
      // Prefer ETA/ETD to avoid stale style
      let topPx = null;
      let heightPx = null;
      if (ship.eta instanceof Date && ship.etd instanceof Date && !isNaN(ship.eta) && !isNaN(ship.etd)) {
        const startMs = startDate.getTime();
        topPx = ((ship.eta.getTime() - startMs) / MS_PER_SLOT) * SLOT_HEIGHT;
        heightPx = ((ship.etd.getTime() - ship.eta.getTime()) / MS_PER_SLOT) * SLOT_HEIGHT;
      } else if (ship.style?.top && ship.style?.height) {
        // Fallback to style if dates invalid
        const parseNum = (v) => (typeof v === 'string' && v.endsWith('px')) ? parseFloat(v) : (typeof v === 'number' ? v : parseFloat(v));
        topPx = parseNum(ship.style.top);
        heightPx = parseNum(ship.style.height);
      }
      if (topPx != null && heightPx != null && !isNaN(topPx) && !isNaN(heightPx)) {
        const shipStart = topPx;
        const shipEnd = topPx + heightPx;
        const overlaps = [];
        let bestIdx = null;
        let bestOverlap = -1;
        for (let i = 0; i < numDays; i++) {
          const dayStart = i * DAY_HEIGHT;
          // day slot
          const daySlotStart = dayStart;
          const daySlotEnd = dayStart + SLOT_HEIGHT;
          const dayOverlap = Math.max(0, Math.min(shipEnd, daySlotEnd) - Math.max(shipStart, daySlotStart));
          if (dayOverlap > 0) overlaps.push(i * 2);
          // night slot
          const nightSlotStart = dayStart + SLOT_HEIGHT;
          const nightSlotEnd = dayStart + DAY_HEIGHT;
          const nightOverlap = Math.max(0, Math.min(shipEnd, nightSlotEnd) - Math.max(shipStart, nightSlotStart));
          if (nightOverlap > 0) overlaps.push(i * 2 + 1);
          const totalOverlap = dayOverlap + nightOverlap;
          if (totalOverlap > bestOverlap) {
            bestOverlap = totalOverlap;
            bestIdx = i;
          }
        }
        if (overlaps.length > 0) {
          const unique = Array.from(new Set(overlaps)).map(i => Math.max(0, Math.min(numDays * 2 - 1, i)));
          setActiveDayIndex(unique);
        } else if (bestIdx !== null) {
          const clamped = Math.max(0, Math.min(numDays - 1, bestIdx));
          setActiveDayIndex([clamped * 2, clamped * 2 + 1]);
        }
      } else {
        // Can't determine position -> clear vertical highlight
        setActiveDayIndex(null);
      }
    } catch (err) {
      // ignore compute errors
    }
  };

  const handleClosePanel = () => {
    setSelectedShip(null);
  };

  const handleShipPositionChange = (shipId, newPosition) => {
    // Cập nhật activeBerth khi đang kéo
    if (newPosition.berthName) {
      setActiveBerth(newPosition.berthName);
    }
    // Determine activeDayIndex based on the ship's vertical coverage (topPx / heightPx)
    const parsePx = (v) => {
      if (v === undefined || v === null) return null;
      if (typeof v === 'number') return v;
      if (typeof v === 'string' && v.endsWith('px')) return parseFloat(v);
      if (typeof v === 'string') return parseFloat(v);
      return null;
    };

    const topPx = newPosition.topPx ?? parsePx(newPosition.top);
    const heightPx = newPosition.heightPx ?? (newPosition.height ? parsePx(newPosition.height) : null);

    if (topPx != null && heightPx != null && !isNaN(topPx) && !isNaN(heightPx)) {
      try {
        const SLOT_HEIGHT = 30; // px per half-day slot
        const DAY_HEIGHT = SLOT_HEIGHT * 2; // day consists of 2 slots (NGÀY + ĐÊM)
        let bestIdx = null;
        let bestOverlap = -1;
        const overlaps = [];
        const shipStart = topPx;
        const shipEnd = topPx + heightPx;
        // compute overlap per half-day slot
        for (let i = 0; i < numDays; i++) {
          const dayStart = i * DAY_HEIGHT;
          // day slot
          const daySlotStart = dayStart;
          const daySlotEnd = dayStart + SLOT_HEIGHT;
          const dayOverlap = Math.max(0, Math.min(shipEnd, daySlotEnd) - Math.max(shipStart, daySlotStart));
          if (dayOverlap > 0) overlaps.push(i * 2);
          // night slot
          const nightSlotStart = dayStart + SLOT_HEIGHT;
          const nightSlotEnd = dayStart + DAY_HEIGHT;
          const nightOverlap = Math.max(0, Math.min(shipEnd, nightSlotEnd) - Math.max(shipStart, nightSlotStart));
          if (nightOverlap > 0) overlaps.push(i * 2 + 1);
          const totalOverlap = dayOverlap + nightOverlap;
          if (totalOverlap > bestOverlap) {
            bestOverlap = totalOverlap;
            bestIdx = i;
          }
        }
        if (overlaps.length > 0) {
          // unique slot indices
          const unique = Array.from(new Set(overlaps)).map(i => Math.max(0, Math.min(numDays * 2 - 1, i)));
          setActiveDayIndex(unique);
        } else if (bestIdx !== null) {
          const clamped = Math.max(0, Math.min(numDays - 1, bestIdx));
          // highlight both slots for the best day
          setActiveDayIndex([clamped * 2, clamped * 2 + 1]);
        }
      } catch (err) {
        // ignore
      }
    } else if (newPosition.timeOffset !== undefined && newPosition.timeOffset !== null) {
      // Fallback: use timeOffset -> slot -> day mapping (old behavior)
      try {
        const MS_PER_SLOT = 12 * 60 * 60 * 1000;
        const slotIndex = Math.floor(newPosition.timeOffset / MS_PER_SLOT);
        const dayIndex = Math.floor(slotIndex / 2);
        const clamped = Math.max(0, Math.min(numDays - 1, dayIndex));
        setActiveDayIndex(clamped);
      } catch (err) {
        // ignore
      }
    }
    
    setBerthedShips(prevShips => 
      prevShips.map(ship => {
        if (ship.id === shipId) {
          const updatedShip = {
            ...ship,
            style: {
              ...ship.style,
              left: newPosition.left,
            }
          };
          
          // Cập nhật berthName nếu có thay đổi
          if (newPosition.berthName) {
            updatedShip.berthName = newPosition.berthName;
          }
          
          // Tính toán start và end (relative-to-berth) dựa trên left và LOA
          if (newPosition.left && ship.loa) {
            const leftMatch = newPosition.left.match(/calc\((-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*\*\s*100%\)/);
            if (leftMatch) {
              const absStart = parseFloat(leftMatch[1]);
              const refStart = BERTH_REFERENCES[updatedShip.berthName] || 10;
              // start relative to berth
              updatedShip.start = absStart - refStart;
              updatedShip.end = updatedShip.start + Number(ship.loa || 0);
            }
          }
          
          // Nếu rollback với eta/etd gốc, khôi phục trực tiếp
          if (newPosition.rollbackEta && newPosition.rollbackEtd) {
            updatedShip.eta = newPosition.rollbackEta;
            updatedShip.etd = newPosition.rollbackEtd;
          }
          // Nếu có thay đổi thời gian, cập nhật ETA và ETD
          else if (newPosition.timeOffset !== undefined) {
            const newEta = new Date(startDate.getTime() + newPosition.timeOffset);
            let duration;
            const etaValid = ship.eta instanceof Date && !isNaN(ship.eta.getTime());
            const etdValid = ship.etd instanceof Date && !isNaN(ship.etd.getTime());
            if (etaValid && etdValid) {
              duration = ship.etd.getTime() - ship.eta.getTime();
            } else {
              duration = 24 * 60 * 60 * 1000; // 1 ngày
            }
            const newEtd = new Date(newEta.getTime() + duration);
            updatedShip.eta = newEta;
            updatedShip.etd = newEtd;
          }
          
          return updatedShip;
        }
        return ship;
      })
    );
    // selectedShip sẽ tự động được cập nhật qua useEffect
  };

  const handleShipDragEnd = () => {
    // Reset activeBerth khi thả chuột
    setActiveBerth(null);
    // Reset active day highlight as well
    setActiveDayIndex(null);
  };

  // Lấy selectedShip mới nhất từ berthedShips
  const currentSelectedShip = selectedShip 
    ? berthedShips.find(s => s.id === selectedShip.id) || selectedShip
    : null;

  // Click bất kỳ đâu ngoài planner để deselect
  const handleAppClick = (event) => {
    // Chỉ deselect nếu click vào app container, không phải các phần tử con
    if (event.target.classList.contains('app') || 
        event.target.classList.contains('main-content')) {
      setSelectedShip(null);
      setActiveDayIndex(null);
      setActiveBerth(null);
    }
  };

  // Xử lý drop tàu từ waiting list vào grid
  useEffect(() => {
  window.onShipDropFromWaiting = (ship, event) => {
      // Xác định vị trí thả dựa vào tọa độ chuột
      // 1. Xác định berth và vị trí X (meters) theo vị trí X chuột
      // 2. Xác định slot thời gian (ETA/ETD) theo vị trí Y chuột
      
      const grid = document.querySelector('.grid-main');
      if (!grid) return;
      const rect = grid.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // === 1. TÍNH BERTH VÀ VỊ TRÍ X (METERS) ===
      const totalWidth = rect.width;
      const totalMeters = 1005;
      
      // Tính vị trí tuyệt đối (absolute meters) từ tọa độ X
      const absoluteMeters = (x / totalWidth) * totalMeters;
      
      // Xác định berth dựa trên vị trí tuyệt đối
      // Cấu trúc: gap10 | K12C | gap30 | K12A | K12 | K12B | gap20 | TT2 | gap10
      const blockDefs = [
        { id: 'gap', start: 0, end: 10 },
        { id: 'K12C', start: 10, end: 199 },
        { id: 'gap', start: 199, end: 229 },
        { id: 'K12A', start: 229, end: 361 },
        { id: 'K12', start: 361, end: 549 },
        { id: 'K12B', start: 549, end: 753 },
        { id: 'gap', start: 753, end: 773 },
        { id: 'TT2', start: 773, end: 995 },
        { id: 'gap', start: 995, end: 1005 },
      ];
      
      let berthName = null;
      for (let block of blockDefs) {
        if (absoluteMeters >= block.start && absoluteMeters < block.end) {
          if (block.id !== 'gap') {
            berthName = block.id;
          }
          break;
        }
      }
      
      if (!berthName) return; // Không thả vào vùng hợp lệ (gap)

      // Tính vị trí relative-to-berth
      const refStart = BERTH_REFERENCES[berthName] || 10;
      const loa = ship.loa || 100;
      
      // startRel: vị trí bắt đầu tàu relative to berth (căn giữa tàu với vị trí thả)
      const startRel = Math.round(absoluteMeters - refStart - (loa / 2));
      const endRel = Math.round(startRel + loa);

      // === 2. TÍNH THỜI GIAN (ETA/ETD) ===
      const slotHeight = 30;
      const msPerSlot = 12 * 60 * 60 * 1000;
      const slot = Math.floor(y / slotHeight);
      const eta = new Date(startDate.getTime() + slot * msPerSlot);
      
      // Giữ nguyên duration tàu (nếu có), nếu không có ETD thì mặc định ETD = ETA + 1 ngày
      let duration;
      const etaValid = ship.eta instanceof Date && !isNaN(ship.eta.getTime());
      const etdValid = ship.etd instanceof Date && !isNaN(ship.etd.getTime());
      if (etaValid && etdValid) {
        duration = ship.etd.getTime() - ship.eta.getTime();
      } else {
        duration = 24 * 60 * 60 * 1000; // 1 ngày
      }
      const etd = new Date(eta.getTime() + duration);

      // === 3. TÍNH STYLE (LEFT, WIDTH, TOP, HEIGHT) ===
      const absStart = refStart + startRel;
      const absEnd = refStart + endRel;
      const shipWidth = absEnd - absStart;
      const left = `calc(${absStart}/1005*100%)`;
      const width = `calc(${shipWidth}/1005*100%)`;
      
      const startDateMs = startDate.getTime();
      const topPx = ((eta.getTime() - startDateMs) / msPerSlot) * slotHeight;
      const heightPx = ((etd.getTime() - eta.getTime()) / msPerSlot) * slotHeight;
      const top = `${topPx}px`;
      const height = `${heightPx}px`;

      // === 4. TẠO TÀU MỚI VÀ THÊM VÀO PLANNER ===
      const newShip = {
        ...ship,
        berthName,
        eta,
        etd,
        start: startRel,
        end: endRel,
        style: {
          left,
          width,
          top,
          height,
        },
      };
      
      setBerthedShips(prev => [...prev, newShip]);
      setWaitingShips(prev => prev.filter(s => s.id !== ship.id));
      setSelectedShip(newShip);
      setToast({ message: `Tàu ${ship.name} đã cập cầu tại ${berthName}.`, type: 'success' });
    };
    return () => { window.onShipDropFromWaiting = null; };
  }, [startDate, berthedShips]);

  // Handler cập nhật kế hoạch tàu từ DetailPanel
  // Kiểm tra chồng lấn và khoảng cách 10% LOA
  const checkOverlapAndGap = (ship, allShips, left, width, top, height, startDateMs) => {
    // left: calc(x/1005*100%), width: calc(w/1005*100%), top: y px, height: h px
    const leftMatch = left && left.match(/calc\((-?\d+)\s*\/\s*(\d+)\s*\*\s*100%\)/);
    const widthMatch = width && width.match(/calc\((\d+)\s*\/\s*(\d+)\s*\*\s*100%\)/);
    if (!leftMatch || !widthMatch) return { overlap: false, gapWarning: false, overlapShip: null };
    const newShipStart = parseInt(leftMatch[1]);
    const shipWidthMeters = parseInt(widthMatch[1]);
    const newShipEnd = newShipStart + shipWidthMeters;
    const newShipTop = top ? parseFloat(top) : 0;
    const newShipBottom = newShipTop + (height ? parseFloat(height) : 0);
    
    let gapWarning = false;
    
    // Hàm tính style cho tàu nếu chưa có - IMPROVED: validate eta/etd properly
    const calculateShipStyle = (otherShip) => {
      // Convert eta/etd to Date if needed and validate
      let otherEta = otherShip.eta;
      let otherEtd = otherShip.etd;
      
      if (!(otherEta instanceof Date)) {
        if (typeof otherEta === 'string' || typeof otherEta === 'number') {
          otherEta = new Date(otherEta);
        }
      }
      if (!(otherEtd instanceof Date)) {
        if (typeof otherEtd === 'string' || typeof otherEtd === 'number') {
          otherEtd = new Date(otherEtd);
        }
      }
      
      // Check if dates are valid
      if (!otherEta || !otherEtd || isNaN(otherEta.getTime()) || isNaN(otherEtd.getTime())) {
        return null;
      }
      
      const slotHeight = 30;
      const msPerSlot = 12 * 60 * 60 * 1000;
      const oTop = ((otherEta.getTime() - startDateMs) / msPerSlot) * slotHeight;
      const oHeight = ((otherEtd.getTime() - otherEta.getTime()) / msPerSlot) * slotHeight;
      return { top: oTop, height: oHeight };
    };
    
    for (let otherShip of allShips) {
      if (otherShip.id === ship.id) continue;
      
      // Kiểm tra các tàu có thể chồng lấn: cùng berth hoặc các berth liền kề (K12A, K12, K12B dùng chung hệ quy chiếu)
      const berthGroups = {
        'K12C': ['K12C'],
        'K12A': ['K12A', 'K12', 'K12B'],
        'K12': ['K12A', 'K12', 'K12B'],
        'K12B': ['K12A', 'K12', 'K12B'],
        'TT2': ['TT2']
      };
      const shipGroup = berthGroups[ship.berthName] || [];
      const otherGroup = berthGroups[otherShip.berthName] || [];
      const canOverlap = shipGroup.some(b => otherGroup.includes(b));
      
      if (!canOverlap) continue;
      
      // So sánh vị trí
      const oLeftMatch = otherShip.style?.left && otherShip.style.left.match(/calc\((-?\d+)\s*\/\s*(\d+)\s*\*\s*100%\)/);
      const oWidthMatch = otherShip.style?.width && otherShip.style.width.match(/calc\((\d+)\s*\/\s*(\d+)\s*\*\s*100%\)/);
      if (!oLeftMatch || !oWidthMatch) continue;
      const otherStart = parseInt(oLeftMatch[1]);
      const otherWidth = parseInt(oWidthMatch[1]);
      const otherEnd = otherStart + otherWidth;
      
      // Tính hoặc lấy top/height của tàu khác - IMPROVED: always recalculate to ensure accuracy
      let oTop, oHeight, otherBottom;
      // ALWAYS recalculate from eta/etd to avoid using stale style values from loaded files
      const calculated = calculateShipStyle(otherShip);
      if (calculated) {
        oTop = calculated.top;
        oHeight = calculated.height;
        otherBottom = oTop + oHeight;
      } else if (otherShip.style?.top && otherShip.style?.height) {
        // Fallback to existing style values only if can't calculate
        const topStr = otherShip.style.top;
        const heightStr = otherShip.style.height;
        oTop = parseFloat(topStr);
        oHeight = parseFloat(heightStr);
        otherBottom = oTop + oHeight;
      } else {
        // Can't determine position - skip this ship
        continue;
      }
      
      // Additional validation: ensure otherBottom is valid
      if (isNaN(oTop) || isNaN(oHeight) || isNaN(otherBottom)) {
        continue;
      }
      
      // Kiểm tra overlap theo 2 chiều
      // FIXED: Chỉ báo chồng lấn khi thực sự giao nhau, không tính trường hợp chạm nhau
      // Horizontal: chồng lấn khi có phần giao nhau (không chỉ chạm)
      const horizontalOverlap = (newShipStart < otherEnd && newShipEnd > otherStart);
      // Vertical (time axis): chồng lấn khi có thời gian giao nhau (không chỉ chạm)
      const verticalOverlap = (newShipTop < otherBottom && newShipBottom > oTop);
      
      if (horizontalOverlap && verticalOverlap) {
        return { overlap: true, gapWarning: false, overlapShip: otherShip };
      }
      // Cảnh báo chỉ khi thực sự giao nhau trên trục thời gian (overlap dọc)
      const verticalOverlapOnly = (newShipTop < otherBottom && newShipBottom > oTop);
      const horizontalNoOverlap = (newShipEnd <= otherStart || newShipStart >= otherEnd);
      if (verticalOverlapOnly && horizontalNoOverlap) {
        // Khoảng cách giữa 2 tàu (mép phải tàu trái và mép trái tàu phải)
        const dist = Math.min(Math.abs(newShipStart - otherEnd), Math.abs(otherStart - newShipEnd));
        // Lấy LOA lớn hơn
        const loa1 = Number(ship.loa) || 0;
        const loa2 = Number(otherShip.loa) || 0;
        const minGap = 0.1 * Math.max(loa1, loa2);
        if (dist < minGap) {
          gapWarning = true;
        }
      }
    }
    return { overlap: false, gapWarning, overlapShip: null };
  };

  const handleUpdateShipPlan = (updatedShip) => {
    // Tính lại style.left, style.width, style.top, style.height dựa trên berthName, loa, eta, etd
    const slotHeight = 30;
    const msPerSlot = 12 * 60 * 60 * 1000;
    const startDateMs = startDate.getTime();
    
    // IMPROVED: Validate and convert eta/etd to proper Date objects
    let eta = null;
    let etd = null;
    
    if (updatedShip.eta) {
      eta = updatedShip.eta instanceof Date ? updatedShip.eta : new Date(updatedShip.eta);
      if (isNaN(eta.getTime())) eta = null;
    }
    
    if (updatedShip.etd) {
      etd = updatedShip.etd instanceof Date ? updatedShip.etd : new Date(updatedShip.etd);
      if (isNaN(etd.getTime())) etd = null;
    }
    
    const berthName = updatedShip.berthName;
    const loa = Number(updatedShip.loa);

    // Nếu tàu đang ở waitingShips thì cập nhật vào waitingShips
    const isWaiting = waitingShips.some(s => s.id === updatedShip.id);
    if (isWaiting) {
      // Tính startPosition và endPosition từ start/end nếu có
      let startPosition, endPosition;
      if (updatedShip.start !== undefined && updatedShip.end !== undefined) {
        startPosition = Number(updatedShip.start);
        endPosition = Number(updatedShip.end);
      }
      
      setWaitingShips(prev => prev.map(s => s.id === updatedShip.id ? {
        ...s,
        ...updatedShip,
        eta,
        etd,
        start: startPosition,
        end: endPosition
      } : s));
      setToast({ message: `Đã cập nhật thông tin tàu ${updatedShip.name} trong danh sách chờ.`, type: 'success' });
      setSelectedShip(null);
      return;
    }

    // Tìm tàu hiện tại trong berthedShips để lấy giá trị cũ
    const currentShip = berthedShips.find(s => s.id === updatedShip.id);

    let left = currentShip?.style?.left, width = currentShip?.style?.width, top = undefined, height = undefined;
    // Ưu tiên sử dụng start/end từ DetailPanel, sau đó mới dùng style.left/width
    if (berthName && loa && eta && etd) {
      // FIXED: Ưu tiên start/end từ form (chính xác) hơn style.left/width (có thể cũ)
      let useStart = updatedShip.start !== undefined ? Number(updatedShip.start) : undefined;
      let useEnd = updatedShip.end !== undefined ? Number(updatedShip.end) : undefined;
      if (!isNaN(useStart) && !isNaN(useEnd)) {
        // Tính từ start/end (relative-to-berth)
        const refStart = BERTH_REFERENCES[berthName] || 10;
        const absStart = refStart + useStart;
        const absEnd = refStart + useEnd;
        const newWidth = absEnd - absStart;
        left = `calc(${absStart}/1005*100%)`;
        width = `calc(${newWidth}/1005*100%)`;
      } else if (updatedShip.style?.left && updatedShip.style?.width) {
        // Fallback: dùng style.left/width nếu không có start/end
        left = updatedShip.style.left;
        width = updatedShip.style.width;
      } else if (!currentShip || currentShip.berthName !== berthName || currentShip.loa !== loa) {
        // Fallback cuối: tạo mới ở đầu bến
        const refStart = BERTH_REFERENCES[berthName] || 10;
        left = `calc(${refStart}/1005*100%)`;
        width = `calc(${loa}/1005*100%)`;
      }
      // Luôn tính lại top, height dựa trên eta/etd
      const topPx = ((eta.getTime() - startDateMs) / msPerSlot) * slotHeight;
      const heightPx = ((etd.getTime() - eta.getTime()) / msPerSlot) * slotHeight;
      top = `${topPx}px`;
      height = `${heightPx}px`;
    }
    // Kiểm tra chồng lấn và 10% LOA, loại bỏ chính tàu đang cập nhật khỏi danh sách so sánh
    setBerthedShips(prev => {
      const otherShips = prev.filter(s => s.id !== updatedShip.id);
      const { overlap, gapWarning, overlapShip } = checkOverlapAndGap(
        { ...updatedShip, loa, berthName },
        otherShips,
        left,
        width,
        top,
        height,
        startDateMs
      );
      if (overlap) {
        setHighlightedShips([updatedShip.id, overlapShip.id]);
        setTimeout(() => setHighlightedShips([]), 3000);
        setToast({ message: `Lỗi: Tàu ${updatedShip.name} bị chồng lấn với tàu ${overlapShip?.name || ''} tại bến ${berthName}. Vui lòng kiểm tra lại thời gian và vị trí!`, type: 'error' });
        return prev; // Không cập nhật
      }
      
      // Tính start và end (relative-to-berth) từ left/width để đồng bộ chính xác
      let startRel, endRel;
      if (left) {
        const leftMatch = left.match(/calc\((-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*\*\s*100%\)/);
        const widthMatch = width && width.match(/calc\((-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*\*\s*100%\)/);
        if (leftMatch) {
          const absStart = parseFloat(leftMatch[1]);
          const refStart = BERTH_REFERENCES[berthName] || 10;
          startRel = absStart - refStart;
          const wMeters = widthMatch ? parseFloat(widthMatch[1]) : (loa || 0);
          endRel = startRel + wMeters;
        }
      }
      
      const updatedList = prev.map(s => s.id === updatedShip.id ? {
        ...s,
        ...updatedShip,
        eta,
        etd,
        berthName,
        loa,
        start: startRel,
        end: endRel,
        style: {
          ...s.style,
          left,
          width,
          top,
          height
        },
        gapWarning: gapWarning
      } : s);
      setToast({ message: gapWarning
        ? `Cảnh báo: Khoảng cách giữa tàu ${updatedShip.name} và tàu khác nhỏ hơn 10% LOA tàu lớn hơn! (Vẫn cho phép cập nhật)`
        : `Đã cập nhật kế hoạch cho tàu ${updatedShip.name}.`,
        type: gapWarning ? 'warning' : 'success' });
      setSelectedShip(null);
      return updatedList;
    });
  };

  return (
    <div className="app" onClick={handleAppClick}>
      {/* Password Modal */}
      {showPasswordModal && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 9998,
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              background: "rgba(0,0,0,0.18)"
            }}
          />
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
              textAlign: "center"
            }}>
              <h2 style={{marginBottom: "18px"}}>Nhập mật khẩu để sử dụng</h2>
              <input
                type="password"
                value={passwordInput}
                onChange={e => {
                  setPasswordInput(e.target.value);
                  setPasswordError("");
                }}
                style={{
                  fontSize: "18px",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  width: "100%",
                  marginBottom: "12px"
                }}
                placeholder="Mật khẩu..."
                autoFocus
                onKeyDown={async e => {
                  if (e.key === "Enter") {
                    if (await verifyPassword(passwordInput)) {
                      setShowPasswordModal(false);
                      await setCurrentPasswordHash(passwordInput);
                    } else {
                      setPasswordError("Mật khẩu không đúng!");
                    }
                  }
                }}
              />
              <button
                style={{
                  fontSize: "16px",
                  padding: "8px 24px",
                  borderRadius: "6px",
                  background: "#1976d2",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer"
                }}
                onClick={async () => {
                  if (await verifyPassword(passwordInput)) {
                    setShowPasswordModal(false);
                    await setCurrentPasswordHash(passwordInput);
                  } else {
                    setPasswordError("Mật khẩu không đúng!");
                  }
                }}
              >Vào chương trình</button>
              {passwordError && (
                <div style={{color: "#d32f2f", marginTop: "10px"}}>{passwordError}</div>
              )}
              <div style={{marginTop: "18px", fontSize: "0.95em", color: "#888"}}>
                © Nguyen Hoang &amp; Ban Khai thac | Trung tam DHKT KV TAN THUAN
              </div>
            </div>
          </div>
        </>
      )}
      {!showPasswordModal && (
        <>
          {/* Modal xác nhận xóa tàu */}
          <ConfirmModal
            isOpen={confirmRemove.show}
            title="Xác nhận rời tàu"
            message={<>{`Bạn có chắc chắn muốn cho tàu `}<b>{confirmRemove.ship?.name}</b>{` rời cầu?`}</>}
            confirmText="Xác nhận"
            cancelText="Hủy"
            onConfirm={confirmRemoveShip}
            onCancel={cancelRemoveShip}
            confirmButtonClass="btn-confirm-primary"
          />

          {/* Modal xác nhận xóa tàu khỏi waiting list */}
          <ConfirmModal
            isOpen={confirmDeleteWaiting.show}
            title="Xác nhận xóa tàu"
            message={<>{`Bạn có chắc chắn muốn xóa tàu `}<b>{confirmDeleteWaiting.ship?.name}</b>{` khỏi danh sách chờ?`}</>}
            confirmText="Xác nhận"
            cancelText="Hủy"
            onConfirm={confirmDeleteWaitingShip}
            onCancel={cancelDeleteWaitingShip}
            confirmButtonClass="btn-confirm-primary"
          />
          <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />
          <Header 
            numDays={numDays}
            onDayChange={handleDayChange}
            startDate={startDate}
            onStartDateChange={handleStartDateChange}
            onSavePlan={async () => {
              try {
                const dataToSave = {
                  berthedShips,
                  waitingShips,
                  startDate,
                  numDays,
                  cranes: cranePositionsRef.current || []
                };
                const dataStr = JSON.stringify(dataToSave, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = generateFileName('berth', '.json');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                setToast({ message: 'Đã lưu kế hoạch thành công!', type: 'success' });
              } catch (err) {
                setToast({ message: 'Lỗi khi lưu kế hoạch!', type: 'error' });
              }
            }}
            onOpenPlan={handleOpenPlan}
            onImportPlan={handleImportPlan}
            onClearPlan={(skipConfirm) => {
              // If called with skipConfirm === true, clear without asking (used by Import flow)
              const doClear = (skipConfirm === true) || window.confirm('Bạn có chắc muốn xóa toàn bộ kế hoạch không?');
              if (doClear) {
                setBerthedShips([]);
                setWaitingShips([]);
                cranePositionsRef.current = [];
                setSelectedShip(null);
                setToast({ message: 'Đã xóa kế hoạch thành công!', type: 'info' });
              }
            }}
            onExportPDF={async () => {
              setToast({ message: 'Bắt đầu xuất PDF...', type: 'info' });
              try {
                await exportPlanToPDF(
                  (progressMsg) => setToast({ message: progressMsg, type: 'info' }),
                  () => setToast({ message: 'Đã xuất PDF thành công!', type: 'success' }),
                  (errMsg) => setToast({ message: errMsg || 'Lỗi khi xuất PDF!', type: 'error' })
                );
              } catch (err) {
                console.error('Error exporting PDF via service:', err);
                setToast({ message: 'Lỗi khi xuất PDF!', type: 'error' });
              }
            }}
            onExportDetailedReport={() => {
              try {
                setToast({ message: 'Chuẩn bị báo cáo chi tiết...', type: 'info' });
                const html = buildDetailedReportHTML(berthedShips, waitingShips, startDate, numDays);
                const blob = new Blob([html], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
                setToast({ message: 'Đã tạo báo cáo chi tiết (mở tab mới)', type: 'success' });
              } catch (err) {
                console.error('Lỗi xuất báo cáo chi tiết:', err);
                setToast({ message: 'Lỗi khi xuất báo cáo chi tiết', type: 'error' });
              }
            }}
          />
          <div className="main-content">
            <div className="planner-container">
                <BerthPlanner 
                numDays={numDays}
                startDate={startDate}
                berthedShips={berthedShips}
                highlightedShips={highlightedShips}
                onShipSelect={handleSelectShip}
                onShipPositionChange={handleShipPositionChange}
                onShipDragEnd={handleShipDragEnd}
                activeBerth={activeBerth}
                activeDayIndex={activeDayIndex}
                onActiveDayChange={(v) => {
                  // accept number (day or slot) or array/null from child; normalize to array of slot indices or null
                  if (v === null || v === undefined) return setActiveDayIndex(null);
                  if (Array.isArray(v)) {
                    if (v.length === 0) return setActiveDayIndex(null);
                    // if values look like day indices (< numDays), convert to slots
                    if (v.every(x => typeof x === 'number' && x >= 0 && x < numDays)) {
                      const slots = v.flatMap(d => [d * 2, d * 2 + 1]);
                      return setActiveDayIndex(slots);
                    }
                    return setActiveDayIndex(v);
                  }
                  if (typeof v === 'number') {
                    if (v >= 0 && v < numDays) {
                      // day index -> both slots
                      return setActiveDayIndex([v * 2, v * 2 + 1]);
                    }
                    // assume slot index
                    return setActiveDayIndex([v]);
                  }
                  return setActiveDayIndex(null);
                }}
                selectedShipId={selectedShip?.id}
                onRemoveShip={handleRemoveShip}
                onMoveToWaiting={handleMoveToWaiting}
                setCranePositionsRef={ref => { cranePositionsRef.current = ref; }}
              />
              {/* Import modal preview */}
              <ImportModal
                show={importModalVisible}
                rows={importRows}
                onClose={() => { setImportModalVisible(false); setImportRows([]); }}
                onImportSelected={(selected) => {
                  // Prepare ships: ensure dates are Date objects and compute style for berthed ships
                  // Also adjust planner range: set startDate to earliest ETA from imported data (if any)
                  // and set numDays to cover the latest ETD from imported data.
                  try {
                    const importedDates = (selected || []).map(s => ({
                      eta: s.eta ? new Date(s.eta) : null,
                      etd: s.etd ? new Date(s.etd) : null
                    }));
                    const validEtas = importedDates.map(d => d.eta).filter(Boolean);
                    const validEtds = importedDates.map(d => d.etd).filter(Boolean);
                    let minEtaDate = null;
                    if (validEtas.length) {
                      minEtaDate = new Date(Math.min(...validEtas.map(d => d.getTime())));
                      // normalize to midnight (planner expects startDate at day boundary)
                      const normalized = new Date(minEtaDate.getFullYear(), minEtaDate.getMonth(), minEtaDate.getDate());
                      setStartDate(normalized);
                    }
                    if (validEtds.length) {
                      const maxEtd = new Date(Math.max(...validEtds.map(d => d.getTime())));
                      const baseStart = minEtaDate ? new Date(minEtaDate.getFullYear(), minEtaDate.getMonth(), minEtaDate.getDate()) : startDate;
                      const msPerDay = 24 * 60 * 60 * 1000;
                      let days = Math.ceil((maxEtd.getTime() - baseStart.getTime()) / msPerDay);
                      if (days <= 0) days = 1; // at least 1 day
                      setNumDays(days);
                    }
                  } catch (e) {
                    console.warn('Failed to adjust planner range from imported data', e);
                  }
                  const w = [];
                  const b = [];
                  let autoMovedToWaiting = 0;
                  selected.forEach(s => {
                    const ship = { ...s };
                    const meta = ship._importMeta || {};
                    // normalize dates
                    if (ship.eta && !(ship.eta instanceof Date)) ship.eta = new Date(ship.eta);
                    if (ship.etd && !(ship.etd instanceof Date)) ship.etd = new Date(ship.etd);
                    const status = String(ship.status || '').toUpperCase();
                    // If berth provided but not in allowed list, clear it and treat as waiting (case-insensitive)
                    const isBerthValid = ship.berthName && VALID_BERTHS.some(vb => vb.toUpperCase() === String(ship.berthName).trim().toUpperCase());
                    if (ship.berthName && !isBerthValid) {
                      console.warn(`Invalid berth name '${ship.berthName}' for ship '${ship.name}', moving to waiting`);
                      ship.berthName = '';
                    }
                    // If import preview flagged an overlap/conflict, move to waiting instead of berthed
                    const hasOverlap = Array.isArray(meta.errors) && meta.errors.some(e => String(e).toLowerCase().includes('overlap'));
                    const isInvalidBerth = Array.isArray(meta.warnings) && meta.warnings.some(w => String(w).toLowerCase().includes('invalid berth'));
                    if (hasOverlap || isInvalidBerth) {
                      // clear berth and treat as waiting
                      ship.berthName = '';
                      autoMovedToWaiting += 1;
                      w.push(ship);
                      return; // skip berthed logic
                    }
                    // Allow ships with valid berthName to be berthed even if status is empty/missing
                    // (previously required status to include 'BERTH' keywords, which was too strict)
                    const shouldBeBerthed = ship.berthName && (
                      status === '' || 
                      status.includes('BERTH') || 
                      status.includes('ĐANG') || 
                      status.includes('BERTHED')
                    );
                    
                    if (shouldBeBerthed) {
                      // Validate berth has a reference point
                      const refStart = BERTH_REFERENCES[ship.berthName];
                      if (refStart === undefined) {
                        // Berth not in BERTH_REFERENCES → move to waiting with warning
                        console.warn(`Import: berth "${ship.berthName}" not found in BERTH_REFERENCES, moving ship to waiting`);
                        ship.berthName = '';
                        w.push(ship);
                        return;
                      }
                      
                      // Check if position data exists; if missing, move to waiting instead of auto-placing at 0
                      const hasStart = (ship.start !== undefined && ship.start !== null && !isNaN(Number(ship.start)));
                      const hasEnd = (ship.end !== undefined && ship.end !== null && !isNaN(Number(ship.end)));
                      
                      if (!hasStart && !hasEnd) {
                        // No position data → move to waiting (user must manually place)
                        console.warn(`Import: ship "${ship.name}" has berth but no position; moving to waiting for manual placement`);
                        ship.berthName = '';
                        w.push(ship);
                        return;
                      }
                      
                      // compute start/end and style
                      // If only start is provided, calculate end based on LOA
                      // If only end is provided, calculate start based on LOA
                      let startRel;
                      let endRel;
                      
                      if (hasStart && !hasEnd) {
                        // Has start only → calculate end = start + LOA
                        startRel = Number(ship.start);
                        endRel = startRel + (ship.loa || 100);
                      } else if (!hasStart && hasEnd) {
                        // Has end only → calculate start = end - LOA
                        endRel = Number(ship.end);
                        startRel = endRel - (ship.loa || 100);
                      } else {
                        // Has both start and end → use as-is
                        startRel = Number(ship.start);
                        endRel = Number(ship.end);
                      }
                      const absStart = refStart + startRel;
                      const absEnd = refStart + endRel;
                      const shipWidth = absEnd - absStart;
                      const left = `calc(${absStart}/1005*100%)`;
                      const width = `calc(${shipWidth}/1005*100%)`;
                      ship.start = startRel;
                      ship.end = endRel;
                      // Ensure mandra is preserved (it was parsed earlier but make it explicit)
                      ship.mandra = ship.mandra || null;
                      ship.style = { ...(ship.style || {}), left, width };
                      b.push(ship);
                    } else {
                      w.push(ship);
                    }
                  });
                  if (w.length) setWaitingShips(prev => [...prev, ...w]);
                  if (b.length) setBerthedShips(prev => [...prev, ...b]);
                  setImportModalVisible(false);
                  setImportRows([]);
                  const movedMsg = typeof autoMovedToWaiting === 'number' && autoMovedToWaiting > 0 ? ` (${autoMovedToWaiting} moved to waiting due to conflicts)` : '';
                  setToast({ message: `Imported ${w.length} waiting, ${b.length} berthed${movedMsg}`, type: 'success' });
                }}
                // 'Import all valid' action removed; users should select rows then click 'Nhập mục đã chọn'
              />
            </div>
            <div className="right-sidebar">
              {currentSelectedShip ? (
                <DetailPanel 
                  key={currentSelectedShip.id}
                  ship={currentSelectedShip} 
                  onClose={handleClosePanel} 
                  onUpdate={handleUpdateShipPlan}
                  onToast={(msg, type) => setToast({ message: msg, type: type || 'info' })}
                />
              ) : (
                <ControlPanel 
                  waitingShips={waitingShips} 
                  onShipSelect={handleSelectShip}
                  onAddWaitingShip={handleAddWaitingShip}
                  onDockShip={handleDockShipFromWaiting}
                  onDeleteWaitingShip={handleDeleteWaitingShip}
                  highlightedShips={highlightedShips}
                />
              )}
            </div>
          </div>
          {/* Copyright footer */}
          <footer className="app-footer">
            © Nguyen Hoang &amp; Ban Khai thac | Trung tam DHKT KV TAN THUAN
          </footer>
        </>
      )}
    </div>
  );
}

export default App;