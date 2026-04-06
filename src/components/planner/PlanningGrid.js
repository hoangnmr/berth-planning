import React from 'react';
import BerthedShip from './BerthedShip';

// Cập nhật TOTAL_METERS từ 985 lên 1005 (có gap 30m giữa K12C và K12A)
const SLOT_HEIGHT = 30;
const TOTAL_METERS = 1005;
const MS_PER_SLOT = 12 * 60 * 60 * 1000;

const calculateShipStyle = (ship, startDate) => {
  const startTime = startDate.getTime();
  // Nếu thiếu eta hoặc etd thì trả về style mặc định
  if (!ship.eta || !ship.etd || typeof ship.eta.getTime !== 'function' || typeof ship.etd.getTime !== 'function') {
    return {
      ...ship.style,
      top: '0px',
      height: `${SLOT_HEIGHT}px`, // Chiều cao mặc định 1 slot
    };
  }
  const etaTime = ship.eta.getTime();
  const etdTime = ship.etd.getTime();
  const top = ((etaTime - startTime) / MS_PER_SLOT) * SLOT_HEIGHT;
  const height = ((etdTime - etaTime) / MS_PER_SLOT) * SLOT_HEIGHT;
  return {
    ...ship.style,
    top: `${top}px`,
    height: `${height}px`,
  };
};

