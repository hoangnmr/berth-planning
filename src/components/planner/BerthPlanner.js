import React from 'react';
import BerthHeader from './BerthHeader';
import PitchRuler from './PitchRuler';
import PlanningGrid from './PlanningGrid';
import { berthData } from '../../data/mockData';

// Hàm generateDays giữ nguyên
const generateDays = (startDate, numDays) => {
  const days = [];
  let currentDate = new Date(startDate);
  const options = { weekday: 'short' };
  
  for (let i = 0; i < numDays; i++) {
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    let dayOfWeek = new Intl.DateTimeFormat('vi-VN', options).format(currentDate);
    if (dayOfWeek.includes('Chủ')) dayOfWeek = 'CN';
    else dayOfWeek = dayOfWeek.replace('Thứ ', 'T');
    days.push({
      date: `${day}/${month}`,
      dayOfWeek: dayOfWeek,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return days;
};

function BerthPlanner({ numDays, startDate, berthedShips, highlightedShips, onShipSelect, onShipPositionChange, onShipDragEnd, activeBerth, selectedShipId, onRemoveShip, onMoveToWaiting, setCranePositionsRef, activeDayIndex, onActiveDayChange }) {
  
  const daysArray = generateDays(startDate, numDays);

  return (
    <div className="berth-planner">
      <BerthHeader 
        berths={berthData.berths} 
        activeBerth={activeBerth} 
        setCranePositionsRef={setCranePositionsRef}
      />
      <PitchRuler />
        <PlanningGrid
          days={daysArray}
          startDate={startDate}
          berthedShips={berthedShips}
          highlightedShips={highlightedShips}
          onShipSelect={onShipSelect}
          onShipPositionChange={onShipPositionChange}
          onShipDragEnd={onShipDragEnd}
          selectedShipId={selectedShipId}
          onRemoveShip={onRemoveShip}
          onMoveToWaiting={onMoveToWaiting}
          activeDayIndex={activeDayIndex}
          onActiveDayChange={onActiveDayChange}
        />
    </div>
  );
}

export default BerthPlanner;