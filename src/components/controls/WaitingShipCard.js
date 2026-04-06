import React from 'react';
import { formatNumber } from '../../utils/format';
import { formatDateTime } from '../../utils/dateHelpers';
import { CARGO_COLORS, normalizeCargoType } from '../../utils/constants';

// Hàm helper để lấy lớp CSS màu
const getColorClasses = (cargoType) => {
  const normalizedType = normalizeCargoType(cargoType);
  const colors = CARGO_COLORS[normalizedType];
  return { 
    bar: colors.bar,
    fill: colors.cardFill 
  };
};

function WaitingShipCard({ ship, index, highlightedShips = [], onShipSelect, onDock, onDelete }) {
  const { bar: barClass, fill: fillClass } = getColorClasses(ship.cargoType);

  // Handler drag
  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/json', JSON.stringify(ship));
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragEnd = (e) => {
    // Có thể thêm hiệu ứng nếu cần
  };

  const handleDockClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDock) onDock(ship);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(ship);
  };

  return (
    <div
      className={`waiting-ship-card ${highlightedShips?.includes(ship.id) ? 'ship-highlighted' : ''}`}
      onClick={() => onShipSelect(ship)}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Dải màu */}
      <div className={`card-color-bar ${barClass}`}></div>

      {/* Nội dung chính */}
      <div className={`card-main-content ${fillClass}`}>
        <div className="card-index">
          {index + 1}.
        </div>
        <div className="card-content">
          <div className="card-header">
            {ship.name}
          </div>
          <div className="card-body">
            <strong>{ship.cargoType}</strong> | <strong>{formatNumber(ship.cargo)} {ship.cargoType === 'Container' ? 'TEUs' : 'tấn'}</strong>
          </div>
          {(() => {
            const startVal = ship.start !== undefined ? ship.start : ship.startPosition;
            const endVal = ship.end !== undefined ? ship.end : ship.endPosition;
            const hasStartEnd = startVal !== undefined && endVal !== undefined;
            if (!ship.berthName && !hasStartEnd) return null;
            return (
              <div className="card-berth-info">
                {ship.berthName || '—'}{hasStartEnd ? ` | ${Math.round(startVal)} - ${Math.round(endVal)}` : ''}
              </div>
            );
          })()}
          <div className="card-footer">
            {formatDateTime(ship.eta)} <span style={{fontSize: '1.2em', fontWeight: 'bold'}}>→</span> {formatDateTime(ship.etd)}
          </div>
        </div>
      </div>

      {/* Buttons on the right edge */}
      <div className="card-action-buttons">
        <button 
          className="card-btn card-btn-dock"
          onClick={handleDockClick}
          title="Cập cầu"
        >
          {/* Anchor icon (mỏ neo) - clean and professional */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v6" />
            <path d="M5 12a7 7 0 0 0 14 0" />
            <path d="M7.5 19.5a6 6 0 0 0 9 0" />
            <line x1="12" y1="12" x2="12" y2="21" />
          </svg>
        </button>
        <button 
          className="card-btn card-btn-delete"
          onClick={handleDeleteClick}
          title="Xóa khỏi danh sách chờ"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default WaitingShipCard;