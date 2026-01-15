// ===== Global State =====
let model;
let trainingData;
let isTraining = false;
let currentActivation = 'sigmoid';
let learningRate = 0.1;
let epoch = 0;

// Canvas contexts
let networkCtx;
let decisionCtx;

// Network architecture
const NETWORK_STRUCTURE = {
    input: 2,
    hidden: 4,
    output: 2
};

// ===== Initialization =====
window.addEventListener('DOMContentLoaded', () => {
    initializeCanvases();
    initializeControls();
    generateTrainingData();
    createModel();
    startTraining();
});

// ===== Canvas Setup =====
function initializeCanvases() {
    const networkCanvas = document.getElementById('networkCanvas');
    const decisionCanvas = document.getElementById('decisionCanvas');
    
    // Set canvas sizes
    networkCanvas.width = networkCanvas.offsetWidth;
    networkCanvas.height = networkCanvas.offsetHeight;
    decisionCanvas.width = decisionCanvas.offsetWidth;
    decisionCanvas.height = decisionCanvas.offsetHeight;
    
    networkCtx = networkCanvas.getContext('2d');
    decisionCtx = decisionCanvas.getContext('2d');
    
    // Handle window resize
    window.addEventListener('resize', () => {
        networkCanvas.width = networkCanvas.offsetWidth;
        networkCanvas.height = networkCanvas.offsetHeight;
        decisionCanvas.width = decisionCanvas.offsetWidth;
        decisionCanvas.height = decisionCanvas.offsetHeight;
    });
}

// ===== Control Handlers =====
function initializeControls() {
    // Learning rate slider
    const learningRateSlider = document.getElementById('learningRate');
    const learningRateValue = document.getElementById('learningRateValue');
    
    learningRateSlider.addEventListener('input', (e) => {
        learningRate = parseFloat(e.target.value);
        learningRateValue.textContent = learningRate.toFixed(3);
        if (model && model.optimizer) {
            model.optimizer.learningRate = learningRate;
        }
    });
    
    // Activation function buttons
    const activationBtns = document.querySelectorAll('.activation-btn');
    activationBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            activationBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentActivation = btn.dataset.activation;
            createModel();
        });
    });
    
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', () => {
        epoch = 0;
        createModel();
        updateMetrics(0, 0);
    });
}

// ===== Data Generation =====
function generateTrainingData() {
    const numSamples = 100;
    const data = [];
    const labels = [];
    
    // Generate two spiral clusters
    for (let i = 0; i < numSamples / 2; i++) {
        // Class 0 - Red spiral
        const r = i / (numSamples / 2) * 3;
        const t = 1.75 * i / (numSamples / 2) * 2 * Math.PI;
        const x = r * Math.cos(t) + Math.random() * 0.3;
        const y = r * Math.sin(t) + Math.random() * 0.3;
        data.push([x, y]);
        labels.push(0);
        
        // Class 1 - Blue spiral
        const r2 = i / (numSamples / 2) * 3;
        const t2 = 1.75 * i / (numSamples / 2) * 2 * Math.PI + Math.PI;
        const x2 = r2 * Math.cos(t2) + Math.random() * 0.3;
        const y2 = r2 * Math.sin(t2) + Math.random() * 0.3;
        data.push([x2, y2]);
        labels.push(1);
    }
    
    trainingData = {
        xs: tf.tensor2d(data),
        ys: tf.oneHot(tf.tensor1d(labels, 'int32'), 2)
    };
}

// ===== Model Creation =====
function createModel() {
    // Dispose old model if exists
    if (model) {
        model.dispose();
    }
    
    // Create sequential model
    model = tf.sequential();
    
    // Input layer -> Hidden layer
    model.add(tf.layers.dense({
        inputShape: [NETWORK_STRUCTURE.input],
        units: NETWORK_STRUCTURE.hidden,
        activation: currentActivation,
        kernelInitializer: 'randomNormal'
    }));
    
    // Hidden layer -> Output layer
    model.add(tf.layers.dense({
        units: NETWORK_STRUCTURE.output,
        activation: 'softmax',
        kernelInitializer: 'randomNormal'
    }));
    
    // Compile model
    model.compile({
        optimizer: tf.train.sgd(learningRate),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    });
}

