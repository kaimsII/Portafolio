// Data Definitions
const RAW_DATA = [
    { date: "2024-01-15", product: "Laptop Pro X", category: "Electrónica", price: 1250, region: "Norte" },
    { date: "2024-01-16", product: "Monitor 4K", category: "Accesorios", price: 450, region: "Este" },
    { date: "2024-01-16", product: "Teclado Mec.", category: "Accesorios", price: 120, region: "Oeste" },
    { date: "2024-01-17", product: "Mouse Ergo", category: "Accesorios", price: 85, region: "Norte" },
    { date: "2024-01-18", product: "Licencia SW", category: "Software", price: 299, region: "Sur" },
    { date: "2024-01-19", product: "Tablet Air", category: "Electrónica", price: 650, region: "Este" },
    { date: "2024-01-20", product: "Dock Univ.", category: "Accesorios", price: 180, region: "Oeste" },
    { date: "2024-01-21", product: "Headset V2", category: "Audio", price: 150, region: "Sur" },
];

const UI = {
    stage: document.getElementById('stage'),
    dataContainer: document.getElementById('data-container'),
    statsContainer: document.getElementById('stats-container'),
    chartsContainer: document.getElementById('charts-container'),
    aiOverlay: document.getElementById('ai-overlay'),
    aiText: document.getElementById('ai-text'),
    narrative: {
        box: document.getElementById('narrative-box'),
        chapter: document.getElementById('chapter-id'),
        main: document.getElementById('narrative-main'),
        adv: document.getElementById('narrative-adv')
    },
    stats: {
        count: document.getElementById('stat-count'),
        sum: document.getElementById('stat-sum'),
        avg: document.getElementById('stat-avg')
    },
    code: {
        container: document.getElementById('code-content'),
        status: document.querySelector('.execution-status')
    }
};

// Utils
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function updateNarrative(chapter, text, advantage, colorVar, stampText, codeSnippet) {
    UI.narrative.box.style.borderLeftColor = `var(${colorVar})`;
    UI.narrative.chapter.style.color = `var(${colorVar})`;

    // Update Code
    if (codeSnippet) {
        UI.code.container.style.opacity = 0;
        UI.code.status.style.opacity = 0;

        setTimeout(() => {
            UI.code.container.innerHTML = codeSnippet;
            UI.code.container.style.opacity = 1;
            UI.code.status.style.opacity = 1;
        }, 300);
    }

    // Fade out narrative
    UI.narrative.main.style.opacity = 0;
    UI.narrative.adv.style.opacity = 0;

    setTimeout(() => {
        UI.narrative.chapter.innerText = chapter;
        UI.narrative.main.innerText = text;
        UI.narrative.adv.innerText = advantage;

        // Fade in
        UI.narrative.main.style.opacity = 1;
        UI.narrative.adv.style.opacity = 1;
    }, 600);
}

// Focus Helper
function setFocus(element, labelText = "VISTA ACTUAL") {
    // Remove focus from all
    [UI.dataContainer, UI.statsContainer, UI.chartsContainer, UI.aiOverlay, UI.stage].forEach(el => {
        if (el) {
            el.classList.remove('focus-highlight');
            const oldInd = el.querySelector('.focus-indicator');
            if (oldInd) oldInd.remove();
        }
    });

    if (element) {
        element.classList.add('focus-highlight');
        const badge = document.createElement('div');
        badge.className = 'focus-indicator';
        badge.innerText = labelText;
        element.appendChild(badge);
    }
}

// Sequence Steps

async function init() {
    await sleep(2000); // Initial pause
    loadDataPhase();
}

