const appState = {
    currentStep: 0,
    isPlaying: true,
    speed: 7333, // ~7.3 seconds per step
    mockData: [
        { id: '001', nombre: 'Ana García', edad: 34, sexo: 'F', tipo: 'Consulta', fecha: '2023-10-25' },
        { id: '002', nombre: 'Luis Pérez', edad: 45, sexo: 'M', tipo: 'Urgencia', fecha: '2023-10-25' },
        { id: '003', nombre: 'Maria Borja', edad: 28, sexo: 'F', tipo: 'Control', fecha: '2023-10-26' },
        { id: '004', nombre: 'Carlos Ruiz', edad: 62, sexo: 'M', tipo: 'Consulta', fecha: '2023-10-26' },
        { id: '005', nombre: 'Elena T.', edad: 19, sexo: 'F', tipo: 'Urgencia', fecha: '2023-10-27' },
        { id: '006', nombre: 'Pedro K.', edad: 33, sexo: 'M', tipo: 'Control', fecha: '2023-10-27' }
    ]
};

const steps = [
    {
        id: '5.1',
        title: '5.1 Conceptos Clave CSV',
        description: 'Los archivos CSV (Comma Separated Values) son el estándar para intercambio de datos simples. A diferencia de Excel, son texto plano ligero y universal.',
        code: `# Ejemplo de estructura CSV en texto plano:
id,nombre,edad,sexo,tipo,fecha
001,Ana García,34,F,Consulta,2023-10-25
002,Luis Pérez,45,M,Urgencia,2023-10-25
...
# Cada línea es un registro.
# Las columnas se separan por comas.`,
        render: 'renderCSVConcept',
        note: 'Nota: La primera línea define los encabezados "id", "nombre", etc.'
    },
    {
        id: '5.2',
        title: '5.2 Lectura Básica',
        description: 'Usamos la librería nativa `csv` de Python. `csv.reader` lee el archivo línea por línea, devolviendo cada fila como una lista de cadenas de texto.',
        code: `import csv

with open('pacientes.csv', mode='r') as archivo:
    lector = csv.reader(archivo)
    for fila in lector:
        print(fila) # Imprime una lista ['id', 'nombre'...]`,
        render: 'renderBasicRead',
        note: 'El bloque "with" es buena práctica: asegura que el archivo se cierre correctamente.'
    },
    {
        id: '5.3',
        title: '5.3 Procesamiento con Diccionarios',
        description: '`csv.DictReader` es más potente: convierte cada fila en un diccionario, usando los encabezados como claves. Esto hace el código más legible y robusto.',
        code: `import csv

# Leemos directamente a diccionarios
with open('pacientes.csv', 'r') as f:
    lector = csv.DictReader(f)
    pacientes = list(lector)

# Ahora podemos acceder por nombre de columna
# print(pacientes[0]['nombre']) -> "Ana García"`,
        render: 'renderDictRead',
        note: 'Usar DictReader previene errores si cambia el orden de las columnas en el CSV.'
    },
    {
        id: '5.4',
        title: '5.4 Búsqueda y Filtrado',
        description: 'Podemos iterar sobre la lista de diccionarios para encontrar información específica. Aquí filtramos pacientes del sexo Femenino ("F").',
        code: `mujeres = []
for p in pacientes:
    if p['sexo'] == 'F':
        mujeres.append(p)

print(f"Total mujeres: {len(mujeres)}")
# Resultado: Ana García, Maria Borja, Elena T.`,
        render: 'renderFilter',
        note: 'Las listas por comprensión en Python harían esto en una sola línea.'
    },
    {
        id: '5.5',
        title: '5.5 Escritura de Archivos CSV',
        description: 'Para guardar datos procesados, usamos `csv.writer`. Debemos especificar `newline=""` para evitar líneas en blanco extra en Windows.',
        code: `datos_nuevos = [
    ['007', 'Nuevo Paciente', '30', 'M', 'Consulta']
]

with open('nuevos_pacientes.csv', 'w', newline='') as f:
    escritor = csv.writer(f)
    escritor.writerow(['id','nombre','edad','sexo','tipo'])
    escritor.writerows(datos_nuevos)`,
        render: 'renderWrite',
        note: 'Es importante definir la codificación adecuada (utf-8) si trabajamos con tildes.'
    },
    {
        id: '5.6',
        title: '5.6 Generar CSV desde Diccionarios',
        description: '`csv.DictWriter` simplifica la escritura cuando nuestros datos están en diccionarios. Requires definir los `fieldnames` (nombres de columnas) primero.',
        code: `campos = ['id', 'nombre', 'edad', 'sexo', 'tipo', 'fecha']

with open('reporte_mujeres.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=campos)
    writer.writeheader() # Escribe la fila de títulos
    writer.writerows(mujeres) # Escribe toda la lista filtrada`,
        render: 'renderDictWrite',
        note: 'Esto es ideal para generar reportes automáticos sin errores manuales.'
    },
    {
        id: '5.7',
        title: '5.7 Dialectos Personalizados',
        description: 'A veces los CSV usan `;` en lugar de `,` (común en Excel en español) o `|`. Python permite definir "dialectos" para adaptarse.',
        code: `csv.register_dialect('excel_es', delimiter=';')

with open('datos_excel.csv', 'r') as f:
    lector = csv.reader(f, dialect='excel_es')
    # Lee correctamente archivos separados por punto y coma`,
        render: 'renderDialect',
        note: 'El delimitador incorrecto es la causa principal de errores al leer CSVs.'
    },
    {
        id: '5.8',
        title: '5.8 Buenas Prácticas',
        description: 'Refactorización final: encapsular la lógica en funciones reutilizables y tipadas para un código profesional.',
        code: `from typing import List, Dict

def cargar_pacientes(ruta: str) -> List[Dict]:
    try:
        with open(ruta, encoding='utf-8') as f:
            return list(csv.DictReader(f))
    except FileNotFoundError:
        return []

# El código ahora es modular, seguro y fácil de leer.`,
        render: 'renderRefactor',
        note: 'El uso de Type Hints (List, Dict) hace que el código sea auto-documentado.'
    }
];