// ===== Training Loop =====
async function startTraining() {
    isTraining = true;
    
    async function trainStep() {
        if (!isTraining) return;
        
        // Train for one epoch
        const history = await model.fit(trainingData.xs, trainingData.ys, {
            epochs: 1,
            shuffle: true,
            verbose: 0
        });
        
        epoch++;
        const loss = history.history.loss[0];
        const accuracy = history.history.acc[0];
        
        // Update UI
        updateMetrics(loss, accuracy);
        drawNetwork();
        drawDecisionBoundary();
        
        // Continue training
        requestAnimationFrame(trainStep);
    }
    
    trainStep();
}

// ===== Metrics Update =====
function updateMetrics(loss, accuracy) {
    document.getElementById('epoch').textContent = epoch;
    document.getElementById('loss').textContent = loss.toFixed(4);
    document.getElementById('accuracy').textContent = (accuracy * 100).toFixed(1) + '%';
}

// ===== Network Visualization =====
function drawNetwork() {
    const canvas = networkCtx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    networkCtx.fillStyle = '#0f172a';
    networkCtx.fillRect(0, 0, width, height);
    
    // Get weights
    const weights = model.getWeights();
    const w1 = weights[0].arraySync(); // Input -> Hidden
    const w2 = weights[2].arraySync(); // Hidden -> Output
    
    // Layer positions
    const layers = [
        { neurons: NETWORK_STRUCTURE.input, x: width * 0.2 },
        { neurons: NETWORK_STRUCTURE.hidden, x: width * 0.5 },
        { neurons: NETWORK_STRUCTURE.output, x: width * 0.8 }
    ];
    
    const neuronRadius = 20;
    const neuronPositions = [];
    
    // Calculate neuron positions
    layers.forEach(layer => {
        const positions = [];
        const spacing = height / (layer.neurons + 1);
        for (let i = 0; i < layer.neurons; i++) {
            positions.push({
                x: layer.x,
                y: spacing * (i + 1)
            });
        }
        neuronPositions.push(positions);
    });
    
    // Draw connections (Input -> Hidden)
    for (let i = 0; i < NETWORK_STRUCTURE.input; i++) {
        for (let j = 0; j < NETWORK_STRUCTURE.hidden; j++) {
            const weight = w1[i][j];
            drawConnection(
                neuronPositions[0][i],
                neuronPositions[1][j],
                weight
            );
        }
    }
    
    // Draw connections (Hidden -> Output)
    for (let i = 0; i < NETWORK_STRUCTURE.hidden; i++) {
        for (let j = 0; j < NETWORK_STRUCTURE.output; j++) {
            const weight = w2[i][j];
            drawConnection(
                neuronPositions[1][i],
                neuronPositions[2][j],
                weight
            );
        }
    }
    
    // Draw neurons
    neuronPositions.forEach((layer, layerIdx) => {
        layer.forEach((pos, neuronIdx) => {
            let label = '';
            if (layerIdx === 0) label = `x${neuronIdx + 1}`;
            else if (layerIdx === 1) label = `h${neuronIdx + 1}`;
            else label = `y${neuronIdx + 1}`;
            
            drawNeuron(pos.x, pos.y, neuronRadius, label);
        });
    });
}

