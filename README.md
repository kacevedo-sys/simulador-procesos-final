
# Simulador de Gestión de Procesos

Este repositorio contiene un simulador didáctico de planificación de procesos (FCFS, SJF, SRTF, RR). La aplicación está escrita en HTML/CSS/JavaScript usando módulos ES (ES Modules).

IMPORTANTE: por seguridad los navegadores bloquean la carga de módulos desde `file://`. Debes servir la carpeta con un servidor HTTP local para que `type="module"` funcione correctamente.

## Archivos principales

- `index.html` — Interfaz principal y elementos DOM (selects, botones, tablas, gantt).
- `css/style.css` — Estilos (si existen en el repo).
- `js/algorithms.js` — Funciones puras de planificación: `fcfsSchedule`, `sjfSchedule`, `srtfSchedule`, `rrSchedule`.
- `js/uiHandlers.js` — Funciones de renderizado y manipulación del DOM: cabecera de tiempos, grilla Gantt, tabla de procesos y tabla de resultados.
- `js/main.js` — Punto de entrada (módulo). Conecta la UI con los algoritmos, maneja el estado compartido `window.SIM_PROCESSES`, el runner oculto (1 segundo por unidad) y el cálculo de métricas.

Además pueden quedar otros archivos de iteraciones previas; la versión activa carga `js/main.js` desde `index.html`.

## Instrucciones rápidas (Windows PowerShell)

Abre PowerShell en la carpeta del proyecto (la carpeta que contiene `index.html`) y cualquiera de los siguientes comandos:

Opción A — Python 3 (si lo tienes):

```powershell
# Levanta un servidor en el puerto 8000
python -m http.server 8000
# Luego abre en tu navegador:
# http://localhost:8000/index.html
```

Opción B — Node.js (con npx disponible):

```powershell
# Instala y ejecuta un servidor temporal (usa npx)
npx http-server -c-1 -p 8000
# o
npx serve -s . -l 8000
# Abrir en el navegador:
# http://localhost:8000/index.html
```

Opción C — Visual Studio Code

- Instala la extensión "Live Server".
- Abre la carpeta del proyecto en VS Code, clic derecho en `index.html` → "Open with Live Server".

## Uso (en la página web)

1. Selecciona un proceso (A..G).
2. Ingresa `ti` (arrival) y `t` (burst), pulsa "Agregar / Actualizar".
3. Verás la fila en la tabla de procesos.
4. Pulsa cualquiera de los botones de ejecución (Ejecutar FCFS / SJF / SRTF / RR). El simulador precomputará el timeline y lo reproducirá internamente a 1 segundo por unidad. La grilla Gantt irá pintándose y la tabla de resultados se actualizará progresivamente.

## Depuración (consola del navegador)

Se añadieron logs para facilitar la depuración. Abre DevTools (F12) → Consola y busca entradas como:

- `[main] addProc clicked` — cuando pulsas "Agregar".
- `[ui] refreshProcTable — current processes:` — cuando la tabla de procesos se refresca.
- `[main] run FCFS` — cuando inicias un algoritmo.
- `[main] startHiddenRunner total=` — longitud total del timeline.
- `[main] tick 0 sliceLen 1` y `[ui] paintGantt tick length=` — ticks del runner y pintado del gantt.

Si ves el error de CORS (Access to script at 'file://...js/main.js' ... blocked by CORS policy), significa que abriste `index.html` directamente usando `file://`. Sigue las instrucciones arriba para servir la carpeta con un servidor HTTP.

## Problemas comunes y soluciones

- Error CORS / imports bloqueados: usa un servidor local (ver sección Instrucciones rápidas).
- No aparece la tabla de procesos o no se pueden agregar: abre la consola (F12) y revisa los logs; busca errores de JS o mensajes `[main] ...`/`[ui] ...`.
- Si el Gantt no se pinta aunque el timeline exista: revisa la consola por `[ui] paintGantt tick length=` en cada tick.

## Notas para desarrolladores

- El estado compartido de los procesos se guarda en `window.SIM_PROCESSES`.
- Para pruebas unitarias de los algoritmos puedes importar `js/algorithms.js` desde Node (requiere adaptarlo o usar bundler/transpiler), o copiar las funciones a un entorno de pruebas.

---

Si quieres, puedo:

- Añadir un pequeño script de prueba para los algoritmos (archivo `tests/test_algorithms.js`).
- Quitar los `console.log` de depuración y dejar el código limpio.
- Generar un `package.json` con un script `start` que ejecute `http-server` para simplificar el arranque.

Dime qué prefieres y lo agrego en el siguiente paso.


