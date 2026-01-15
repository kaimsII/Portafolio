/**
 * Chapter 5: Complex Data Visualizer
 * Vanilla JS Implementation
 */

// --- 5.1 Text Mining Visualizer ---
class TextMiningVisualizer {
    constructor() {
        this.container = document.getElementById('text-flow-container');
        // Clear existing structure to rebuild for better layout
        this.container.innerHTML = `
            <div class="mining-stage" id="stage-input">
                <div class="stage-label">1. Entrada de Texto</div>
                <div id="raw-text-display">Esperando datos...</div>
            </div>
            <div class="process-arrow">⬇ Tokenización y Limpieza ⬇</div>
            <div class="mining-stage" id="stage-process">
                <div class="stage-label">2. Procesamiento (Palabra por palabra)</div>
                <div id="token-display-area"></div>
                <div id="mining-status">Iniciando...</div>
            </div>
            <div class="process-arrow">⬇ Extracción de Características ⬇</div>
            <div class="mining-stage" id="stage-output">
                <div class="stage-label">3. Frecuencia de Términos (Conocimiento Estructurado)</div>
                <div id="bag-of-words-chart"></div>
            </div>
        `;

        this.rawDisplay = document.getElementById('raw-text-display');
        this.tokenArea = document.getElementById('token-display-area');
        this.statusLabel = document.getElementById('mining-status');
        this.chartContainer = document.getElementById('bag-of-words-chart');

        this.sentences = [
            "El aprendizaje profundo es genial",
            "El aprendizaje automático usa datos",
            "Datos y más datos son necesarios",
            "Genial es el aprendizaje profundo"
        ];

        // Stop words in Spanish
        this.stopWords = ["el", "la", "es", "y", "son", "usa", "los", "las", "un", "una", "de", "en", "más"];
        this.wordCounts = {};

        this.init();
    }

    init() {
        this.startLoop();
    }

    async startLoop() {
        let sentenceIdx = 0;
        while (true) {
            const sentence = this.sentences[sentenceIdx % this.sentences.length];
            sentenceIdx++;

            // Step 1: Show Raw Text
            this.updateStatus("Recibiendo texto crudo...");
            this.rawDisplay.textContent = `"${sentence}"`;
            this.rawDisplay.style.opacity = 1;

            // Clear previous tokens processing area but KEEP chart accumulating (or clear it if user wants loop)
            // Let's keep chart accumulating for a loop cycle, then reset.
            if (sentenceIdx % this.sentences.length === 1 && sentenceIdx > 1) {
                // await this.wait(2000);
                // this.wordCounts = {};
                // this.chartContainer.innerHTML = '';
            }
            this.tokenArea.innerHTML = '';

            await this.wait(1500);

            // Step 2: Tokenize and Filter
            const words = sentence.toLowerCase().split(/\s+/);

            for (let word of words) {
                // Create token element
                const token = document.createElement('span');
                token.className = 'mining-token';
                token.textContent = word;
                this.tokenArea.appendChild(token);

                // Animate appearance
                await this.wait(100);
                token.classList.add('visible');

                // Analyze
                await this.wait(800);

                if (this.stopWords.includes(word)) {
                    // Stop Word Case
                    this.updateStatus(`"${word}" es irrelevante (Stop Word). Eliminando...`);
                    token.classList.add('rejected');
                    await this.wait(800);
                    token.style.opacity = 0; // Fade out
                    token.style.transform = 'scale(0)';
                } else {
                    // Content Word Case
                    this.updateStatus(`"${word}" es clave. Agregando al conteo...`);
                    token.classList.add('accepted');
                    await this.wait(800);

                    // "Fly" effect to chart (visual cue)
                    token.style.transform = 'translateY(20px) scale(1.1)';
                    token.style.opacity = 0;

                    this.updateChart(word);
                }
                await this.wait(400);
            }

            this.updateStatus("Oración procesada. Esperando siguiente entrada...");
            await this.wait(2000);
        }
    }

