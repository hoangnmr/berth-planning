import React from 'react';
import WaitingShipCard from '../controls/WaitingShipCard';

// File ControlPanel CHỈ chứa Tạo tàu và Tàu chờ
function ControlPanel({ waitingShips, onShipSelect, onAddWaitingShip, onDockShip, onDeleteWaitingShip, highlightedShips = [] }) { 
  return (
    <div className="panel control-panel">
      {/* === Module Tạo Tàu Mới === */}
      <section>
        <h2>Tạo Tàu Mới</h2>
        <div className="form-container">
          <div className="form-row">
            <div className="form-group">
              <label>Tên tàu</label>
              <input type="text" />
            </div>
            <div className="form-group">
              <label>IMO</label>
              <input type="text" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>DWT</label>
              <input type="number" />
            </div>
            <div className="form-group">
              <label>LOA (m)</label>
              <input type="number" />
            </div>
            <div className="form-group">
              <label>BEAM (m)</label>
              <input type="number" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Loại hàng</label>
              <select>
                <option>Sắt thép</option>
                <option>Container</option>
                <option>Hàng khác</option>
              </select>
            </div>
            <div className="form-group">
              <label>Số lượng</label>
              <input type="text" />
            </div>
          </div>
          <button className="btn-primary" onClick={() => {
            // Lấy giá trị từ form
            const form = document.querySelector('.form-container');
            const name = form.querySelector('input[type="text"]')?.value || '';
            const imo = form.querySelectorAll('input[type="text"]')[1]?.value || '';
            let dwt = Number(form.querySelector('input[type="number"]')?.value);
            if (!dwt) dwt = 1000;
            let loa = Number(form.querySelectorAll('input[type="number"]')[1]?.value);
            let beam = Number(form.querySelectorAll('input[type="number"]')[2]?.value);
            if (!loa) loa = 100;
            if (!beam) beam = 20;
            const cargoType = form.querySelector('select')?.value || '';
            const cargo = form.querySelectorAll('input[type="text"]')[3]?.value || '';
            if (!name) return;
            const newShip = {
              id: 'W' + Date.now(),
              name,
              imo,
              dwt,
              loa,
              beam,
              cargoType,
              cargo,
            };
            if (onAddWaitingShip) onAddWaitingShip(newShip);
            // Reset các input/select trong form
            form.querySelectorAll('input').forEach(input => input.value = '');
            form.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
          }}>Thêm vào tàu chờ</button>
        </div>
      </section>

      {/* === Module Tàu Chờ Cầu (Dạng Card) === */}
      <section>
        <h2>Tàu Đang Chờ Cầu ({waitingShips.length})</h2>
        <div className="waiting-list-container">
          {[...waitingShips]
            .sort((a, b) => {
              const aEta = a.eta ? new Date(a.eta).getTime() : Infinity;
              const bEta = b.eta ? new Date(b.eta).getTime() : Infinity;
              return aEta - bEta;
            })
            .map((ship, index) => (
              <WaitingShipCard 
                key={ship.id} 
                ship={ship} 
                index={index}
                highlightedShips={highlightedShips}
                onShipSelect={onShipSelect}
                onDock={onDockShip}
                onDelete={onDeleteWaitingShip}
              />
            ))}
        </div>
      </section>
    </div>
  );
}

export default ControlPanel;