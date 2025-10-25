// uiHandlers.js — renderizado del Gantt, tabla de procesos y resultados
export const MAX_TIME = 30;
export const PROCESS_NAMES = ['A','B','C','D','E','F','G'];
export const colors = { A:'p-A', B:'p-B', C:'p-C', D:'p-D', E:'p-E', F:'p-F', G:'p-G' };

const procTableBody = () => document.querySelector('#procTable tbody');
const ganttGrid = () => document.getElementById('ganttGrid');
const timeHeader = () => document.getElementById('timeHeader');
const legend = () => document.getElementById('legend');
const resultsTbody = () => document.querySelector('#resultsTable tbody');
const resultsFoot = () => document.getElementById('resultsFoot');
const metricsArea = () => document.getElementById('metricsArea');
const summary = () => document.getElementById('summary');

export function renderTimeHeader(){ const el = timeHeader(); if(!el) return; el.innerHTML=''; for(let i=0;i<MAX_TIME;i++){ const c = document.createElement('div'); c.className='time-cell'; c.textContent = i; el.appendChild(c); } }

export function renderEmptyGantt(){ const grid = ganttGrid(); if(!grid) return; grid.innerHTML=''; for(const rowName of PROCESS_NAMES){ const row = document.createElement('div'); row.className='row'; const label = document.createElement('div'); label.className='row-label'; label.textContent = rowName; row.appendChild(label); const rowCells = document.createElement('div'); rowCells.className='row-cells'; for(let c=0;c<MAX_TIME;c++){ const cell = document.createElement('div'); cell.className='cell empty'; cell.dataset.proc=''; rowCells.appendChild(cell); } row.appendChild(rowCells); grid.appendChild(row); } renderLegend(); }

export function renderLegend(){ const el = legend(); if(!el) return; el.innerHTML = ''; for(const p of PROCESS_NAMES){ const item=document.createElement('div'); item.className='legend-item'; const sw=document.createElement('div'); sw.style.width='18px'; sw.style.height='14px'; sw.style.borderRadius='3px'; sw.className = colors[p]; const label=document.createElement('div'); label.textContent = p + (window.SIM_PROCESSES && window.SIM_PROCESSES[p] ? ' (t='+window.SIM_PROCESSES[p].burst+', ti='+window.SIM_PROCESSES[p].arrival+')' : ' — vacío'); item.appendChild(sw); item.appendChild(label); el.appendChild(item); } }

// Refresh de la tabla de procesos. Si se pasa highlightName, la fila
// correspondiente se marcará con la clase most-efficient.
export function refreshProcTable(highlightName){ const tb = procTableBody(); if(!tb) return; tb.innerHTML=''; for(const p of PROCESS_NAMES){ const pr = window.SIM_PROCESSES && window.SIM_PROCESSES[p]; if(pr){ const tr = document.createElement('tr'); if(p === highlightName) tr.className = 'most-efficient'; tr.innerHTML = `<td>${p}</td><td>${pr.arrival}</td><td>${pr.burst}</td>`; tb.appendChild(tr); } } renderLegend(); }

// Añadir versión con logging para depuración (se usa la misma función)
const _origRefresh = refreshProcTable;
export function refreshProcTableWithLog(highlightName){ console.log('[ui] refreshProcTable — current processes:', window.SIM_PROCESSES); _origRefresh(highlightName); }

export function paintGantt(timeline){ renderEmptyGantt(); const rows = ganttGrid().querySelectorAll('.row'); for(let t=0;t<Math.min(timeline.length, MAX_TIME); t++){ const p = timeline[t]; if(!p) continue; const idx = PROCESS_NAMES.indexOf(p); if(idx<0) continue; const row = rows[idx]; const cells = row.querySelectorAll('.cell'); const cell = cells[t]; cell.className = 'cell ' + colors[p]; cell.textContent = p; } }

// wrapper con log para ver ticks
export function paintGanttWithLog(timeline){ console.log('[ui] paintGantt tick length=', timeline.length); paintGantt(timeline); }

// Mejor proceso - función auxiliar para elegir el "más eficiente" según
// criterios sencillos: mayor I (t/T), en empate menor T (retorno), luego menor Te (espera).
function pickMostEfficient(tableRows){ if(!tableRows || tableRows.length===0) return null; const completed = tableRows.filter(r => r.T !== '-' && r.T !== undefined); if(completed.length === 0) return null; let best = null; for(const r of completed){ const I = (r.I === '-' || r.I === undefined) ? -1 : Number(r.I); const T = (r.T === '-' || r.T === undefined) ? Number.POSITIVE_INFINITY : Number(r.T); const Te = (r.Te === '-' || r.Te === undefined) ? Number.POSITIVE_INFINITY : Number(r.Te); if(!Number.isFinite(I)) continue; if(!best) { best = { row:r, I, T, Te }; continue; } if(I > best.I) { best = { row:r, I, T, Te }; } else if(I === best.I){ if(T < best.T) best = { row:r, I, T, Te }; else if(T === best.T && Te < best.Te) best = { row:r, I, T, Te }; } } return best ? best.row.name : null; }

// Reimplementación de renderResults que marca el proceso más eficiente.
export function renderResults(metrics){ const tb = resultsTbody(); if(!tb) return; tb.innerHTML=''; const rows = (metrics.tableRows || []);
	// determinar proceso más eficiente
	const mostEff = pickMostEfficient(rows);
	rows.forEach(r=>{ const tr = document.createElement('tr'); if(r.name === mostEff) tr.className = 'most-efficient'; tr.innerHTML = `<td>${r.name}</td><td>${r.arrival}</td><td>${r.burst}</td><td>${r.tf}</td><td>${r.T}</td><td>${r.Te}</td><td>${r.I}</td>`; tb.appendChild(tr); });
	if(resultsFoot()) resultsFoot().innerHTML = `
		<tr>
			<td colspan="4" style="text-align:right"><strong>Promedios</strong></td>
			<td><strong>${metrics.avgT}</strong></td>
			<td><strong>${metrics.avgWait}</strong></td>
			<td><strong>${metrics.avgI}</strong></td>
		</tr>` + (mostEff ? `\
		<tr><td colspan="7" style="text-align:center;background:#e6f7ff">Proceso más eficiente: <strong>${mostEff}</strong></td></tr>` : '');
	if(metricsArea()) metricsArea().innerHTML = `<div class="small">Duración total: ${metrics._timelineLength || 0}</div>`;
	if(summary()) summary().innerHTML = `<div class="small">Tiempo mostrado: 0 .. ${Math.min(MAX_TIME-1, (metrics._timelineLength||0) - 1)}</div>`;
	// también resaltamos en la tabla de procesos (si aplica)
	try{ refreshProcTableWithLog(mostEff); }catch(e){ console.warn('[ui] refreshProcTableWithLog failed', e); }
}

export function clearResults(){ if(resultsTbody()) resultsTbody().innerHTML=''; if(resultsFoot()) resultsFoot().innerHTML=''; if(metricsArea()) metricsArea().innerHTML=''; if(summary()) summary().innerHTML=''; }