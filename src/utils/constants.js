// src/utils/constants.js

// === CONSTANTS CẦU BẾN ===
export const BERTH_TOTAL_METERS = 1005;
export const SLOT_HEIGHT = 30; // px
export const MS_PER_SLOT = 12 * 60 * 60 * 1000; // 12 giờ
export const MIN_SHIP_HEIGHT = 48; // px - chiều cao tối thiểu khối tàu để hiển thị đủ info

// === BERTH REFERENCES (Vị trí bắt đầu tuyệt đối trong hệ quy chiếu 1005m) ===
export const BERTH_REFERENCES = {
  K12C: 10,
  K12A: 229,
  K12: 229, // Chung block với K12A
  K12B: 229, // Chung block với K12A
  TT2: 773,
};

// === BERTH DEFINITIONS (Chi tiết các cầu bến) ===
export const BERTH_DEFINITIONS = [
  { id: 'K12C', name: 'K12C', start: 10, end: 199, refStart: 10 },
  { id: 'K12A', name: 'K12A', start: 229, end: 361, refStart: 229 },
  { id: 'K12', name: 'K12', start: 361, end: 549, refStart: 229 },
  { id: 'K12B', name: 'K12B', start: 549, end: 753, refStart: 229 },
  { id: 'TT2', name: 'TT2', start: 773, end: 995, refStart: 773 },
];

// === BERTH GROUPS (Nhóm cầu bến có thể overlap) ===
export const BERTH_GROUPS = {
  K12C: ['K12C'],
  K12A: ['K12A', 'K12', 'K12B'],
  K12: ['K12A', 'K12', 'K12B'],
  K12B: ['K12A', 'K12', 'K12B'],
  TT2: ['TT2'],
};

// === CARGO TYPE COLORS ===
export const CARGO_COLORS = {
  Container: {
    fill: 'ship-fill-container',
    color: 'ship-color-container',
    bar: 'color-bar-container',
    cardFill: 'card-fill-container',
  },
  'Sắt thép': {
    fill: 'ship-fill-steel',
    color: 'ship-color-steel',
    bar: 'color-bar-steel',
    cardFill: 'card-fill-steel',
  },
  'Hàng khác': {
    fill: 'ship-fill-other',
    color: 'ship-color-other',
    bar: 'color-bar-other',
    cardFill: 'card-fill-other',
  },
};

// === CARGO TYPE NORMALIZATION ===
// Normalize cargoType (có thể UPPERCASE từ import) về key chuẩn trong CARGO_COLORS
export const normalizeCargoType = (cargoType) => {
  if (!cargoType) return 'Hàng khác';
  const normalized = String(cargoType).toLowerCase();
  if (normalized.includes('cont') || normalized.includes('container')) return 'Container';
  if (normalized.includes('sắt') || normalized.includes('sat') || normalized.includes('thép') || normalized.includes('thep') || normalized.includes('steel')) return 'Sắt thép';
  return 'Hàng khác';
};

// === DEFAULT VALUES ===
export const DEFAULT_NUM_DAYS = 7;
export const DEFAULT_SHIP_DURATION_MS = 24 * 60 * 60 * 1000; // 1 ngày
export const MIN_SHIP_GAP_RATIO = 0.1; // 10% LOA

// === STORAGE KEYS ===
export const STORAGE_KEY = 'berthPlannerState';
export const PASSWORD_KEY = 'plannerPassword';
export const DEFAULT_PASSWORD = 'HoangTT';
