import React, { useRef, useState, useEffect } from 'react';
import { formatNumber } from '../../utils/format';
import { formatDateTime } from '../../utils/dateHelpers';
import { BERTH_DEFINITIONS, MIN_SHIP_HEIGHT, CARGO_COLORS, normalizeCargoType } from '../../utils/constants';
import { createPortal } from "react-dom";
import { determinePrimaryBerth } from '../../utils/styleCalculators';

// Hàm helper v23.0
const getShipClasses = (cargoType) => {
  const normalizedType = normalizeCargoType(cargoType);
  const colors = CARGO_COLORS[normalizedType];
  return {
    fillClass: colors.fill,
    colorClass: colors.color
  };
};

function BerthedShip({ ship, style, highlightedShips, onShipClick, onShipPositionChange, onShipDragEnd, isSelected, allShips, onRemoveShip, onMoveToWaiting }) {
  
  const shipRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Tooltip auto-hide timer (hide after 5s of no interaction)
  const tooltipTimerRef = useRef(null);
  const TOOLTIP_TIMEOUT_MS = 5000;

  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [hasMoved, setHasMoved] = useState(false); // Track nếu thực sự đã drag
  const [hasOverlap, setHasOverlap] = useState(false); // Track nếu có chồng lấn
  const [hasGapWarning, setHasGapWarning] = useState(false); // Track cảnh báo khoảng cách LOA
  const originalShipRef = useRef(null); // Lưu toàn bộ ship data ban đầu để rollback
  
  const { fillClass, colorClass } = getShipClasses(ship.cargoType);
  
  // (SỬA LỖI) Lấy lại mandraClass
  const mandraClass = ship.mandra === 'left' ? 'mandra-left' : 'mandra-right';

  // Tính toán vị trí start và end theo hệ quy chiếu của berth
  const calculatePositions = () => {
    // If ship already has start/end (relative-to-berth), use them directly
    if (ship.start !== undefined && ship.start !== null && ship.end !== undefined && ship.end !== null && !isNaN(Number(ship.start)) && !isNaN(Number(ship.end))) {
      return { start: Number(ship.start), end: Number(ship.end) };
    }

    // Fallback: parse style.left/width if start/end not available
    if (!style || !style.left || !style.width) return { start: 0, end: 0 };
    
    // Parse left từ calc() expression
    const leftMatch = style.left.match(/calc\((-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*\*\s*100%\)/);
    const widthMatch = style.width.match(/calc\((-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*\*\s*100%\)/);
    
    if (leftMatch && widthMatch) {
      const absoluteStart = parseFloat(leftMatch[1]);
      const width = parseFloat(widthMatch[1]);
      const absoluteEnd = absoluteStart + width;
      
      // Chuyển đổi sang hệ quy chiếu của berth
      let relativeStart = 0;
      let relativeEnd = 0;
      
      // Tìm berth definition dựa trên berthName
      const berthDef = BERTH_DEFINITIONS.find(b => b.id === ship.berthName);
      if (berthDef) {
        relativeStart = absoluteStart - berthDef.refStart;
        relativeEnd = absoluteEnd - berthDef.refStart;
      }
      
      return { start: relativeStart, end: relativeEnd };
    }
    
    return { start: 0, end: 0 };
  };
  
  const { start, end } = calculatePositions();

  // Determine if ship is small (narrow or short) to trigger external info popover
  const getShipWidthMeters = () => {
    if (!style || !style.width) return 0;
    const m = style.width.match(/calc\((\d+)\s*\/\s*(\d+)\s*\*\s*100%\)/);
    return m ? parseInt(m[1]) : 0;
  };
  const widthMeters = getShipWidthMeters();
  const heightPx = style && style.height ? parseFloat(style.height) : MIN_SHIP_HEIGHT;
  // eslint-disable-next-line no-unused-vars
  const isSmallShip = widthMeters < 120 || heightPx <= MIN_SHIP_HEIGHT; // thresholds can be tuned

  // Dynamic font scaling for small ships: try to fit Details content into available ship box
  const detailsRef = useRef(null);
  const detailsContentRef = useRef(null);
  const [dynamicFontSize, setDynamicFontSize] = useState(null); // px number

  const displayName = ship.name;

  // Tooltip state & positioning for ALL ships on hover
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  const updateTooltipPosition = () => {
    const el = shipRef.current;
    if (!el) return;
    const planner = document.querySelector('.planner-container');
    const container = planner || document.body;
    const shipRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const gap = 12;
    // Try to measure tooltip width (it's already rendered when showTooltip === true)
    const tooltipEl = document.querySelector('.ship-tooltip');
    const measuredTooltipWidth = tooltipEl ? Math.round(tooltipEl.getBoundingClientRect().width) : 360;
    const tooltipWidth = measuredTooltipWidth || 360;

    // Preferred when there's space on the right: place just to the right of the ship
    const preferredLeft = shipRect.right - containerRect.left + gap;

    // Alternative when there's no space on the right: place to the left, but closer to the ship.
    // Use measured tooltip width and a small closeGap so the tooltip sits nearer the ship.
    const closeGap = 8; // smaller gap when tooltip on left to make it appear closer
    const altLeft = shipRect.left - containerRect.left - tooltipWidth - closeGap;

    const viewportWidth = window.innerWidth;
    // Use a slightly smaller overflow threshold based on measured width so we decide correctly
    const willOverflowRight = shipRect.right + tooltipWidth + gap > viewportWidth;
    const left = willOverflowRight ? Math.max(altLeft, gap) : preferredLeft;
    const top = shipRect.top - containerRect.top;
    setTooltipPos({ top, left });
  };

  useEffect(() => {
    if (!showTooltip) return;
    updateTooltipPosition();
    const handleScroll = () => updateTooltipPosition();
    const handleResize = () => updateTooltipPosition();
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [showTooltip]);

  // Xử lý drag and drop
  const handleMouseDown = (e) => {
    // Chỉ drag khi click vào thân tàu, không phải buttons
    if (e.target.tagName === 'BUTTON') return;
    
    // Lưu toàn bộ ship data ban đầu để có thể rollback
    originalShipRef.current = {
      eta: ship.eta,
      etd: ship.etd,
      berthName: ship.berthName,
      style: { ...ship.style }
    };
    
  setIsDragging(true);
  // While starting a drag, keep tooltip visible and cancel auto-hide
  try { clearTimeout(tooltipTimerRef.current); tooltipTimerRef.current = null; } catch (err) { /* ignore */ }
  // Mark global dragging ship so other ship components can suppress their tooltips
  try { window.__shipDraggingId = ship.id; } catch (err) { /* ignore */ }
  // Ensure tooltip for the dragging ship is visible to show live updates
  setShowTooltip(true);
    setHasMoved(false); // Reset hasMoved
    setHasOverlap(false); // Reset overlap
    setDragStartX(e.clientX);
    setDragStartY(e.clientY);
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none'; // Ngăn chọn text khi drag
    e.preventDefault();
    e.stopPropagation(); // Ngăn event bubble
  };

  useEffect(() => {
    if (!isDragging) return;
    // current ship height in pixels (parsed from style) available to both handlers
    const shipHeight = style && style.height ? parseFloat(style.height) : 0;

    const handleMouseMove = (e) => {
      if (!shipRef.current || !onShipPositionChange) return;
      
      // Ngăn default behavior
      e.preventDefault();

      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;

      // Kiểm tra nếu đã di chuyển đủ xa (threshold 3px)
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        setHasMoved(true);
      }

      // Lấy container width để tính phần trăm
      const gridMain = document.querySelector('.grid-main');
      if (!gridMain) return;
      
      const containerWidth = gridMain.offsetWidth;
      const containerHeight = gridMain.offsetHeight;

  // Parse giá trị hiện tại (hỗ trợ số âm)
  if (!style || !style.left || !style.width) return;
  const leftMatch = style.left.match(/calc\((-?\d+)\s*\/\s*(\d+)\s*\*\s*100%\)/);
  const topMatch = style.top ? parseFloat(style.top) : 0;
  const heightMatch = shipHeight;
  const widthMatch = style.width.match(/calc\((\d+)\s*\/\s*(\d+)\s*\*\s*100%\)/);
  if (!leftMatch || !widthMatch) return;

      const currentLeftMeters = parseInt(leftMatch[1]);
      const totalMeters = parseInt(leftMatch[2]); // 1005
      const shipWidthMeters = parseInt(widthMatch[1]);

      // Tính delta theo meters
      const deltaXPercent = (deltaX / containerWidth) * 100;
      const deltaXMeters = (deltaXPercent / 100) * totalMeters;
      
      const deltaYPixels = deltaY;

      // Vị trí mới - KHÔNG giới hạn, cho phép ló tàu
  let newLeftMeters = Math.round(currentLeftMeters + deltaXMeters);
  let newTopPixels = topMatch + deltaYPixels;

      // Chỉ giới hạn không cho ra ngoài biên trái (âm) và quá phải
      newLeftMeters = Math.max(-shipWidthMeters, Math.min(totalMeters, newLeftMeters));
      // Giới hạn theo chiều dọc để không ra ngoài container
      newTopPixels = Math.max(0, Math.min(containerHeight - heightMatch, newTopPixels));
      
      // Xác định berth chính dựa trên vị trí tàu
      const shipEnd = newLeftMeters + shipWidthMeters;
      const newBerthName = determinePrimaryBerth(newLeftMeters, shipEnd, BERTH_DEFINITIONS);

      // Tính ETA, ETD (chưa snap, snap sẽ thực hiện khi mouseUp)
      const MS_PER_SLOT = 12 * 60 * 60 * 1000;
      const SLOT_HEIGHT = 30;
      const timeOffsetMs = (newTopPixels / SLOT_HEIGHT) * MS_PER_SLOT;
      
      // Kiểm tra chồng lấn với các tàu khác
      // Kiểm tra chồng lấn và khoảng cách tối thiểu LOA
      const checkOverlapAndGap = () => {
        if (!allShips) return { overlap: false, gapWarning: false };
        const newShipStart = newLeftMeters;
        const newShipEnd = newLeftMeters + shipWidthMeters;
        const newShipTop = newTopPixels;
        const newShipBottom = newTopPixels + heightMatch;
        let gapWarning = false;
        for (let otherShip of allShips) {
          if (otherShip.id === ship.id) continue;
          let otherStart, otherWidth, otherEnd, otherTop, otherHeight, otherBottom;
          if (otherShip.style?.left && otherShip.style?.width) {
            const otherLeftMatch = otherShip.style.left.match(/calc\((-?\d+)\s*\/\s*(\d+)\s*\*\s*100%\)/);
            const otherWidthMatch = otherShip.style.width.match(/calc\((\d+)\s*\/\s*(\d+)\s*\*\s*100%\)/);
            if (!otherLeftMatch || !otherWidthMatch) continue;
            otherStart = parseInt(otherLeftMatch[1]);
            otherWidth = parseInt(otherWidthMatch[1]);
            otherEnd = otherStart + otherWidth;
          } else {
            continue;
          }
          if (otherShip.style?.top && otherShip.style?.height) {
            otherTop = parseFloat(otherShip.style.top);
            otherHeight = parseFloat(otherShip.style.height);
            otherBottom = otherTop + otherHeight;
          } else {
            continue;
          }
          // Kiểm tra overlap theo 2 chiều
          // FIXED: Chỉ báo chồng lấn khi thực sự giao nhau, không tính trường hợp chạm nhau
          const horizontalOverlap = (newShipStart < otherEnd && newShipEnd > otherStart);
          const verticalOverlap = (newShipTop < otherBottom && newShipBottom > otherTop);
          if (horizontalOverlap && verticalOverlap) {
            return { overlap: true, gapWarning: false };
          }
          // Cảnh báo chỉ khi thực sự giao nhau trên trục thời gian (overlap dọc)
          const verticalOverlapOnly = (newShipTop < otherBottom && newShipBottom > otherTop);
          const horizontalNoOverlap = (newShipEnd <= otherStart || newShipStart >= otherEnd);
          if (verticalOverlapOnly && horizontalNoOverlap) {
            // Khoảng cách giữa 2 tàu (mép phải tàu trái và mép trái tàu phải)
            const dist = Math.min(Math.abs(newShipStart - otherEnd), Math.abs(otherStart - newShipEnd));
            // Lấy LOA lớn hơn
            const loa1 = ship.loa || 0;
            const loa2 = otherShip.loa || 0;
            const minGap = 0.1 * Math.max(loa1, loa2);
            if (dist < minGap) {
              gapWarning = true;
            }
          }
        }
        return { overlap: false, gapWarning };
      };
      
  const { overlap: isOverlapping, gapWarning: isGapWarning } = checkOverlapAndGap();
      setHasOverlap(isOverlapping);
      setHasGapWarning(isGapWarning);
      // Cập nhật vị trí, thời gian và berth (chưa snap)
      onShipPositionChange(ship.id, {
        left: `calc(${newLeftMeters} / ${totalMeters} * 100%)`,
      top: `${newTopPixels}px`,
    topPx: newTopPixels,
    heightPx: heightMatch,
        timeOffset: timeOffsetMs,
        berthName: newBerthName,
        skipSnap: true, // Flag để báo đang drag, chưa snap
        hasOverlap: isOverlapping,
        hasGapWarning: isGapWarning
      });

      // Update tooltip position to follow the ship during drag. Use rAF so DOM update settles.
      try {
        requestAnimationFrame(() => {
          try { updateTooltipPosition(); } catch (err) { /* ignore */ }
        });
      } catch (err) { /* ignore if rAF not available */ }

      // Reset drag start cho lần move tiếp theo
      setDragStartX(e.clientX);
      setDragStartY(e.clientY);
    };

  const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = ''; // Reset user select
      // Clear global dragging marker
      try { if (window.__shipDraggingId === ship.id) delete window.__shipDraggingId; } catch (err) { window.__shipDraggingId = undefined; }
      
      // Nếu có chồng lấn, rollback về vị trí ban đầu
      if (hasOverlap && hasMoved && originalShipRef.current && onShipPositionChange) {
        const original = originalShipRef.current;
        
        // Rollback về vị trí ban đầu với eta/etd gốc
          onShipPositionChange(ship.id, {
              left: original.style.left,
              top: original.style.top,
              topPx: original.style?.top ? parseFloat(original.style.top) : undefined,
              heightPx: original.style?.height ? parseFloat(original.style.height) : shipHeight,
              berthName: original.berthName,
              rollbackEta: original.eta,
              rollbackEtd: original.etd,
              skipSnap: false
            });
        
        setHasOverlap(false);
        setHasMoved(false);
        originalShipRef.current = null;
        return;
      }
      
      // Reset originalShipRef
      originalShipRef.current = null;
      
      // Trigger click nếu không có drag (threshold nhỏ)
      if (!hasMoved && onShipClick) {
        onShipClick(ship);
      }
      
      // Snap vào mốc thời gian khi kết thúc drag
      if (hasMoved && onShipPositionChange) {
        // Parse vị trí hiện tại
        const topMatch = style.top ? parseFloat(style.top) : 0;
        const leftMatch = style.left.match(/calc\((-?\d+)\s*\/\s*(\d+)\s*\*\s*100%\)/);
        
        if (leftMatch) {
          const currentLeftMeters = parseInt(leftMatch[1]);
          const totalMeters = parseInt(leftMatch[2]);
          
          // SNAP vào nearest slot
          const MS_PER_SLOT = 12 * 60 * 60 * 1000;
          const SLOT_HEIGHT = 30;
          const currentSlot = topMatch / SLOT_HEIGHT;
          const snappedSlot = Math.round(currentSlot);
          const snappedTopPixels = snappedSlot * SLOT_HEIGHT;
          
          // Tính timeOffset từ vị trí snapped
          const timeOffsetMs = (snappedTopPixels / SLOT_HEIGHT) * MS_PER_SLOT;
          
          // Xác định berth
          const widthMatch = style.width.match(/calc\((\d+)\s*\/\s*(\d+)\s*\*\s*100%\)/);
          const shipWidthMeters = widthMatch ? parseInt(widthMatch[1]) : 0;
          const shipEnd = currentLeftMeters + shipWidthMeters;
          const newBerthName = determinePrimaryBerth(currentLeftMeters, shipEnd, BERTH_DEFINITIONS);
          
          // Cập nhật với vị trí snapped
          onShipPositionChange(ship.id, {
            left: `calc(${currentLeftMeters} / ${totalMeters} * 100%)`,
            top: `${snappedTopPixels}px`,
            topPx: snappedTopPixels,
            heightPx: shipHeight,
            timeOffset: timeOffsetMs,
            berthName: newBerthName,
            skipSnap: false // Đã snap xong
          });
        }
      }
      
      // Gọi callback khi kết thúc drag chỉ khi thực sự có kéo thả
      if (hasMoved && onShipDragEnd) {
        onShipDragEnd();
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartX, dragStartY, style, ship, onShipPositionChange, onShipDragEnd]);

  // Helpers to manage tooltip auto-hide
  const clearTooltipTimer = () => {
    try {
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
        tooltipTimerRef.current = null;
      }
    } catch (err) {
      tooltipTimerRef.current = null;
    }
  };

  const startTooltipTimer = () => {
    clearTooltipTimer();
    // If currently dragging this or another ship, do not start auto-hide
    if (isDragging || (typeof window !== 'undefined' && window.__shipDraggingId && window.__shipDraggingId !== ship.id)) return;
    tooltipTimerRef.current = setTimeout(() => {
      // Only hide when not dragging (or if dragging is not this ship)
      if (!(typeof window !== 'undefined' && window.__shipDraggingId && window.__shipDraggingId !== ship.id) && !isDragging) {
        setShowTooltip(false);
      }
      tooltipTimerRef.current = null;
    }, TOOLTIP_TIMEOUT_MS);
  };

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      clearTooltipTimer();
    };
  }, []);

  // Ensure global dragging flag is cleared if this component unmounts while it was the dragging ship
  useEffect(() => {
    return () => {
      try { if (window.__shipDraggingId === ship.id) delete window.__shipDraggingId; } catch (err) { window.__shipDraggingId = undefined; }
    };
  }, [ship.id]);

  // Determine font size based on LOA
  const getFontSize = () => {
    if (ship.loa <= 60) return '10px'; // Very small ships
    if (ship.loa <= 90) return '12px'; // Small ships
    if (ship.loa <= 120) return '13px'; // Medium ships
    return '15px'; // Normal size
  };
  const infoFontSize = getFontSize();

  // Recompute dynamic font-size to fit within ship details area when necessary
  useEffect(() => {
    const compute = () => {
      try {
        const detailsEl = detailsRef.current;
        const contentEl = detailsContentRef.current;
        if (!detailsEl || !contentEl) return setDynamicFontSize(null);

        // available space inside ship for text
        const availW = Math.max(4, detailsEl.clientWidth - 6); // padding safety
        const availH = Math.max(4, detailsEl.clientHeight - 4);

        // Reset content font-size to base to measure natural size
        const baseSize = parseInt(infoFontSize, 10) || 12;
        contentEl.style.fontSize = baseSize + 'px';

        // Measure content natural size
        const contentW = contentEl.scrollWidth;
        const contentH = contentEl.scrollHeight;

        // If fits, clear dynamic override
        if (contentW <= availW && contentH <= availH) {
          setDynamicFontSize(null);
          return;
        }

        // Compute scale factor and clamp
        const scaleW = availW / contentW;
        const scaleH = availH / contentH;
        const scale = Math.min(scaleW, scaleH, 1);
        const minFont = 8; // don't go below 8px
        const newSize = Math.max(minFont, Math.floor(baseSize * scale));
        setDynamicFontSize(newSize);
      } catch (err) {
        // ignore measurement errors
      }
    };

    // Run on next animation frame to ensure DOM is updated
    const raf = requestAnimationFrame(compute);
    window.addEventListener('resize', compute);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', compute);
    };
  }, [style?.width, style?.height, ship.name, ship.cargo, ship.eta, ship.etd, infoFontSize]);

  // Component Mũi Tàu (Mũi tên)
  const Bow = () => (
    <div className={`ship-bow ${colorClass}`}>
      {/* Mũi tên sẽ được vẽ bằng CSS ::before */}
    </div>
  );
  
  // Component Cabin (Đuôi tàu)
  const Cabin = () => (
    <div className={`ship-cabin ${colorClass}`}></div>
  );

  // Component Text + Nút Bấm
  const Details = () => (
    <div className="ship-details-wrapper" ref={detailsRef}>
      <div className="ship-text-content" ref={detailsContentRef} style={{ fontSize: dynamicFontSize ? `${dynamicFontSize}px` : infoFontSize }}>
        <div className="ship-details" style={{ fontSize: dynamicFontSize ? `${dynamicFontSize}px` : undefined }}>
          {displayName} | {formatNumber(ship.cargo)}
        </div>
        <div className="ship-details-sub" style={{ fontSize: dynamicFontSize ? `${Math.max(8, Math.floor(dynamicFontSize * 0.85))}px` : undefined }}>
          {formatDateTime(ship.eta)} <span style={{fontSize: '1.2em', fontWeight: 'bold'}}>→</span> {formatDateTime(ship.etd)}
        </div>
      </div>
      <div className="ship-hover-buttons">
        <button className="btn-wait" onClick={e => { e.stopPropagation(); if (onMoveToWaiting) onMoveToWaiting(ship); }}>CHỜ</button>
        <button className="btn-depart" onClick={e => { e.stopPropagation(); if (onRemoveShip) onRemoveShip(ship); }}>RỜI</button>
      </div>
    </div>
  );

  // Format dates for tooltip: dd/mm - hh:mm
  const formatTooltipDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm} - ${hh}:${min}`;
  };

  // Format duration between two dates as "x ngày x giờ"
  const formatDuration = (start, end) => {
    if (!start || !end) return '-';
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return '-';
    let diff = e.getTime() - s.getTime();
    if (diff < 0) diff = -diff; // in case ETD < ETA, show absolute
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const MS_PER_HOUR = 60 * 60 * 1000;
    const days = Math.floor(diff / MS_PER_DAY);
    const hours = Math.floor((diff % MS_PER_DAY) / MS_PER_HOUR);
    return `${days} ngày ${hours} giờ`;
  };

  return (
    <>
    <div 
      ref={shipRef}
      // Thêm class cảnh báo khoảng cách LOA nếu vi phạm
      className={`berthed-ship ${fillClass} ${mandraClass} ${isSelected ? 'ship-selected' : ''} ${hasOverlap ? 'ship-overlap' : ''} ${hasGapWarning ? 'ship-gap-warning' : ''} ${highlightedShips?.includes(ship.id) ? 'ship-highlighted' : ''}`} 
      style={{
        ...style,
        height: style && style.height ? (parseFloat(style.height) < MIN_SHIP_HEIGHT ? `${MIN_SHIP_HEIGHT}px` : style.height) : `${MIN_SHIP_HEIGHT}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => {
        // Suppress tooltips for other ships while a ship is being dragged
        if (typeof window !== 'undefined' && window.__shipDraggingId && window.__shipDraggingId !== ship.id) return;
        setShowTooltip(true);
        // start auto-hide timer
        startTooltipTimer();
      }}
      onMouseLeave={() => {
        // If this ship is the one being dragged, keep tooltip visible during drag so it can update.
        if (typeof window !== 'undefined' && window.__shipDraggingId === ship.id && isDragging) return;
        // clear any pending auto-hide and hide tooltip immediately
        clearTooltipTimer();
        setShowTooltip(false);
      }}
      onMouseMove={() => {
        // If another ship is being dragged, ignore
        if (typeof window !== 'undefined' && window.__shipDraggingId && window.__shipDraggingId !== ship.id) return;
        // user interacted (moved) while hovering -> reset auto-hide timer
        clearTooltipTimer();
        startTooltipTimer();
      }}
    >
      {/* Dùng Flexbox để xếp Mũi/Text/Cabin */}
      {ship.mandra === 'left' ? (
        <>
          <Bow />
          <Details />
          <Cabin />
          {/* Vị trí start và end */}
          <div className="ship-position ship-position-start">{start}</div>
          <div className="ship-position ship-position-end">{end}</div>
        </>
      ) : (
        <>
          <Cabin />
          <Details />
          <Bow />
          {/* Vị trí start và end */}
          <div className="ship-position ship-position-start">{start}</div>
          <div className="ship-position ship-position-end">{end}</div>
        </>
      )}
    </div>
    {showTooltip && createPortal(
      <div className="ship-tooltip" style={{ top: tooltipPos.top, left: tooltipPos.left }}>
        <div className="tooltip-row tooltip-title">M/v {ship.name}</div>
        <div className="tooltip-row"><span className="tooltip-label">DWT:</span> {ship.dwt || '-'} | <span className="tooltip-label">LOA:</span> {ship.loa || '-'}m</div>
        <div className="tooltip-row">{ship.cargoType} | {formatNumber(ship.cargo)} {ship.cargoType === 'Container' ? 'cont' : 'tấn'}</div>
  <div className="tooltip-row"><span className="tooltip-label">ETA:</span> {formatTooltipDate(ship.eta)}</div>
  <div className="tooltip-row"><span className="tooltip-label">ETD:</span> {formatTooltipDate(ship.etd)}</div>
  <div className="tooltip-row"><span className="tooltip-label">Duration:</span> {formatDuration(ship.eta, ship.etd)}</div>
  <div className="tooltip-row"><span className="tooltip-label">Bến:</span> <strong>{ship.berthName || '-'}</strong> | {start} - {end}</div>
      </div>,
      document.querySelector('.planner-container') || document.body
    )}
    </>
  );
}

export default BerthedShip;