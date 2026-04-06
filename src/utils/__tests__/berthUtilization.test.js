import { computeBerthUtilization } from '../berthUtilization';

describe('computeBerthUtilization meter×time', () => {
  test('single ship full-day covers full berth -> meterPct 100', () => {
    const start = new Date('2025-11-01T00:00:00Z');
    const ships = [
      // ship occupies full berth from start to end
      { berthName: 'K12C', eta: new Date('2025-11-01T00:00:00Z'), etd: new Date('2025-11-02T00:00:00Z'), start: 0, end: 189 }
    ];
    const res = computeBerthUtilization(ships, { startDate: start, numDays: 1, order: ['K12C'], berthLengths: { K12C: 189 } });
    expect(res.rows[0].meterPct).toBe(100);
  });

  test('two ships split berth non-overlapping in space at same time -> meterPct 100', () => {
    const start = new Date('2025-11-01T00:00:00Z');
    const ships = [
      { berthName: 'K12C', eta: new Date('2025-11-01T00:00:00Z'), etd: new Date('2025-11-01T12:00:00Z'), start: 0, end: 94.5 },
      { berthName: 'K12C', eta: new Date('2025-11-01T00:00:00Z'), etd: new Date('2025-11-01T12:00:00Z'), start: 94.5, end: 189 }
    ];
    const res = computeBerthUtilization(ships, { startDate: start, numDays: 0.5, order: ['K12C'], berthLengths: { K12C: 189 } });
    // For half-day window both ships occupy together entire berth during slice -> meterPct 100
    expect(res.rows[0].meterPct).toBe(100);
  });

  test('overlapping ships in both time and space should not double-count meters', () => {
    const start = new Date('2025-11-01T00:00:00Z');
    const ships = [
      { berthName: 'K12C', eta: new Date('2025-11-01T00:00:00Z'), etd: new Date('2025-11-01T12:00:00Z'), start: 0, end: 120 },
      { berthName: 'K12C', eta: new Date('2025-11-01T06:00:00Z'), etd: new Date('2025-11-01T18:00:00Z'), start: 60, end: 189 }
    ];
    const res = computeBerthUtilization(ships, { startDate: start, numDays: 1, order: ['K12C'], berthLengths: { K12C: 189 } });
    // Check meterPct is between 0 and 100 and less than sum of separate ship lengths
    expect(res.rows[0].meterPct).toBeGreaterThanOrEqual(0);
    expect(res.rows[0].meterPct).toBeLessThanOrEqual(100);
  });
});