// UI References
const ui = {
    title: document.getElementById('step-title'),
    desc: document.getElementById('step-description'),
    code: document.getElementById('code-display'),
    visual: document.getElementById('visual-stage'),
    progress: document.getElementById('progress-bar'),
    noteBox: document.getElementById('explanation-box'),
    noteMsg: document.getElementById('explanation-msg'),
    status: document.getElementById('system-status'),
    pauseBtn: document.getElementById('pause-btn')
};

// Logic
function togglePause() {
    appState.isPlaying = !appState.isPlaying;

    if (appState.isPlaying) {
        ui.pauseBtn.innerText = "⏸ Pausar";
        ui.status.innerText = "En línea";
        ui.status.style.color = "#38bdf8";
        loop();
    } else {
        ui.pauseBtn.innerText = "▶ Continuar";
        ui.status.innerText = "Pausado";
        ui.status.style.color = "#fbbf24";
    }
}

// Render Functions
const renderers = {
    renderCSVConcept: () => {
        let html = '<div class="file-card"><div class="file-icon-box">CSV</div><div><strong>pacientes.csv</strong><br><small>Archivo de Texto Plano</small></div></div>';
        html += '<table class="data-table" style="font-family: monospace; color: #94a3b8;">';
        html += '<tr><td>id,nombre,edad,sexo,tipo,fecha</td></tr>';
        appState.mockData.slice(0, 3).forEach(row => {
            html += `<tr><td>${row.id},${row.nombre},${row.edad},${row.sexo},${row.tipo},${row.fecha}</td></tr>`;
        });
        html += '</table>';
        return html;
    },
    renderBasicRead: () => {
        let html = '<h4>Interpretación como Listas</h4><br>';
        html += '<table class="data-table">';
        html += '<tr><th>Índice 0</th><th>Índice 1</th><th>Índice 2</th><th>...</th></tr>';
        appState.mockData.slice(0, 3).forEach(row => {
            html += `<tr><td>"${row.id}"</td><td>"${row.nombre}"</td><td>"${row.edad}"</td><td>...</td></tr>`;
        });
        html += '</table>';
        return html;
    },
    renderDictRead: () => {
        let html = '<h4>Interpretación como Diccionarios</h4><br>';
        html += '<div style="background: #1e1e1e; border: 1px solid #333; padding: 1rem; font-family: monospace; color: #d4d4d4;">';
        html += '<span style="color: #569cd6;">[</span><br>';
        appState.mockData.slice(0, 2).forEach(row => {
            html += `&nbsp;&nbsp;{ <span style="color:#9cdcfe;">'id'</span>: <span style="color:#ce9178;">'${row.id}'</span>, <span style="color:#9cdcfe;">'nombre'</span>: <span style="color:#ce9178;">'${row.nombre}'</span>... },<br>`;
        });
        html += '&nbsp;&nbsp;...<br><span style="color: #569cd6;">]</span></div>';
        return html;
    },
    renderFilter: () => {
        let html = '<h4>Filtrando: Sexo == "F"</h4><br>';
        html += '<table class="data-table">';
        html += '<tr><th>ID</th><th>Nombre</th><th>Sexo</th><th>Estado</th></tr>';
        appState.mockData.forEach(row => {
            const isMatch = row.sexo === 'F';
            const style = isMatch ? 'background: rgba(14, 165, 233, 0.2);' : 'opacity: 0.3;';
            const status = isMatch ? 'SELECCIONADO' : 'IGNORADO';
            html += `<tr style="${style}"><td>${row.id}</td><td>${row.nombre}</td><td>${row.sexo}</td><td>${status}</td></tr>`;
        });
        html += '</table>';
        return html;
    },
    renderWrite: () => {
        return `<div style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="background: #1e293b; padding: 1rem; border: 1px solid #334155; border-radius: 6px;">
                <strong style="color: #38bdf8;">1. Datos en Memoria (Lista)</strong>
                <div style="font-family: monospace; color: #cbd5e1; margin-top: 0.5rem;">
                    ['007', 'Nuevo Paciente', '30', 'M', 'Consulta']
                </div>
            </div>
            
            <div style="text-align: center; color: #94a3b8; font-size: 0.8rem; letter-spacing: 0.1em;">
                TRANSFORMACIÓN (csv.writer)
                <div style="height: 20px; border-left: 2px dashed #94a3b8; margin: 5px auto;"></div>
            </div>

            <div style="background: #f0fdf4; padding: 1rem; border: 1px solid #86efac; border-radius: 6px; color: #166534;">
                <strong style="color: #15803d;">2. Archivo CSV (Texto Plano)</strong>
                <div style="font-family: monospace; margin-top: 0.5rem;">
                    007,Nuevo Paciente,30,M,Consulta
                </div>
            </div>
        </div>`;
    },
    renderDictWrite: () => {
        return `<div style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="background: #1e293b; padding: 1rem; border: 1px solid #334155; border-radius: 6px;">
                <strong style="color: #38bdf8;">1. Datos en Memoria (Diccionario)</strong>
                <div style="font-family: monospace; color: #cbd5e1; margin-top: 0.5rem;">
                    { 'id': '007', 'nombre': 'Ana', 'edad': '30'... }
                </div>
            </div>

            <div style="text-align: center; color: #94a3b8; font-size: 0.8rem; letter-spacing: 0.1em;">
                 MAPEO AUTOMÁTICO (csv.DictWriter)
                <div style="height: 20px; border-left: 2px dashed #94a3b8; margin: 5px auto;"></div>
                <span style="font-size: 0.7rem;">Usa los encabezados para ordenar los valores</span>
            </div>

            <div style="background: #f0fdf4; padding: 1rem; border: 1px solid #86efac; border-radius: 6px; color: #166534;">
                <strong style="color: #15803d;">2. Archivo y Reporte Generado</strong>
                <div style="font-family: monospace; margin-top: 0.5rem;">
                    id,nombre,edad...<br>
                    007,Ana,30...
                </div>
            </div>
        </div>`;
    },
    renderDialect: () => {
        let html = '<h4>Lectura con Delimitador ";" (Excel Europeo)</h4><br>';
        html += '<div style="background: #e2e8f0; padding: 10px; border: 1px solid #ccc; font-family: monospace; margin-bottom: 10px; color: #333;">';
        html += 'id;nombre;edad;sexo...<br>';
        html += '001;Ana García;34;F...';
        html += '</div>';
        html += '<div style="text-align: center; color: #4ade80; font-weight: bold;">INTERPRETADO CORRECTAMENTE</div>';
        return html;
    },
    renderRefactor: () => {
        return `<div style="text-align: center; padding: 2rem;">
            <div style="font-size: 1.5rem; margin-bottom: 1rem; color: #38bdf8; font-weight: bold; border: 2px solid #38bdf8; display: inline-block; padding: 1rem; border-radius: 50%;">Clean Code</div>
            <h3>Código Optimizado</h3>
            <p style="color: #94a3b8;">Estructura modular lista para producción.</p>
        </div>`;
    }
};

