const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const outDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const ws_data = [
  ['id','name','status','berthName','startPosition','endPosition','eta','etd','cargoType','cargo','dwt','loa','beam','notes','contFlag','cargoUnit'],
  ['SHIP_001','MV HANOI','WAITING','K12C',12.5,45,'2025-11-09T08:00:00','2025-11-10T18:00:00','Container','20/15',50000,180,28,'Priority client',1,'TEU'],
  ['SHIP_002','MV SAIGON','BERTHED','K12A',60,120,'2025-11-08T06:00:00','2025-11-09T16:00:00','Steel','1200',40000,165,26,'Steel import',0,'tons'],
  ['SHIP_003','MV HUE','WAITING','Chờ','','', '2025-11-11T10:00:00','2025-11-12T20:00:00','Container','35',30000,150,24,'Waiting for berth',1,'TEU'],
  ['SHIP_004','MV DANANG','WAITING','TT2',10,50,'2025-11-07T09:00:00','2025-11-08T19:00:00','Bulk','5000',20000,170,27,'Grain bulk',0,'tons'],
];

// Convert ISO strings in ETA/ETD columns to Date objects for better Excel typing
for (let r = 1; r < ws_data.length; r++) {
  const eta = ws_data[r][6];
  const etd = ws_data[r][7];
  if (eta) ws_data[r][6] = new Date(eta);
  if (etd) ws_data[r][7] = new Date(etd);
}

const ws = XLSX.utils.aoa_to_sheet(ws_data);
// Optionally set column widths
ws['!cols'] = [{wch:12},{wch:20},{wch:12},{wch:10},{wch:8},{wch:8},{wch:20},{wch:20},{wch:12},{wch:12},{wch:10},{wch:8},{wch:8},{wch:20},{wch:8},{wch:10}];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Ships');

const outPath = path.join(outDir, 'sample_ships_import.xlsx');
XLSX.writeFile(wb, outPath);
console.log('Wrote sample file to', outPath);
