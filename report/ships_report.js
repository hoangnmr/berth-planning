// ships_report.js - JavaScript logic for ships report
// Embedded sample data (from data/mau.json)
const sampleData = {
"berthedShips": [
  {
    "id": "W1762403477213",
    "name": "VIET THUAN 215-06",
    "imo": "",
    "dwt": 1000,
    "loa": 168,
    "beam": 20,
    "cargoType": "Sắt thép",
    "cargo": "",
    "berthName": "K12C",
    "eta": "2025-10-06T09:57:00.000Z",
    "etd": "2025-10-07T17:52:00.000Z",
    "style": {
      "left": "calc(18 / 1005 * 100%)",
      "width": "calc(168/1005*100%)",
      "top": "104.375px",
      "height": "79.79166666666667px"
    },
    "mandra": "",
    "gapWarning": false
  },
  {
    "id": "W1762403749764",
    "name": "TU CUONG 68",
    "imo": "",
    "dwt": 1000,
    "loa": 117,
    "beam": 20,
    "cargoType": "Sắt thép",
    "cargo": "",
    "berthName": "K12A",
    "eta": "2025-10-06T10:36:00.000Z",
    "etd": "2025-10-07T18:27:00.000Z",
    "style": {
      "left": "calc(201 / 1005 * 100%)",
      "width": "calc(117/1005*100%)",
      "top": "104.375px",
      "height": "79.79166666666667px"
    },
    "mandra": "",
    "gapWarning": false
  },
  {
    "id": "W1762403750057",
    "name": "THANH HAI 168",
    "imo": "",
    "dwt": 1000,
    "loa": 180,
    "beam": 20,
    "cargoType": "Container",
    "cargo": "200/150",
    "berthName": "K12",
    "eta": "2025-10-06T10:57:00.000Z",
    "etd": "2025-10-07T19:27:00.000Z",
    "style": {
      "left": "calc(333 / 1005 * 100%)",
      "width": "calc(180/1005*100%)",
      "top": "104.375px",
      "height": "79.79166666666667px"
    },
    "mandra": "",
    "gapWarning": false
  },
  {
    "id": "W1762403750349",
    "name": "HAI PHUONG 09",
    "imo": "",
    "dwt": 1000,
    "loa": 110,
    "beam": 20,
    "cargoType": "Container",
    "cargo": "100/80",
    "berthName": "K12B",
    "eta": "2025-10-07T16:13:00.000Z",
    "etd": "2025-10-08T20:27:00.000Z",
    "style": {
      "left": "calc(528 / 1005 * 100%)",
      "width": "calc(110/1005*100%)",
      "top": "158.41666666666669px",
      "height": "121.25000000000001px"
    },
    "mandra": "",
    "gapWarning": false
  },
  {
    "id": "W1762403750639",
    "name": "VINH GIA 168",
    "imo": "",
    "dwt": 1000,
    "loa": 117,
    "beam": 20,
    "cargoType": "Khác",
    "cargo": "",
    "berthName": "TT2",
    "eta": "2025-10-07T08:22:00.000Z",
    "etd": "2025-10-09T08:52:00.000Z",
    "style": {
      "left": "calc(785 / 1005 * 100%)",
      "width": "calc(117/1005*100%)",
      "top": "158.41666666666669px",
      "height": "121.25000000000001px"
    },
    "mandra": "",
    "gapWarning": false
  },
  {
    "id": "W1762403956220",
    "name": "ANT LUCKY",
    "imo": "",
    "dwt": 1000,
    "loa": 180,
    "beam": 20,
    "cargoType": "Sắt thép",
    "cargo": "30606",
    "berthName": "K12C",
    "eta": "2025-10-10T23:50:00.000Z",
    "etd": "2025-10-12T16:00:00.000Z",
    "style": {
      "left": "calc(6/1005*100%)",
      "width": "calc(180/1005*100%)",
      "top": "377.0833333333333px",
      "height": "100.41666666666667px"
    },
    "mandra": "",
    "gapWarning": false,
    "start": -4,
    "end": 176
  },
  {
    "id": "W1762404047972",
    "name": "TRUNG THANG 66",
    "imo": "",
    "dwt": 1000,
    "loa": 110,
    "beam": 20,
    "cargoType": "Sắt thép",
    "cargo": "",
    "berthName": "TT2",
    "eta": "2025-10-11T09:57:00.000Z",
    "etd": "2025-10-12T20:27:00.000Z",
    "style": {
      "left": "calc(798 / 1005 * 100%)",
      "width": "calc(110/1005*100%)",
      "top": "377.0833333333333px",
      "height": "100.41666666666667px"
    },
    "mandra": "",
    "gapWarning": false,
    "start": -4,
    "end": 176
  }
],
"waitingShips": []
};

// Global variables
let currentList = [];
let currentSort = { key: null, dir: null };