// Core Logic
function updateUI(stepIndex) {
    const step = steps[stepIndex];

    // Animate Text Change
    ui.title.style.opacity = 0;
    ui.desc.style.opacity = 0;
    ui.code.style.opacity = 0;

    setTimeout(() => {
        ui.title.innerText = step.title;
        ui.desc.innerText = step.description;
        ui.code.innerHTML = syntaxHighlight(step.code);
        ui.visual.innerHTML = renderers[step.render]();

        ui.title.style.opacity = 1;
        ui.desc.style.opacity = 1;
        ui.code.style.opacity = 1;

        // Explanation / Note Pop
        ui.noteBox.classList.remove('visible');
        setTimeout(() => {
            ui.noteMsg.innerText = step.note;
            ui.noteBox.classList.add('visible');
        }, 1000); // Slightly delayed

    }, 200);

    // Update Progress Bar
    const progress = ((stepIndex + 1) / steps.length) * 100;
    ui.progress.style.width = `${progress}%`;
}

// Improved Syntax Highlighter
// Simplified to prevent regex conflicts with HTML tags
function syntaxHighlight(code) {
    let html = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    return html;
}

// Auto-play Loop
function loop() {
    if (!appState.isPlaying) return;

    updateUI(appState.currentStep);

    appState.currentStep++;
    if (appState.currentStep >= steps.length) {
        appState.currentStep = 0; // Loop back
        setTimeout(loop, appState.speed + 2000); // Pause longer at end
    } else {
        setTimeout(loop, appState.speed);
    }
}

// Start
document.addEventListener('DOMContentLoaded', () => {
    ui.pauseBtn.addEventListener('click', togglePause);
    loop();
});
