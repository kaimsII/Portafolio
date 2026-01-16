/**
 * Sistema Visual de Automatización - Demo Script
 * Simulates Python automating Excel tasks without user interaction.
 */

// --- Configuration & State ---
const CONFIG = {
    stepDelay: 1200,      // Base delay between major actions
    typeSpeed: 30,        // Typing speed for terminal
    rows: 15,
    cols: 6,              // A-F
    colHeaders: ['A', 'B', 'C', 'D', 'E', 'F']
};

const STATE = {
    currentPhase: 'INIT', // INIT, RAW, CLEANING, FORMATTING, SUMMARY
    currentRow: 0,
    isPaused: false
};

// --- Mock Data ---

// headers
const HEADERS = ['ID_Transacción', 'Fecha', 'Cliente_Corporativo', 'Región_Venta', 'Categoría_Servicio', 'Facturación'];

// Raw 'Messy' Data (More realistic business names and inconsistencies)
const DATA_RAW = [
    ['TX-1001', '2024/01/15', '   Grupo Logístico Norte  ', 'NORTE', 'Consultoría TI', '4500'],
    ['TX-1002', '15-01-2024', 'Servicios Financieros Global', 'norte', 'Licencia Cloud', '1250.00'],
    ['TX-1002', '15-01-2024', 'Servicios Financieros Global', 'norte', 'Licencia Cloud', '1250.00'], // DUPLICATE
    ['TX-1003', '2024-01/16', 'Industrias  Metálicas', 'SUR', 'Soporte 24/7', '$850'],
    ['TX-1004', '2024.01.17', 'Comercializadora del Valle', 'Este', 'Consultoría TI', '4500'],
    ['TX-1005', 'N/A', 'ERROR_DATA_NULL', 'Oeste', 'Hardware', 'N/A'], // Invalid
    ['TX-1006', '18/01/2024', 'Grupo Logístico Norte', 'Norte', 'Licencia Cloud', '1250'],
    ['TX-1008', '2024-01-19', 'Aseguradora del Sur', 'Sur', 'Auditoría', '3200'],
    ['TX-1009', '20/01/2024', 'Servicios Financieros Global', 'Norte', 'Hardware', '980'],
    [null, null, null, null, null, null], // Empty row
    ['TX-1010', '21-01-24', 'Tech Solutions Integ.', 'ESTE', 'Consultoría TI', '4500']
];

// Cleaned 'Format' Data
const DATA_CLEAN = [
    ['TX-1001', '2024-01-15', 'Grupo Logístico Norte', 'Norte', 'Consultoría TI', 4500],
    ['TX-1002', '2024-01-15', 'Servicios Finan. Global', 'Norte', 'Licencia Cloud', 1250],
    // Duplicate removed
    ['TX-1003', '2024-01-16', 'Industrias Metálicas', 'Sur', 'Soporte 24/7', 850],
    ['TX-1004', '2024-01-17', 'Comercializadora Valle', 'Este', 'Consultoría TI', 4500],
    // Invalid removed
    ['TX-1006', '2024-01-18', 'Grupo Logístico Norte', 'Norte', 'Licencia Cloud', 1250],
    ['TX-1008', '2024-01-19', 'Aseguradora del Sur', 'Sur', 'Auditoría', 3200],
    ['TX-1009', '2024-01-20', 'Servicios Finan. Global', 'Norte', 'Hardware', 980],
    // Empty removed
    ['TX-1010', '2024-01-21', 'Tech Solutions Integ.', 'Este', 'Consultoría TI', 4500]
];

// Summary Data (Fuller, more professional pivot)
const DATA_SUMMARY = [
    ['Región', 'Cliente Top', 'Servicio Principal', 'Transacciones', 'Total Facturado', '% Part.'],
    ['Este', 'Tech Sol. Integ.', 'Consultoría TI', '2', 9000, '42.8%'],
    ['Norte', 'Grupo Logístico', 'Licencia Cloud', '4', 7980, '38.0%'],
    ['Sur', 'Aseguradora S.', 'Auditoría', '2', 4050, '19.2%'],
    ['TOTAL', '-', '-', '8', 21030, '100%']
];

