/**
 * CNN Visual Project - script.js
 * PURE VISUAL MODE: No user interactions, automatic loops.
 */

// --- UTILS ---
const Utils = {
    // Generate a random pixel grid
    createGrid: (size) => {
        const grid = [];
        for (let i = 0; i < size; i++) {
            const row = [];
            for (let j = 0; j < size; j++) {
                row.push(Math.random());
            }
            grid.push(row);
        }
        return grid;
    },

    // Create shaped grids
    createShape: (type, size = 10) => {
        const grid = Array(size).fill(0).map(() => Array(size).fill(0));
        if (type === 'x') {
            for (let i = 1; i < size - 1; i++) {
                grid[i][i] = 1; grid[i][size - 1 - i] = 1;
            }
        } else if (type === 'l') {
            for (let i = 1; i < size - 1; i++) grid[i][1] = 1;
            for (let j = 1; j < size - 1; j++) grid[size - 2][j] = 1;
        } else if (type === 'o') {
            for (let i = 2; i < size - 2; i++) {
                grid[i][2] = 1; grid[i][size - 3] = 1;
                grid[2][i] = 1; grid[size - 3][i] = 1;
            }
        }
        return grid;
    },

    // Draw grid to canvas with HIGH VISIBILITY
    drawGrid: (ctx, grid, offsetX, offsetY, cellSize, highlight = null) => {
        const rows = grid.length;
        const cols = grid[0].length;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const val = grid[i][j];
                const x = offsetX + j * cellSize;
                const y = offsetY + i * cellSize;

                // VISIBILITY FIX: Base cell color is dark gray (#333) not black
                // Active pixels are white/bright blue
                const intensity = Math.floor(val * 200);
                // Bg for empty cells
                ctx.fillStyle = '#222';
                ctx.fillRect(x, y, cellSize - 1, cellSize - 1);

                // Draw content on top if > 0
                if (val > 0.1) {
                    const c = 55 + intensity; // range 55-255
                    ctx.fillStyle = `rgb(${c}, ${c}, ${c})`;
                    ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
                }

                // Highlight border if active
                if (highlight && i >= highlight.r && i < highlight.r + highlight.h &&
                    j >= highlight.c && j < highlight.c + highlight.w) {
                    ctx.strokeStyle = '#60a5fa'; // Bright Blue Highlight
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x, y, cellSize - 1, cellSize - 1);
                }
            }
        }
    }
};

// --- SECTION 3.1: FUNDAMENTALS ---
class SectionFundamentals {
    constructor() {
        this.denseCanvas = document.getElementById('canvas-dense');
        this.cnnCanvas = document.getElementById('canvas-cnn');
        this.init();
    }

    init() {
        this.setupCanvas(this.denseCanvas);
        this.setupCanvas(this.cnnCanvas);
        this.drawDense(this.denseCanvas);
        this.drawCNN(this.cnnCanvas);
    }

    setupCanvas(canvas) {
        canvas.width = 300;
        canvas.height = 200;
    }

    drawDense(canvas) {
        const ctx = canvas.getContext('2d');
        const inputNodes = [{ x: 50, y: 40 }, { x: 50, y: 80 }, { x: 50, y: 120 }, { x: 50, y: 160 }];
        const hiddenNodes = [{ x: 250, y: 60 }, { x: 250, y: 100 }, { x: 250, y: 140 }];

        // Brighter connections
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;

        inputNodes.forEach(src => {
            hiddenNodes.forEach(dst => {
                ctx.beginPath();
                ctx.moveTo(src.x, src.y);
                ctx.lineTo(dst.x, dst.y);
                ctx.stroke();
            });
        });

        this.drawNodes(ctx, inputNodes, '#60a5fa');
        this.drawNodes(ctx, hiddenNodes, '#34d399');
    }