    updateChart(word) {
        if (!this.wordCounts[word]) this.wordCounts[word] = 0;
        this.wordCounts[word]++;

        // Render Chart sorted by count
        this.chartContainer.innerHTML = '';
        const maxCount = Math.max(...Object.values(this.wordCounts));

        // Sort entries
        const sortedEntries = Object.entries(this.wordCounts).sort((a, b) => b[1] - a[1]); // Descending

        for (let [w, count] of sortedEntries) {
            const barCont = document.createElement('div');
            barCont.className = 'bar-container';

            const barWrapper = document.createElement('div');
            // barWrapper.style.height = '100px';
            barWrapper.style.flex = '1';
            barWrapper.style.display = 'flex';
            barWrapper.style.alignItems = 'flex-end';
            barWrapper.style.width = '100%';
            barWrapper.style.justifyContent = 'center';

            const bar = document.createElement('div');
            bar.className = 'bar';
            // Scale height
            const height = (count / maxCount) * 100;
            bar.style.height = `${height}%`;

            // Color mapping based on count intensity
            const intensity = 0.5 + (count / 10) * 0.5;
            bar.style.backgroundColor = `rgba(76, 201, 240, ${intensity > 1 ? 1 : intensity})`;

            const label = document.createElement('div');
            label.className = 'bar-label';
            label.textContent = w;

            const countLabel = document.createElement('div');
            countLabel.className = 'count-label';
            countLabel.textContent = count;
            countLabel.style.fontSize = '0.7rem';
            countLabel.style.marginBottom = '2px';

            barWrapper.appendChild(bar);
            barCont.appendChild(countLabel);
            barCont.appendChild(barWrapper);
            barCont.appendChild(label);

            this.chartContainer.appendChild(barCont);
        }
    }

    updateStatus(msg) {
        this.statusLabel.textContent = msg;
        this.statusLabel.style.animation = 'none';
        this.statusLabel.offsetHeight; /* trigger reflow */
        this.statusLabel.style.animation = 'fadeIn 0.3s ease';
    }

    wait(ms) { return new Promise(r => setTimeout(r, ms)); }
}

// --- 5.2 Graph Visualizer ---
class GraphVisualizer {
    constructor() {
        this.canvas = document.getElementById('graphCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.edges = [];
        this.width = this.canvas.offsetWidth;
        this.height = this.canvas.offsetHeight;

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.isDirect = true; // Directed graph by default

        // Init Graph Data
        this.initGraph(15);
        this.animate();
    }

    initGraph(count) {
        this.nodes = [];
        this.edges = [];
        for (let i = 0; i < count; i++) {
            this.nodes.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: 5 + Math.random() * 5,
                color: '#4cc9f0',
                id: i,
                isCentral: false
            });
        }

        // Create edges randomly
        this.nodes.forEach(node => {
            const connections = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < connections; j++) {
                const target = this.nodes[Math.floor(Math.random() * count)];
                if (target !== node) {
                    this.edges.push({ source: node, target: target });
                }
            }
        });
    }

    toggleDirect() {
        this.isDirect = !this.isDirect;
    }

    findCentral() {
        // Simple degree centrality
        const degrees = new Array(this.nodes.length).fill(0);
        this.edges.forEach(e => {
            degrees[e.source.id]++;
            degrees[e.target.id]++;
        });

        let maxDegree = -1;
        let maxIdx = -1;
        degrees.forEach((d, i) => {
            if (d > maxDegree) {
                maxDegree = d;
                maxIdx = i;
            }
        });

        this.nodes.forEach(n => {
            n.isCentral = (n.id === maxIdx);
            n.color = n.isCentral ? '#f72585' : '#4cc9f0';
            if (n.isCentral) n.radius = 15;
            else n.radius = 5 + Math.random() * 5;
        });
    }

    update() {
        // Physics-lite: Nodes float and bounce off walls
        this.nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;

            if (node.x < 0 || node.x > this.width) node.vx *= -1;
            if (node.y < 0 || node.y > this.height) node.vy *= -1;
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw Edges
        this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        this.ctx.lineWidth = 1;

        this.edges.forEach(edge => {
            this.ctx.beginPath();
            this.ctx.moveTo(edge.source.x, edge.source.y);
            this.ctx.lineTo(edge.target.x, edge.target.y);
            this.ctx.stroke();

            // Arrow if directed
            if (this.isDirect) {
                this.drawArrow(edge.source.x, edge.source.y, edge.target.x, edge.target.y);
            }
        });

        // Draw Nodes
        this.nodes.forEach(node => {
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = node.color;
            this.ctx.fill();

            // Halo for central node
            if (node.isCentral) {
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, node.radius + 10, 0, Math.PI * 2);
                this.ctx.strokeStyle = 'rgba(247, 37, 133, 0.5)';
                this.ctx.stroke();
            }
        });
    }

    drawArrow(x1, y1, x2, y2) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headlen = 10;
        // Back off a bit from the clean target center so arrow doesn't overlap node too much
        const endX = x2 - 10 * Math.cos(angle);
        const endY = y2 - 10 * Math.sin(angle);

        this.ctx.beginPath();
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
        this.ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6));
        this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
        this.ctx.fill();
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// --- 5.3 Naive Bayes Visualizer (Scanner Logic) ---
class BayesVisualizer {
    constructor() {
        this.display = document.getElementById('bayes-email-display');
        this.evidenceArea = document.getElementById('bayes-evidence');

        this.barSpam = document.getElementById('bar-spam');
        this.barHam = document.getElementById('bar-ham');
        this.valSpam = document.getElementById('val-spam');
        this.valHam = document.getElementById('val-ham');

        // Corpus of emails with known words
        this.emails = [
            { text: "Oferta increíble ganar dinero rápido", type: "spam" },
            { text: "Reunión del proyecto mañana lunes", type: "ham" },
            { text: "Felicidades has ganado un premio gratis", type: "spam" },
            { text: "Adjunto el reporte del equipo de ventas", type: "ham" }
        ];

        // Knowledge Base (Probabilities for words)
        this.wordWeights = {
            "oferta": 0.8, "ganar": 0.9, "dinero": 0.9, "rápido": 0.7, "gratis": 0.95, "premio": 0.9, "felicidades": 0.8,
            "reunión": 0.1, "proyecto": 0.1, "mañana": 0.2, "lunes": 0.2, "adjunto": 0.1, "reporte": 0.1, "equipo": 0.1
        };

        this.init();
    }

