// Shared helpers for report and sorting
export function parseCargoNumber(cargo){
  if(cargo===null||cargo===undefined||cargo==='') return 0;
  const s = String(cargo).trim();
  if(!s) return 0;
  if(s.includes('/')){
    const parts = s.split('/').map(p=>{
      const n = parseFloat(p.replace(/[^0-9.-]/g,''));
      return isFinite(n)?n:0;
    });
    return parts.reduce((a,b)=>a+b,0);
  }
  const n = parseFloat(s.replace(/[^0-9.-]/g,''));
  return isFinite(n)?n:0;
}

export function parseCargoImpExp(cargo){
  if(cargo===null||cargo===undefined||cargo==='') return {imp:0,exp:0};
  const s = String(cargo).trim();
  if(s.includes('/')){
    const [a,b] = s.split('/').map(p=>{
      const n = parseFloat(p.replace(/[^0-9.-]/g,''));
      return isFinite(n)?n:0;
    });
    return {imp: a||0, exp: b||0};
  }
  const n = parseFloat(s.replace(/[^0-9.-]/g,''));
  return {imp: isFinite(n)?n:0, exp:0};
}

export function computeDurationSeconds(eta, etd){
  if(!eta || !etd) return null;
  const a = eta instanceof Date ? eta : new Date(eta);
  const b = etd instanceof Date ? etd : new Date(etd);
  if(!isFinite(a.getTime()) || !isFinite(b.getTime())) return null;
  return Math.max(0, Math.round((b.getTime() - a.getTime())/1000));
}

export function formatDurationFromSeconds(sec){
  if(sec===null||sec===undefined) return '-';
  const s = Number(sec);
  if(!isFinite(s)) return '-';
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  if(days>0) return `${days}d ${hours}h ${mins}m`;
  if(hours>0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function sortListByKey(list, key, asc = true){
  const copy = Array.isArray(list)?list.slice():[];
  const multiplier = asc?1:-1;
  copy.sort((a,b)=>{
    const av = (a[key]===undefined||a[key]===null)?(key.startsWith('_')?Number.POSITIVE_INFINITY:'') : a[key];
    const bv = (b[key]===undefined||b[key]===null)?(key.startsWith('_')?Number.POSITIVE_INFINITY:'') : b[key];
    if(typeof av === 'number' || typeof bv === 'number'){
      const na = Number(av)||0; const nb = Number(bv)||0; return (na-nb)*multiplier;
    }
    if(av instanceof Date || bv instanceof Date){
      const ta = av instanceof Date ? av.getTime() : (av?Number(av):0);
      const tb = bv instanceof Date ? bv.getTime() : (bv?Number(bv):0);
      return (ta - tb) * multiplier;
    }
    return String(av).localeCompare(String(bv)) * multiplier;
  });
  return copy;
}
