// utils/format.js
// Hàm format số có dấu . phân cách phần ngàn
export function formatNumber(num) {
  if (typeof num !== 'number' && typeof num !== 'string') return num;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
