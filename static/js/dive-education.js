/**
 * Dive Education & Calculations JavaScript
 * Handles interactive educational content, calculators, simulator, and AI chatbot
 */

// Initialize education module
document.addEventListener('DOMContentLoaded', function() {
    initializePressureSimulator();
    initializeChatbot();
    
    // Apply unit system if available
    if (window.unitsManager) {
        window.addEventListener('unitsChanged', updateEducationUnits);
        updateEducationUnits();
    }
});

/**
 * Interactive Pressure Simulator
 */
function initializePressureSimulator() {
    const canvas = document.getElementById('pressureChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const depthSlider = document.getElementById('depthSlider');
    const depthDisplay = document.getElementById('depthDisplay');
    const pressureDisplay = document.getElementById('pressureDisplay');
    
    function updatePressureChart() {
        const depth = parseInt(depthSlider.value);
        const pressure = 1 + (depth / 10); // ATM = 1 + depth/10
        
        // Update displays
        const unit = window.unitsManager ? window.unitsManager.getDepthUnit() : 'm';
        const displayDepth = window.unitsManager && window.unitsManager.currentSystem === 'imperial' ? 
            Math.round(depth * 3.28084 * 10) / 10 : depth;
        
        depthDisplay.textContent = `${displayDepth}${unit}`;
        pressureDisplay.textContent = `${pressure.toFixed(1)} ATM`;
        
        // Clear and draw chart
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw depth representation
        const maxDepth = 40;
        const depthRatio = depth / maxDepth;
        const barHeight = canvas.height * 0.8;
        const barWidth = 40;
        const x = (canvas.width - barWidth) / 2;
        
        // Water column
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(x, canvas.height - barHeight * depthRatio, barWidth, barHeight * depthRatio);
        
        // Diver representation
        if (depth > 0) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(x + barWidth/2, canvas.height - barHeight * depthRatio + 10, 8, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Pressure indicators
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${pressure.toFixed(1)} ATM`, canvas.width/2, 20);
        ctx.fillText(`${depth}m`, canvas.width/2, canvas.height - 5);
    }
    
    depthSlider.addEventListener('input', updatePressureChart);
    updatePressureChart();
}

/**
 * Gas Mix Calculator
 */
function calculateBestMix() {
    const desiredPPO2 = parseFloat(document.getElementById('desiredPPO2').value);
    const maxDepth = parseFloat(document.getElementById('maxDepth').value);
    const resultsDiv = document.getElementById('mixResults');
    
    // Convert depth to meters if imperial
    const depthInMeters = window.unitsManager && window.unitsManager.currentSystem === 'imperial' ? 
        maxDepth / 3.28084 : maxDepth;
    
    // Calculate absolute pressure at depth
    const absolutePressure = 1 + (depthInMeters / 10);
    
    // Calculate required oxygen percentage
    const oxygenPercentage = Math.round((desiredPPO2 / absolutePressure) * 100);
    
    // Calculate MODs
    const mod14 = Math.round((desiredPPO2 / 0.21 - 1) * 10); // MOD at 1.4
    const mod16 = Math.round((1.6 / (oxygenPercentage / 100) - 1) * 10); // MOD at 1.6
    
    // Display results
    document.getElementById('oxygenPercentage').textContent = `${oxygenPercentage}%`;
    
    const depthUnit = window.unitsManager ? window.unitsManager.getDepthUnit() : 'm';
    const mod14Display = window.unitsManager && window.unitsManager.currentSystem === 'imperial' ? 
        Math.round(mod14 * 3.28084) : mod14;
    const mod16Display = window.unitsManager && window.unitsManager.currentSystem === 'imperial' ? 
        Math.round(mod16 * 3.28084) : mod16;
    
    document.getElementById('calculatedMOD').textContent = `${mod14Display}${depthUnit}`;
    document.getElementById('emergencyMOD').textContent = `${mod16Display}${depthUnit}`;
    
    resultsDiv.style.display = 'block';
}

/**
 * SAC Rate Calculator
 */
function calculateSAC() {
    const tankSize = parseFloat(document.getElementById('tankSize').value);
    const workingPressure = parseFloat(document.getElementById('workingPressure').value);
    const avgDepth = parseFloat(document.getElementById('avgDepth').value);
    const diveTime = parseFloat(document.getElementById('diveTime').value);
    const resultsDiv = document.getElementById('sacResults');
    
    // Convert to metric if needed
    const tankSizeL = window.unitsManager && window.unitsManager.currentSystem === 'imperial' ? 
        tankSize * 28.3168 : tankSize;
    const pressureBar = window.unitsManager && window.unitsManager.currentSystem === 'imperial' ? 
        workingPressure / 14.5038 : workingPressure;
    const depthM = window.unitsManager && window.unitsManager.currentSystem === 'imperial' ? 
        avgDepth / 3.28084 : avgDepth;
    
    // Calculate total gas and consumption
    const totalGas = tankSizeL * pressureBar;
    const avgPressure = 1 + (depthM / 10);
    const gasUsedAtDepth = totalGas * 0.7; // Assuming 70% consumption
    const sacRate = (gasUsedAtDepth / avgPressure) / (diveTime / 60);
    
    // Format results based on unit system
    const volumeUnit = window.unitsManager ? window.unitsManager.getVolumeUnit() : 'L';
    const sacDisplay = window.unitsManager && window.unitsManager.currentSystem === 'imperial' ? 
        (sacRate / 28.3168).toFixed(1) : sacRate.toFixed(1);
    const gasUsedDisplay = window.unitsManager && window.unitsManager.currentSystem === 'imperial' ? 
        (gasUsedAtDepth / 28.3168).toFixed(0) : gasUsedAtDepth.toFixed(0);
    const totalNeededDisplay = window.unitsManager && window.unitsManager.currentSystem === 'imperial' ? 
        (totalGas / 28.3168).toFixed(0) : totalGas.toFixed(0);
    
    document.getElementById('calculatedSAC').textContent = `${sacDisplay} ${volumeUnit}/min`;
    document.getElementById('gasUsed').textContent = `${gasUsedDisplay} ${volumeUnit}`;
    document.getElementById('totalGasNeeded').textContent = `${totalNeededDisplay} ${volumeUnit}`;
    
    resultsDiv.style.display = 'block';
}

/**
 * Dive Simulator
 */
let simulationRunning = false;
let simulationCanvas, simulationCtx;
let simulationData = [];

function startSimulation() {
    if (simulationRunning) return;
    
    const canvas = document.getElementById('simulationChart');
    if (!canvas) return;
    
    simulationCanvas = canvas;
    simulationCtx = canvas.getContext('2d');
    simulationRunning = true;
    
    // Get simulation parameters
    const maxDepth = parseFloat(document.getElementById('simDepth').value);
    const bottomTime = parseFloat(document.getElementById('simTime').value);
    const gasMix = document.getElementById('simGasMix').value;
    const sacRate = parseFloat(document.getElementById('simSAC').value);
    
    // Clear previous data
    simulationData = [];
    
    // Show controls
    document.getElementById('simulationControls').style.display = 'block';
    
    // Start simulation loop
    runSimulation(maxDepth, bottomTime, sacRate);
}

function runSimulation(maxDepth, bottomTime, sacRate) {
    let currentTime = 0;
    let currentDepth = 0;
    let currentAir = 100;
    const totalTime = bottomTime + 10; // Add ascent time
    
    const interval = setInterval(() => {
        // Calculate current depth based on dive profile
        if (currentTime < 5) {
            // Descent phase
            currentDepth = (currentTime / 5) * maxDepth;
        } else if (currentTime < bottomTime) {
            // Bottom phase
            currentDepth = maxDepth;
        } else {
            // Ascent phase
            const ascentTime = currentTime - bottomTime;
            currentDepth = maxDepth * (1 - ascentTime / 10);
            currentDepth = Math.max(0, currentDepth);
        }
        
        // Calculate air consumption
        const pressure = 1 + (currentDepth / 10);
        const airConsumption = (sacRate / 60) * pressure * (1/60); // Per second consumption
        currentAir -= airConsumption;
        currentAir = Math.max(0, currentAir);
        
        // Update displays
        const depthUnit = window.unitsManager ? window.unitsManager.getDepthUnit() : 'm';
        const displayDepth = window.unitsManager && window.unitsManager.currentSystem === 'imperial' ? 
            Math.round(currentDepth * 3.28084) : Math.round(currentDepth);
        
        document.getElementById('currentDepth').textContent = `${displayDepth}${depthUnit}`;
        document.getElementById('airRemaining').textContent = `${Math.round(currentAir)}%`;
        
        // Store data point
        simulationData.push({
            time: currentTime,
            depth: currentDepth,
            air: currentAir
        });
        
        // Draw chart
        drawSimulationChart();
        
        currentTime += 0.5;
        
        if (currentTime > totalTime || currentAir <= 0) {
            clearInterval(interval);
            simulationRunning = false;
            
            if (currentAir <= 0) {
                alert('Warning: Air supply depleted! This simulation shows the importance of proper gas planning.');
            }
        }
    }, 500);
}

function drawSimulationChart() {
    const ctx = simulationCtx;
    const canvas = simulationCanvas;
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    if (simulationData.length < 2) return;
    
    // Set up chart dimensions
    const margin = 40;
    const chartWidth = width - 2 * margin;
    const chartHeight = height - 2 * margin;
    
    // Find max values for scaling
    const maxTime = Math.max(...simulationData.map(d => d.time));
    const maxDepth = Math.max(...simulationData.map(d => d.depth));
    
    // Draw depth profile
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    simulationData.forEach((point, index) => {
        const x = margin + (point.time / maxTime) * chartWidth;
        const y = margin + (point.depth / maxDepth) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, height - y); // Invert Y for depth
        } else {
            ctx.lineTo(x, height - y);
        }
    });
    
    ctx.stroke();
    
    // Draw axes
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    
    // Y axis
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, height - margin);
    ctx.stroke();
    
    // X axis
    ctx.beginPath();
    ctx.moveTo(margin, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Time (min)', width / 2, height - 5);
    
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Depth', 0, 0);
    ctx.restore();
}

/**
 * AI Chatbot Functions
 */
let chatHistory = [];

function initializeChatbot() {
    // Initialize local AI model placeholder
    // In a real implementation, this would load a local LLM like WebLLM
    console.log('Initializing local AI chatbot...');
}

function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatMessage(message, 'user');
    input.value = '';
    
    // Process with local AI
    setTimeout(() => {
        const response = generateAIResponse(message);
        addChatMessage(response, 'assistant');
    }, 1000);
}

function addChatMessage(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message mb-3`;
    
    const icon = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
    const name = sender === 'user' ? 'You' : 'ScuPlan Assistant';
    const bgColor = sender === 'user' ? 'primary' : 'secondary';
    
    messageDiv.innerHTML = `
        <div class="d-flex ${sender === 'user' ? 'flex-row-reverse' : ''}">
            <div class="${sender === 'user' ? 'ms-3' : 'me-3'}">
                <i class="${icon} text-${bgColor}"></i>
            </div>
            <div class="flex-grow-1">
                <span class="badge bg-${bgColor} mb-1">${name}</span>
                <p class="mb-0">${message}</p>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateAIResponse(message) {
    // Simple rule-based responses (in real implementation, use local LLM)
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('mod') || lowerMessage.includes('maximum operating depth')) {
        return "MOD (Maximum Operating Depth) is calculated using PPO₂ limits. For recreational diving, use 1.4 ATA: MOD = (PPO₂ / O₂%) × 10 - 10. For example, EAN32 at 1.4 PPO₂: MOD = (1.4 / 0.32) × 10 - 10 = 33.75m";
    }
    
    if (lowerMessage.includes('nitrox') || lowerMessage.includes('ean')) {
        return "Nitrox (EANx) contains higher oxygen than air (21%). Common mixes are EAN32 (32% O₂) and EAN36 (36% O₂). Benefits: longer NDL, reduced nitrogen absorption, less fatigue. Risks: reduced MOD, oxygen toxicity if limits exceeded.";
    }
    
    if (lowerMessage.includes('decompression') || lowerMessage.includes('deco')) {
        return "Decompression stops allow dissolved nitrogen to safely off-gas. Required when you exceed No Decompression Limits (NDL). Stop duration depends on depth, time, and gas mix. Safety stops (3-5min at 5m) are recommended even within NDL.";
    }
    
    if (lowerMessage.includes('sac') || lowerMessage.includes('air consumption')) {
        return "SAC Rate (Surface Air Consumption) measures breathing efficiency. Average: 15-25 L/min. Calculate: (Tank volume × pressure used) ÷ (dive time × average pressure). Lower SAC = longer dives and better gas planning.";
    }
    
    if (lowerMessage.includes('narcosis') || lowerMessage.includes('nitrogen narcosis')) {
        return "Nitrogen narcosis affects judgment and coordination, typically starting at 30m (100ft). Symptoms: euphoria, overconfidence, impaired decision-making. Solutions: ascend to shallower depth, use trimix for deep dives, maintain training awareness.";
    }
    
    if (lowerMessage.includes('safety stop')) {
        return "Safety stops (3-5 minutes at 5m/15ft) are precautionary decompression, even when within NDL. Benefits: additional off-gassing time, controlled ascent practice, safety margin. Mandatory after deep dives (>18m/60ft) or multiple dives.";
    }
    
    if (lowerMessage.includes('trimix')) {
        return "Trimix (oxygen/helium/nitrogen) is used for deep technical diving. Helium reduces narcosis and has faster decompression than nitrogen. Common mixes: 18/45 (18% O₂, 45% He) for 60m dives. Requires advanced training and precise planning.";
    }
    
    if (lowerMessage.includes('gas planning') || lowerMessage.includes('rule of thirds')) {
        return "Gas planning ensures adequate air supply. Rule of Thirds: 1/3 for going out, 1/3 for return, 1/3 for emergencies. For technical diving, calculate Minimum Gas: volume needed to ascend safely from maximum depth with stressed breathing rate.";
    }
    
    if (lowerMessage.includes('emergency') || lowerMessage.includes('out of air')) {
        return "Out-of-air emergencies: 1) Stay calm, 2) Signal buddy, 3) Share air using alternate air source, 4) Begin controlled ascent, 5) Maintain contact with buddy. If alone: CESA (Controlled Emergency Swimming Ascent) as last resort - exhale continuously while ascending.";
    }
    
    // Default responses
    const defaultResponses = [
        "That's an interesting diving question! Can you be more specific about what aspect you'd like to know?",
        "Based on standard diving practices, I'd recommend consulting your certification manual and dive tables for specific calculations. What particular scenario are you planning for?",
        "Diving safety depends on proper training and equipment. Are you asking about a specific dive situation or general diving principles?",
        "For detailed calculations and safety procedures, always refer to your diving certification and follow established protocols. What specific diving topic interests you most?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

/**
 * Update units throughout education module
 */
function updateEducationUnits() {
    if (!window.unitsManager) return;
    
    // Update all unit labels
    window.unitsManager.applyUnits();
    
    // Update any existing calculation results
    const mixResults = document.getElementById('mixResults');
    const sacResults = document.getElementById('sacResults');
    
    if (mixResults && mixResults.style.display !== 'none') {
        calculateBestMix();
    }
    
    if (sacResults && sacResults.style.display !== 'none') {
        calculateSAC();
    }
}