async function loadDataPhase() {
    setFocus(UI.dataContainer, "1. INGESTA DE DATOS");

    // HTML-Safe Code Snippet with Syntax Highlighting and "Active Line"
    const code = `
<span class="code-keyword">import</span> pandas <span class="code-keyword">as</span> pd

<span class="code-comment"># Ingesta optimizada de datos</span>
<span class="code-comment"># 'parse_dates' detecta fechas automáticamente</span>
<span class="active-code">df = pd.<span class="code-function">read_csv</span>(<span class="code-string">'ventas_2024.csv'</span>, encoding=<span class="code-string">'utf-8'</span>)</span>

<span class="code-comment"># Vista previa de la estructura</span>
<span class="code-keyword">print</span>(df.head(5))
    `;


    updateNarrative(
        "TRATAMIENTO DE DATOS",
        "Cargando archivo CSV crudo. Sin procesar, los datos son solo texto plano difícil de interpretar.",
        "Python permite la ingesta masiva de datos estructurados en milisegundos.",
        "--accent-blue",
        null,
        code
    );

    // Build Grid Headers
    const headers = ["Fecha", "Producto", "Categoría", "Precio ($)"];
    headers.forEach(h => {
        const div = document.createElement('div');
        div.className = 'data-cell header';
        div.innerText = h;
        UI.dataContainer.appendChild(div);
    });

    // Build Grid Rows
    RAW_DATA.forEach((row, i) => {
        const values = [row.date, row.product, row.category, row.price];
        values.forEach(v => {
            const div = document.createElement('div');
            div.className = 'data-cell';
            div.innerText = v;
            UI.dataContainer.appendChild(div);
        });
    });

    UI.dataContainer.classList.add('fade-in');

    await sleep(10000);
    identifyTypesPhase();
}

async function identifyTypesPhase() {
    setFocus(UI.dataContainer, "2. ESCANEO DE TIPOS");

    const code = `
<span class="code-comment"># Auditoría automática de tipos de datos</span>
<span class="code-function">df.info</span>()

<span class="code-comment"># Normalización vectorial de fechas</span>
<span class="active-code">df[<span class="code-string">'Fecha'</span>] = pd.<span class="code-function">to_datetime</span>(df[<span class="code-string">'Fecha'</span>], format=<span class="code-string">'%Y-%m-%d'</span>)</span>
    `;


    updateNarrative(
        "INFERENCIA DE TIPOS",
        "Python escanea automáticamente cada columna para determinar su naturaleza (Fecha, Texto, Numérico).",
        "Ventaja: Elimina la configuración manual de formatos y evita errores de cálculo.",
        "--accent-purple",
        null,
        code
    );

    const cells = Array.from(document.querySelectorAll('.data-cell'));
    for (let i = 4; i < cells.length; i++) {
        const cell = cells[i];
        const colIndex = i % 4;
        let tagType = "";
        let tagText = "";

        if (colIndex === 0) { tagType = "tag-date"; tagText = "DATE"; }
        else if (colIndex === 1 || colIndex === 2) { tagType = "tag-str"; tagText = "STR"; }
        else if (colIndex === 3) { tagType = "tag-num"; tagText = "FLOAT"; }

        const badge = document.createElement('span');
        badge.className = `type-tag ${tagType}`;
        badge.innerText = tagText;
        cell.appendChild(badge);

        setTimeout(() => {
            badge.style.transform = "translateY(-50%) scale(1)";
        }, (i - 4) * 100);
    }

    await sleep(10000);
    generateStatsPhase();
}

async function generateStatsPhase() {
    // Transition UI
    UI.dataContainer.style.opacity = 0;
    setFocus(null);
    await sleep(1000);
    UI.dataContainer.style.display = 'none';
    UI.statsContainer.style.display = 'grid';

    void UI.statsContainer.offsetWidth;
    UI.statsContainer.classList.add('fade-in');
    setFocus(UI.statsContainer, "3. ESTADÍSTICAS AUTOMÁTICAS");

    const code = `
<span class="code-comment"># Generación de perfil estadístico</span>
<span class="code-comment"># Calcula media, desv. est., min/max en un paso</span>
<span class="active-code">stats = df.<span class="code-function">describe</span>().round(2)</span>

<span class="code-comment"># Agregación de alta velocidad</span>
kpis = df.<span class="code-function">agg</span>({<span class="code-string">'Precio'</span>: [<span class="code-string">'sum'</span>, <span class="code-string">'mean'</span>]})
    `;


    updateNarrative(
        "INFORMES AUTOMATIZADOS",
        "Generando perfilamiento de datos. Se calculan métricas clave instantáneamente.",
        "Ventaja: Obtención inmediata de insights sin tablas dinámicas complejas.",
        "--accent-green",
        null,
        code
    );

    animateValue(UI.stats.count, 0, RAW_DATA.length, 2000, "");
    animateValue(UI.stats.sum, 0, RAW_DATA.reduce((a, b) => a + b.price, 0), 2000, "$");
    animateValue(UI.stats.avg, 0, Math.round(RAW_DATA.reduce((a, b) => a + b.price, 0) / RAW_DATA.length), 2000, "$");

    await sleep(10000);
    visualizePhase();
}

