/**
 * berthUtilization.js
 *
 * Contains the standalone calculation logic for computing berth utilization
 * (occupied milliseconds and percentage over a reporting window) per berth
 * and for a combined group (TÂN THUẬN 1 = union of K12C/K12A/K12/K12B).
 *
 * The function is intentionally pure and side-effect free: it accepts a list
 * of ship-like objects (each can have `eta`/`etd` as Date or ISO string) and
 * returns an object with per-berth occupancy intervals merged and simple
 * numeric summaries. Keep presentation (HTML/CSS) outside this module so
 * the calculation can be updated without touching rendering code.
 *
 * Usage:
 *   const util = computeBerthUtilization(list, { startDate: new Date(), numDays: 7 });
 *   // util.rows -> [{ berth: 'K12C', occupiedMs: ..., pct: ... }, ...]
 *   // util.combined -> { name: 'TÂN THUẬN 1', occupiedMs: ..., pct: ... }
 */

/**
 * Normalize a possible date value (Date object or ISO string/number) to Date or null
 * @param {Date|string|number|null|undefined} v
 * @returns {Date|null}
 */
function toDateOrNull(v) {
  if (v === null || v === undefined || v === '') return null;
  if (v instanceof Date && !isNaN(v.getTime())) return v;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Merge a sorted list of intervals [startMs, endMs] into disjoint intervals
 * @param {Array<[number, number]>} intervals
 * @returns {Array<[number, number]>}
 */
function mergeIntervals(intervals) {
  if (!intervals || intervals.length === 0) return [];
  const ints = intervals.slice().sort((a,b)=>a[0]-b[0]);
  const out = [];
  for (const it of ints) {
    if (out.length === 0) { out.push([it[0], it[1]]); continue; }
    const last = out[out.length - 1];
    if (it[0] <= last[1]) {
      // overlap -> extend
      last[1] = Math.max(last[1], it[1]);
    } else {
      out.push([it[0], it[1]]);
    }
  }
  return out;
}

/**
 * Compute berth utilization.
 *
 * @param {Array<Object>} ships - array of ship objects; each may have `berthName`, `eta`, `etd`.
 * @param {Object} opts
 * @param {Date} opts.startDate - reporting window start (Date)
 * @param {number} opts.numDays - number of days in the window
 * @param {Array<string>} [opts.order] - ordered berth names to compute and return (defaults to common K12/TT order)
 * @param {Array<string>} [opts.combinedBerths] - array of berth names to union for the combined metric (TÂN THUẬN 1)
 * @returns {Object} result { start: Date, windowEnd: Date, totalWindowMs: number, rows: Array, combined: Object }
 */
export function computeBerthUtilization(ships, opts) {
  const start = opts && opts.startDate ? toDateOrNull(opts.startDate) : new Date();
  const num = opts && typeof opts.numDays === 'number' ? opts.numDays : 7;
  const windowEnd = new Date(start.getTime() + num * 24 * 60 * 60 * 1000);
  const fixedOrderInner = (opts && Array.isArray(opts.order)) ? opts.order : ['K12C','K12A','K12','K12B','TT2'];
  const combinedBerths = (opts && Array.isArray(opts.combinedBerths)) ? opts.combinedBerths : ['K12C','K12A','K12','K12B'];
  // padding: ship effective time = [eta - PREP_TIME_MS, etd + PREP_TIME_MS]
  const PREP_TIME_MS = (opts && typeof opts.prepHours === 'number') ? opts.prepHours * 60 * 60 * 1000 : 2 * 60 * 60 * 1000; // default 2 hours
  // Xalan factor: proportion of ship-occupied time additionally occupied by xalan activities
  const XALAN_FACTOR = (opts && typeof opts.xalanFactor === 'number') ? opts.xalanFactor : 0.3;

  // Collect intervals per berth in milliseconds
  const intervalsByBerth = {};
  for (const s of (ships || [])) {
    const berth = s && s.berthName ? String(s.berthName).trim() : null;
    if (!berth) continue;
    const etaRaw = toDateOrNull(s.eta || s._eta);
    const etdRaw = toDateOrNull(s.etd || s._etd);
    if (!etaRaw || !etdRaw) continue;
    // extend by prep time (ETA - 2h, ETD + 2h) then clip to window
    const a = new Date(Math.max(start.getTime(), etaRaw.getTime() - PREP_TIME_MS));
    const b = new Date(Math.min(windowEnd.getTime(), etdRaw.getTime() + PREP_TIME_MS));
    if (a.getTime() >= b.getTime()) continue;
    if (!intervalsByBerth[berth]) intervalsByBerth[berth] = [];
    intervalsByBerth[berth].push([a.getTime(), b.getTime()]);
  }

  const totalWindowMs = windowEnd.getTime() - start.getTime();

  // compute rows
  // optional berth lengths (meters) map - default values based on planner layout
  const defaultBerthLengths = { K12C: 189, K12A: 132, K12: 188, K12B: 204, TT2: 222 };
  const berthLengths = (opts && opts.berthLengths) ? opts.berthLengths : defaultBerthLengths;

  const rows = fixedOrderInner.map(berth => {
    const ints = intervalsByBerth[berth] || [];
    const merged = mergeIntervals(ints);
    let occupiedMs = merged.reduce((sum, r) => sum + (r[1] - r[0]), 0);
    // apply xalan factor on time-based occupancy (additional time proportion)
    occupiedMs = Math.min(totalWindowMs, Math.round(occupiedMs * (1 + XALAN_FACTOR)));
    let pct = totalWindowMs > 0 ? Math.round((occupiedMs / totalWindowMs) * 100) : 0;
    if (pct > 100) pct = 100;

  // --- meter×time calculation ---
    // For accuracy we slice the time axis by all event boundaries and for each
    // slice merge the meter ranges (start/end) of ships active in that slice.
    // This prevents double-counting overlapping meter segments at the same time.
    // Collect ships for this berth that have valid start/end (meters) and time intervals
    const berthShips = (ships || []).filter(s => (s && String(s.berthName || '').trim() === String(berth)));
    // build time events within [start, windowEnd]
    const timePoints = new Set();
    berthShips.forEach(s => {
      const eta = toDateOrNull(s.eta || s._eta);
      const etd = toDateOrNull(s.etd || s._etd);
      if (!eta || !etd) return;
      const a2 = new Date(Math.max(start.getTime(), eta.getTime() - PREP_TIME_MS));
      const b2 = new Date(Math.min(windowEnd.getTime(), etd.getTime() + PREP_TIME_MS));
      if (a2 && b2 && a2.getTime() < b2.getTime()) {
        timePoints.add(a2.getTime());
        timePoints.add(b2.getTime());
      }
    });
    const times = Array.from(timePoints).sort((a,b)=>a-b);
    let occupiedMeterMs = 0;
    for (let i = 0; i < times.length - 1; i++) {
      const t0 = times[i];
      const t1 = times[i+1];
      const sliceMs = t1 - t0;
      if (sliceMs <= 0) continue;
      // active ships during slice
      const active = berthShips.filter(s => {
        const eta = toDateOrNull(s.eta || s._eta);
        const etd = toDateOrNull(s.etd || s._etd);
        if (!eta || !etd) return false;
        const a2 = new Date(Math.max(start.getTime(), eta.getTime() - PREP_TIME_MS));
        const b2 = new Date(Math.min(windowEnd.getTime(), etd.getTime() + PREP_TIME_MS));
        return a2.getTime() <= t0 && b2.getTime() >= t1;
      }).filter(s => (s.start !== undefined && s.end !== undefined && !isNaN(Number(s.start)) && !isNaN(Number(s.end))));
      if (active.length === 0) continue;
      // collect meter ranges and merge
      // merge intervals but enforce minimum gap = 0.1 * max(loa_i, loa_j) between adjacent ships
      const meterIntervalsWithLoa = active.map(s => ({ start: Number(s.start), end: Number(s.end), loa: Number(s.loa || 0) })).filter(it => it.end > it.start).sort((a,b)=>a.start-b.start);
      const mergedMeters = [];
      for (const seg of meterIntervalsWithLoa) {
        if (mergedMeters.length === 0) { mergedMeters.push([seg.start, seg.end, seg.loa]); continue; }
        const last = mergedMeters[mergedMeters.length - 1];
        const lastStart = last[0];
        const lastEnd = last[1];
        const lastLoa = last[2] || 0;
        const gap = seg.start - lastEnd;
        const requiredGap = 0.1 * Math.max(lastLoa || 0, seg.loa || 0);
        if (gap < requiredGap) {
          // merge including the small gap (treat gap as occupied dead zone)
          last[1] = Math.max(lastEnd, seg.end);
          last[2] = Math.max(lastLoa, seg.loa || 0);
        } else {
          mergedMeters.push([seg.start, seg.end, seg.loa]);
        }
      }
      // drop loa from mergedMeters for summation
      const totalMeters = mergedMeters.reduce((sum, r) => sum + (r[1] - r[0]), 0);
      occupiedMeterMs += totalMeters * sliceMs;
    }

    const berthLength = Number(berthLengths[berth] || 0);
    const totalMeterMs = berthLength * totalWindowMs; // meter * ms
    let meterPct = totalMeterMs > 0 ? Math.round((occupiedMeterMs / totalMeterMs) * 100) : 0;
    // apply xalan factor proportionally to meter×time as well
    const occupiedMeterMsWithXalan = Math.min(totalMeterMs, Math.round(occupiedMeterMs * (1 + XALAN_FACTOR)));
    meterPct = totalMeterMs > 0 ? Math.round((occupiedMeterMsWithXalan / totalMeterMs) * 100) : 0;
    if (meterPct > 100) meterPct = 100;

    return { berth, occupiedMs, pct, intervals: merged, occupiedMeterMs: occupiedMeterMsWithXalan, meterPct, berthLength };
  });

  // combined
  let combinedIntervals = [];
  for (const b of combinedBerths) {
    const ints = intervalsByBerth[b] || [];
    for (const it of ints) combinedIntervals.push([it[0], it[1]]);
  }
  combinedIntervals = mergeIntervals(combinedIntervals);
  const combinedOccupiedMs = combinedIntervals.reduce((sum, r) => sum + (r[1] - r[0]), 0);
  const combinedPct = totalWindowMs > 0 ? Math.round((combinedOccupiedMs / totalWindowMs) * 100) : 0;

  return {
    start,
    windowEnd,
    totalWindowMs,
    rows,
    combined: { name: 'TÂN THUẬN 1', occupiedMs: combinedOccupiedMs, pct: combinedPct, intervals: combinedIntervals }
  };
}

export default { computeBerthUtilization };