// --- DOM Elements ---
const gridContainer = document.getElementById('spreadsheet-grid');
const logContainer = document.getElementById('terminal-log');
const progressBar = document.getElementById('progress-bar');
const formulaBar = document.getElementById('formula-bar');

// Metric Elements
const elManualTime = document.getElementById('manual-time');
const elPythonTime = document.getElementById('python-time');
const elErrorCount = document.getElementById('error-count-manual');

let errorCounter = 0;
// Card Elements
const elOverlay = document.getElementById('action-overlay');
const elActionTitle = document.getElementById('action-title');
const elActionCode = document.getElementById('action-code');
const elActionDesc = document.getElementById('action-desc');



// --- Initialization ---
function initGrid() {
    gridContainer.style.gridTemplateColumns = `40px repeat(${CONFIG.cols}, 1fr)`;

    // Header Row
    // Corner
    const corner = createCell('cell row-header', '');
    gridContainer.appendChild(corner);

    // Column Headers A-F
    CONFIG.colHeaders.forEach(h => {
        gridContainer.appendChild(createCell('cell header', h));
    });

    // Body
    renderEmptyGrid();
}

function renderEmptyGrid() {
    // Clear existing body cells (keep headers) but simplistic approach:
    // Just append row by row.
    for (let r = 1; r <= CONFIG.rows; r++) {
        // Row Header
        gridContainer.appendChild(createCell('cell row-header', r));

        // Cells
        for (let c = 0; c < CONFIG.cols; c++) {
            gridContainer.appendChild(createCell('cell', '', `cell-${r}-${c}`));
        }
    }
}

function createCell(className, content, id = null) {
    const div = document.createElement('div');
    div.className = className;
    div.textContent = content;
    if (id) div.id = id;
    return div;
}

function updateCell(r, c, content, className = null) {
    const cell = document.getElementById(`cell-${r}-${c}`);
    if (cell) {
        cell.textContent = content;
        if (className) {
            // Fix: split by space to avoid DOMException on classList.add
            const classes = className.trim().split(/\s+/);
            classes.forEach(cls => {
                if (cls) cell.classList.add(cls);
            });
        }
    }
}

function clearCellStyles() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(c => {
        c.className = 'cell'; // reset
        if (c.id === '') { // It's a header
            if (c.textContent.match(/[A-Z]/) && c.textContent.length === 1) c.className = 'cell header';
            else if (c.textContent === '') c.className = 'cell row-header';
            else if (!isNaN(c.textContent)) c.className = 'cell row-header';
        }
    });
}

// --- Terminal & UI System ---
async function log(message, type = 'info') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `> ${message}`;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
    await wait(400);
}

function updateProgress(percent) {
    progressBar.style.width = `${percent}%`;
}

function updateMetrics(manual, python, errors) {
    if (manual) elManualTime.textContent = manual;
    if (python) elPythonTime.textContent = python;
    if (errors !== null) {
        errorCounter += errors;
        elErrorCount.textContent = errorCounter;
    }
}

async function showActionCard(title, code, description, humanTime, pyTime) {
    elActionTitle.textContent = title;
    elActionCode.textContent = code;
    elActionDesc.textContent = description;

    // Update comparison text inside card
    const cardComp = document.querySelector('.comparison');
    cardComp.innerHTML = `
        <span class="comp-item human">Manual: ${humanTime}</span>
        <span class="arrow">→</span>
        <span class="comp-item bot">Python: ${pyTime}</span>
    `;

    elOverlay.classList.remove('hidden');
    await wait(4500); // Increased from 2500ms to 4500ms for better readability
    elOverlay.classList.add('hidden');
    await wait(800); // Increased pause after hiding
}

// --- Animation Sequences ---

