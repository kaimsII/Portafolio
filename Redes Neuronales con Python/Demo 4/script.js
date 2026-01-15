/**
 * RNN Visual Demo - Didactic V7 (Step-Based Navigation)
 */

window.onerror = function (msg, url, line) {
    const el = document.getElementById('step-title');
    if (el) el.innerText = "Error: " + msg;
    const desc = document.getElementById('step-desc');
    if (desc) desc.innerText = "Line: " + line;
    return false;
};

const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

const uiTitle = document.getElementById('step-title');
const uiDesc = document.getElementById('step-desc');

// Controls
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnPause = document.getElementById('btn-pause');
const iconPause = document.getElementById('icon-pause');
const iconPlay = document.getElementById('icon-play');

// --- Config ---
const CONFIG = {
    colors: {
        nodeFill: '#0f172a',
        nodeActive: '#38bdf8',
        nodeRecurrent: '#c084fc',
        nodeGate: '#fbbf24',
        text: '#f8fafc',
        connection: '#64748b',
        particle: '#ffffff',
        gradientGood: '#4ade80',
        gradientBad: '#f87171'
    }
};

let width, height;
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

// --- STATE ---
const STATE = {
    paused: false,
    sceneIndex: 0,
    stepIndex: 0,
    signal: null,
    skipWait: false,
    isFastForwarding: false,
    nextSceneIndex: null
};

if (btnPause) {
    btnPause.addEventListener('click', () => {
        STATE.paused = !STATE.paused;
        updatePauseIcon();
    });

    btnNext.addEventListener('click', () => { STATE.skipWait = true; });
    btnPrev.addEventListener('click', () => { STATE.signal = 'prev'; });
}

function initSidebar() {
    const nav = document.getElementById('chapter-nav');
    if (!nav) return;
    nav.innerHTML = ''; // Clear

    SCENES.forEach((scene, index) => {
        const btn = document.createElement('button');
        btn.className = 'chapter-btn';
        // Extract short name "4.1", "4.2" etc.
        const titleParts = scene.name.split(' ');
        const shortName = titleParts[0]; // "4.1"
        const label = titleParts.slice(1).join(' '); // "Need for Memory"

        // Let's us just use the full name but maybe truncated or just the number if too long?
        // User asked "Saltar a cada capitulo"
        // Let's just use the name from the scene
        btn.innerText = scene.name;

        btn.addEventListener('click', () => {
            STATE.nextSceneIndex = index;
            STATE.signal = 'jump';
        });

        nav.appendChild(btn);
    });
}

function updatePauseIcon() {
    if (STATE.paused) {
        if (iconPause) iconPause.classList.add('hidden');
        if (iconPlay) iconPlay.classList.remove('hidden');
    } else {
        if (iconPause) iconPause.classList.remove('hidden');
        if (iconPlay) iconPlay.classList.add('hidden');
    }
}

class NavigationError extends Error {
    constructor(direction) {
        super(direction);
        this.name = "NavigationError";
    }
}

async function wait(ms) {
    if (STATE.isFastForwarding) return; // Immediate return

    let elapsed = 0;
    while (elapsed < ms) {
        if (STATE.signal) {
            const sig = STATE.signal;
            STATE.signal = null;
            throw new NavigationError(sig);
        }

        if (STATE.skipWait) {
            STATE.skipWait = false;
            return;
        }

        if (STATE.paused) {
            await new Promise(r => setTimeout(r, 100));
            continue;
        }
        await new Promise(r => setTimeout(r, 16));
        elapsed += 16;
    }
}

async function say(title, text) {
    if (uiTitle) uiTitle.innerText = title;
    if (uiDesc) uiDesc.innerHTML = text;

    if (STATE.isFastForwarding) return;

    // Speeding up: Min 1.5s, Base 1s
    const duration = Math.max(1500, 1000 + (text ? text.length : 0) * 40);
    await wait(duration);
}