    init() {
        this.startLoop();
    }

    async startLoop() {
        let idx = 0;
        while (true) {
            const email = this.emails[idx % this.emails.length];
            idx++;

            // Reset state
            let spamProb = 0.5; // Starts neutral
            this.updateBars(spamProb);
            this.evidenceArea.innerHTML = '';

            // 1. Show Subject
            this.display.textContent = `"${email.text}"`;
            this.display.classList.add('scanning');

            await this.wait(1000);

            // 2. Scan words
            const words = email.text.toLowerCase().split(' ');
            for (let word of words) {
                // Visualize scanning

                // Check if word implies Spam or Ham
                let weight = this.wordWeights[word];
                if (weight !== undefined) {
                    const isSpammy = weight > 0.5;

                    // Create visual evidence
                    const evEl = document.createElement('div');
                    evEl.className = `evidence-token ${isSpammy ? 'bad' : 'good'}`;
                    evEl.innerHTML = `
                        <span class="word">${word}</span>
                        <span class="impact">${isSpammy ? '▲ SPAM' : '▲ SEGURO'}</span>
                    `;
                    this.evidenceArea.appendChild(evEl);

                    // Update probability (Naive Bayes simplification)
                    // Visual simplification: Nudge towards 0 or 1
                    if (isSpammy) {
                        spamProb = spamProb + (1 - spamProb) * 0.4;
                    } else {
                        spamProb = spamProb - (spamProb) * 0.4;
                    }

                    this.updateBars(spamProb);

                    await this.wait(1200); // Wait to read
                } else {
                    // Neutral word, skip fast
                    await this.wait(200);
                }
            }

            this.display.classList.remove('scanning');

            // 3. Final Decision
            const finalVerdict = spamProb > 0.6 ? "¡ES SPAM!" : (spamProb < 0.4 ? "ES SEGURO" : "INCIERTO");
            this.valSpam.textContent = finalVerdict;
            this.valHam.textContent = "";
            this.valSpam.style.color = '#fff';

            await this.wait(3000);
        }
    }

    updateBars(spamRate) {
        // spamRate is 0.0 to 1.0 (1.0 = 100% spam)
        const spamPct = Math.round(spamRate * 100);
        const hamPct = 100 - spamPct;

        this.barSpam.style.width = `${spamPct}%`; // Horizontal bars now
        this.barHam.style.width = `${hamPct}%`;

        this.valSpam.textContent = `${spamPct}%`;
        this.valHam.textContent = `${hamPct}%`;

        // Highlight dominant
        if (spamPct > hamPct) {
            this.barSpam.style.opacity = 1;
            this.barHam.style.opacity = 0.3;
        } else {
            this.barSpam.style.opacity = 0.3;
            this.barHam.style.opacity = 1;
        }
    }

    wait(ms) { return new Promise(r => setTimeout(r, ms)); }
}

