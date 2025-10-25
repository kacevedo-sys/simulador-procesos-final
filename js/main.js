import { fcfsSchedule, sjfSchedule, srtfSchedule, rrSchedule } from './algorithms.js';
import { renderTimeHeader, renderEmptyGantt, refreshProcTableWithLog, refreshProcTable, paintGanttWithLog, paintGantt, renderResults, clearResults } from './uiHandlers.js';

// Restaurar el objeto de procesos en window para compatibilidad
window.SIM_PROCESSES = window.SIM_PROCESSES || {};

// DOM refs
const procTableBody = document.querySelector('#procTable tbody');
const addProcBtn = document.getElementById('addProc');
const removeProcBtn = document.getElementById('removeProc');
const clearAllBtn = document.getElementById('clearAll');
const procNameInp = document.getElementById('procName');
const arrivalInp = document.getElementById('arrival');
const burstInp = document.getElementById('burst');

const runFCFSBtn = document.getElementById('runFCFS');
const runSJFBtn = document.getElementById('runSJF');
const runSRTFBtn = document.getElementById('runSRTF');
const runRRBtn = document.getElementById('runRR');
const rrQuantumInp = document.getElementById('rrQuantum');

const resetAllBtn = document.getElementById('resetAll');

// Hidden runner
let hiddenRunnerId = null; let hiddenRunnerIndex = 0; let hiddenRunnerTimeline = []; let timelineLength = 0;

function snapshotProcs(){ const snap={}; for(const k in window.SIM_PROCESSES) snap[k] = {...window.SIM_PROCESSES[k]}; return snap; }

function startHiddenRunner(timeline){ if(hiddenRunnerId) clearInterval(hiddenRunnerId); hiddenRunnerTimeline = timeline.slice(); hiddenRunnerIndex = 0; console.log('[main] startHiddenRunner total=', timeline.length); hiddenRunnerId = setInterval(()=>{ if(hiddenRunnerIndex >= hiddenRunnerTimeline.length){ clearInterval(hiddenRunnerId); hiddenRunnerId = null; console.log('[main] hidden runner finished'); return; } const slice = hiddenRunnerTimeline.slice(0, hiddenRunnerIndex + 1); console.log('[main] tick', hiddenRunnerIndex, 'sliceLen', slice.length); paintGanttWithLog(slice); const metrics = computeMetricsFromTimeline(slice, snapshotProcs()); metrics._timelineLength = slice.length; renderResults(metrics); hiddenRunnerIndex++; }, 1000); }

function stopHiddenRunner(){ if(hiddenRunnerId) clearInterval(hiddenRunnerId); hiddenRunnerId=null; hiddenRunnerIndex=0; hiddenRunnerTimeline=[]; }

function computeMetricsFromTimeline(timeline, processesSnapshot){
  const names = Object.keys(processesSnapshot).sort();
  const tf = {}; const firstExec = {}; const executedTime = {};
  for(const n of names){ tf[n]=null; firstExec[n]=null; executedTime[n]=0; }
  for(let t=0;t<timeline.length;t++){ const p = timeline[t]; if(!p) continue; tf[p] = t+1; if(firstExec[p] === null) firstExec[p]=t; executedTime[p] = (executedTime[p]||0)+1; }
  function fmt2(v){ const n = Number(v); if(!Number.isFinite(n)) return '-'; const r = Math.round(n*100)/100; return r.toFixed(2); }
  const tableRows = []; let sumT=0, sumWait=0, sumI=0, count=0;
  for(const n of names){ const pr = processesSnapshot[n]; if(!pr) continue; const arrival = pr.arrival; const burst = pr.burst; const tfN = (tf[n] !== null && tf[n] !== undefined) ? tf[n] : '-'; const T = (tfN === '-') ? '-' : (tfN - arrival); const Te = (T === '-') ? '-' : (T - burst); const I = (T === '-' || T === 0) ? '-' : fmt2(burst / T); tableRows.push({ name:n, arrival, burst, tf:tfN, T, Te, I }); if(T !== '-') { sumT += Number(T); sumWait += Number(Te); sumI += Number(burst)/Number(T); count++; } }
  const avgT = count ? fmt2(sumT/count) : '-'; const avgWait = count ? fmt2(sumWait/count) : '-'; const avgI = count ? fmt2(sumI/count) : '-';
  return { tableRows, avgT, avgWait, avgI };
}

function runAlgorithm(name){ clearResults(); stopHiddenRunner(); const snap = snapshotProcs(); if(Object.keys(snap).length === 0) return alert('No hay procesos definidos.'); let timeline = []; if(name === 'FCFS') timeline = fcfsSchedule(snap); else if(name === 'SJF') timeline = sjfSchedule(snap); else if(name === 'SRTF') timeline = srtfSchedule(snap); else if(name === 'RR') timeline = rrSchedule(snap, Number(rrQuantumInp.value) || 1); else return; timelineLength = timeline.length; startHiddenRunner(timeline); }

// UI bindings (guardados defensivamente)
if(addProcBtn) addProcBtn.addEventListener('click', ()=>{
  const name = procNameInp && procNameInp.value;
  const arrival = arrivalInp ? Number(arrivalInp.value) : NaN;
  const burst = burstInp ? Number(burstInp.value) : NaN;
  console.log('[main] addProc clicked', { name, arrival, burst });
  if(!name) return alert('Seleccione un nombre de proceso.');
  if(!Number.isFinite(arrival) || arrival < 0 || !Number.isFinite(burst) || burst <= 0) return alert('Valores inválidos. arrival >= 0, burst > 0');
  window.SIM_PROCESSES[name] = { name, arrival: Math.floor(arrival), burst: Math.floor(burst) };
  refreshProcTableWithLog();
  console.log('[main] process added', window.SIM_PROCESSES[name]);
});
if(removeProcBtn) removeProcBtn.addEventListener('click', ()=>{ const name = procNameInp && procNameInp.value; console.log('[main] removeProc clicked', name); if(!name) return alert('Seleccione un nombre de proceso para eliminar.'); delete window.SIM_PROCESSES[name]; refreshProcTableWithLog(); console.log('[main] process removed', name); });
if(clearAllBtn) {
  clearAllBtn.addEventListener('click', ()=>{
    for(const p of ['A','B','C','D','E','F','G']) delete window.SIM_PROCESSES[p];
    refreshProcTableWithLog();
    renderEmptyGantt();
    clearResults();
  });
}

if(runFCFSBtn){ runFCFSBtn.addEventListener('click', ()=>{ console.log('[main] run FCFS'); runAlgorithm('FCFS'); }); }
if(runSJFBtn){ runSJFBtn.addEventListener('click', ()=>{ console.log('[main] run SJF'); runAlgorithm('SJF'); }); }
if(runSRTFBtn){ runSRTFBtn.addEventListener('click', ()=>{ console.log('[main] run SRTF'); runAlgorithm('SRTF'); }); }
if(runRRBtn){ runRRBtn.addEventListener('click', ()=>{ console.log('[main] run RR'); runAlgorithm('RR'); }); }

if(resetAllBtn){ resetAllBtn.addEventListener('click', ()=>{ stopHiddenRunner(); renderEmptyGantt(); clearResults(); }); }

// Inicialización UI
renderTimeHeader(); renderEmptyGantt(); refreshProcTableWithLog(); clearResults();
