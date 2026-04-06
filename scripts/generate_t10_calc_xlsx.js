const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const input = path.resolve(__dirname, '..', 'data', 't10.xlsx');
const out = path.resolve(__dirname, '..', 'data', 't10_calc.xlsx');

if (!fs.existsSync(input)) {
  console.error('Input not found:', input);
  process.exit(1);
}

const wb = XLSX.readFile(input, { cellDates: true });
const sheetName = wb.SheetNames[0];
const ws = wb.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
if (rows.length === 0) { console.error('No rows'); process.exit(1); }

// Normalize column names and pick fields we expect
// We'll write Data sheet with columns: ETA, ETD, Berth, Start, End, LOA
const dataRows = rows.map(r => {
  // attempt common column names
  const get = (keys) => {
    for (const k of keys) if (r[k] !== undefined) return r[k];
    return '';
  };
  const eta = get(['ETA','Eta','eta','ETA (local)','ETA_dt']) || '';
  const etd = get(['ETD','Etd','etd','ETD (local)','ETD_dt']) || '';
  const berth = get(['Berth','berth','berthName','BerthName','Bến','bến','Bến']) || '';
  const start = get(['Start','start','StartPosition','startpos','start_pos']) || '';
  const end = get(['End','end','EndPosition','endpos','end_pos']) || '';
  const loa = get(['LOA','Loa','loa','Length','LOA (m)']) || '';
  return { ETA: eta, ETD: etd, Berth: berth, Start: start, End: end, LOA: loa };
});

// Determine window start and end
const toMs = v => (v instanceof Date ? v.getTime() : (typeof v === 'number' ? new Date(v).getTime() : (v ? new Date(v).getTime() : NaN)));
const etas = dataRows.map(r => toMs(r.ETA)).filter(t => !isNaN(t));
const etd = dataRows.map(r => toMs(r.ETD)).filter(t => !isNaN(t));
const minEta = new Date(Math.min(...etas));
minEta.setHours(0,0,0,0);
const maxEtd = new Date(Math.max(...etd));
// compute numDays to cover
const numDays = Math.ceil((maxEtd.getTime() - minEta.getTime()) / (24*3600*1000)) || 1;

// Build new workbook
const newWb = XLSX.utils.book_new();

// Data sheet
const dataHeader = ['ETA','ETD','Berth','Start','End','LOA'];
const dataSheetRows = [dataHeader].concat(dataRows.map(r => [r.ETA, r.ETD, r.Berth, r.Start, r.End, r.LOA]));
const dataWs = XLSX.utils.aoa_to_sheet(dataSheetRows);
XLSX.utils.book_append_sheet(newWb, dataWs, 'Data');

// Settings sheet
const settings = [
  ['ReportStart', minEta],
  ['NumDays', numDays],
  ['SlotHours', 1],
  ['PrepHours', 2],
  ['XalanFactor', 0.3]
];
const settWs = XLSX.utils.aoa_to_sheet(settings);
// Ensure date cell is typed as date
settWs['B1'].t = 'd';
XLSX.utils.book_append_sheet(newWb, settWs, 'Settings');

// Calc sheet
// Build timeslots (hourly) from ReportStart to ReportStart + NumDays
const slots = [];
const startMs = minEta.getTime();
const totalHours = Math.ceil(numDays * 24);
for (let i=0;i<totalHours;i++) {
  const t = new Date(startMs + i * 3600*1000);
  slots.push([t]);
}
const calcHeader = ['SlotTime','K12C','K12A','K12','K12B','TT2'];
const calcRows = [calcHeader];
// Populate slot rows with formulas
// We'll write formulas that use SUMPRODUCT on Data sheet:
// =--(SUMPRODUCT((Data!$C$2:$C$N="K12C")*((Data!$A$2:$A$N - Settings!$B$4/24) <= $A2)*((Data!$B$2:$B$N + Settings!$B$4/24) > $A2))>0)

const N = dataRows.length + 1; // header
for (let i=0;i<slots.length;i++) {
  const rowIdx = 2 + i; // 1-based
  const slotTimeCell = `A${rowIdx}`;
  const slotTime = slots[i][0];
  // We'll put actual date in A cell and formulas in berth columns
  const row = [slotTime];
  const berthList = ['K12C','K12A','K12','K12B','TT2'];
  for (let b=0;b<berthList.length;b++) {
    const berth = berthList[b];
    const formula = `=--(SUMPRODUCT((Data!$C$2:$C$${N}="${berth}")*((Data!$A$2:$A$${N} - Settings!$B$4/24) <= A${rowIdx})*((Data!$B$2:$B$${N} + Settings!$B$4/24) > A${rowIdx}))>0)`;
    row.push({ f: formula });
  }
  calcRows.push(row);
}

// After slots, add summary rows per berth computing percent and applying xalan
const summaryStart = calcRows.length + 2;
calcRows.push([]);
const berthList = ['K12C','K12A','K12','K12B','TT2'];
for (let b=0;b<berthList.length;b++) {
  const berth = berthList[b];
  // formula: occupied_hours = SUM(column), pct = MIN(100,ROUND((occupied_hours / totalHours * 100) * (1 + XalanFactor),0))
  const col = String.fromCharCode('B'.charCodeAt(0) + b);
  const sumFormula = `=SUM(${col}$2:${col}$${1+totalHours})`;
  const pctFormula = `=MIN(100,ROUND(((${sumFormula}/${totalHours})*100)*(1+Settings!$B$5),0))`;
  calcRows.push([`${berth} occupied_hours`, { f: sumFormula }]);
  calcRows.push([`${berth} pct`, { f: pctFormula }]);
}

const calcWs = XLSX.utils.aoa_to_sheet(calcRows);
XLSX.utils.book_append_sheet(newWb, calcWs, 'Calc');

XLSX.writeFile(newWb, out, { bookType: 'xlsx' });
console.log('Wrote', out);