// --- Graphics ---
class Node {
    constructor(id, x, y, label, type = 'dense') {
        this.id = id; this.x = x; this.y = y; this.label = label; this.type = type;
        this.radius = 40; this.color = CONFIG.colors.nodeFill;
        this.scale = 0; this.targetScale = 1;
        this.value = ''; this.subLabel = ''; this.glow = 0;
    }
    update() {
        // Fast forward: Scale snaps instantly
        if (STATE.isFastForwarding) {
            this.scale = this.targetScale;
            this.glow = 0;
        } else {
            this.scale = this.scale + (this.targetScale - this.scale) * 0.1;
            this.glow *= 0.9;
        }
    }
    draw(ctx) {
        if (this.scale < 0.01) return;
        ctx.save(); ctx.translate(this.x, this.y); ctx.scale(this.scale, this.scale);

        ctx.beginPath();
        if (this.type === 'lstm') {
            const r = this.radius;
            ctx.rect(-r, -r, r * 2, r * 2);
        } else {
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        }

        ctx.fillStyle = this.color; ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = (this.type === 'recurrent' || this.type === 'lstm') ? CONFIG.colors.nodeRecurrent : CONFIG.colors.nodeActive;
        if (this.glow > 0.1) { ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 20 * this.glow; }
        ctx.stroke(); ctx.shadowBlur = 0;

        ctx.fillStyle = CONFIG.colors.text; ctx.font = '600 14px Inter'; ctx.textAlign = 'center'; ctx.fillText(this.label, 0, -55);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 14px JetBrains Mono';
        if (this.value.length > 8) ctx.font = 'bold 11px JetBrains Mono';
        ctx.fillText(this.value, 0, 5);
        if (this.subLabel) { ctx.fillStyle = '#cbd5e1'; ctx.font = '10px JetBrains Mono'; ctx.fillText(this.subLabel, 0, 60); }
        ctx.restore();
    }
    pulse() { this.glow = 1.0; }
}

class Connection {
    constructor(fromNode, toNode, type = 'straight') {
        this.from = fromNode; this.to = toNode; this.type = type;
        this.active = false; this.dashed = false;
    }
    draw(ctx) {
        if (this.from.scale < 0.1 || (this.to && this.to.scale < 0.1)) return;
        ctx.beginPath();
        ctx.strokeStyle = this.active ? CONFIG.colors.nodeActive : CONFIG.colors.connection;
        ctx.lineWidth = 2;
        if (this.dashed) ctx.setLineDash([8, 8]); else ctx.setLineDash([]);

        if (this.type === 'loop') ctx.arc(this.from.x + 40, this.from.y - 40, 30, 0, Math.PI * 2);
        else if (this.type === 'curve') { ctx.moveTo(this.from.x, this.from.y); ctx.quadraticCurveTo((this.from.x + this.to.x) / 2, this.from.y - 120, this.to.x, this.to.y); }
        else if (this.type === 'autoregressive') { ctx.moveTo(this.from.x, this.from.y); ctx.bezierCurveTo(this.from.x, this.from.y + 100, this.to.x, this.to.y + 100, this.to.x, this.to.y); }
        else { ctx.moveTo(this.from.x, this.from.y); ctx.lineTo(this.to.x, this.to.y); }
        ctx.stroke(); ctx.setLineDash([]);
    }
}

