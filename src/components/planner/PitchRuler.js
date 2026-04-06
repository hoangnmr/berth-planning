
import React from 'react';
import { berthData } from '../../data/mockData';

const PitchRuler = () => {
  const allPitches = [];
  const totalLength = berthData.totalLength;

  // Tính tổng chiều dài từng khối (dựa trên mockData)
  const block1Length = 189; // K12C
  const gap1Width = 30;
  const block2Length = 132 + 188 + 204; // K12A + K12 + K12B = 524
  const gap2Width = 20;
  const block3Length = 222; // TT2

  // Lấy tất cả pitch thuộc các bến
  berthData.berths.forEach(berth => {
    const berthPitches = berthData.pitches.filter(p => p.berth === berth.name);
    berthPitches.forEach(pitch => {
      const absoluteM = berth.start + pitch.m;
      
      // Xác định khối và tính vị trí % trong khối đó
      let blockId, positionInBlock, blockStart, blockLength;
      
      if (absoluteM >= 10 && absoluteM < 199) {
        // Khối 1: K12C (10-199)
        blockId = 'block1';
        positionInBlock = absoluteM - 10;
        blockStart = 10;
        blockLength = block1Length;
      } else if (absoluteM >= 229 && absoluteM < 753) {
        // Khối 2: K12A, K12, K12B (229-753)
        blockId = 'block2';
        positionInBlock = absoluteM - 229;
        blockStart = 229;
        blockLength = block2Length;
      } else if (absoluteM >= 773) {
        // Khối 3: TT2 (773-995)
        blockId = 'block3';
        positionInBlock = absoluteM - 773;
        blockStart = 773;
        blockLength = block3Length;
      }
      
      allPitches.push({ 
        ...pitch, 
        absoluteM,
        blockId,
        positionInBlock,
        blockStart,
        blockLength,
        displayId: pitch.id,
        displayLabel: pitch.label
      });
    });
  });

  // Thêm pitch độc lập B1 và B2
  berthData.pitches.forEach(pitch => {
    if (pitch.isIndependent) {
      let blockId, positionInBlock, blockStart, blockLength;
      
      if (pitch.id === 'B1') {
        // B1 nằm trong gap2 (giữa K12B và TT2)
        // K12B kết thúc ở 753, TT2 bắt đầu ở 773 → gap 20m
        blockId = 'gap2';
        positionInBlock = 0; // Đầu gap
        blockStart = 753;
        blockLength = gap2Width;
      } else if (pitch.id === 'B2') {
        // B2 nằm trong gap3 (sau TT2)
        // TT2 kết thúc ở 995, gap 10m
        blockId = 'gap3';
        positionInBlock = 5; // Giữa gap 10m
        blockStart = 995;
        blockLength = 10;
      }
      
      allPitches.push({ 
        ...pitch, 
        absoluteM: pitch.m,
        blockId,
        positionInBlock,
        blockStart,
        blockLength,
        displayId: pitch.id,
        displayLabel: pitch.label
      });
    }
  });

  return (
    <div className="pitch-ruler-wrapper">
      <div className="pitch-ruler-spacer"></div>
      <div className="pitch-ruler-container">
        
        {/* Gap 10m đầu tiên */}
        <div className="pitch-ruler-gap pitch-ruler-gap-10"></div>
        
        {/* Khối 1: K12C */}
        <div className="pitch-ruler-block pitch-ruler-block-k12c">
          {allPitches.filter(p => p.blockId === 'block1').map((pitch, index) => {
            const leftPosition = (pitch.positionInBlock / pitch.blockLength) * 100;
            return (
              <div 
                key={`${pitch.berth}-${pitch.id}-${index}`} 
                className="pitch-marker" 
                style={{ 
                  left: `${leftPosition}%`,
                  color: pitch.color || 'black'
                }}
              >
                <div className={`pitch-dot ${pitch.color === 'red' ? 'pitch-dot-red' : ''}`}></div>
                <div className="pitch-id">{pitch.displayId}</div>
                <div className="pitch-label">{pitch.displayLabel}</div>
              </div>
            );
          })}
        </div>
        
        {/* Gap 30m */}
        <div className="pitch-ruler-gap pitch-ruler-gap-30"></div>
        
        {/* Khối 2: K12A + K12 + K12B */}
        <div className="pitch-ruler-block pitch-ruler-block-main">
          {allPitches.filter(p => p.blockId === 'block2').map((pitch, index) => {
            const leftPosition = (pitch.positionInBlock / pitch.blockLength) * 100;
            return (
              <div 
                key={`${pitch.berth}-${pitch.id}-${index}`} 
                className="pitch-marker" 
                style={{ 
                  left: `${leftPosition}%`,
                  color: pitch.color || 'black'
                }}
              >
                <div className={`pitch-dot ${pitch.color === 'red' ? 'pitch-dot-red' : ''}`}></div>
                <div className="pitch-id">{pitch.displayId}</div>
                <div className="pitch-label">{pitch.displayLabel}</div>
              </div>
            );
          })}
        </div>
        
        {/* Gap 20m */}
        <div className="pitch-ruler-gap pitch-ruler-gap-20">
          {/* Pitch B1 nằm trong gap này */}
          {allPitches.filter(p => p.blockId === 'gap2').map((pitch, index) => {
            return (
              <div 
                key={`${pitch.id}-${index}`} 
                className={`pitch-marker ${pitch.color === 'red' ? 'pitch-red' : ''}`}
                style={{ 
                  left: '50%'
                }}
              >
                <div className={`pitch-dot ${pitch.color === 'red' ? 'pitch-dot-red' : ''}`}></div>
                <div className="pitch-id">{pitch.displayId}</div>
                <div className="pitch-label">{pitch.displayLabel}</div>
              </div>
            );
          })}
        </div>
        
        {/* Khối 3: TT2 */}
        <div className="pitch-ruler-block pitch-ruler-block-tt2">
          {allPitches.filter(p => p.blockId === 'block3').map((pitch, index) => {
            const leftPosition = (pitch.positionInBlock / pitch.blockLength) * 100;
            return (
              <div 
                key={`${pitch.berth || 'independent'}-${pitch.id}-${index}`} 
                className="pitch-marker" 
                style={{ 
                  left: `${leftPosition}%`,
                  color: pitch.color || 'black'
                }}
              >
                <div className={`pitch-dot ${pitch.color === 'red' ? 'pitch-dot-red' : ''}`}></div>
                <div className="pitch-id">{pitch.displayId}</div>
                <div className="pitch-label">{pitch.displayLabel}</div>
              </div>
            );
          })}
        </div>
        
        {/* Gap 10m cuối */}
        <div className="pitch-ruler-gap pitch-ruler-gap-10">
          {/* Pitch B2 nằm trong gap này */}
          {allPitches.filter(p => p.blockId === 'gap3').map((pitch, index) => {
            return (
              <div 
                key={`${pitch.id}-${index}`} 
                className={`pitch-marker ${pitch.color === 'red' ? 'pitch-red' : ''}`}
                style={{ 
                  left: '50%'
                }}
              >
                <div className={`pitch-dot ${pitch.color === 'red' ? 'pitch-dot-red' : ''}`}></div>
                <div className="pitch-id">{pitch.displayId}</div>
                <div className="pitch-label">{pitch.displayLabel}</div>
              </div>
            );
          })}
        </div>
        
      </div>
    </div>
  );
};

export default PitchRuler;