// Utility functions
function fmtNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('vi-VN').format(Math.round(num));
}

function fmtDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return dateStr;
  }
}

function fmtDuration(mins) {
  if (!mins || mins < 0) return '-';
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (hours > 0) {
    return `${hours}h ${remainingMins}m`;
  }
  return `${remainingMins}m`;
}

function getCargoColor(type) {
  const colors = {
    'sắt thép': '#10b981',
    'sắt': '#10b981',
    'thép': '#10b981',
    'container': '#f59e0b',
    'cont': '#f59e0b',
    'khác': '#6c757d'
  };
  const key = (type || '').toLowerCase();
  for (const [k, v] of Object.entries(colors)) {
    if (key.includes(k)) return v;
  }
  return '#6c757d';
}

// Data processing functions
function buildList(data) {
  const allShips = [...(data.berthedShips || []), ...(data.waitingShips || [])];
  return allShips.map(s => {
    const eta = s.eta ? new Date(s.eta) : null;
    const etd = s.etd ? new Date(s.etd) : null;
    const durationMins = eta && etd ? Math.max(0, Math.round((etd - eta) / (1000 * 60))) : null;
    return {
      ...s,
      _eta: eta,
      _etd: etd,
      _durationMins: durationMins,
      _duration: durationMins ? fmtDuration(durationMins) : '-',
      status: s.berthName ? 'berthed' : 'waiting'
    };
  });
}

// UI rendering functions
function renderSummary(list) {
  const container = document.getElementById('summary');
  const berthed = list.filter(s => s.status === 'berthed').length;
  const waiting = list.filter(s => s.status === 'waiting').length;
  const totalCargo = list.reduce((sum, s) => {
    const cargoNum = parseFloat(s.cargo) || 0;
    return sum + cargoNum;
  }, 0);

  container.innerHTML = `
    <div class="stat">
      <div style="font-size:24px;font-weight:700;color:#0b5ed7">${list.length}</div>
      <div style="font-size:12px;color:#6c757d">Tổng tàu</div>
    </div>
    <div class="stat">
      <div style="font-size:24px;font-weight:700;color:#10b981">${berthed}</div>
      <div style="font-size:12px;color:#6c757d">Đã cập bến</div>
    </div>
    <div class="stat">
      <div style="font-size:24px;font-weight:700;color:#f59e0b">${waiting}</div>
      <div style="font-size:12px;color:#6c757d">Đang chờ</div>
    </div>
    <div class="stat">
      <div style="font-size:24px;font-weight:700;color:#8b5cf6">${fmtNumber(totalCargo)}</div>
      <div style="font-size:12px;color:#6c757d">Tổng sản lượng</div>
    </div>
  `;
}