    drawCNN(canvas) {
        const ctx = canvas.getContext('2d');
        const size = 20;
        const startX = 40;
        const startY = 60;

        // Input Grid
        ctx.fillStyle = '#333';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                ctx.fillRect(startX + j * size, startY + i * size, size - 1, size - 1);
            }
        }

        const dest = { x: 240, y: 100 };

        // Visibility Fix: Brighter Cone
        ctx.fillStyle = 'rgba(96, 165, 250, 0.2)';
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + 4 * size, startY);
        ctx.lineTo(dest.x, dest.y);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(startX, startY + 4 * size);
        ctx.lineTo(startX + 4 * size, startY + 4 * size);
        ctx.lineTo(dest.x, dest.y);
        ctx.fill();

        this.drawNodes(ctx, [dest], '#34d399');
    }

    drawNodes(ctx, nodes, color) {
        ctx.fillStyle = color;
        nodes.forEach(n => {
            ctx.beginPath();
            ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
            ctx.fill();
            // Glow
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    }
}

// --- SECTION 3.2: CONVOLUTION (AUTO LOOP) ---
class SectionConvolution {
    constructor() {
        this.canvas = document.getElementById('canvas-conv');
        this.ctx = this.canvas.getContext('2d');
        this.imageSize = 7;
        this.grid = Utils.createGrid(this.imageSize);
        this.kernelSize = 3;

        this.canvas.width = 500;
        this.canvas.height = 300;

        // Start Loop
        this.loop();
    }

    async loop() {
        while (true) {
            const outSize = this.imageSize - this.kernelSize + 1;

            // Animate scan
            for (let i = 0; i < outSize; i++) {
                for (let j = 0; j < outSize; j++) {
                    this.render({ r: i, c: j });
                    await new Promise(r => setTimeout(r, 600)); // Speed
                }
            }
            // Pause at end
            await new Promise(r => setTimeout(r, 1500));
        }
    }

    render(highlightPos = null) {
        this.ctx.fillStyle = '#050505'; // Clear with BG color
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const cellSize = 28;

        // Labels
        this.ctx.fillStyle = '#fff';
        this.ctx.font = "14px Inter";
        this.ctx.fillText("Entrada", 20, 25);

        // Input Grid
        Utils.drawGrid(this.ctx, this.grid, 20, 40, cellSize, highlightPos
            ? { r: highlightPos.r, c: highlightPos.c, h: this.kernelSize, w: this.kernelSize }
            : null);

        // Kernel lines
        if (highlightPos) {
            const kX = 20 + highlightPos.c * cellSize + (this.kernelSize * cellSize) / 2;
            const kY = 40 + highlightPos.r * cellSize + (this.kernelSize * cellSize) / 2;
            const targetX = 320 + highlightPos.c * cellSize + cellSize / 2;
            const targetY = 40 + highlightPos.r * cellSize + cellSize / 2;

            this.ctx.strokeStyle = '#60a5fa';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(kX, kY);
            this.ctx.lineTo(targetX, targetY);
            this.ctx.stroke();
        }

        // Output Grid
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText("Mapa de Características", 320, 25);
        const outSize = this.imageSize - this.kernelSize + 1;

        // Draw Output background slots
        for (let i = 0; i < outSize; i++) {
            for (let j = 0; j < outSize; j++) {
                const ox = 320 + j * cellSize;
                const oy = 40 + i * cellSize;
                this.ctx.strokeStyle = '#333';
                this.ctx.strokeRect(ox, oy, cellSize, cellSize);

                // Fill if passed
                if (highlightPos && (i < highlightPos.r || (i === highlightPos.r && j <= highlightPos.c))) {
                    this.ctx.fillStyle = 'rgba(96, 165, 250, 0.8)';
                    this.ctx.fillRect(ox + 1, oy + 1, cellSize - 2, cellSize - 2);
                }
            }
        }
    }
}

// --- SECTION 3.3: POOLING (AUTO LOOP) ---
class SectionPooling {
    constructor() {
        this.ctxPool = document.getElementById('canvas-pooling').getContext('2d');
        this.ctxFlat = document.getElementById('canvas-flatten').getContext('2d');

        document.getElementById('canvas-pooling').width = 200;
        document.getElementById('canvas-pooling').height = 200;
        document.getElementById('canvas-flatten').width = 200;
        document.getElementById('canvas-flatten').height = 200;

        this.gridSize = 4;
        this.grid = Utils.createGrid(this.gridSize);
        this.step = 0;

        this.loop();
    }

    async loop() {
        while (true) {
            this.step = 0;
            // 4 Steps of pooling
            for (let i = 0; i < 4; i++) {
                this.render();
                await new Promise(r => setTimeout(r, 1000));
                this.step++;
            }
            // Pause fully flattened
            this.render();
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    render() {
        // Pooling Grid
        this.ctxPool.clearRect(0, 0, 200, 200);
        this.ctxFlat.clearRect(0, 0, 200, 200);

        Utils.drawGrid(this.ctxPool, this.grid, 10, 10, 40);

        // Flatten Placeholder
        this.ctxFlat.fillStyle = 'transparent';
        this.ctxFlat.strokeStyle = '#333';
        for (let i = 0; i < 4; i++) {
            this.ctxFlat.strokeRect(80, 10 + i * 40, 40, 40);
        }

        // Draw logic based on current step
        if (this.step < 4) {
            const regionSize = 2;
            const r = Math.floor(this.step / 2) * regionSize;
            const c = (this.step % 2) * regionSize;

            // Highlight Pool
            this.ctxPool.strokeStyle = '#f87171'; // Red
            this.ctxPool.lineWidth = 3;
            this.ctxPool.strokeRect(10 + c * 40, 10 + r * 40, 80, 80);

            // Fill Flatten up to current step
            for (let k = 0; k <= this.step; k++) {
                this.ctxFlat.fillStyle = '#f87171';
                this.ctxFlat.fillRect(80, 10 + k * 40, 40, 40);
                this.ctxFlat.fillStyle = '#fff';
                this.ctxFlat.font = "bold 14px Inter";
                this.ctxFlat.fillText("MAX", 85, 35 + k * 40);
            }
        }
    }
}

// --- SECTION 3.4: CASE STUDY (AUTO LOOP) ---
class SectionCaseStudy {
    constructor() {
        this.canvasInput = document.getElementById('canvas-case-input');
        this.canvasFilters = document.getElementById('canvas-case-filters');
        this.predOutput = document.getElementById('prediction-output');
        this.label = document.getElementById('current-shape-label');

        this.ctxInput = this.canvasInput.getContext('2d');
        this.ctxFilters = this.canvasFilters.getContext('2d');

        this.shapes = ['x', 'l', 'o'];
        this.currentIdx = 0;

        this.loop();
    }

    async loop() {
        while (true) {
            const shape = this.shapes[this.currentIdx];
            this.label.innerText = shape.toUpperCase();
            this.simulate(shape);

            this.currentIdx = (this.currentIdx + 1) % this.shapes.length;
            await new Promise(r => setTimeout(r, 4000)); // Change every 4s
        }
    }

    simulate(shapeType) {
        // 1. Generate Input
        const grid = Utils.createShape(shapeType, 10);
        this.ctxInput.clearRect(0, 0, 60, 60);
        Utils.drawGrid(this.ctxInput, grid, 0, 0, 6);

        // 2. Filters
        this.ctxFilters.clearRect(0, 0, 100, 60);
        // Animate simulated filters appearing
        setTimeout(() => {
            for (let i = 0; i < 3; i++) {
                const opacity = Math.random() * 0.6 + 0.4;
                this.ctxFilters.fillStyle = `rgba(96, 165, 250, ${opacity})`;
                this.ctxFilters.fillRect(10 + i * 30, 10, 20, 40);
            }
        }, 500);

        // 3. Bars
        let probs = { x: 0.1, o: 0.1, l: 0.1 };
        probs[shapeType] = 0.95; // High confidence

        setTimeout(() => this.updateBars(probs), 1000);
    }

    updateBars(probs) {
        const labels = ['X', 'O', 'L'];
        const keys = ['x', 'o', 'l'];

        this.predOutput.innerHTML = '';

        keys.forEach((k, i) => {
            const p = probs[k];
            const width = Math.round(p * 100);
            const color = (width > 80) ? 'var(--success)' : '#444';

            const html = `
                <div class="bar-container">
                    <div class="bar-label">${labels[i]}</div>
                    <div class="bar-fill" style="width: 0%"></div>
                    <div class="pct" style="margin-left: 10px; font-size: 0.8rem; color: #888">0%</div>
                </div>
            `;
            const el = document.createElement('div');
            el.innerHTML = html;
            this.predOutput.appendChild(el.firstElementChild);

            // Animate fill
            setTimeout(() => {
                const fill = this.predOutput.children[i].querySelector('.bar-fill');
                const text = this.predOutput.children[i].querySelector('.pct');
                fill.style.width = `${width}%`;
                fill.style.background = color;
                text.innerText = `${width}%`;
            }, 100);
        });
    }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    new SectionFundamentals();
    new SectionConvolution();
    new SectionPooling();
    new SectionCaseStudy();

    // Quick restart button
    document.getElementById('btn-restart').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
