// src/utils/styleCalculators.js
import { 
  BERTH_TOTAL_METERS, 
  SLOT_HEIGHT, 
  MS_PER_SLOT, 
  BERTH_REFERENCES,
  BERTH_GROUPS,
  MIN_SHIP_GAP_RATIO
} from './constants';

/**
 * Tính toán style cho ship dựa trên vị trí và thời gian
 * @param {Object} ship - Thông tin tàu
 * @param {Date} startDate - Ngày bắt đầu planning
 * @returns {Object} Style object {left, width, top, height}
 */
export const calculateShipStyle = (ship, startDate) => {
  const { berthName, loa, eta, etd } = ship;
  
  if (!berthName || !loa || !eta || !etd) {
    return null;
  }

  // Convert eta and etd to Date objects if they're not already
  const etaDate = eta instanceof Date ? eta : new Date(eta);
  const etdDate = etd instanceof Date ? etd : new Date(etd);
  
  // Validate dates
  if (isNaN(etaDate.getTime()) || isNaN(etdDate.getTime())) {
    return null;
  }

  const refStart = BERTH_REFERENCES[berthName] || BERTH_REFERENCES.K12C;
  const startDateMs = startDate.getTime();
  
  // Calculate position
  // Prefer using ship.start and ship.end (relative-to-berth metres) as source of truth
  let absStart = refStart;
  let widthMeters = Number(loa) || 0;
  if (ship.start !== undefined && ship.start !== null && !isNaN(Number(ship.start))) {
    const s = Number(ship.start);
    // if end provided, use it; otherwise derive from LOA
    const e = (ship.end !== undefined && ship.end !== null && !isNaN(Number(ship.end))) ? Number(ship.end) : (s + (Number(loa) || 0));
    absStart = refStart + s;
    widthMeters = e - s;
  }
  const left = `calc(${absStart}/${BERTH_TOTAL_METERS}*100%)`;
  const width = `calc(${widthMeters}/${BERTH_TOTAL_METERS}*100%)`;
  
  // Calculate time-based position
  const topPx = ((etaDate.getTime() - startDateMs) / MS_PER_SLOT) * SLOT_HEIGHT;
  const heightPx = ((etdDate.getTime() - etaDate.getTime()) / MS_PER_SLOT) * SLOT_HEIGHT;
  
  return {
    left,
    width,
    top: `${topPx}px`,
    height: `${heightPx}px`
  };
};

/**
 * Parse style string để lấy giá trị số
 * @param {string} styleStr - Style string (calc(x/y*100%) hoặc xpx)
 * @returns {number|null} Giá trị số hoặc null
 */
