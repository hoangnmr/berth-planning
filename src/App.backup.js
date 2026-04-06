import React, { useState, useEffect, useRef } from 'react';
import Toast from './components/common/Toast';
import './App.css';
import Header from './components/layout/Header';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ControlPanel from './components/layout/ControlPanel';
import DetailPanel from './components/layout/DetailPanel'; // Import Panel mới
import BerthPlanner from './components/planner/BerthPlanner';
import { initialWaitingShips, initialBerthedShips } from './data/mockData';

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

function App() {
  // Cờ để ngăn useEffect lọc tàu khi đang khôi phục kế hoạch
  const isRestoringPlan = useRef(false);
  // Hàm mở file kế hoạch và khôi phục trạng thái
  const handleOpenPlan = async () => {
    try {
      // Tạo input file động
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const text = await file.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          setToast({ message: 'File không hợp lệ!', type: 'error' });
          return;
        }
        // Khôi phục state
        if (Array.isArray(data.cranes)) {
          cranePositionsRef.current = data.cranes;
        }
        if (Array.isArray(data.berthedShips)) {
          isRestoringPlan.current = true;
          setBerthedShips(data.berthedShips.map(ship => ({
            ...ship,
            eta: ship.eta ? new Date(ship.eta) : null,
            etd: ship.etd ? new Date(ship.etd) : null
          })));
        }
        if (Array.isArray(data.waitingShips)) {
          setWaitingShips(data.waitingShips.map(ship => ({
            ...ship,
            eta: ship.eta ? new Date(ship.eta) : null,
            etd: ship.etd ? new Date(ship.etd) : null
          })));
        }
        if (data.startDate) {
          setStartDate(new Date(data.startDate));
        }
        if (data.numDays) {
          setNumDays(data.numDays);
        }
        setToast({ message: 'Đã mở và khôi phục kế hoạch thành công!', type: 'success' });
      };
      input.click();
    } catch (err) {
      setToast({ message: 'Lỗi khi mở file kế hoạch!', type: 'error' });
    }
  };
  // Ref để lấy vị trí cẩu từ BerthHeader
  const cranePositionsRef = useRef([]);
  // Thêm tàu mới vào waiting list
  const handleAddWaitingShip = (ship) => {
    setWaitingShips(prev => [...prev, ship]);
    setToast({ message: `Đã thêm tàu ${ship.name} vào danh sách chờ.`, type: 'success' });
  };
  const [toast, setToast] = useState({ message: '', type: 'info' });
  // Xóa tàu khỏi planner (RỜI)
  const handleRemoveShip = (ship) => {
    setBerthedShips(prev => prev.filter(s => s.id !== ship.id));
    setSelectedShip(null);
    setToast({ message: `Tàu ${ship.name} đã rời cầu.`, type: 'success' });
  };

  // Chuyển tàu về waiting list (CHỜ)
  const handleMoveToWaiting = (ship) => {
    setBerthedShips(prev => prev.filter(s => s.id !== ship.id));
    setWaitingShips(prev => [...prev, {
      ...ship,
      eta: null,
      etd: null,
      berthName: null,
      mandra: null,
      style: { ...ship.style, left: undefined, top: undefined }
    }]);
    setSelectedShip(null);
    setToast({ message: `Tàu ${ship.name} đã chuyển về danh sách chờ.`, type: 'info' });
  };
  const [numDays, setNumDays] = useState(7);
  const [startDate, setStartDate] = useState(new Date('2025-11-01T00:00:00')); 
  
  const [waitingShips, setWaitingShips] = useState([]); // Khởi tạo rỗng
  const [berthedShips, setBerthedShips] = useState([]); // Khởi tạo rỗng
  const [selectedShip, setSelectedShip] = useState(null); // null = không có tàu nào được chọn
  const [activeBerth, setActiveBerth] = useState(null); // Berth đang được highlight khi drag

  // Đưa logic lọc vào hàm riêng
  const filterShipsByDate = (days) => {
    const newDays = parseInt(days, 10);
    const newEndDate = addDays(startDate, newDays);
    
    // Luôn lọc từ data gốc
    const allShips = [...initialBerthedShips, ...initialWaitingShips];
    const newBerthedList = [];
    const newWaitingList = [];

    allShips.forEach(ship => {
      // Tàu chưa có lịch
      if (!ship.eta || !ship.etd) {
        newWaitingList.push(ship);
        return;
      }
      // Tàu đã rời (trước ngày bắt đầu)
      if (ship.etd < startDate) {
        return; 
      }
      // Tàu nằm ngoài khung ngày (ví dụ TOMINI OROSHI)
      if (ship.eta >= newEndDate) {
        newWaitingList.push({...ship, eta: null, etd: null, mandra: null, berthName: null});
      } 
      // Tàu nằm trong khung ngày
      else if (ship.etd > startDate && ship.eta < newEndDate) {
        newBerthedList.push(ship);
      }
      // Trường hợp khác
      else {
        newWaitingList.push({...ship, eta: null, etd: null, mandra: null, berthName: null});
      }
    });
    setBerthedShips(newBerthedList);
    setWaitingShips(newWaitingList);
  };
  
  // Thêm useEffect để lọc tàu ngay khi tải trang
  useEffect(() => {
    if (isRestoringPlan.current) {
      isRestoringPlan.current = false;
      return;
    }
    filterShipsByDate(numDays); // Chạy lần đầu với 7 ngày
  }, []); // Mảng rỗng [] đảm bảo nó chỉ chạy 1 lần khi mount

  // Thêm useEffect để lọc lại khi startDate thay đổi
  useEffect(() => {
    if (isRestoringPlan.current) {
      isRestoringPlan.current = false;
      return;
    }
    filterShipsByDate(numDays);
  }, [startDate]); // Chạy lại khi startDate thay đổi

  // Hàm này gọi khi select thay đổi
  const handleDayChange = (newDayCount) => {
    setNumDays(newDayCount); // Cập nhật state
    filterShipsByDate(newDayCount); // Lọc lại tàu
  };

  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
    // Không cần gọi filterShipsByDate ở đây vì useEffect sẽ tự động chạy
  };

  const handleSelectShip = (ship) => {
    setSelectedShip(ship);
  };

  const handleClosePanel = () => {
    setSelectedShip(null);
  };

  const handleShipPositionChange = (shipId, newPosition) => {
    // Cập nhật activeBerth khi đang kéo
    if (newPosition.berthName) {
      setActiveBerth(newPosition.berthName);
    }
    
    setBerthedShips(prevShips => 
      prevShips.map(ship => {
        if (ship.id === shipId) {
          const updatedShip = {
            ...ship,
            style: {
              ...ship.style,
              left: newPosition.left,
            }
          };
          
          // Cập nhật berthName nếu có thay đổi
          if (newPosition.berthName) {
            updatedShip.berthName = newPosition.berthName;
          }
          
          // Nếu rollback với eta/etd gốc, khôi phục trực tiếp
          if (newPosition.rollbackEta && newPosition.rollbackEtd) {
            updatedShip.eta = newPosition.rollbackEta;
            updatedShip.etd = newPosition.rollbackEtd;
          }
          // Nếu có thay đổi thời gian, cập nhật ETA và ETD
          else if (newPosition.timeOffset !== undefined) {
            const newEta = new Date(startDate.getTime() + newPosition.timeOffset);
            const duration = ship.etd.getTime() - ship.eta.getTime();
            const newEtd = new Date(newEta.getTime() + duration);
            
            updatedShip.eta = newEta;
            updatedShip.etd = newEtd;
          }
          
          return updatedShip;
        }
        return ship;
      })
    );
    // selectedShip sẽ tự động được cập nhật qua useEffect
  };

  const handleShipDragEnd = () => {
    // Reset activeBerth khi thả chuột
    setActiveBerth(null);
  };

  // Lấy selectedShip mới nhất từ berthedShips
  const currentSelectedShip = selectedShip 
    ? berthedShips.find(s => s.id === selectedShip.id) || selectedShip
    : null;

  // Click bất kỳ đâu ngoài planner để deselect
  const handleAppClick = (event) => {
    // Chỉ deselect nếu click vào app container, không phải các phần tử con
    if (event.target.classList.contains('app') || 
        event.target.classList.contains('main-content')) {
      setSelectedShip(null);
    }
  };

  // Xử lý drop tàu từ waiting list vào grid
  useEffect(() => {
  window.onShipDropFromWaiting = (ship, event) => {
      // Xác định vị trí thả dựa vào tọa độ chuột
      // 1. Xác định cột (berth) theo vị trí X
      // 2. Xác định slot thời gian (ETA/ETD) theo vị trí Y
      // Lấy bounding rect của grid-main
      const grid = document.querySelector('.grid-main');
      if (!grid) return;
      const rect = grid.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Tính toán cột (berth)
      // Lấy width từng cột (dựa vào số cột và gap)
      // Cấu trúc: gap10 | K12C | gap30 | K12A | K12 | K12B | gap20 | TT2 | gap10
      // Tính toán vị trí các block theo px
      const totalWidth = rect.width;
      // Tỷ lệ các block (dựa vào mét):
      // gap10: 10m, K12C: 189m, gap30: 30m, K12A: 132m, K12: 188m, K12B: 204m, gap20: 20m, TT2: 222m, gap10: 10m
      const blockDefs = [
        { id: 'gap', meters: 10 },
        { id: 'K12C', meters: 189 },
        { id: 'gap', meters: 30 },
        { id: 'K12A', meters: 132 },
        { id: 'K12', meters: 188 },
        { id: 'K12B', meters: 204 },
        { id: 'gap', meters: 20 },
        { id: 'TT2', meters: 222 },
        { id: 'gap', meters: 10 },
      ];
      let px = 0;
      let berthName = null;
      for (let i = 0; i < blockDefs.length; i++) {
        const blockPx = blockDefs[i].meters / 1005 * totalWidth;
        if (x >= px && x < px + blockPx) {
          if (blockDefs[i].id !== 'gap') berthName = blockDefs[i].id;
          break;
        }
        px += blockPx;
      }
      if (!berthName) return; // Không thả vào vùng hợp lệ

      // Tính toán ETA/ETD theo vị trí Y
      // Mỗi SLOT_HEIGHT = 12h
      const slot = Math.floor(y / 30);
      const eta = new Date(startDate.getTime() + slot * 12 * 60 * 60 * 1000);
      // Giữ nguyên duration tàu (nếu có), nếu không có ETD thì mặc định ETD = ETA + 1 ngày
      let duration;
      if (ship.etd && ship.eta) {
        duration = ship.etd.getTime() - ship.eta.getTime();
      } else {
        duration = 24 * 60 * 60 * 1000; // 1 ngày
      }
      const etd = new Date(eta.getTime() + duration);

      // Tính left style (tỷ lệ mét trên tổng 1005m)
      // Lấy refStart của berth
      const berthRef = {
        'K12C': 10,
        'K12A': 229,
        'K12': 361,
        'K12B': 549,
        'TT2': 773,
      };
      const refStart = berthRef[berthName] || 10;
      // left = (refStart / 1005) * 100%
      const left = `calc(${refStart}/1005*100%)`;

      // Tính style.width dựa trên LOA
      const width = `calc(${ship.loa || 100}/1005*100%)`;
      const newShip = {
        ...ship,
        berthName,
        eta,
        etd,
        style: {
          ...ship.style,
          left,
          width,
        },
      };
      setBerthedShips(prev => [...prev, newShip]);
      setWaitingShips(prev => prev.filter(s => s.id !== ship.id));
      setSelectedShip(newShip); // Tự động chọn tàu vừa thả
      setToast({ message: `Tàu ${ship.name} đã cập cầu thành công.`, type: 'success' });
    };
    return () => { window.onShipDropFromWaiting = null; };
  }, [startDate]);

  // Handler cập nhật kế hoạch tàu từ DetailPanel
  // Kiểm tra chồng lấn và khoảng cách 10% LOA
  const checkOverlapAndGap = (ship, allShips, left, width, top, height, startDateMs) => {
    // left: calc(x/1005*100%), width: calc(w/1005*100%), top: y px, height: h px
    const leftMatch = left && left.match(/calc\((-?\d+)\s*\/\s*(\d+)\s*\*\s*100%\)/);
    const widthMatch = width && width.match(/calc\((\d+)\s*\/\s*(\d+)\s*\*\s*100%\)/);
    if (!leftMatch || !widthMatch) return { overlap: false, gapWarning: false, overlapShip: null };
    const newShipStart = parseInt(leftMatch[1]);
    const shipWidthMeters = parseInt(widthMatch[1]);
    const newShipEnd = newShipStart + shipWidthMeters;
    const newShipTop = top ? parseFloat(top) : 0;
    const newShipBottom = newShipTop + (height ? parseFloat(height) : 0);
    let gapWarning = false;
    
    // Hàm tính style cho tàu nếu chưa có
    const calculateShipStyle = (otherShip) => {
      if (!otherShip.eta || !otherShip.etd) return null;
      const slotHeight = 30;
      const msPerSlot = 12 * 60 * 60 * 1000;
      const oTop = ((otherShip.eta.getTime() - startDateMs) / msPerSlot) * slotHeight;
      const oHeight = ((otherShip.etd.getTime() - otherShip.eta.getTime()) / msPerSlot) * slotHeight;
      return { top: oTop, height: oHeight };
    };
    
    for (let otherShip of allShips) {
      if (otherShip.id === ship.id) continue;
      
      // Kiểm tra các tàu có thể chồng lấn: cùng berth hoặc các berth liền kề (K12A, K12, K12B dùng chung hệ quy chiếu)
      const berthGroups = {
        'K12C': ['K12C'],
        'K12A': ['K12A', 'K12', 'K12B'],
        'K12': ['K12A', 'K12', 'K12B'],
        'K12B': ['K12A', 'K12', 'K12B'],
        'TT2': ['TT2']
      };
      const shipGroup = berthGroups[ship.berthName] || [];
      const otherGroup = berthGroups[otherShip.berthName] || [];
      const canOverlap = shipGroup.some(b => otherGroup.includes(b));
      
      if (!canOverlap) continue;
      
      // So sánh vị trí
      const oLeftMatch = otherShip.style?.left && otherShip.style.left.match(/calc\((-?\d+)\s*\/\s*(\d+)\s*\*\s*100%\)/);
      const oWidthMatch = otherShip.style?.width && otherShip.style.width.match(/calc\((\d+)\s*\/\s*(\d+)\s*\*\s*100%\)/);
      if (!oLeftMatch || !oWidthMatch) continue;
      const otherStart = parseInt(oLeftMatch[1]);
      const otherWidth = parseInt(oWidthMatch[1]);
      const otherEnd = otherStart + otherWidth;
      
      // Tính hoặc lấy top/height của tàu khác
      let oTop, oHeight, otherBottom;
      if (otherShip.style?.top && otherShip.style?.height) {
        oTop = parseFloat(otherShip.style.top);
        oHeight = parseFloat(otherShip.style.height);
        otherBottom = oTop + oHeight;
      } else {
        const calculated = calculateShipStyle(otherShip);
        if (!calculated) continue;
        oTop = calculated.top;
        oHeight = calculated.height;
        otherBottom = oTop + oHeight;
      }
      
      // Kiểm tra overlap theo 2 chiều
      const horizontalOverlap = !(newShipEnd <= otherStart || newShipStart >= otherEnd);
      const verticalOverlap = !(newShipBottom <= oTop || newShipTop >= otherBottom);
      if (horizontalOverlap && verticalOverlap) {
        return { overlap: true, gapWarning: false, overlapShip: otherShip };
      }
      // Cảnh báo chỉ khi thực sự giao nhau trên trục thời gian (overlap dọc)
      const verticalOverlapOnly = (newShipTop < otherBottom && newShipBottom > oTop);
      const horizontalNoOverlap = (newShipEnd <= otherStart || newShipStart >= otherEnd);
      if (verticalOverlapOnly && horizontalNoOverlap) {
        // Khoảng cách giữa 2 tàu (mép phải tàu trái và mép trái tàu phải)
        const dist = Math.min(Math.abs(newShipStart - otherEnd), Math.abs(otherStart - newShipEnd));
        // Lấy LOA lớn hơn
        const loa1 = Number(ship.loa) || 0;
        const loa2 = Number(otherShip.loa) || 0;
        const minGap = 0.1 * Math.max(loa1, loa2);
        if (dist < minGap) {
          gapWarning = true;
        }
      }
    }
    return { overlap: false, gapWarning, overlapShip: null };
  };

  const handleUpdateShipPlan = (updatedShip) => {
    // Tính lại style.left, style.width, style.top, style.height dựa trên berthName, loa, eta, etd
    const berthRef = {
      'K12C': 10,
      'K12A': 229,
      'K12': 361,
      'K12B': 549,
      'TT2': 773,
    };
    const totalMeters = 1005;
    const slotHeight = 30;
    const msPerSlot = 12 * 60 * 60 * 1000;
    const startDateMs = startDate.getTime();
    const eta = updatedShip.eta ? new Date(updatedShip.eta) : null;
    const etd = updatedShip.etd ? new Date(updatedShip.etd) : null;
    const berthName = updatedShip.berthName;
    const loa = Number(updatedShip.loa);
    let left = undefined, width = undefined, top = undefined, height = undefined;
    if (berthName && loa && eta && etd) {
      const refStart = berthRef[berthName] || 10;
      left = `calc(${refStart}/1005*100%)`;
      width = `calc(${loa}/1005*100%)`;
      // Tính top, height
      const topPx = ((eta.getTime() - startDateMs) / msPerSlot) * slotHeight;
      const heightPx = ((etd.getTime() - eta.getTime()) / msPerSlot) * slotHeight;
      top = `${topPx}px`;
      height = `${heightPx}px`;
    }
    // Kiểm tra chồng lấn và 10% LOA, loại bỏ chính tàu đang cập nhật khỏi danh sách so sánh
    setBerthedShips(prev => {
      const otherShips = prev.filter(s => s.id !== updatedShip.id);
      const { overlap, gapWarning, overlapShip } = checkOverlapAndGap(
        { ...updatedShip, loa, berthName },
        otherShips,
        left,
        width,
        top,
        height,
        startDateMs
      );
      if (overlap) {
        setToast({ message: `Lỗi: Tàu ${updatedShip.name} bị chồng lấn với tàu ${overlapShip?.name || ''} tại bến ${berthName}. Vui lòng kiểm tra lại thời gian và vị trí!`, type: 'error' });
        return prev; // Không cập nhật
      }
      const updatedList = prev.map(s => s.id === updatedShip.id ? {
        ...s,
        ...updatedShip,
        eta,
        etd,
        berthName,
        loa,
        style: {
          ...s.style,
          left,
          width,
          top,
          height
        },
        gapWarning: gapWarning
      } : s);
      setToast({ message: gapWarning
        ? `Cảnh báo: Khoảng cách giữa tàu ${updatedShip.name} và tàu khác nhỏ hơn 10% LOA tàu lớn hơn! (Vẫn cho phép cập nhật)`
        : `Đã cập nhật kế hoạch cho tàu ${updatedShip.name}.`,
        type: gapWarning ? 'warning' : 'success' });
      setSelectedShip(null);
      return updatedList;
    });
  };

  return (
    <div className="app" onClick={handleAppClick}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />
      <Header 
        numDays={numDays}
        onDayChange={handleDayChange}
        startDate={startDate}
        onStartDateChange={handleStartDateChange}
        onSavePlan={async () => {
          // Lấy dữ liệu vị trí cẩu từ ref
          const cranePositions = cranePositionsRef.current || [];
          // Gom dữ liệu trạng thái
          const planData = {
            cranes: cranePositions,
            berthedShips,
            waitingShips,
            startDate,
            numDays
          };
          // Chuyển thành JSON
          const json = JSON.stringify(planData, null, 2);
          // Tải file về máy (bước sau sẽ bổ sung chọn đường dẫn)
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `berth-plan-${Date.now()}.json`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);
        }}
        onOpenPlan={handleOpenPlan}
        onExportPDF={async () => {
          try {
            setToast({ message: 'Đang chuẩn bị file PDF...', type: 'info' });
            await new Promise(r => setTimeout(r, 100));

            const planner = document.querySelector('.berth-planner');
            const waitingListSection = document.querySelector('.right-sidebar .control-panel > section:last-child');

            if (!planner || !waitingListSection) {
              setToast({ message: 'Không tìm thấy đủ các thành phần để xuất PDF!', type: 'error' });
              return;
            }

            // 1. Tạo container ẩn để dựng layout PDF
            const pdfLayout = document.createElement('div');
            pdfLayout.id = 'pdf-layout-container'; // Thêm ID để dễ dàng xóa nếu có lỗi
            pdfLayout.style.position = 'fixed';
            pdfLayout.style.top = '0';
            pdfLayout.style.left = '0';
            pdfLayout.style.zIndex = '-1';
            pdfLayout.style.width = '1600px';
            pdfLayout.style.display = 'flex';
            pdfLayout.style.backgroundColor = 'white';

            // 2. Clone và thêm planner
            const plannerClone = planner.cloneNode(true);
            plannerClone.style.width = '1280px';
            plannerClone.style.flexShrink = '0';
            
            // 3. Clone và thêm waiting list
            const waitingListClone = waitingListSection.cloneNode(true);
            const waitingListContainer = document.createElement('div');
            waitingListContainer.style.width = '320px';
            waitingListContainer.style.padding = '15px';
            waitingListContainer.style.flexShrink = '0';
            waitingListContainer.appendChild(waitingListClone);

            pdfLayout.appendChild(plannerClone);
            pdfLayout.appendChild(waitingListContainer);
            document.body.appendChild(pdfLayout);

            await new Promise(r => setTimeout(r, 500));

            // 4. Chụp ảnh layout ẩn
            const canvas = await html2canvas(pdfLayout, {
              scale: 1.5,
              useCORS: true,
              allowTaint: true,
            });
            const imgData = canvas.toDataURL('image/jpeg', 0.9);

            // 5. Xóa layout ẩn
            document.body.removeChild(pdfLayout);

            // 6. Tạo PDF và chia trang
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            // Giữ nguyên tỉ lệ ảnh, đặt chiều rộng PDF là 1600px
            const pdfWidth = 1600;
            const pdfHeight = (imgHeight * pdfWidth) / imgWidth;
            const pageHeight = 1123; // Chiều cao 1 trang A4 landscape (tương đương)
            let heightLeft = pdfHeight;

            const pdf = new jsPDF({ orientation: 'l', unit: 'px', format: [pdfWidth, pageHeight] });
            let position = 0;

            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
              position = heightLeft - pdfHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
              heightLeft -= pageHeight;
            }
            
            pdf.save(`berth-plan-multipage-${Date.now()}.pdf`);
            setToast({ message: 'Đã xuất PDF thành công!', type: 'success' });

          } catch (err) {
            console.error('Lỗi xuất PDF:', err);
            setToast({ message: 'Lỗi khi xuất PDF!', type: 'error' });
            const pdfLayout = document.querySelector('#pdf-layout-container');
            if (pdfLayout) document.body.removeChild(pdfLayout);
          }
        }}
      />
      <div className="main-content">
        <div className="planner-container">
          <BerthPlanner 
            numDays={numDays}
            startDate={startDate}
            berthedShips={berthedShips}
            onShipSelect={handleSelectShip}
            onShipPositionChange={handleShipPositionChange}
            onShipDragEnd={handleShipDragEnd}
            activeBerth={activeBerth}
            selectedShipId={selectedShip?.id}
            onRemoveShip={handleRemoveShip}
            onMoveToWaiting={handleMoveToWaiting}
            setCranePositionsRef={ref => { cranePositionsRef.current = ref; }}
          />
        </div>

        <div className="right-sidebar">
          {currentSelectedShip ? (
            <DetailPanel 
              key={currentSelectedShip.id}
              ship={currentSelectedShip} 
              onClose={handleClosePanel} 
              onUpdate={handleUpdateShipPlan}
            />
          ) : (
            <ControlPanel 
              waitingShips={waitingShips} 
              onShipSelect={handleSelectShip}
              onAddWaitingShip={handleAddWaitingShip}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;