function animateValue(obj, start, end, duration, prefix) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = prefix + Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

async function visualizePhase() {
    updateNarrative(
        "VISUALIZACIÓN DINÁMICA",
        "Transformando datos numéricos y categóricos en representaciones visuales comparativas.",
        "Ventaja: Las librerías de Python (Matplotlib/Seaborn) crean gráficos listos para publicación automáticamente.",
        "--accent-orange",
        null,
        `
<span class="code-keyword">import</span> seaborn <span class="code-keyword">as</span> sns

<span class="code-comment"># Configuración de estética profesional</span>
sns.<span class="code-function">set_theme</span>(style=<span class="code-string">"darkgrid"</span>)

<span class="code-comment"># Renderizado de gráfico categórico</span>
<span class="active-code">sns.<span class="code-function">barplot</span>(data=df, x=<span class="code-string">'Categoría'</span>, y=<span class="code-string">'Precio'</span>, estimator=<span class="code-string">'sum'</span>)</span>
        `

    );

    UI.statsContainer.style.opacity = 0;
    setFocus(null);
    await sleep(500);
    UI.statsContainer.style.display = 'none';

    UI.chartsContainer.style.display = 'flex';
    void UI.chartsContainer.offsetWidth;
    UI.chartsContainer.classList.add('fade-in');
    setFocus(UI.chartsContainer, "4. VIZUALIZACIÓN");

    const categoryTotals = {};
    RAW_DATA.forEach(d => {
        categoryTotals[d.category] = (categoryTotals[d.category] || 0) + d.price;
    });
    const entries = Object.entries(categoryTotals);
    const maxVal = Math.max(...entries.map(e => e[1]));

    entries.forEach(([cat, val]) => {
        const group = document.createElement('div');
        group.className = 'bar-group';

        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = '0%';

        const label = document.createElement('div');
        label.className = 'bar-label';
        label.innerText = cat;

        group.appendChild(bar);
        group.appendChild(label);
        UI.chartsContainer.appendChild(group);

        setTimeout(() => {
            const h = (val / maxVal) * 80;
            bar.style.height = `${h}%`;
        }, 500);
    });

    await sleep(13000);
    aiInsightPhase();
}

async function aiInsightPhase() {
    // Hide Charts (Clean transition)
    UI.chartsContainer.style.display = "none";
    setFocus(null);

    updateNarrative(
        "INTELIGENCIA ARTIFICIAL APLICADA",
        "Conectando con modelo de lenguaje (simulado) para interpretar los resultados encontrados.",
        "Ventaja: Convierte datos fríos en narrativa de negocio accionable.",
        "--accent-purple",
        null,
        `
<span class="code-keyword">import</span> openai

<span class="code-comment"># Construcción del contexto de datos</span>
contexto = df.<span class="code-function">to_json</span>(orient=<span class="code-string">'records'</span>)

<span class="code-comment"># Consulta a modelo generativo (GPT-4)</span>
<span class="active-code">response = openai.ChatCompletion.<span class="code-function">create</span>(</span>
    model=<span class="code-string">"gpt-4"</span>,
    messages=[{<span class="code-string">"role"</span>: <span class="code-string">"user"</span>, <span class="code-string">"content"</span>: <span class="code-string">f"Analiza: {contexto}"</span>}]
)
        `

    );

    UI.aiOverlay.style.display = 'block';
    void UI.aiOverlay.offsetWidth;
    UI.aiOverlay.classList.add('fade-in');
    setFocus(UI.aiOverlay, "5. ANÁLISIS IA");

    const insightText = "ANÁLISIS COMPLETADO:\n\n1. Tendencia Dominante: La categoría 'Electrónica' representa el 60% de los ingresos, impulsada por 'Laptop Pro X'.\n2. Oportunidad: 'Accesorios' tiene alto volumen de transacciones pero bajo ticket promedio.\n3. Recomendación: Crear bundles de Laptop + Accesorios para incrementar margen.\n\n>> Informe generado exitosamente.";

    await typeWriter(insightText, UI.aiText);
}

async function typeWriter(text, element) {
    element.innerText = "";
    for (let i = 0; i < text.length; i++) {
        const char = text.charAt(i);
        element.innerText += char;
        let delay = 30;
        if (char === '\n') delay = 300;
        if (char === ':') delay = 200;
        await sleep(delay);
    }
}

// Start
init();