function renderCharts(list) {
  const container = document.getElementById('charts');
  // Group by cargoType
  const cargoStats = {};
  list.forEach(s => {
    const typeKey = (s.cargoType || 'Khác').toString().trim().toLowerCase();
    const key = typeKey || 'khác';
    if (!cargoStats[key]) cargoStats[key] = { count: 0, totalCargo: 0 };
    cargoStats[key].count++;
    if (key.includes('container') || key.includes('cont')) {
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
      if (!cargoStats[key].totalCargo || typeof cargoStats[key].totalCargo === 'object') cargoStats[key].totalCargo = 0;
      cargoStats[key].totalCargo += cargoNum;
    }
  });
  // Pie chart for ship count (ordered Sắt thép, Container, Khác, then others)
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
  // Generate cargo summary text (professional layout) + totals
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
      totalContImp += imp; totalContExp += exp;
      cargoSummary += `
        <div style="display:flex;align-items:center;gap:10px;padding:12px 16px;border:1px solid #e2e8f0;border-radius:12px;background:#ffffff;box-shadow:0 1px 2px rgba(0,0,0,.04);border-left:6px solid ${cardColor}">
          <div style="flex:1;display:flex;flex-direction:column;">
            <div style="font-size:12px;font-weight:700;color:#334155;letter-spacing:.4px">${prettyLabel}</div>
            <div style="font-size:14px;font-weight:600;color:#0f172a">Tổng sản lượng: <span style="color:${cardColor}">${fmtNumber(imp)}</span>/<span style="color:#dc2626">${fmtNumber(exp)}</span> <span style="font-size:12px;color:#475569">Cont (Nhập/Xuất)</span></div>
          </div>
          <div style="text-align:right;font-size:12px;color:#475569">Số tàu: <strong>${stat.count}</strong></div>
        </div>`;
    } else {
      const unit = 'Tấn';
      totalTons += (stat.totalCargo || 0);
      cargoSummary += `
        <div style="display:flex;align-items:center;gap:10px;padding:12px 16px;border:1px solid #e2e8f0;border-radius:12px;background:#ffffff;box-shadow:0 1px 2px rgba(0,0,0,.04);border-left:6px solid ${cardColor}">
          <div style="flex:1;display:flex;flex-direction:column;">
            <div style="font-size:12px;font-weight:700;color:#334155;letter-spacing:.4px">${prettyLabel}</div>
            <div style="font-size:14px;font-weight:600;color:#0f172a">Tổng sản lượng: <span style="color:${cardColor}">${fmtNumber(stat.totalCargo)}</span> <span style="font-size:12px;color:#475569">${unit}</span></div>
          </div>
          <div style="text-align:right;font-size:12px;color:#475569">Số tàu: <strong>${stat.count}</strong></div>
        </div>`;
    }
  });
  // Totals card
  cargoSummary += `
    <div style="display:flex;align-items:center;gap:10px;padding:12px 16px;border:1px solid #e2e8f0;border-radius:12px;background:linear-gradient(180deg,#fff,#f8fbff);box-shadow:0 1px 2px rgba(0,0,0,.04)">
      <div style="flex:1;display:flex;flex-direction:column;">
        <div style="font-size:12px;font-weight:800;color:#0b5ed7;letter-spacing:.6px">TỔNG CỘNG</div>
        <div style="font-size:14px;font-weight:700;color:#0f172a">${fmtNumber(totalTons)} <span style="font-size:12px;color:#475569">Tấn</span> · <span style="color:#f97316">${fmtNumber(totalContImp)}</span>/<span style="color:#dc2626">${fmtNumber(totalContExp)}</span> <span style="font-size:12px;color:#475569">Cont (Nhập/Xuất)</span></div>
      </div>
    </div>`;
  cargoSummary += '</div>';
  // Berth-level aggregation (normalize berth names to uppercase)
  const berthStats = {};
  list.forEach(s => {
    const berthRaw = s.berthName || '';
    const berth = berthRaw ? String(berthRaw).trim().toUpperCase() : 'Chờ';
    if(!berthStats[berth]) berthStats[berth] = { count: 0, tons: 0, contImp: 0, contExp: 0, contCount: 0 };
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
        berthStats[berth].contImp += v; // treat single value as import
      }
    } else if(type.includes('sắt') || type.includes('thép') || type.includes('sat') || type.includes('thep')) {
      const v = parseFloat(cargoStr)||0;
      berthStats[berth].tons += v;
    }
  });
  // Fixed order: K12C, K12A, K12, K12B, TT2, Chờ
  const fixedOrder = ['K12C', 'K12A', 'K12', 'K12B', 'TT2', 'Chờ'];
  const berthData = fixedOrder.map(berth => ({
    berth,
    count: berthStats[berth]?.count || 0,
    tons: berthStats[berth]?.tons || 0,
    contTotal: (berthStats[berth]?.contImp || 0) + (berthStats[berth]?.contExp || 0),
    contCount: berthStats[berth]?.contCount || 0
  }));

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px;">
      <div class="chart-container">
        <h3>Tổng số tàu theo loại</h3>
        <canvas id="shipCountChart"></canvas>
      </div>
      <div class="chart-container">
        <h3>Tổng sản lượng theo loại</h3>
        <div style="padding:16px;">${cargoSummary}</div>
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
  `;
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
            return `${label} - ${value} tàu`;
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
      const shipCountData = berthData.map(b => b.count);
      new Chart(el, {
    type: 'bar',
    data: {
      labels: berthLabels,
      datasets: [
        { label: 'Sản lượng (Tấn)', data: steelData, backgroundColor: '#10b981', yAxisID: 'y', order: 1 },
        { label: 'Lượt tàu', data: shipCountData, type: 'line', borderColor: '#0b5ed7', backgroundColor: '#0b5ed7', yAxisID: 'y1', tension: 0.25, pointRadius: 4, order: 0 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom' },
        datalabels: {
          color: '#0f172a',
          anchor: 'end',
          align: 'top',
          formatter: (value, ctx) => ctx.dataset.type === 'line' ? value : fmtNumber(value)
        }
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
        { label: 'Sản lượng (Cont)', data: containerData, backgroundColor: '#f59e0b', yAxisID: 'y', order: 1 },
        { label: 'Lượt tàu', data: shipCountData, type: 'line', borderColor: '#0b5ed7', backgroundColor: '#0b5ed7', yAxisID: 'y1', tension: 0.25, pointRadius: 4, order: 0 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom' },
        datalabels: {
          color: '#0f172a',
          anchor: 'end',
          align: 'top',
          formatter: (value, ctx) => ctx.dataset.type === 'line' ? value : fmtNumber(value)
        }
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

function renderInsights(list) {
  const container = document.getElementById('insights');
  // Find earliest and latest ETD
  const shipsWithETD = list.filter(s => s._etd);
  const earliestRelease = shipsWithETD.length ? shipsWithETD.reduce((min, s) => s._etd < min._etd ? s : min) : null;
  const latestRelease = shipsWithETD.length ? shipsWithETD.reduce((max, s) => s._etd > max._etd ? s : max) : null;
  container.innerHTML = `
    <div class="insight-card">
      <h4>Tàu giải phóng nhanh nhất</h4>
      <p><strong>${earliestRelease ? earliestRelease.name : 'N/A'}</strong> - ETA: ${earliestRelease ? fmtDate(earliestRelease._eta) : '-'} - ETD: ${earliestRelease ? fmtDate(earliestRelease._etd) : '-'} - Duration: ${earliestRelease ? earliestRelease._duration : '-'}</p>
    </div>
    <div class="insight-card">
      <h4>Tàu giải phóng lâu nhất</h4>
      <p><strong>${latestRelease ? latestRelease.name : 'N/A'}</strong> - ETA: ${latestRelease ? fmtDate(latestRelease._eta) : '-'} - ETD: ${latestRelease ? fmtDate(latestRelease._etd) : '-'} - Duration: ${latestRelease ? latestRelease._duration : '-'}</p>
    </div>
  `;
}

function renderTableRows(list) {
  const tbody = document.querySelector('#shipsTable tbody');
  tbody.innerHTML = list.map((s, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${s.name || '-'}</td>
      <td><span class="badge-status st-${s.status}">${s.status === 'berthed' ? 'Đã cập' : 'Chờ'}</span></td>
      <td>${s.berthName || '-'}</td>
      <td>${fmtDate(s._eta)}</td>
      <td>${fmtDate(s._etd)}</td>
      <td>${s._duration}</td>
      <td class="col-right">${s.cargo || '-'}</td>
      <td>${s.cargoType || '-'}</td>
      <td class="col-right">${fmtNumber(s.dwt)}</td>
      <td class="col-right">${fmtNumber(s.loa)}</td>
      <td class="col-right">${fmtNumber(s.beam)}</td>
    </tr>
  `).join('');
}