function PlanningGrid({ days, startDate, berthedShips, highlightedShips, onShipSelect, onShipPositionChange, onShipDragEnd, selectedShipId, onRemoveShip, onMoveToWaiting, activeDayIndex, onActiveDayChange }) {

  const gridHeight = {
    height: `calc(var(--day-total-height) * ${days.length})`,
  };

  // Handler để deselect khi click vào vùng trống
  const handleGridClick = (e) => {
    // Chỉ deselect nếu click trực tiếp vào grid, không phải vào tàu
    if (e.target.classList.contains('grid-day') || 
        e.target.classList.contains('grid-day-gap') ||
        e.target.classList.contains('grid-main')) {
      onShipSelect(null);
    }
  };

  // Handler drag over để cho phép drop và highlight slot tương ứng (half-day)
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    try {
      const grid = e.currentTarget;
      const rect = grid.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const totalSlots = days.length * 2; // day + night per day
      const slotHeight = rect.height / totalSlots;
      const slotIndex = Math.floor(y / slotHeight);
      if (typeof onActiveDayChange === 'function') onActiveDayChange(slotIndex >= 0 && slotIndex < totalSlots ? slotIndex : null);
    } catch (err) {
      // ignore
    }
  };

  const handleDragLeave = (e) => {
    if (typeof onActiveDayChange === 'function') onActiveDayChange(null);
  };

  // Handler drop: lấy data tàu, xác định vị trí thả
  const handleDrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;
    const ship = JSON.parse(data);
    // Tính toán vị trí thả dựa vào tọa độ chuột
    if (typeof window.onShipDropFromWaiting === 'function') {
      window.onShipDropFromWaiting(ship, e);
    }
  };

  return (
    <div className="planning-grid-container" style={gridHeight}>
      {/* Cột Trục Y - Thời gian */}
      <div className="timeline">
        {days.map((day, idx) => {
          const daySlot = idx * 2;
          const nightSlot = idx * 2 + 1;
          const dayActive = Array.isArray(activeDayIndex) ? activeDayIndex.includes(daySlot) : activeDayIndex === daySlot;
          const nightActive = Array.isArray(activeDayIndex) ? activeDayIndex.includes(nightSlot) : activeDayIndex === nightSlot;
          const fullActive = dayActive && nightActive;
          return (
          <div key={day.date} className={`timeline-day ${fullActive ? 'day-active' : ''}`}>
            <div className="timeline-day-col">
              <div>{day.dayOfWeek}</div>
              <div style={{fontSize: '0.8rem', fontWeight: 500}}>{day.date}</div>
            </div>
            <div className="timeline-slot-col">
              <div className={`timeline-slot ${dayActive ? 'day-active' : ''}`}>NGÀY</div>
              <div className={`timeline-slot ${nightActive ? 'day-active' : ''}`}>ĐÊM</div>
            </div>
          </div>
        )})}
      </div>
      
      {/* Vùng Nước (Grid) - Với gap */}
      <div
        className="grid-main"
        style={gridHeight}
        onClick={handleGridClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => { handleDrop(e); if (typeof onActiveDayChange === 'function') onActiveDayChange(null); }}
      >
        {/* Gap 10m đầu tiên */}
        <div className="grid-column-gap grid-column-gap-10">
          {days.map((day, idx) => {
            const daySlot = idx * 2;
            const nightSlot = idx * 2 + 1;
            const dayActive = Array.isArray(activeDayIndex) ? activeDayIndex.includes(daySlot) : activeDayIndex === daySlot;
            const nightActive = Array.isArray(activeDayIndex) ? activeDayIndex.includes(nightSlot) : activeDayIndex === nightSlot;
            const className = dayActive && nightActive ? 'day-active' : (dayActive ? 'slot-day-active' : (nightActive ? 'slot-night-active' : ''));
            return <div key={`gap0-${day.date}`} className={`grid-day-gap ${className}`}></div>
          })}
        </div>
        
        {/* Khối 1: K12C */}
        <div className="grid-column grid-column-k12c">
          {days.map((day, idx) => {
            const daySlot = idx * 2;
            const nightSlot = idx * 2 + 1;
            const dayActive = Array.isArray(activeDayIndex) ? activeDayIndex.includes(daySlot) : activeDayIndex === daySlot;
            const nightActive = Array.isArray(activeDayIndex) ? activeDayIndex.includes(nightSlot) : activeDayIndex === nightSlot;
            const className = dayActive && nightActive ? 'day-active' : (dayActive ? 'slot-day-active' : (nightActive ? 'slot-night-active' : ''));
            return <div key={day.date} className={`grid-day ${className}`}></div>
          })}
        </div>
        
        {/* Gap 30m */}
        <div className="grid-column-gap grid-column-gap-30">
          {days.map((day, idx) => {
            const daySlot = idx * 2;
            const nightSlot = idx * 2 + 1;
            const dayActive = Array.isArray(activeDayIndex) ? activeDayIndex.includes(daySlot) : activeDayIndex === daySlot;
            const nightActive = Array.isArray(activeDayIndex) ? activeDayIndex.includes(nightSlot) : activeDayIndex === nightSlot;
            const className = dayActive && nightActive ? 'day-active' : (dayActive ? 'slot-day-active' : (nightActive ? 'slot-night-active' : ''));
            return <div key={`gap1-${day.date}`} className={`grid-day-gap ${className}`}></div>
          })}
        </div>
        
        {/* Khối 2: K12A, K12, K12B */}
      <div className="grid-column grid-column-k12a">
        {days.map((day, idx) => {
          const daySlot = idx * 2;
          const nightSlot = idx * 2 + 1;
          const dayActive = Array.isArray(activeDayIndex) ? activeDayIndex.includes(daySlot) : activeDayIndex === daySlot;
          const nightActive = Array.isArray(activeDayIndex) ? activeDayIndex.includes(nightSlot) : activeDayIndex === nightSlot;
          const className = dayActive && nightActive ? 'day-active' : (dayActive ? 'slot-day-active' : (nightActive ? 'slot-night-active' : ''));
          return <div key={day.date} className={`grid-day ${className}`}></div>
        })}
      </div>
      <div className="grid-column grid-column-k12">
        {days.map((day, idx) => {
          const daySlot = idx * 2;
          const nightSlot = idx * 2 + 1;
          const dayActive = Array.isArray(activeDayIndex) ? activeDayIndex.includes(daySlot) : activeDayIndex === daySlot;
          const nightActive = Array.isArray(activeDayIndex) ? activeDayIndex.includes(nightSlot) : activeDayIndex === nightSlot;
          const className = dayActive && nightActive ? 'day-active' : (dayActive ? 'slot-day-active' : (nightActive ? 'slot-night-active' : ''));
          return <div key={day.date} className={`grid-day ${className}`}></div>
        })}
      </div>
      <div className="grid-column grid-column-k12b">
        {days.map((day, idx) => {
          const daySlot = idx * 2;
          const nightSlot = idx * 2 + 1;
          const dayActive = Array.isArray(activeDayIndex) ? activeDayIndex.includes(daySlot) : activeDayIndex === daySlot;
          const nightActive = Array.isArray(activeDayIndex) ? activeDayIndex.includes(nightSlot) : activeDayIndex === nightSlot;
          const className = dayActive && nightActive ? 'day-active' : (dayActive ? 'slot-day-active' : (nightActive ? 'slot-night-active' : ''));
          return <div key={day.date} className={`grid-day ${className}`}></div>
        })}
      </div>
        
        {/* Gap 20m */}
        <div className="grid-column-gap grid-column-gap-20">
          {days.map((day, idx) => {
            const daySlot = idx * 2;
            const nightSlot = idx * 2 + 1;
            const dayActive = Array.isArray(activeDayIndex) ? activeDayIndex.includes(daySlot) : activeDayIndex === daySlot;
            const nightActive = Array.isArray(activeDayIndex) ? activeDayIndex.includes(nightSlot) : activeDayIndex === nightSlot;
            const className = dayActive && nightActive ? 'day-active' : (dayActive ? 'slot-day-active' : (nightActive ? 'slot-night-active' : ''));
            return <div key={`gap2-${day.date}`} className={`grid-day-gap ${className}`}></div>
          })}
        </div>
        
        {/* Khối 3: TT2 */}
        <div className="grid-column grid-column-tt2">
          {days.map((day, idx) => {
            const daySlot = idx * 2;
            const nightSlot = idx * 2 + 1;
            const dayActive = Array.isArray(activeDayIndex) ? activeDayIndex.includes(daySlot) : activeDayIndex === daySlot;
            const nightActive = Array.isArray(activeDayIndex) ? activeDayIndex.includes(nightSlot) : activeDayIndex === nightSlot;
            const className = dayActive && nightActive ? 'day-active' : (dayActive ? 'slot-day-active' : (nightActive ? 'slot-night-active' : ''));
            return <div key={day.date} className={`grid-day ${className}`}></div>
          })}
        </div>
        
        {/* Gap 10m cuối */}
        <div className="grid-column-gap grid-column-gap-10">
          {days.map((day, idx) => {
            const daySlot = idx * 2;
            const nightSlot = idx * 2 + 1;
            const dayActive = Array.isArray(activeDayIndex) ? activeDayIndex.includes(daySlot) : activeDayIndex === daySlot;
            const nightActive = Array.isArray(activeDayIndex) ? activeDayIndex.includes(nightSlot) : activeDayIndex === nightSlot;
            const className = dayActive && nightActive ? 'day-active' : (dayActive ? 'slot-day-active' : (nightActive ? 'slot-night-active' : ''));
            return <div key={`gap3-${day.date}`} className={`grid-day-gap ${className}`}></div>
          })}
        </div>

        {/* Vẽ Tàu */}
        {berthedShips.map(ship => {
          const shipStyle = calculateShipStyle(ship, startDate);
          return (
            <BerthedShip
              key={ship.id}
              ship={ship}
              style={shipStyle}
              highlightedShips={highlightedShips}
              onShipClick={(s) => {
                // ensure click passes latest computed style for accurate highlight fallback if ETA/ETD invalid
                const enriched = { ...s, style: shipStyle };
                onShipSelect(enriched);
              }}
              onShipPositionChange={onShipPositionChange}
              onShipDragEnd={onShipDragEnd}
              isSelected={selectedShipId === ship.id}
              allShips={berthedShips.map(s => ({
                ...s,
                style: calculateShipStyle(s, startDate)
              }))}
              onRemoveShip={onRemoveShip}
              onMoveToWaiting={onMoveToWaiting}
            />
          );
        })}
      </div>
    </div>
  );
}

export default PlanningGrid;