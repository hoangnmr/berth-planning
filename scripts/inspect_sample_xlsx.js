const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');

const wb = XLSX.readFile(path.join(__dirname, '..', 'data', 'sample_ships_import.xlsx'), {cellDates:true});
const sheetName = wb.SheetNames[0];
const ws = wb.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(ws, {defval: ''});

// Normalize common fields
function toDate(v){
  if (!v) return null;
  if (v instanceof Date) return v;
  const d = new Date(v);
  if (!isNaN(d)) return d;
  return null;
}

const targetNames = ["VIET THUAN 12-01","TS HONOUR"];

const found = rows.filter(r => targetNames.includes((r.name||r.Name||r.NAME||'').toString().trim()));

console.log('TOTAL_ROWS', rows.length);
console.log('FOUND_COUNT', found.length);
console.log('--- ALL ROWS ---');
console.log(JSON.stringify(rows, null, 2));
console.log('--- FOUND ROWS ---');
console.log(JSON.stringify(found, null, 2));

if (found.length === 2){
  const a = found[0];
  const b = found[1];
  const etaA = toDate(a.eta || a.ETA || a.Eta);
  const etdA = toDate(a.etd || a.ETD || a.Etd);
  const etaB = toDate(b.eta || b.ETA || b.Eta);
  const etdB = toDate(b.etd || b.ETD || b.Etd);

  // spatial: use startPosition/endPosition if present, otherwise use berthName + start/end if available
  const sA = (a.startPosition || a.start || a.Start || a.startPosition_meters) || 0;
  const eA = (a.endPosition || a.end || a.End) || (a.loa ? (Number(a.start||0) + Number(a.loa)) : sA);
  const sB = (b.startPosition || b.start || b.Start) || 0;
  const eB = (b.endPosition || b.end || b.End) || (b.loa ? (Number(b.start||0) + Number(b.loa)) : sB);

  const spatialOverlap = Math.max(sA,sB) < Math.min(eA,eB);
  const sameBerth = ((a.berthName||a.Berth||a.berth||'')+'').trim() !== '' && ((a.berthName||a.Berth||a.berth||'')+'').trim() === (((b.berthName||b.Berth||b.berth||'')+'').trim());
  const timeOverlap = etaA && etdA && etaB && etdB && (Math.max(+etaA, +etaB) < Math.min(+etdA, +etdB));

  console.log('\nComputed:');
  console.log('A:', {name: a.name||a.Name, berth: a.berthName||a.Berth, start:sA, end:eA, eta:etaA, etd:etdA});
  console.log('B:', {name: b.name||b.Name, berth: b.berthName||b.Berth, start:sB, end:eB, eta:etaB, etd:etdB});
  console.log({sameBerth, spatialOverlap, timeOverlap, overlap: sameBerth && spatialOverlap && timeOverlap});
}

// Exit
process.exit(0);
