// src/utils/dateHelpers.js

/**
 * Thêm số ngày vào một ngày
 * @param {Date} date - Ngày gốc
 * @param {number} days - Số ngày cần thêm
 * @returns {Date} Ngày mới
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Format datetime theo định dạng dd/mm | hh:mm
 * @param {Date|string|number} date - Ngày cần format
 * @returns {string} Chuỗi đã format hoặc 'N/A'
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${day}/${month} | ${hours}:${minutes}`;
};

/**
 * Chuyển đổi giá trị thành Date hợp lệ
 * @param {Date|string|number} val - Giá trị cần chuyển
 * @returns {Date|null} Date object hoặc null nếu không hợp lệ
 */
export const toValidDate = (val) => {
  if (val instanceof Date && !isNaN(val.getTime())) return val;
  if (typeof val === 'string' || typeof val === 'number') {
    const d = new Date(val);
    return !isNaN(d.getTime()) ? d : null;
  }
  return null;
};

/**
 * Tính time offset từ start date
 * @param {Date} startDate - Ngày bắt đầu
 * @param {Date} targetDate - Ngày mục tiêu
 * @returns {number} Offset tính bằng milliseconds
 */
export const calculateTimeOffset = (startDate, targetDate) => {
  return targetDate.getTime() - startDate.getTime();
};

/**
 * Format ngày cho input type="date"
 * @param {Date} date - Ngày cần format
 * @returns {string} Chuỗi yyyy-mm-dd
 */
export const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Tạo tên file với timestamp
 * @param {string} prefix - Tiền tố tên file
 * @param {string} extension - Phần mở rộng (.json, .pdf)
 * @returns {string} Tên file hoàn chỉnh
 */
export const generateFileName = (prefix, extension) => {
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const dd = pad(now.getDate());
  const mm = pad(now.getMonth() + 1);
  const yy = now.getFullYear().toString().slice(-2);
  const hh = pad(now.getHours());
  const min = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `${prefix}_${dd}_${mm}_${yy}-${hh}_${min}_${ss}${extension}`;
};
