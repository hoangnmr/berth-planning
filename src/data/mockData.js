// Ngày bắt đầu (để tính toán)
// Ngày bắt đầu là ngày hôm nay
const START_DATE = new Date();

// Hàm helper
const addHours = (date, h) => {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + h);
  return newDate;
};
const addSlots = (date, slots) => addHours(date, slots * 12);

// === DỮ LIỆU CẦU BẾN ===
export const berthData = {
  totalLength: 1005, // Tổng chiều dài (10 + 189 + 30 + 132 + 188 + 204 + 20 + 222 + 10)
  berths: [
    { id: 'K12C', name: 'K12C', length: 189, start: 10 },          // Khối 1: 10-199
    // Gap 30m
    { id: 'K12A', name: 'K12A', length: 132, start: 229 },         // Khối 2: 229-361
    { id: 'K12', name: 'K12', length: 188, start: 361 },           // 361-549
    { id: 'K12B', name: 'K12B', length: 204, start: 549 },         // 549-753
    // Gap 20m
    { id: 'TT2', name: 'TT2', length: 222, start: 773 },           // Khối 3: 773-995
    // Gap 10m (cuối)
  ],
  gaps: [
    { afterBerth: null, width: 10 },    // Gap đầu tiên (trước K12C)
    { afterBerth: 'K12C', width: 30 },  // Gap giữa K12C và K12A
    { afterBerth: 'K12B', width: 20 },  // Gap giữa K12B và TT2
    { afterBerth: 'TT2', width: 10 },   // Gap sau TT2
  ],
  pitches: [
    // K12C: pitch 1-8 (vị trí tương đối trong bến, start = 0)
    { id: 1, berth: 'K12C', m: 0, label: '0' },
    { id: 2, berth: 'K12C', m: 24, label: '24' },
    { id: 3, berth: 'K12C', m: 53, label: '53' },
    { id: 4, berth: 'K12C', m: 79, label: '79' },
    { id: 5, berth: 'K12C', m: 108, label: '108' },
    { id: 6, berth: 'K12C', m: 134, label: '134' },
    { id: 7, berth: 'K12C', m: 168, label: '168' },
    { id: 8, berth: 'K12C', m: 180, label: '187' }, // Điều chỉnh từ 187 về 180 để tránh gap
    
    // K12A: pitch 1-6 (vị trí tương đối trong bến, start = 189)
    { id: 1, berth: 'K12A', m: 7, label: '7' },
    { id: 2, berth: 'K12A', m: 34, label: '34' },
    { id: 3, berth: 'K12A', m: 54, label: '54' },
    { id: 4, berth: 'K12A', m: 78, label: '78' },
    { id: 5, berth: 'K12A', m: 98, label: '98' },
    { id: 6, berth: 'K12A', m: 125, label: '125' },
    
    // K12: pitch 7-12 (vị trí tương đối trong bến, start = 341)
    // Label: số mét TỪ ĐẦU K12A (209m trong hệ mới)
    // K12A kết thúc ở 341, K12 bắt đầu ở 341
    // Label 148 = vị trí 148m từ đầu K12A = 209+148 = 357 → m = 357-341 = 16
    { id: 7, berth: 'K12', m: 16, label: '148' },     // 148m từ đầu K12A
    { id: 8, berth: 'K12', m: 41, label: '173' },     // 173m từ đầu K12A (209+173=382, 382-341=41)
    { id: 9, berth: 'K12', m: 70, label: '202' },     // 202m từ đầu K12A (209+202=411, 411-341=70)
    { id: 10, berth: 'K12', m: 100, label: '232' },   // 232m từ đầu K12A (209+232=441, 441-341=100)
    { id: 11, berth: 'K12', m: 129, label: '261' },   // 261m từ đầu K12A (209+261=470, 470-341=129)
    { id: 12, berth: 'K12', m: 159, label: '291' },   // 291m từ đầu K12A (209+291=500, 500-341=159)
    
    // K12B: pitch 13-21 (vị trí tương đối trong bến, start = 529)
    // Label: số mét TỪ ĐẦU K12A (209m trong hệ mới)
    // K12 kết thúc ở 529, K12B bắt đầu ở 529
    // Label 320 = vị trí 320m từ đầu K12A = 209+320 = 529 → m = 529-529 = 0
    { id: 13, berth: 'K12B', m: 0, label: '320' },    // 320m từ đầu K12A
    { id: 14, berth: 'K12B', m: 19, label: '339' },   // 339m từ đầu K12A (209+339=548, 548-529=19)
    { id: 15, berth: 'K12B', m: 42, label: '362' },   // 362m từ đầu K12A (209+362=571, 571-529=42)
    { id: 16, berth: 'K12B', m: 64, label: '384' },   // 384m từ đầu K12A (209+384=593, 593-529=64)
    { id: 17, berth: 'K12B', m: 87, label: '407' },   // 407m từ đầu K12A (209+407=616, 616-529=87)
    { id: 18, berth: 'K12B', m: 114, label: '434' },  // 434m từ đầu K12A (209+434=643, 643-529=114)
    { id: 19, berth: 'K12B', m: 142, label: '462' },  // 462m từ đầu K12A (209+462=671, 671-529=142)
    { id: 20, berth: 'K12B', m: 170, label: '490' },  // 490m từ đầu K12A (209+490=699, 699-529=170)
    { id: 21, berth: 'K12B', m: 195, label: '522' },  // 522m từ đầu K12A (209+522=731, 731-529=202, điều chỉnh về 195)
    
    // TT2: pitch 0-13 (vị trí tương đối trong bến, start = 713)
    { id: 0, berth: 'TT2', m: 0, label: '0' },
    { id: 1, berth: 'TT2', m: 12, label: '12' },
    { id: 2, berth: 'TT2', m: 30, label: '30' },
    { id: 3, berth: 'TT2', m: 45, label: '45' },
    { id: 4, berth: 'TT2', m: 61, label: '61' },
    { id: 5, berth: 'TT2', m: 79, label: '79' },
    { id: 6, berth: 'TT2', m: 97, label: '97' },
    { id: 7, berth: 'TT2', m: 115, label: '115' },
    { id: 8, berth: 'TT2', m: 132, label: '132' },
    { id: 9, berth: 'TT2', m: 150, label: '150' },
    { id: 10, berth: 'TT2', m: 166, label: '166' },
    { id: 11, berth: 'TT2', m: 184, label: '184' },
    { id: 12, berth: 'TT2', m: 201, label: '201' },
    { id: 13, berth: 'TT2', m: 215, label: '222' }, // Điều chỉnh từ 222 về 215 để tránh gap
    
    // Pitch độc lập B1 và B2 (màu đỏ)
    { id: 'B1', berth: null, m: 723, label: '-40', color: 'red', isIndependent: true },  // Giữa K12B (723) và TT2 (743)
    { id: 'B2', berth: null, m: 970, label: '245', color: 'red', isIndependent: true },  // Giữa gap sau TT2 (965 + 5)
  ]
};