// Sorting and interaction functions
function attachSortHandlers(baseList) {
  document.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      const currentDir = currentSort.key === key ? currentSort.dir : null;
      const newDir = currentDir === 'asc' ? 'desc' : 'asc';
      currentSort = { key, dir: newDir };

      // Update UI indicators
      document.querySelectorAll('th.sortable').forEach(o => {
        o.classList.remove('active');
        const ind = o.querySelector('.sort-indicator');
        if (ind) ind.textContent = '';
      });
      th.classList.add('active');
      const ind = th.querySelector('.sort-indicator');
      if (ind) ind.textContent = newDir === 'asc' ? '▲' : '▼';

      // Sort and render
      currentList = sortData(baseList, key, newDir);
      renderTableRows(currentList);
      renderCharts(currentList);
      renderInsights(currentList);
    });
  });
}

function sortData(list, key, dir) {
  return [...list].sort((a, b) => {
    let aVal = a[key];
    let bVal = b[key];

    // Handle special cases
    if (key === 'eta' || key === 'etd') {
      aVal = a[`_${key}`];
      bVal = b[`_${key}`];
    } else if (key === 'duration') {
      aVal = a._durationMins;
      bVal = b._durationMins;
    } else if (key === 'cargo') {
      aVal = parseFloat(a.cargo) || 0;
      bVal = parseFloat(b.cargo) || 0;
    }

    // Handle nulls
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return dir === 'asc' ? -1 : 1;
    if (bVal == null) return dir === 'asc' ? 1 : -1;

    // Compare
    if (aVal < bVal) return dir === 'asc' ? -1 : 1;
    if (aVal > bVal) return dir === 'asc' ? 1 : -1;
    return 0;
  });
}

function downloadCSV(list) {
  const headers = ['STT', 'Tên tàu', 'Trạng thái', 'Bến', 'ETA', 'ETD', 'Thời gian cập bến', 'Hàng hóa', 'Loại hàng', 'DWT', 'LOA', 'Beam'];
  const csvContent = [
    headers.join(','),
    ...list.map((s, idx) => [
      idx + 1,
      `"${s.name || ''}"`,
      s.status === 'berthed' ? 'Đã cập bến' : 'Đang chờ',
      `"${s.berthName || ''}"`,
      `"${fmtDate(s._eta)}"`,
      `"${fmtDate(s._etd)}"`,
      `"${s._duration}"`,
      `"${s.cargo || ''}"`,
      `"${s.cargoType || ''}"`,
      s.dwt || '',
      s.loa || '',
      s.beam || ''
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `ships_report_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

// Initialization
(function init(){
  document.getElementById('genTime').textContent = new Date().toLocaleString();
  const baseList = buildList(sampleData);
  renderSummary(baseList);
  renderCharts(baseList);
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