// algorithms.js — funciones puras de planificación (scheduling)
// Cada función recibe un snapshot de procesos: {A:{name,arrival,burst}, ...}
// Devuelve un timeline[] con nombres de procesos o null para idle.

export function fcfsSchedule(procs){
  const list = Object.values(procs).sort((a,b)=>{
    if(a.arrival !== b.arrival) return a.arrival - b.arrival;
    return a.name.localeCompare(b.name);
  });
  const timeline = [];
  let time = 0;
  for(const p of list){
    if(time < p.arrival){ while(time < p.arrival){ timeline.push(null); time++; } }
    for(let i=0;i<p.burst;i++){ timeline.push(p.name); time++; }
  }
  return timeline;
}

export function sjfSchedule(procs){
  const names = Object.keys(procs).slice();
  let time = 0;
  const timeline = [];
  const completed = new Set();
  const total = names.length;
  while(completed.size < total){
    const ready = Object.values(procs).filter(p => p.arrival <= time && !completed.has(p.name));
    if(ready.length === 0){ timeline.push(null); time++; continue; }
    ready.sort((a,b)=> a.burst - b.burst || a.arrival - b.arrival || a.name.localeCompare(b.name));
    const p = ready[0]; for(let i=0;i<p.burst;i++){ timeline.push(p.name); time++; } completed.add(p.name);
  }
  return timeline;
}

export function srtfSchedule(procs){
  const rem = {};
  for(const k in procs) rem[k] = procs[k].burst;
  const totalBurst = Object.values(procs).reduce((s,p)=> s + p.burst, 0);
  const timeline = [];
  let time = 0;
  const cap = Math.max((Object.values(procs).reduce((s,p)=> Math.max(s, p.arrival + p.burst),0) + 200), totalBurst + 200);
  while(Object.values(rem).some(x=>x>0) && time < cap){
    const candidates = Object.values(procs).filter(p=> p.arrival <= time && rem[p.name] > 0);
    if(candidates.length === 0){ timeline.push(null); time++; continue; }
    candidates.sort((a,b)=> rem[a.name]-rem[b.name] || a.arrival-b.arrival || a.name.localeCompare(b.name));
    const sel = candidates[0]; timeline.push(sel.name); rem[sel.name]--; time++;
  }
  return timeline;
}

export function rrSchedule(procs, quantum=3){
  const rem = {};
  for(const k in procs) rem[k] = procs[k].burst;
  const timeline = [];
  const queue = [];
  const added = new Set();
  let time = 0;
  while(Object.values(rem).some(x=>x>0)){
    for(const k in procs) if(procs[k].arrival <= time && !added.has(k) && rem[k] > 0){ queue.push(k); added.add(k); }
    if(queue.length === 0){ timeline.push(null); time++; continue; }
    const cur = queue.shift(); const q = Math.max(1, Math.floor(quantum)); const exec = Math.min(q, rem[cur]);
    for(let i=0;i<exec;i++){ timeline.push(cur); time++; rem[cur]--; for(const k in procs) if(procs[k].arrival <= time && !added.has(k) && rem[k] > 0){ queue.push(k); added.add(k); } }
    if(rem[cur] > 0) queue.push(cur);
  }
  return timeline;
}