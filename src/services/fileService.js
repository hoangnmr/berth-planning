// src/services/fileService.js
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { generateFileName } from '../utils/dateHelpers';
import { toValidDate } from '../utils/dateHelpers';

/**
 * Mở file JSON kế hoạch và parse data
 * @param {Function} onSuccess - Callback khi thành công (data)
 * @param {Function} onError - Callback khi lỗi (message)
 */
export const openPlanFile = (onSuccess, onError) => {
  try {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // Validate data structure
        if (!data || typeof data !== 'object') {
          onError('File không đúng định dạng!');
          return;
        }
        
        // Convert date strings to Date objects
        const processedData = {
          berthedShips: (data.berthedShips || []).map(ship => ({
            ...ship,
            eta: toValidDate(ship.eta),
            etd: toValidDate(ship.etd)
          })),
          waitingShips: (data.waitingShips || []).map(ship => ({
            ...ship,
            eta: toValidDate(ship.eta),
            etd: toValidDate(ship.etd)
          })),
          startDate: toValidDate(data.startDate),
          numDays: data.numDays || 7,
          cranes: Array.isArray(data.cranes) ? data.cranes : []
        };
        
        onSuccess(processedData);
      } catch (err) {
        console.error('Lỗi parse JSON:', err);
        onError('File không hợp lệ!');
      }
    };
    
    input.click();
  } catch (err) {
    console.error('Lỗi mở file:', err);
    onError('Lỗi khi mở file kế hoạch!');
  }
};

/**
 * Lưu kế hoạch ra file JSON
 * @param {Object} planData - Data cần lưu {cranes, berthedShips, waitingShips, startDate, numDays}
 * @param {Function} onSuccess - Callback khi thành công
 * @param {Function} onError - Callback khi lỗi
 */
export const savePlanFile = (planData, onSuccess, onError) => {
  try {
    const json = JSON.stringify(planData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = generateFileName('berth', '.json');
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onSuccess();
    }, 100);
  } catch (err) {
    console.error('Lỗi lưu file:', err);
    onError('Lỗi khi lưu file kế hoạch!');
  }
};

/**
 * Xuất kế hoạch ra file PDF
 * @param {Function} onProgress - Callback cập nhật tiến trình
 * @param {Function} onSuccess - Callback khi thành công
 * @param {Function} onError - Callback khi lỗi (message)
 */
export const exportPlanToPDF = async (onProgress, onSuccess, onError) => {
  let pdfLayout = null;
  
  try {
    onProgress('Đang chuẩn bị file PDF...');
    await new Promise(r => setTimeout(r, 100));

    const planner = document.querySelector('.berth-planner');
    const waitingListSection = document.querySelector('.right-sidebar .control-panel > section:last-child');

    if (!planner || !waitingListSection) {
      onError('Không tìm thấy đủ các thành phần để xuất PDF!');
      return;
    }

    // Tạo container ẩn để dựng layout PDF
    pdfLayout = document.createElement('div');
    pdfLayout.id = 'pdf-layout-container';
    pdfLayout.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      z-index: -1;
      width: 1600px;
      display: flex;
      background-color: white;
    `;

    // Clone planner
    const plannerClone = planner.cloneNode(true);
    plannerClone.style.width = '1280px';
    plannerClone.style.flexShrink = '0';
    
    // Clone waiting list
    const waitingListClone = waitingListSection.cloneNode(true);
    const waitingListContainer = document.createElement('div');
    waitingListContainer.style.cssText = 'width: 320px; padding: 15px; flex-shrink: 0;';
    waitingListContainer.appendChild(waitingListClone);

    pdfLayout.appendChild(plannerClone);
    pdfLayout.appendChild(waitingListContainer);
    document.body.appendChild(pdfLayout);

    await new Promise(r => setTimeout(r, 500));

    onProgress('Đang chụp ảnh layout...');
    const canvas = await html2canvas(pdfLayout, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 0.9);

    // Xóa layout ẩn
    document.body.removeChild(pdfLayout);
    pdfLayout = null;

    onProgress('Đang tạo file PDF...');
    
    // Tạo PDF và chia trang
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const pdfWidth = 1600;
    const pdfHeight = (imgHeight * pdfWidth) / imgWidth;
    const pageHeight = 1123; // A4 landscape
    let heightLeft = pdfHeight;

    const pdf = new jsPDF({ orientation: 'l', unit: 'px', format: [pdfWidth, pageHeight] });
    let position = 0;

    // Thêm ảnh cho trang đầu tiên
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Thêm các trang tiếp theo nếu cần
    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }
    
    // Thêm copyright vào tất cả các trang
    const totalPages = pdf.internal.getNumberOfPages();
    const copyrightText = '© Nguyen Hoang & Ban Khai thac | Trung tam DHKT KV TAN THUAN';
    
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(85, 85, 85);
      const textWidth = pdf.getTextWidth(copyrightText);
      const textX = (pdfWidth - textWidth) / 2;
      const textY = pageHeight - 15;
      pdf.text(copyrightText, textX, textY);
    }
    
    pdf.save(generateFileName('berth', '.pdf'));
    onSuccess();

  } catch (err) {
    console.error('Lỗi xuất PDF:', err);
    onError('Lỗi khi xuất PDF!');
    
    // Cleanup nếu có lỗi
    if (pdfLayout && document.body.contains(pdfLayout)) {
      document.body.removeChild(pdfLayout);
    }
  }
};