export const parseStyleValue = (styleStr) => {
  if (!styleStr) return null;
  
  // Parse calc(x/y*100%)
  const calcMatch = styleStr.match(/calc\((-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*\*\s*100%\)/);
  if (calcMatch) {
    return parseFloat(calcMatch[1]);
  }
  
  // Parse xpx
  const pxMatch = styleStr.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (pxMatch) {
    return parseFloat(pxMatch[1]);
  }
  
  return null;
};

/**
 * Tính toán vị trí và kích thước tàu từ style object
 * @param {Object} ship - Thông tin tàu
 * @param {Date} startDate - Ngày bắt đầu planning
 * @returns {Object} {start, end, top, bottom} hoặc null
 */
const getShipBounds = (ship, startDate) => {
  let left, width, top, height;
  
  // Nếu ship có style, dùng style
  if (ship.style) {
    left = parseStyleValue(ship.style.left);
    width = parseStyleValue(ship.style.width);
    top = parseStyleValue(ship.style.top);
    height = parseStyleValue(ship.style.height);
  }
  
  // Nếu không có style hoặc thiếu thông tin, tính từ eta/etd
  if ((left === null || width === null || top === null || height === null) && ship.eta && ship.etd) {
    const style = calculateShipStyle(ship, startDate);
    if (!style) return null;
    
    left = left ?? parseStyleValue(style.left);
    width = width ?? parseStyleValue(style.width);
    top = top ?? parseStyleValue(style.top);
    height = height ?? parseStyleValue(style.height);
  }
  
  if (left === null || width === null || top === null || height === null) {
    return null;
  }
  
  return {
    start: left,
    end: left + width,
    top: top,
    bottom: top + height
  };
};

/**
 * Kiểm tra overlap và khoảng cách giữa các tàu
 * @param {Object} ship - Tàu đang kiểm tra
 * @param {Array} allShips - Danh sách tất cả tàu
 * @param {Date} startDate - Ngày bắt đầu planning
 * @returns {Object} {overlap: boolean, gapWarning: boolean, overlapShip: Object|null}
 */
export const checkOverlapAndGap = (ship, allShips, startDate) => {
  const shipBounds = getShipBounds(ship, startDate);
  if (!shipBounds) {
    return { overlap: false, gapWarning: false, overlapShip: null };
  }
  
  const { start: newStart, end: newEnd, top: newTop, bottom: newBottom } = shipBounds;
  let gapWarning = false;
  
  // Lấy nhóm berth của tàu đang kiểm tra
  const shipGroup = BERTH_GROUPS[ship.berthName] || [];
  
  for (const otherShip of allShips) {
    if (otherShip.id === ship.id) continue;
    
    // Chỉ kiểm tra với các tàu cùng nhóm berth
    const otherGroup = BERTH_GROUPS[otherShip.berthName] || [];
    const canOverlap = shipGroup.some(b => otherGroup.includes(b));
    if (!canOverlap) continue;
    
    const otherBounds = getShipBounds(otherShip, startDate);
    if (!otherBounds) continue;
    
    const { start: otherStart, end: otherEnd, top: otherTop, bottom: otherBottom } = otherBounds;
    
    // Kiểm tra overlap theo 2 chiều
    // FIXED: Chỉ báo chồng lấn khi thực sự giao nhau, không tính trường hợp chạm nhau
    const horizontalOverlap = (newStart < otherEnd && newEnd > otherStart);
    const verticalOverlap = (newTop < otherBottom && newBottom > otherTop);
    
    if (horizontalOverlap && verticalOverlap) {
      return { overlap: true, gapWarning: false, overlapShip: otherShip };
    }
    
    // Kiểm tra khoảng cách 10% LOA (chỉ khi overlap theo thời gian)
    if (verticalOverlap && !horizontalOverlap) {
      const dist = Math.min(Math.abs(newStart - otherEnd), Math.abs(otherStart - newEnd));
      const loa1 = Number(ship.loa) || 0;
      const loa2 = Number(otherShip.loa) || 0;
      const minGap = MIN_SHIP_GAP_RATIO * Math.max(loa1, loa2);
      
      if (dist < minGap) {
        gapWarning = true;
      }
    }
  }
  
  return { overlap: false, gapWarning, overlapShip: null };
};

/**
 * Xác định berth chính dựa trên vị trí tàu (phần nào nhiều nhất)
 * @param {number} shipStart - Vị trí bắt đầu tàu
 * @param {number} shipEnd - Vị trí kết thúc tàu
 * @param {Array} berthDefinitions - Danh sách định nghĩa berth
 * @returns {string} ID của berth chính
 */
export const determinePrimaryBerth = (shipStart, shipEnd, berthDefinitions) => {
  let maxOverlap = 0;
  let primaryBerth = null;

  berthDefinitions.forEach(berth => {
    const overlapStart = Math.max(shipStart, berth.start);
    const overlapEnd = Math.min(shipEnd, berth.end);
    const overlap = Math.max(0, overlapEnd - overlapStart);

    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      primaryBerth = berth.id;
    }
  });

  return primaryBerth || 'K12C';
};

/**
 * Backward-compatible helper: calculate style from ship that may have start/end as strings
 */
export const calculateShipStyleFromPosition = (ship, startDate) => {
  if (!ship) return null;
  const copy = { ...ship };
  if (copy.start !== undefined && copy.start !== null && typeof copy.start === 'string') copy.start = Number(copy.start);
  if (copy.end !== undefined && copy.end !== null && typeof copy.end === 'string') copy.end = Number(copy.end);
  return calculateShipStyle(copy, startDate);
};
