const { calculateShipStyle, parseStyleValue } = require('../utils/styleCalculators');
const { BERTH_REFERENCES, BERTH_TOTAL_METERS } = require('../utils/constants');
const sample = require('../../data/mau.json');

describe('Position mapping using pitch ruler', () => {
  const startDate = new Date();

  test('ships with start/end produce correct absolute left and width', () => {
    const ships = sample.berthedShips.filter(s => s.start !== undefined && s.start !== null);
    expect(ships.length).toBeGreaterThan(0);
    ships.forEach(ship => {
      const style = calculateShipStyle({ ...ship, eta: ship.eta, etd: ship.etd }, startDate);
      expect(style).not.toBeNull();
      // parse left absolute meters
      const leftMatch = String(style.left).match(/calc\((-?\d+(?:\.\d+)?)\s*\//);
      expect(leftMatch).not.toBeNull();
      const absStart = parseFloat(leftMatch[1]);
      const expectedAbs = (BERTH_REFERENCES[ship.berthName] || 0) + Number(ship.start);
      expect(Math.abs(absStart - expectedAbs)).toBeLessThan(0.0001);

      // parse width meters
      const widthMatch = String(style.width).match(/calc\((-?\d+(?:\.\d+)?)\s*\//);
      expect(widthMatch).not.toBeNull();
      const widthMeters = parseFloat(widthMatch[1]);
      const expectedWidth = (ship.end !== undefined && ship.end !== null) ? (Number(ship.end) - Number(ship.start)) : Number(ship.loa || 0);
      expect(Math.abs(widthMeters - expectedWidth)).toBeLessThan(0.0001);
    });
  });

  test('parseStyleValue extracts numeric value', () => {
    const v1 = parseStyleValue('calc(241/1005*100%)');
    expect(v1).toBeCloseTo(241);
    const v2 = parseStyleValue('123px');
    expect(v2).toBeCloseTo(123);
  });
});