async function runDemo() {
    initGrid();

    await wait(1000);
    await log('Iniciando Motor de Automatización...', 'system');
    await wait(800);
    await log('Librerías cargadas. Listo para procesar Big Data.', 'success');

    // PHASE 1: Load Raw Data
    await phaseLoadData();

    // PHASE 2: Data Cleaning
    await phaseCleanData();

    // PHASE 3: Formatting
    await phaseFormatting();

    // PHASE 4: Summary Generation
    await phaseSummary();

    await log('Automatización finalizada. Reporte listo para distribución.', 'success');
    updateProgress(100);
}

// Phase 1: Injection
async function phaseLoadData() {
    await log('Fuente detectada: "Sales_Report_Global_Q1.csv"', 'info');
    await log('Ingestando datos crudos...', 'process');
    updateMetrics('15 s', '0.05 s', 0);
    updateProgress(10);

    document.getElementById('tab-raw').classList.add('active');

    // Render Headers
    for (let i = 0; i < HEADERS.length; i++) {
        updateCell(1, i, HEADERS[i]);
        await wait(20);
    }

    // Render Raw Data
    for (let r = 0; r < DATA_RAW.length; r++) {
        const rowData = DATA_RAW[r];
        for (let c = 0; c < rowData.length; c++) {
            updateCell(r + 2, c, rowData[c]);
        }
        await wait(50);
    }

    await log('Carga completa. Se detectan inconsistencias visuales.', 'warning');
    await wait(1000);
}

// Phase 2: Cleaning
async function phaseCleanData() {
    await log('Iniciando limpieza inteligente...', 'process');
    updateProgress(30);

    // 1. Remove Empties
    highlightRow(11, 'format-alert');
    formulaBar.value = "df.dropna(how='all') # Elimina filas vacías";

    await showActionCard(
        "Limpieza de Estructura",
        "df.dropna(how='all')",
        "Detectando y eliminando filas completamente vacías que rompen el análisis.",
        "30 s", "0.01 s"
    );

    await log('Filas vacías eliminadas.', 'info');
    clearRow(11);
    updateMetrics('45 s', '0.12 s', 0);
    await wait(500);

    // 2. Remove Duplicates
    highlightRow(4, 'format-alert');
    formulaBar.value = "df.drop_duplicates() # Elimina repetidos exactos";

    await showActionCard(
        "Deduplicación",
        "df.drop_duplicates()",
        "Escaneando todo el dataset en busca de registros idénticos.",
        "2 min", "0.02 s"
    );

    await log('1 Registro duplicado eliminado.', 'info');
    updateMetrics('02:45 min', '0.14 s', 1);
    clearRow(4);
    await wait(500);

    // 3. Fix Whitespace & Typos
    await log('Estandarizando texto y fechas...', 'system');
    formulaBar.value = "df.apply(normalize_text) # Corrige espacios y formatos";

    await showActionCard(
        "Normalización de Datos",
        "df['Col'].str.strip()",
        "Corrigiendo espacios extra, formatos de fecha mixtos y errores de tipeo.",
        "8 min", "0.3 s"
    );

    await transitionToCleanGrid();

    document.getElementById('tab-raw').classList.remove('active');
    document.getElementById('tab-clean').classList.add('active');
    await log('Dataset normalizado y validado.', 'success');
    updateMetrics('10:45 min', '0.45 s', 14); // Lots of errors fixed
    updateProgress(60);
    await wait(1000);
}

async function transitionToCleanGrid() {
    // Clear whole grid content
    for (let r = 2; r <= CONFIG.rows; r++) {
        for (let c = 0; c < CONFIG.cols; c++) {
            updateCell(r, c, '');
            const cell = document.getElementById(`cell-${r}-${c}`);
            if (cell) cell.className = 'cell'; // remove alerts
        }
    }

    // Fill cleaned data
    // Headers already there
    for (let r = 0; r < DATA_CLEAN.length; r++) {
        const rowData = DATA_CLEAN[r];
        for (let c = 0; c < rowData.length; c++) {
            updateCell(r + 2, c, rowData[c], 'format-cleaned');
        }
        await wait(50);
    }
}


