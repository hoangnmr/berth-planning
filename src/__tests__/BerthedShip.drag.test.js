import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import BerthedShip from '../components/planner/BerthedShip';

// Minimal ship fixture
const ship = {
  id: 's1',
  name: 'Test Ship',
  berthName: 'K12C',
  loa: 200,
  eta: new Date(),
  etd: new Date(Date.now() + 24 * 60 * 60 * 1000),
  style: {
    left: 'calc(100 / 1005 * 100%)',
    width: 'calc(200 / 1005 * 100%)',
    top: '0px',
    height: '30px'
  }
};

describe('BerthedShip drag', () => {
  test('calls onShipPositionChange during drag', async () => {
    const onShipPositionChange = jest.fn();
    const onShipDragEnd = jest.fn();

    const { container } = render(
      <BerthedShip
        ship={ship}
        style={ship.style}
        startDate={new Date()}
        onShipClick={() => {}}
        onShipPositionChange={onShipPositionChange}
        onShipDragEnd={onShipDragEnd}
        allShips={[ship]}
      />
    );

    // Provide a fake grid container used by the component to calculate sizes
    const grid = document.createElement('div');
    grid.className = 'grid-main';
    // JSDOM doesn't compute layout; mock offsetWidth/offsetHeight
    Object.defineProperty(grid, 'offsetWidth', { value: 1000 });
    Object.defineProperty(grid, 'offsetHeight', { value: 400 });
    document.body.appendChild(grid);

    const el = container.querySelector('.berthed-ship');
    expect(el).toBeTruthy();

  // mousedown to start drag
  fireEvent.mouseDown(el, { clientX: 100, clientY: 10 });

  // Allow a tick so the component can attach document-level listeners registered in useEffect
  await new Promise(resolve => setTimeout(resolve, 0));

  // small move
  fireEvent.mouseMove(document, { clientX: 130, clientY: 20 });

  await waitFor(() => expect(onShipPositionChange).toHaveBeenCalled());

    // mouseup to end drag
    fireEvent.mouseUp(document);

    expect(onShipDragEnd).toHaveBeenCalled();
  });
});