// --- 5.4 Time Series Visualizer ---
class TimeSeriesVisualizer {
    constructor() {
        this.canvas = document.getElementById('timeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.statusLabel = document.getElementById('time-status-label');

        this.width = this.canvas.offsetWidth;
        this.height = this.canvas.offsetHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.reset();
        this.startLoop();
    }

    reset() {
        this.data = [];
        this.pattern = [];
        this.prediction = [];
        this.noiseOpacity = 1.0;
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    async startLoop() {
        while (true) {
            this.reset();
            const historyWait = 5;

            // Phase 1: Draw Noisy Reality
            this.updateStatus("1. Leemos el Pasado (Datos con Ruido)");
            await this.drawHistoryPhase(historyWait);
            await this.wait(1000);

            // Phase 2: Find Pattern
            this.updateStatus("2. Extraemos el Patrón (Ignoramos el Ruido)");
            await this.drawPatternPhase();
            await this.wait(1000);

            // Phase 3: Fade Noise (Key for clarity!)
            this.updateStatus("3. Nos quedamos solo con la Tendencia");
            await this.animateNoiseFade();
            await this.wait(1000);

            // Phase 4: Predict
            this.updateStatus("4. Proyectamos el Futuro");
            await this.drawPredictionPhase();

            await this.wait(4000);
        }
    }

    async drawHistoryPhase(speed) {
        const maxLen = Math.floor(this.width * 0.65);
        let t = 0;
        for (let i = 0; i < maxLen; i += 3) {
            t++;
            const val = this.getSignal(t, true);
            this.data.push({ x: i, y: val });
            this.drawAll();
            await this.wait(speed);
        }
    }

    async drawPatternPhase() {
        const historyLen = this.data.length;
        let t = 0;
        // Animation of pattern drawing
        for (let i = 0; i < historyLen; i++) {
            t++;
            if (i < this.data.length) {
                const cleanVal = this.getSignal(t + 1, false);
                this.pattern.push({ x: this.data[i].x, y: cleanVal });
            }
        }

        // Draw reveal
        for (let i = 0; i <= 10; i++) {
            this.drawAll();
            await this.wait(40);
        }
    }

    async animateNoiseFade() {
        for (let i = 10; i >= 0; i--) {
            this.noiseOpacity = i / 10;
            this.drawAll();
            await this.wait(50);
        }
    }

    async drawPredictionPhase() {
        if (this.pattern.length === 0) return;

        const startX = this.pattern[this.pattern.length - 1].x;
        const remainingWidth = this.width - startX - 20;
        let t = this.pattern.length;

        for (let i = 0; i < remainingWidth; i += 3) {
            t++;
            const predVal = this.getSignal(t, false);
            this.prediction.push({ x: startX + i, y: predVal });
            this.drawAll();
            await this.wait(10);
        }
    }

    drawAll() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 1. Draw History (Blue) - With Opacity Control
        if (this.data.length > 0 && this.noiseOpacity > 0) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(76, 201, 240, ${this.noiseOpacity})`; // Blue
            this.ctx.lineWidth = 1; // Thinner for noise
            this.ctx.moveTo(this.data[0].x, this.data[0].y);
            for (let p of this.data) this.ctx.lineTo(p.x, p.y);
            this.ctx.stroke();
        }

        // 2. Draw Pattern (Yellow)
        if (this.pattern.length > 0) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#ffd166'; // Yellow
            this.ctx.lineWidth = 4;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = 'rgba(255, 209, 102, 0.5)';
            this.ctx.lineCap = 'round';
            this.ctx.moveTo(this.pattern[0].x, this.pattern[0].y);
            for (let p of this.pattern) this.ctx.lineTo(p.x, p.y);
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        }

        // 3. Draw Prediction (Pink)
        if (this.prediction.length > 0) {
            const startP = this.prediction[0];
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#f72585';
            this.ctx.lineWidth = 4;
            this.ctx.setLineDash([5, 5]); // Dashed

            // Connect to last pattern
            if (this.pattern.length > 0) {
                const lastPat = this.pattern[this.pattern.length - 1];
                this.ctx.moveTo(lastPat.x, lastPat.y);
            } else {
                this.ctx.moveTo(startP.x, startP.y);
            }

            for (let p of this.prediction) this.ctx.lineTo(p.x, p.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
    }

    getSignal(t, noise) {
        const trend = this.height * 0.55 - (t * 0.1);
        const season = Math.sin(t * 0.08) * 35;
        const n = noise ? (Math.random() - 0.5) * 20 : 0;
        return trend + season + n;
    }

    updateStatus(msg) {
        if (this.statusLabel) this.statusLabel.textContent = msg;
    }

    wait(ms) { return new Promise(r => setTimeout(r, ms)); }
}

// --- Main Init ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Text
    new TextMiningVisualizer();
    // 2. Graph
    window.graphDemo = new GraphVisualizer();
    // 3. Bayes
    new BayesVisualizer();
    // 4. Time
    new TimeSeriesVisualizer();
});
