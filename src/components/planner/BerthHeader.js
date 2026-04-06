import React, { useState, useEffect } from 'react';
import Crane from './Crane';

function BerthHeader({ berths, cranes, activeBerth, setCranePositionsRef }) {
  
  // State để quản lý vị trí cẩu
  const [cranePositions, setCranePositions] = useState([
    // Cẩu GW (GW1-GW5): di chuyển toàn bộ K12C + gap30 + K12A + K12 + K12B
    // Tổng: 189 + 30 + 132 + 188 + 204 = 743m
    // GW1 ở 50m từ đầu K12C (tính từ 10m trong hệ tuyệt đối = 60m tuyệt đối)
    { id: 'GW1', shape: 'circle', colorClass: 'crane-color-gw', left: 'calc(50 / 743 * 100%)', block: 'gw-main', minPercent: 0, maxPercent: 100 },
    // GW2 ở 130m từ đầu K12C (tính từ 10m = 140m tuyệt đối)
    { id: 'GW2', shape: 'circle', colorClass: 'crane-color-gw', left: 'calc(130 / 743 * 100%)', block: 'gw-main', minPercent: 0, maxPercent: 100 },
    // GW3 ở 270m từ đầu K12C (189 + 30 + 51 trong K12A)
    { id: 'GW3', shape: 'circle', colorClass: 'crane-color-gw', left: 'calc(270 / 743 * 100%)', block: 'gw-main', minPercent: 0, maxPercent: 100 },
    // GW4 ở 330m từ đầu K12C (189 + 30 + 111 trong K12A)
    { id: 'GW4', shape: 'circle', colorClass: 'crane-color-gw', left: 'calc(330 / 743 * 100%)', block: 'gw-main', minPercent: 0, maxPercent: 100 },
    // GW5 ở 450m từ đầu K12C (189 + 30 + 132 + 99 trong K12)
    { id: 'GW5', shape: 'circle', colorClass: 'crane-color-gw', left: 'calc(450 / 743 * 100%)', block: 'gw-main', minPercent: 0, maxPercent: 100 },
    
    // GC1, GC2: chỉ di chuyển trong K12B
    // K12B bắt đầu từ 539m trong block 743m (189+30+132+188=539) đến 743m → 539/743 = 72.5% đến 100%
    { id: 'GC1', shape: 'square', colorClass: 'crane-color-gc', left: 'calc(590 / 743 * 100%)', block: 'gw-main', minPercent: 72.5, maxPercent: 100 },
    { id: 'GC2', shape: 'square', colorClass: 'crane-color-gc', left: 'calc(680 / 743 * 100%)', block: 'gw-main', minPercent: 72.5, maxPercent: 100 },
    
    // Khối 3: TT2 (222m)
    // LB1 ở 57m, LB40 ở 137m
    { id: 'LB1', shape: 'circle', colorClass: 'crane-color-lb', left: 'calc(57 / 222 * 100%)', block: 'tt2', minPercent: 0, maxPercent: 100 },
    { id: 'LB40', shape: 'circle', colorClass: 'crane-color-lb', left: 'calc(137 / 222 * 100%)', block: 'tt2', minPercent: 0, maxPercent: 100 },
  ]);

  useEffect(() => {
    if (typeof setCranePositionsRef === 'function') {
      setCranePositionsRef(cranePositions);
    }
  }, [cranePositions, setCranePositionsRef]);

  const handleCranePositionChange = (craneId, newLeft) => {
    setCranePositions(prevPositions => 
      prevPositions.map(crane => 
        crane.id === craneId ? { ...crane, left: newLeft } : crane
      )
    );
  };

  return (
    <div className="berth-header-container">
      {/* Ô trống góc trên bên trái */}
      <div className="timeline-spacer"></div>

      {/* Wrapper cho 2 hàng (Tên bến + Cẩu) */}
      <div className="berth-axis-row-wrapper">
        
        {/* Hàng 1: Tên bến với kích thước mới và gap */}
        <div className="berth-container">
          {/* Gap 10m đầu tiên */}
          <div className="berth-gap berth-gap-10"></div>
          
          {/* Khối 1: K12C (189m) */}
          <div className="berth-block berth-block-k12c">
            <div className={`berth ${activeBerth === 'K12C' ? 'berth-active' : ''}`} data-name="K12C">K12C (189m)</div>
          </div>
          
          {/* Gap 30m */}
          <div className="berth-gap berth-gap-30"></div>
          
          {/* Khối 2: K12A (132m) */}
          <div className="berth-block berth-block-k12a">
            <div className={`berth ${activeBerth === 'K12A' ? 'berth-active' : ''}`} data-name="K12A">K12A (132m)</div>
          </div>
          
          {/* K12 (188m) */}
          <div className="berth-block berth-block-k12">
            <div className={`berth ${activeBerth === 'K12' ? 'berth-active' : ''}`} data-name="K12">K12 (188m)</div>
          </div>
          
          {/* K12B (204m) */}
          <div className="berth-block berth-block-k12b">
            <div className={`berth ${activeBerth === 'K12B' ? 'berth-active' : ''}`} data-name="K12B">K12B (204m)</div>
          </div>
          
          {/* Gap 20m */}
          <div className="berth-gap berth-gap-20"></div>
          
          {/* Khối 3: TT2 (222m) */}
          <div className="berth-block berth-block-tt2">
             <div className={`berth ${activeBerth === 'TT2' ? 'berth-active' : ''}`} data-name="TT2">TT2 (222m)</div>
          </div>
          
          {/* Gap 10m cuối */}
          <div className="berth-gap berth-gap-10"></div>
        </div>

        {/* Hàng 2: Đường ray Cẩu */}
        <div className="crane-rail-container">
          {/* Gap 10m đầu tiên */}
          <div className="crane-rail-gap crane-rail-gap-10"></div>
          
          {/* Khối 1: K12C + Gap invisible + K12A + K12 + K12B */}
          <div className="crane-rail-block crane-rail-block-gw-main">
            {cranePositions.filter(c => c.block === 'gw-main').map(crane => (
              <Crane 
                key={crane.id} 
                id={crane.id} 
                shape={crane.shape}
                colorClass={crane.colorClass} 
                style={{ left: crane.left }}
                block={crane.block}
                minPercent={crane.minPercent}
                maxPercent={crane.maxPercent}
                onPositionChange={handleCranePositionChange}
              />
            ))}
          </div>
          
          {/* Gap 20m */}
          <div className="crane-rail-gap crane-rail-gap-20"></div>
          
          {/* Khối 3: TT2 */}
          <div className="crane-rail-block crane-rail-block-tt2">
            {cranePositions.filter(c => c.block === 'tt2').map(crane => (
              <Crane 
                key={crane.id} 
                id={crane.id} 
                shape={crane.shape}
                colorClass={crane.colorClass}
                style={{ left: crane.left }}
                block={crane.block}
                minPercent={crane.minPercent}
                maxPercent={crane.maxPercent}
                onPositionChange={handleCranePositionChange}
              />
            ))}
          </div>
          
          {/* Gap 10m cuối */}
          <div className="crane-rail-gap crane-rail-gap-10"></div>
        </div>

      </div>
    </div>
  );
}

export default BerthHeader;