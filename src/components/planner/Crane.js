import React, { useState, useEffect, useRef } from 'react';

function Crane({ id, shape, colorClass, style, onPositionChange, block, minPercent = 0, maxPercent = 100 }) {
  // shape: 'square' hoặc 'circle'
  // colorClass: 'crane-color-gc', 'crane-color-gw', 'crane-color-lb'
  
  const shapeClass = shape === 'square' ? 'crane-square' : 'crane-circle';
  const shortId = id.replace('C', '').replace('W', '').replace('LB', 'L');
  
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentLeft, setCurrentLeft] = useState(style?.left || '0%');
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setStartX(e.clientX);
    document.body.style.cursor = 'grabbing';
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const container = containerRef.current?.parentElement;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const deltaX = e.clientX - startX;
      
      // Parse current left percentage or calc expression
      let currentPercent = 0;
      if (typeof currentLeft === 'string') {
        if (currentLeft.includes('calc')) {
          // Parse calc expression
          const match = currentLeft.match(/calc\((\d+)\s*\/\s*(\d+)\s*\*\s*100%\)/);
          if (match) {
            currentPercent = (parseInt(match[1]) / parseInt(match[2])) * 100;
          }
        } else {
          currentPercent = parseFloat(currentLeft);
        }
      }
      
      const deltaPercent = (deltaX / rect.width) * 100;
      const newPercent = Math.max(minPercent, Math.min(maxPercent, currentPercent + deltaPercent));
      
      setCurrentLeft(`${newPercent}%`);
      setStartX(e.clientX);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.cursor = 'default';
        
        if (onPositionChange) {
          onPositionChange(id, currentLeft);
        }
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startX, currentLeft, id, onPositionChange, minPercent, maxPercent]);

  return (
    <div 
      ref={containerRef}
      className="crane-wrapper" 
      style={{ ...style, left: currentLeft, cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
    >
      {/* Cab (Phần vuông/tròn) */}
      <div className={`crane-cab ${shapeClass} ${colorClass}`}>
        {shortId}
      </div>
      {/* (Yêu cầu 1) Xóa bỏ chân cẩu */}
    </div>
  );
}

export default Crane;