/**
 * Python Showcase Script
 * Handles automated animations for the 5 split-view sections.
 */

/* --- UTILS --- */
function setupCanvas(id) {
    const canvas = document.getElementById(id);
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    return { canvas, ctx, width: rect.width, height: rect.height };
}

/* --- 2.1 Engineering: Network Graph --- */
const vizEngineering = {
    canvasId: 'canvas-engineering',
    ctx: null, width: 0, height: 0, active: false,
    nodes: [], lines: [],

    init() {
        const setup = setupCanvas(this.canvasId);
        this.ctx = setup.ctx;
        this.width = setup.width;
        this.height = setup.height;
        this.generateGraph();
        this.animate();
    },

    generateGraph() {
        // Architecture from Python Code (3 -> 8 -> 8 -> 8 -> 2)
        const layers = [3, 8, 8, 8, 2];
        const layerGap = this.width / (layers.length + 1);

        this.nodes = [];
        this.lines = [];

        // Generate Nodes
        layers.forEach((count, lIdx) => {
            const x = layerGap * (lIdx + 1);
            const vGap = this.height / (count + 1);
            const layerNodes = [];
            for (let i = 0; i < count; i++) {
                layerNodes.push({ x, y: vGap * (i + 1) });
            }
            this.nodes.push(layerNodes);
        });

        // Generate Lines (fully connected)
        for (let l = 0; l < this.nodes.length - 1; l++) {
            this.nodes[l].forEach(src => {
                this.nodes[l + 1].forEach(dst => {
                    this.lines.push({
                        x1: src.x, y1: src.y,
                        x2: dst.x, y2: dst.y,
                        alpha: Math.random() * 0.5 // Random initial weight viz
                    });
                });
            });
        }
    },

    animate() {
        const ctx = this.ctx;
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw Lines (pulse effect)
        const time = Date.now() * 0.002;
        this.lines.forEach(l => {
            ctx.beginPath();
            // Subtle pulsing alpha
            const alpha = 0.1 + Math.abs(Math.sin(time + l.alpha * 10)) * 0.2;
            ctx.strokeStyle = `rgba(88, 166, 255, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(l.x1, l.y1);
            ctx.lineTo(l.x2, l.y2);
            ctx.stroke();
        });

        // Draw Nodes
        this.nodes.flat().forEach(n => {
            ctx.beginPath();
            ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#58a6ff';
            ctx.fill();
        });

        requestAnimationFrame(this.animate.bind(this));
    }
};

/* --- 2.2 Training: Loss Curve --- */
const vizTraining = {
    canvasId: 'canvas-training',
    ctx: null, width: 0, height: 0,
    history: [], maxEpochs: 100, currentEpoch: 0,
    statEl: document.getElementById('train-stat'),

    init() {
        const setup = setupCanvas(this.canvasId);
        this.ctx = setup.ctx;
        this.width = setup.width;
        this.height = setup.height;
        this.restart();
        this.animate();
    },

    restart() {
        this.history = [];
        this.currentEpoch = 0;
    },

    animate() {
        if (this.currentEpoch < this.maxEpochs) {
            this.currentEpoch++;
            // Simulate Loss: Decay with some noise
            const loss = 2.0 * Math.exp(-0.05 * this.currentEpoch) + (Math.random() * 0.1);
            this.history.push(loss);

            // Update Stat
            this.statEl.textContent = `Epoch: ${this.currentEpoch} | Loss: ${loss.toFixed(4)}`;
        } else {
            // Auto restart loop after pause
            if (Math.random() < 0.01) this.restart();
        }

        const ctx = this.ctx;
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw Axes
        ctx.strokeStyle = '#30363d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(40, 20); ctx.lineTo(40, this.height - 30);
        ctx.lineTo(this.width - 20, this.height - 30);
        ctx.stroke();

        // Draw Curve
        if (this.history.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = '#238636'; // Green line
            ctx.lineWidth = 3;

            const stepX = (this.width - 60) / this.maxEpochs;
            const maxY = 2.5; // Scale
            const scaleY = (this.height - 50) / maxY;

            this.history.forEach((val, idx) => {
                const x = 40 + (idx * stepX);
                const y = (this.height - 30) - (val * scaleY);
                if (idx === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
        }

        requestAnimationFrame(this.animate.bind(this));
    }
};

/* --- 2.3 Optimization: Grid Search Heatmap --- */
const vizOptimization = {
    canvasId: 'canvas-optimization',
    ctx: null, width: 0, height: 0,
    grid: [], rows: 8, cols: 8, timer: 0,

    init() {
        const setup = setupCanvas(this.canvasId);
        this.ctx = setup.ctx;
        this.width = setup.width;
        this.height = setup.height;
        this.resetGrid();
        this.animate();
    },

    resetGrid() {
        this.grid = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                // Peak at center
                const dx = c - 4; const dy = r - 4;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const score = 1.0 / (1 + dist); // Higher is better
                this.grid.push({
                    x: c, y: r, score: score,
                    scanned: false
                });
            }
        }
        this.timer = 0;
    },

    animate() {
        this.timer++;

        // Scan one cell every few frames
        if (this.timer % 5 === 0) {
            const unscanned = this.grid.filter(c => !c.scanned);
            if (unscanned.length > 0) {
                // Grid Search order: simple shift
                unscanned[0].scanned = true;
            } else {
                if (this.timer % 200 === 0) this.resetGrid();
            }
        }

        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        const cellW = (this.width - 20) / this.cols;
        const cellH = (this.height - 20) / this.rows;

        // Draw Grid
        this.grid.forEach(cell => {
            const px = 10 + cell.x * cellW;
            const py = 10 + cell.y * cellH;

            if (cell.scanned) {
                // Color map: Blue (bad) -> Green (Good)
                // score 0..1
                // We'll mimic a heatmap
                const g = Math.floor(cell.score * 255);
                ctx.fillStyle = `rgba(0, ${g}, ${200 - g}, 0.8)`;
                ctx.fillRect(px, py, cellW - 2, cellH - 2);
            } else {
                ctx.strokeStyle = '#30363d';
                ctx.strokeRect(px, py, cellW - 2, cellH - 2);
            }
        });

        requestAnimationFrame(this.animate.bind(this));
    }
};

/* --- 2.4 Diagnostics: Confusion Matrix & Charts --- */
const vizDiagnostics = {
    canvasId: 'canvas-diagnostics',
    ctx: null, width: 0, height: 0,

    init() {
        const setup = setupCanvas(this.canvasId);
        this.ctx = setup.ctx;
        this.width = setup.width;
        this.height = setup.height;
        this.animate();
    },

    animate() {
        // Draw Static but nice looking charts
        const ctx = this.ctx;
        ctx.fillStyle = '#161b22';
        ctx.fillRect(0, 0, this.width, this.height);

        // Matrix (Left side)
        const mw = this.width * 0.4;
        const mh = this.height * 0.6;
        const mx = 20;
        const my = (this.height - mh) / 2;

        ctx.fillStyle = '#0d4429'; // TP Green
        ctx.fillRect(mx, my, mw / 2, mh / 2);
        ctx.fillStyle = '#fff'; ctx.fillText("TP", mx + 10, my + 20);

        ctx.fillStyle = '#5a1e02'; // FP Red
        ctx.fillRect(mx + mw / 2, my, mw / 2, mh / 2);
        ctx.fillStyle = '#fff'; ctx.fillText("FP", mx + mw / 2 + 10, my + 20);

        ctx.fillStyle = '#0d1117'; // FN
        ctx.fillRect(mx, my + mh / 2, mw / 2, mh / 2);
        ctx.strokeStyle = '#30363d'; ctx.strokeRect(mx, my + mh / 2, mw / 2, mh / 2);

        ctx.fillStyle = '#0d4429'; // TN
        ctx.fillRect(mx + mw / 2, my + mh / 2, mw / 2, mh / 2);

        // Line Chart (Right Side)
        const cx = this.width * 0.55;
        const cy = 30;
        const cw = this.width * 0.4;
        const ch = this.height - 60;

        // Axis
        ctx.beginPath(); ctx.strokeStyle = '#8b949e';
        ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + ch); ctx.lineTo(cx + cw, cy + ch);
        ctx.stroke();

        // Lines
        const time = Date.now() * 0.001;
        ctx.beginPath();
        for (let i = 0; i <= 10; i++) {
            const x = cx + (i / 10) * cw;
            // Wobbly line
            const y = (cy + ch) - ((1 - Math.exp(-i * 0.5)) * ch * 0.8 + Math.sin(time + i) * 5);
            if (i == 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#58a6ff'; ctx.lineWidth = 2; ctx.stroke();

        requestAnimationFrame(this.animate.bind(this));
    }
};

/* --- 2.5 Regularization: Dropout Visual --- */
const vizRegularization = {
    canvasId: 'canvas-regularization',
    ctx: null, width: 0, height: 0,
    nodes: [],

    init() {
        const setup = setupCanvas(this.canvasId);
        this.ctx = setup.ctx;
        this.width = setup.width;
        this.height = setup.height;

        // 5x5 Grid of nodes
        const gap = this.width / 6;
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                this.nodes.push({
                    x: gap * (c + 1), y: gap * (r + 1),
                    active: true,
                    nextToggle: Math.random() * 100
                });
            }
        }
        this.animate();
    },

    animate() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // Update Nodes
        this.nodes.forEach(n => {
            n.nextToggle--;
            if (n.nextToggle <= 0) {
                n.active = !n.active;
                n.nextToggle = 20 + Math.random() * 50; // frames
            }
        });

        // Draw connections (only if both active)
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = 'rgba(88, 166, 255, 0.2)';

        // Simple mesh connections
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const n1 = this.nodes[i];
                const n2 = this.nodes[j];
                const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
                if (dist < this.width / 5) { // close neighbors
                    // If dropout, line disappears if node inactive
                    if (n1.active && n2.active) {
                        ctx.beginPath();
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(n2.x, n2.y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Draw Nodes
        this.nodes.forEach(n => {
            ctx.beginPath();
            ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = n.active ? '#58a6ff' : '#21262d'; // Blue or Dark Grey
            ctx.fill();
        });

        requestAnimationFrame(this.animate.bind(this));
    }
};

/* --- LAUNCH --- */
window.onload = () => {
    vizEngineering.init();
    vizTraining.init();
    vizOptimization.init();
    vizDiagnostics.init();
    vizRegularization.init();
};