class Packet {
    constructor(from, to, color, speed = 0.03) {
        this.from = from; this.to = to; this.progress = 0; this.speed = speed; this.color = color;
        this.dead = false; this.size = 12; this.label = '';
    }
    update() {
        if (STATE.paused && !STATE.isFastForwarding) return;
        // In fast forward, instant finish
        if (STATE.isFastForwarding) {
            this.progress = 1;
            this.dead = true;
            return;
        }
        this.progress += this.speed;
        if (this.progress >= 1) { this.progress = 1; this.dead = true; }
    }
    draw(ctx) {
        if (STATE.isFastForwarding) return;
        const x = this.from.x + (this.to.x - this.from.x) * this.progress;
        const y = this.from.y + (this.to.y - this.from.y) * this.progress;
        ctx.beginPath(); ctx.arc(x, y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color; ctx.fill();
        ctx.shadowBlur = 15; ctx.shadowColor = this.color;
        if (this.label) { ctx.fillStyle = '#fff'; ctx.font = '700 12px Inter'; ctx.textAlign = 'center'; ctx.fillText(this.label, x, y - 20); }
    }
}

let nodes = [];
let connections = [];
let particles = [];
let time = 0;

async function sendData(fromNode, toNode, color = CONFIG.colors.nodeActive, label = '') {
    if (STATE.isFastForwarding) {
        // Instant effect without particle
        if (toNode) toNode.pulse();
        return;
    }
    const p = new Packet(fromNode, toNode, color, 0.04);
    p.label = label;
    particles.push(p);
    while (!p.dead) { await wait(16); }
    if (toNode) toNode.pulse();
}

// --- SCENES & STEPS ---

// Helper to clear everything
function resetCanvas() {
    nodes = [];
    connections = [];
    particles = [];
}

const SCENES = [
    /**
     * SCENE 4.1: Need for Memory
     */
    {
        name: "4.1 Need for Memory",
        setup: () => {
            const input = new Node('i', width * 0.3, height * 0.5, 'Entrada', 'input');
            const hidden = new Node('h', width * 0.5, height * 0.5, 'Cerebro', 'dense');
            const output = new Node('o', width * 0.7, height * 0.5, 'Salida', 'dense');
            nodes = [input, hidden, output];
            connections = [new Connection(input, hidden), new Connection(hidden, output)];
            return { input, hidden, output };
        },
        steps: [
            async (ctx, scope) => {
                await say("Capítulo 4.1: Necesidad de Memoria", "Objetivo: Queremos que la red procese y entienda la frase completa: 'HOLA MUNDO'.");
                if (btnPrev) btnPrev.classList.remove('disabled');
            },
            async (ctx, scope) => {
                const { input, hidden, output } = ctx;
                await say("Paso 1: Procesar 'HOLA'", "En una red clásica, ingresamos la primera palabra 'HOLA'.");
                input.value = "HOLA"; input.color = CONFIG.colors.nodeActive;
                await sendData(input, hidden, CONFIG.colors.nodeActive, "HOLA");
                hidden.color = CONFIG.colors.nodeActive; hidden.value = "HOLA";
                await sendData(hidden, output); output.value = "HOLA";
            },
            async (ctx, scope) => {
                const { input, hidden, output } = ctx;
                await wait(1000);
                await say("Paso 2: Procesar 'MUNDO'", "Ahora ingresamos 'MUNDO'. Observa lo que pasa con 'HOLA'.");
                hidden.value = "";
                await wait(500);
                input.value = "MUNDO"; input.color = CONFIG.colors.gradientBad;
                await sendData(input, hidden, CONFIG.colors.gradientBad, "MUNDO");
                hidden.color = CONFIG.colors.gradientBad; hidden.value = "MUNDO";

                // Propagate
                await sendData(hidden, output, CONFIG.colors.gradientBad);
                output.value = "MUNDO"; output.color = CONFIG.colors.gradientBad;

                await say("¡Problema!", "Al procesar 'MUNDO', la red ha sobreescrito y eliminado 'HOLA'. Ha perdido el contexto.");
            },
            async (ctx, scope) => {
                const { input, hidden, output } = ctx;
                await say("Solución: Usar una RNN", "La RNN añade un bucle para 'reciclar' el pasado.");

                const loop = new Connection(hidden, hidden, 'loop');
                connections.push(loop);
                hidden.type = 'recurrent';
                hidden.color = CONFIG.colors.nodeFill; hidden.value = ""; output.value = ""; input.value = "";
            },
            async (ctx, scope) => {
                const { input, hidden, output } = ctx;
                await say("Con RNN: Paso 1", "Ingresamos 'HOLA'. Se guarda en el estado oculto.");
                input.value = "HOLA"; input.color = CONFIG.colors.nodeActive;
                await sendData(input, hidden, CONFIG.colors.nodeActive, "HOLA");
                hidden.color = CONFIG.colors.nodeActive; hidden.value = "HOLA";

                await say("Conservando Memoria", "El bucle mantiene 'HOLA' vivo mientras esperamos el siguiente dato.");
                // Particle for loop - manual push
                if (!STATE.isFastForwarding) {
                    particles.push(new Packet({ x: hidden.x + 40, y: hidden.y - 40 }, hidden, CONFIG.colors.nodeActive, 0.02));
                }
                await wait(2000);
            },
            async (ctx, scope) => {
                const { input, hidden, output } = ctx;
                await say("Con RNN: Paso 2", "Ingresamos 'MUNDO'. Se combina con el 'HOLA' que viene del bucle.");
                input.value = "MUNDO"; input.color = CONFIG.colors.gradientBad;

                const pIn = new Packet(input, hidden, CONFIG.colors.gradientBad, 0.04);
                pIn.label = "MUNDO";
                if (!STATE.isFastForwarding) {
                    particles.push(pIn);
                    while (!pIn.dead) { await wait(16); }
                }

                hidden.pulse();
                hidden.color = CONFIG.colors.nodeRecurrent;
                hidden.value = "HOLA+MUNDO";
                hidden.targetScale = 1.2;
                await wait(500);
                hidden.targetScale = 1.0;

                await sendData(hidden, output, CONFIG.colors.nodeRecurrent);
                output.value = "FRASE COMPLETA";
                await say("Resultado", "La red ahora contiene ambas palabras en su memoria.");
            }
        ]
    },

    /**
     * SCENE 4.2: Gradient Problem (Feedback)
     */
    {
        name: "4.2 Gradient",
        setup: () => {
            const steps = 4;
            const gap = Math.min(160, width / 5);
            const labels = ["EL", "GATO", "COME", "PEZ"];
            const startX = (width - (steps * gap)) / 2 + 50;
            let chain = [];
            for (let i = 0; i < steps; i++) {
                let n = new Node(i, startX + i * gap, height * 0.4, `t=${i}`, 'recurrent');
                n.value = labels[i]; chain.push(n); nodes.push(n);
                if (i > 0) connections.push(new Connection(chain[i - 1], n));
            }
            return { chain, steps };
        },
        steps: [
            async (ctx, scope) => {
                const { chain, steps } = ctx;
                await say("Capítulo 4.2: Gradiente (Feedback Error)", "Si se crea una RNN que intente predecir la última palabra ('PEZ').");
                let curr = chain[steps - 1];
                curr.subLabel = "Real: PEZ";
                curr.color = CONFIG.colors.nodeRecurrent;
            },
            async (ctx, scope) => {
                const { chain, steps } = ctx;
                let curr = chain[steps - 1];
                await wait(1000);
                await say("¡Error de Predicción!", "Hay casos en los que aunque se procese el contexto, el cálculo puede no ser el correcto, y resulta en una predicción errónea que tiene un contexto similar.");
                curr.value = "PRED: LATA";
                curr.color = CONFIG.colors.gradientBad;
                curr.pulse();
            },
            async (ctx, scope) => {
                const { chain, steps } = ctx;
                let curr = chain[steps - 1];
                await wait(2500);
                await say("Backpropagation (Culpa)", "Para solucionarlo, se envía el error hacia atrás en el tiempo. Se ajustan los pesos para que, la próxima vez, la neurona asocie 'GATO' y 'COME' con 'PEZ' y no con 'LATA'.");

                for (let i = steps - 1; i > 0; i--) {
                    let prev = chain[i - 1];
                    // Only visually animate if not FF
                    if (!STATE.isFastForwarding) {
                        let p = new Packet(curr, prev, CONFIG.colors.gradientBad, 0.03);
                        p.label = "Mal";
                        let intensity = Math.pow(0.5, (steps - 1) - i);
                        p.size = 14 * intensity;
                        p.color = `rgba(248, 113, 113, ${Math.max(0.1, intensity)})`;
                        particles.push(p);
                        while (!p.dead) { await wait(16); }
                    }

                    let intensity = Math.pow(0.5, (steps - 1) - i);
                    if (intensity < 0.25) {
                        prev.color = "#334155";
                        await say("¡Problema!", "La señal de corrección se desvanece (muy debil). El inicio de la frase no aprende.");
                        break;
                    }
                    curr = prev;
                }
            },
            async (ctx, scope) => {
                const { chain, steps } = ctx;
                await wait(2000);
                await say("Solución: LSTM", "Las LSTM tienen una línea de estado de celda (autopista) que permite que la información importante viaje por toda la secuencia sin degradarse.");
                chain.forEach((n, idx) => {
                    n.type = 'lstm'; n.label = 'LSTM'; n.color = '#1e293b';
                    // restore value labels lost if reset? No, they persist.
                });
                // Reset visual of last node
                let curr = chain[steps - 1];
                curr.value = "PRED: LATA"; curr.color = CONFIG.colors.gradientBad;
            },
            async (ctx, scope) => {
                const { chain, steps } = ctx;
                let curr = chain[steps - 1];
                await say("", "Tras predecir 'LATA' en lugar de 'PEZ', la señal de corrección ingresa a la autopista de datos para informar a los estados anteriores sobre el error cometido.");

                for (let i = steps - 1; i > 0; i--) {
                    let prev = chain[i - 1];
                    if (!STATE.isFastForwarding) {
                        let p = new Packet(curr, prev, CONFIG.colors.nodeGate, 0.04);
                        p.size = 12; p.label = "Corregir";
                        particles.push(p);
                        while (!p.dead) { await wait(16); }
                    }
                    curr = prev; curr.pulse(); curr.color = CONFIG.colors.nodeGate;
                }
                await say("Aprendizaje Exitoso", "Todo el contexto ha recibido la señal de corrección.");
            }
        ]
    },

    /**
     * SCENE 4.3: NLP
     */
    {
        name: "4.3 NLP",
        setup: () => {
            const gap = width * 0.25;
            const startX = width * 0.25;
            const wordNode = new Node('w', startX, height * 0.5, 'Texto', 'input'); wordNode.value = "REY";
            const vecNode = new Node('v', startX + gap, height * 0.5, 'Vector', 'dense'); vecNode.subLabel = "[0.9, 0.1, -0.5]";
            const rnnNode = new Node('r', startX + gap * 2, height * 0.5, 'Red', 'recurrent');
            nodes = [wordNode, vecNode, rnnNode];
            connections = [new Connection(wordNode, vecNode), new Connection(vecNode, rnnNode)];
            return { wordNode, vecNode, rnnNode };
        },
        steps: [
            async (ctx, scope) => {
                const { wordNode, vecNode } = ctx;
                await say("Capítulo 4.3: NLP", "Primero se debe hacer la conversión de palabras a números (Embeddings).");
                await sendData(wordNode, vecNode, CONFIG.colors.nodeActive);
                vecNode.pulse(); vecNode.color = CONFIG.colors.nodeGate;
            },
            async (ctx, scope) => {
                const { vecNode, rnnNode } = ctx;
                await say("Matemáticas", "Los embeddings permiten operaciones matemáticas. Por ejemplo: REY - HOMBRE + MUJER = REINA.");
                // Visual effect maybe? Just text is fine for now based on request.
                vecNode.subLabel = "R-H+M = ?";
                await wait(1500);
            },
            async (ctx, scope) => {
                const { vecNode, rnnNode } = ctx;
                vecNode.subLabel = "REINA";
                await say("Embedding", "Ahora la red puede entender el significado matemático (semántico) y procesarlo.");
                await sendData(vecNode, rnnNode, CONFIG.colors.nodeRecurrent);
            }
        ]
    },

    /**
     * SCENE 4.4: Translation
     */
    {
        name: "4.4 Translation",
        setup: () => {
            // Setup for "HOLA MUNDO" -> "HELLO WORLD"
            const enc1 = new Node('e1', width * 0.1, height * 0.6, 'HOLA', 'recurrent');
            const enc2 = new Node('e2', width * 0.2, height * 0.6, 'MUNDO', 'recurrent');
            const ctxNode = new Node('ctx', width * 0.35, height * 0.5, 'Contexto', 'lstm');
            const dec1 = new Node('d1', width * 0.5, height * 0.4, '', 'recurrent'); dec1.targetScale = 0;
            const dec2 = new Node('d2', width * 0.65, height * 0.4, '', 'recurrent'); dec2.targetScale = 0;
            nodes = [enc1, enc2, ctxNode, dec1, dec2];
            connections = [new Connection(enc1, enc2), new Connection(enc2, ctxNode)];
            return { enc1, enc2, ctxNode, dec1, dec2 };
        },
        steps: [
            async (ctx, scope) => {
                const { enc1, enc2 } = ctx;
                await say("Capítulo 4.4: Traducción", "Vamos a traducir 'HOLA MUNDO' del Español al Inglés.");
                enc1.color = CONFIG.colors.nodeActive;
                enc2.color = CONFIG.colors.nodeActive;
            },
            async (ctx, scope) => {
                await say("Detección de Idioma", "La red analiza la estructura de entrada...");
                await wait(1000);
                // Simulate detection
                if (uiTitle) uiTitle.innerText = "Idioma Detectado: Español (ES)";
                await wait(2000);
            },
            async (ctx, scope) => {
                const { enc1, enc2, ctxNode } = ctx;
                await say("Encoder", "El encoder comprime 'HOLA MUNDO' en un vector de pensamiento (Contexto).");
                await sendData(enc1, enc2); await sendData(enc2, ctxNode);
                ctxNode.color = CONFIG.colors.nodeRecurrent; ctxNode.value = "{SALUDO GLOBAL}"; ctxNode.targetScale = 1.4;
                await wait(1000);
            },
            async (ctx, scope) => {
                const { ctxNode, dec1 } = ctx;
                await say("Decoder: Paso 1", "El Decoder recibe el contexto y genera la primera palabra en Inglés.");
                dec1.targetScale = 1;
                connections.push(new Connection(ctxNode, dec1));
                await sendData(ctxNode, dec1, CONFIG.colors.nodeRecurrent);
                dec1.value = "HELLO"; dec1.pulse();
            },
            async (ctx, scope) => {
                const { dec1, dec2 } = ctx;
                await say("Decoder: Paso 2", "Usa 'HELLO' y el contexto para predecir la siguiente.");
                dec2.targetScale = 1;
                let arConn = new Connection(dec1, dec2, 'autoregressive'); arConn.dashed = true; connections.push(arConn);

                if (!STATE.isFastForwarding) {
                    let p = new Packet(dec1, dec2, CONFIG.colors.nodeGate, 0.03);
                    p.label = "Next";
                    const start = { x: dec1.x, y: dec1.y }; const end = { x: dec2.x, y: dec2.y };
                    const ctrl1 = { x: start.x, y: start.y + 120 }; const ctrl2 = { x: end.x, y: end.y + 120 };
                    p.draw = function (ctx) {
                        const t = this.progress;
                        const x = (1 - t) ** 3 * start.x + 3 * (1 - t) ** 2 * t * ctrl1.x + 3 * (1 - t) * t ** 2 * ctrl2.x + t ** 3 * end.x;
                        const y = (1 - t) ** 3 * start.y + 3 * (1 - t) ** 2 * t * ctrl1.y + 3 * (1 - t) * t ** 2 * ctrl2.y + t ** 3 * end.y;
                        ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fillStyle = this.color; ctx.fill();
                    }
                    particles.push(p);
                    while (!p.dead) { await wait(16); }
                }
                dec2.value = "WORLD"; dec2.pulse();
                await say("Traducción Completa", "HOLA MUNDO -> HELLO WORLD");
            }
        ]
    }
];

// --- Main Engine ---

async function playStep(sceneIdx, stepIdx) {
    // 1. Reset everything
    resetCanvas();
    const scene = SCENES[sceneIdx];

    // 2. Setup Context
    const ctx = scene.setup();

    // 3. Fast Forward previous steps
    STATE.isFastForwarding = true;
    for (let i = 0; i < stepIdx; i++) {
        await scene.steps[i](ctx);
    }
    STATE.isFastForwarding = false;

    // 4. Play current step
    // Clear any leftover particles from fast forward? They basically die instantly in FF.
    particles = [];
    // We update UI normally now
    await scene.steps[stepIdx](ctx);
}

async function runLoop() {
    if (uiTitle) uiTitle.innerText = "Cargando...";
    await wait(1000);

    // Init Sidebar
    initSidebar();

    while (true) {
        // UI Controls State
        if (btnPrev) {
            const canGoBack = (STATE.sceneIndex > 0 || STATE.stepIndex > 0);
            if (canGoBack) btnPrev.classList.remove('disabled');
            else btnPrev.classList.add('disabled');
        }

        // Update Sidebar Active State
        document.querySelectorAll('.chapter-btn').forEach((btn, idx) => {
            if (idx === STATE.sceneIndex) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        try {
            await playStep(STATE.sceneIndex, STATE.stepIndex);

            // Auto-advance logic
            STATE.stepIndex++;
            if (STATE.stepIndex >= SCENES[STATE.sceneIndex].steps.length) {
                // End of scene, wait 1s as requested
                await wait(1000);

                STATE.sceneIndex = (STATE.sceneIndex + 1) % SCENES.length;
                STATE.stepIndex = 0;

                // Check if we looped back to start
                if (STATE.sceneIndex === 0) {
                    await say("Fin del Capítulo", "Volviendo al inicio...");
                    await wait(2000);
                }
            }
        } catch (e) {
            if (e.name === "NavigationError") {
                if (e.message === 'next') {
                    // Force complete current step logic is hard, so we just advance index.
                    STATE.stepIndex++;
                    if (STATE.stepIndex >= SCENES[STATE.sceneIndex].steps.length) {
                        // End of scene via button text
                        STATE.sceneIndex = (STATE.sceneIndex + 1) % SCENES.length;
                        STATE.stepIndex = 0;
                        if (STATE.sceneIndex === 0) {
                            await say("Fin del Capítulo", "Volviendo al inicio...");
                            await wait(2000);
                        }
                    }
                } else if (e.message === 'prev') {
                    // Logic: Go to previous step.
                    if (STATE.stepIndex > 0) {
                        STATE.stepIndex--;
                    } else {
                        // Go to previous scene
                        if (STATE.sceneIndex > 0) {
                            STATE.sceneIndex--;
                            STATE.stepIndex = SCENES[STATE.sceneIndex].steps.length - 1;
                        } else {
                            // Loop to end? Or stay at start?
                            // Stay at start for safety as requested "don't wrap to end" earlier
                            STATE.sceneIndex = 0;
                            STATE.stepIndex = 0;
                        }
                    }
                } else if (e.message === 'jump') {
                    // Jump to specific scene
                    if (STATE.nextSceneIndex !== null) {
                        STATE.sceneIndex = STATE.nextSceneIndex;
                        STATE.stepIndex = 0;
                        STATE.nextSceneIndex = null;
                        STATE.skipWait = false; // Reset skip wait if jump
                    }
                }
                // Short pause before restart to let UI settle
                STATE.skipWait = false;
                await new Promise(r => setTimeout(r, 50));
            } else {
                console.error(e);
                if (uiTitle) uiTitle.innerText = "Error: " + e.message;
                await new Promise(r => setTimeout(r, 5000));
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.beginPath();
    for (let x = 0; x < width; x += 60) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
    for (let y = 0; y < height; y += 60) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
    ctx.stroke();
    connections.forEach(c => c.draw(ctx));
    nodes.forEach(n => { n.update(); n.draw(ctx); });
    particles.forEach(p => { p.update(); p.draw(ctx); });
    particles = particles.filter(p => !p.dead);
    time++;
    requestAnimationFrame(animate);
}

// Start
animate();
runLoop();