function drawConnection(from, to, weight) {
    const maxWeight = 2;
    const normalizedWeight = Math.max(-maxWeight, Math.min(maxWeight, weight));
    
    // Color based on weight (red = negative, blue = positive)
    const ratio = (normalizedWeight + maxWeight) / (2 * maxWeight);
    const r = Math.floor(239 * (1 - ratio) + 59 * ratio);
    const g = Math.floor(68 * (1 - ratio) + 130 * ratio);
    const b = Math.floor(68 * (1 - ratio) + 246 * ratio);
    
    // Line thickness based on absolute weight
    const thickness = Math.abs(normalizedWeight) / maxWeight * 4 + 0.5;
    
    networkCtx.beginPath();
    networkCtx.moveTo(from.x, from.y);
    networkCtx.lineTo(to.x, to.y);
    networkCtx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
    networkCtx.lineWidth = thickness;
    networkCtx.globalAlpha = 0.6;
    networkCtx.stroke();
    networkCtx.globalAlpha = 1;
}

function drawNeuron(x, y, radius, label) {
    // Outer glow
    const gradient = networkCtx.createRadialGradient(x, y, 0, x, y, radius * 2);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
    
    networkCtx.fillStyle = gradient;
    networkCtx.beginPath();
    networkCtx.arc(x, y, radius * 2, 0, Math.PI * 2);
    networkCtx.fill();
    
    // Neuron circle
    const neuronGradient = networkCtx.createRadialGradient(x, y, 0, x, y, radius);
    neuronGradient.addColorStop(0, '#3b82f6');
    neuronGradient.addColorStop(1, '#1e40af');
    
    networkCtx.fillStyle = neuronGradient;
    networkCtx.beginPath();
    networkCtx.arc(x, y, radius, 0, Math.PI * 2);
    networkCtx.fill();
    
    // Border
    networkCtx.strokeStyle = '#60a5fa';
    networkCtx.lineWidth = 2;
    networkCtx.stroke();
    
    // Label
    networkCtx.fillStyle = '#ffffff';
    networkCtx.font = 'bold 12px Inter';
    networkCtx.textAlign = 'center';
    networkCtx.textBaseline = 'middle';
    networkCtx.fillText(label, x, y);
}

// ===== Decision Boundary Visualization =====
function drawDecisionBoundary() {
    const canvas = decisionCtx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const resolution = 50;
    
    // Clear canvas
    decisionCtx.fillStyle = '#0f172a';
    decisionCtx.fillRect(0, 0, width, height);
    
    // Create grid for predictions
    const gridSize = resolution;
    const xMin = -4, xMax = 4;
    const yMin = -4, yMax = 4;
    const xStep = (xMax - xMin) / gridSize;
    const yStep = (yMax - yMin) / gridSize;
    
    // Generate grid points
    const gridPoints = [];
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            gridPoints.push([
                xMin + i * xStep,
                yMin + j * yStep
            ]);
        }
    }
    
    // Get predictions
    const gridTensor = tf.tensor2d(gridPoints);
    const predictions = model.predict(gridTensor);
    const predArray = predictions.arraySync();
    
    // Draw heatmap
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;
    
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const idx = i * gridSize + j;
            const prob = predArray[idx][1]; // Probability of class 1
            
            // Color interpolation
            const r = Math.floor(239 * (1 - prob) + 59 * prob);
            const g = Math.floor(68 * (1 - prob) + 130 * prob);
            const b = Math.floor(68 * (1 - prob) + 246 * prob);
            
            decisionCtx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
            decisionCtx.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
        }
    }
    
    // Draw training data points
    const dataArray = trainingData.xs.arraySync();
    const labelArray = trainingData.ys.argMax(1).arraySync();
    
    dataArray.forEach((point, idx) => {
        const x = ((point[0] - xMin) / (xMax - xMin)) * width;
        const y = ((point[1] - yMin) / (yMax - yMin)) * height;
        const label = labelArray[idx];
        
        // Draw point
        decisionCtx.beginPath();
        decisionCtx.arc(x, y, 4, 0, Math.PI * 2);
        decisionCtx.fillStyle = label === 0 ? '#ef4444' : '#3b82f6';
        decisionCtx.fill();
        
        // Glow effect
        decisionCtx.strokeStyle = label === 0 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)';
        decisionCtx.lineWidth = 2;
        decisionCtx.stroke();
    });
    
    // Cleanup
    gridTensor.dispose();
    predictions.dispose();
}
