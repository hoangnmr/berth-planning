// src/services/storageService.js
import { STORAGE_KEY } from '../utils/constants';
import { toValidDate } from '../utils/dateHelpers';

/**
 * Chuyển đổi ship data để lưu vào storage (Date -> string)
 * @param {Array} ships - Danh sách tàu
 * @returns {Array} Danh sách tàu đã serialize
 */
const serializeShips = (ships) => {
  return ships.map(ship => ({
    ...ship,
    eta: ship.eta ? ship.eta.toISOString() : null,
    etd: ship.etd ? ship.etd.toISOString() : null
  }));
};

/**
 * Chuyển đổi ship data từ storage (string -> Date)
 * @param {Array} ships - Danh sách tàu
 * @returns {Array} Danh sách tàu đã deserialize
 */
const deserializeShips = (ships) => {
  return ships.map(ship => ({
    ...ship,
    eta: toValidDate(ship.eta),
    etd: toValidDate(ship.etd)
  }));
};

/**
 * Lưu state vào localStorage
 * @param {Object} state - State cần lưu {berthedShips, waitingShips, startDate, numDays, cranes}
 * @returns {boolean} true nếu thành công, false nếu thất bại
 */
export const saveToLocalStorage = (state) => {
  try {
    const dataToSave = {
      berthedShips: serializeShips(state.berthedShips || []),
      waitingShips: serializeShips(state.waitingShips || []),
      startDate: state.startDate ? state.startDate.toISOString() : null,
      numDays: state.numDays || 7,
      cranes: state.cranes || []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    return true;
  } catch (err) {
    console.error('Lỗi khi lưu localStorage:', err);
    return false;
  }
};

/**
 * Load state từ localStorage
 * @returns {Object|null} State đã load hoặc null nếu không có/lỗi
 */
export const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const data = JSON.parse(saved);
    return {
      berthedShips: deserializeShips(data.berthedShips || []),
      waitingShips: deserializeShips(data.waitingShips || []),
      startDate: toValidDate(data.startDate),
      numDays: data.numDays || 7,
      cranes: data.cranes || []
    };
  } catch (err) {
    console.error('Lỗi khi đọc localStorage:', err);
    return null;
  }
};

/**
 * Xóa state khỏi localStorage
 * @returns {boolean} true nếu thành công
 */
export const clearStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.error('Lỗi khi xóa localStorage:', err);
    return false;
  }
};

/**
 * Kiểm tra xem localStorage có data không
 * @returns {boolean} true nếu có data
 */
export const hasStoredData = () => {
  return localStorage.getItem(STORAGE_KEY) !== null;
};