// Phase 3: Formatting
async function phaseFormatting() {
    await log('Aplicando formato profesional...', 'process');
    formulaBar.value = "apply_styles(palette='corporate') # Diseño automático";
    updateProgress(80);

    await showActionCard(
        "Formato Corporativo",
        "apply_styles()",
        "Aplicando estándares de marca: colores, bordes y formatos de moneda.",
        "5 min", "0.1 s"
    );

    // Header Style
    for (let c = 0; c < HEADERS.length; c++) {
        const cell = document.getElementById(`cell-1-${c}`);
        if (cell) cell.classList.add('format-header-style');
        await wait(50);
    }

    // Currency Style (Col F is index 5 for 'Facturación')
    const rows = DATA_CLEAN.length;
    for (let r = 0; r < rows; r++) {
        const cell = document.getElementById(`cell-${r + 2}-5`);
        if (cell) {
            cell.textContent = `$ ${DATA_CLEAN[r][5].toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
            cell.classList.add('format-currency');
        }
        await wait(20);
    }

    updateMetrics('15:45 min', '0.55 s', null);

    await log('Estilos aplicados a 100% de las celdas.', 'success');
    await wait(1000);
}

// Phase 4: Summary Pivot
async function phaseSummary() {
    await log('Generando insights de negocio...', 'process');
    formulaBar.value = "df.groupby('Región').agg({'Venta': 'sum', 'Cliente': 'count'})";

    await showActionCard(
        "Generación de Reporte",
        "df.groupby().agg()",
        "Creando reporte ejecutivo con KPIs de ventas, clientes top y participación de mercado.",
        "12 min", "0.05 s"
    );

    // Switch Tab
    document.getElementById('tab-clean').classList.remove('active');
    document.getElementById('tab-summary').classList.add('active');

    // Clear Grid
    clearCellStyles(); // remove header styles from wrong cells
    for (let r = 1; r <= CONFIG.rows; r++) {
        for (let c = 0; c < CONFIG.cols; c++) {
            updateCell(r, c, '');
            const cell = document.getElementById(`cell-${r}-${c}`);
            if (cell) {
                cell.className = 'cell'; // full reset
            }
        }
    }

    await wait(300);

    // Draw Summary
    for (let r = 0; r < DATA_SUMMARY.length; r++) {
        const rowData = DATA_SUMMARY[r];
        for (let c = 0; c < rowData.length; c++) {
            // Expand to handle more columns if needed, currently 6 columns in data
            if (rowData[c] !== '') {
                let content = rowData[c];
                let className = '';

                // Style header row
                if (r === 0) className = 'format-header-style';

                // Style Numbers (Money) - Col 4 (Total Facturado)
                if (r > 0 && c === 4) {
                    content = '$ ' + content.toLocaleString('es-MX');
                    className += ' format-currency';
                }

                // Style Percentage - Col 5
                if (r > 0 && c === 5) {
                    className += ' format-currency'; // aligned right
                }

                // Style Total Row
                if (r === DATA_SUMMARY.length - 1) className += ' format-bold';

                // Ensure we use the right cell index (1-based row, 0-based col)
                updateCell(r + 1, c, content, className);
            }
        }
        await wait(100);
    }

    updateMetrics('27:45 min', '0.60 s', null);
    await log('Reporte generado exitosamente.', 'success');
    formulaBar.value = "wb.save('Reporte_Ejecutivo_Q1.xlsx')";
}

// --- Helpers ---
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function highlightRow(rowIdx, className) {
    for (let c = 0; c < CONFIG.cols; c++) {
        const cell = document.getElementById(`cell-${rowIdx}-${c}`);
        if (cell) cell.classList.add(className);
    }
}

function clearRow(rowIdx) {
    for (let c = 0; c < CONFIG.cols; c++) {
        updateCell(rowIdx, c, '');
        const cell = document.getElementById(`cell-${rowIdx}-${c}`);
        if (cell) cell.className = 'cell';
    }
}

// Start
window.addEventListener('load', runDemo);

// Restart Logic
document.getElementById('btn-restart').addEventListener('click', () => {
    window.location.reload();
});