// Dữ liệu Tàu Chờ (chưa có ETA/ETD)
export const initialWaitingShips = [
  {
    id: 'W1',
    name: 'VINALINES STAR',
    cargoType: 'Container',
    cargo: 1200,
    dwt: 22000,
    loa: 180,
    beam: 28,
    eta: '2025-11-07T08:00:00',
    etd: '2025-11-08T20:00:00',
    berth: '', // Chưa xếp lịch
    start: null,
    end: null,
    side: 'mạn trái',
  },
  {
    id: 'W2',
    name: 'HAI PHONG 36',
    cargoType: 'Sắt thép',
    cargo: 8000,
    dwt: 18000,
    loa: 155,
    beam: 24,
    eta: '2025-11-08T10:00:00',
    etd: '2025-11-09T18:00:00',
    berth: '',
    start: null,
    end: null,
    side: 'mạn phải',
  },
  {
    id: 'W3',
    name: 'VIETSHIP 01',
    cargoType: 'Hàng khác',
    cargo: 5000,
    dwt: 12000,
    loa: 120,
    beam: 19,
    eta: '2025-11-09T06:00:00',
    etd: '2025-11-10T14:00:00',
    berth: '',
    start: null,
    end: null,
    side: 'mạn trái',
  },
];

// Dữ liệu Tàu Đã Xếp Lịch (có ETA/ETD)
export const initialBerthedShips = [];