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
 * NDL Calculator
 */
function calculateNDL() {
    const depth = parseFloat(document.getElementById('ndlDepth').value);
    const previousDive = document.getElementById('previousDive').value;
    const surfaceInterval = parseFloat(document.getElementById('surfaceInterval').value);
    const resultsDiv = document.getElementById('ndlResults');
    
    // Convert to metric if needed
    const depthM = window.unitsManager && window.unitsManager.currentSystem === 'imperial' ? 
        depth / 3.28084 : depth;
    
    // NDL table (PADI RDP simplified)
    const ndlTable = {
        12: 147, 15: 80, 18: 56, 21: 40, 24: 29, 27: 22, 30: 20, 33: 16, 36: 14, 39: 13, 42: 11
    };
    
    // Find closest depth
    let ndlTime = 20; // Default
    for (let tableDepth in ndlTable) {
        if (depthM <= parseFloat(tableDepth)) {
            ndlTime = ndlTable[tableDepth];
            break;
        }
    }
    
    // Adjust for previous dive and surface interval
    let residualNitrogen = 'None';
    let adjustedNDL = ndlTime;
    
    if (previousDive !== 'none' && surfaceInterval < 3) {
        let reduction = 0;
        switch(previousDive) {
            case 'short': reduction = surfaceInterval < 1 ? 10 : 5; break;
            case 'medium': reduction = surfaceInterval < 1 ? 15 : 8; break;
            case 'long': reduction = surfaceInterval < 1 ? 20 : 12; break;
        }
        adjustedNDL = Math.max(5, ndlTime - reduction);
        residualNitrogen = 'Low to Moderate';
    }
    
    const safetyAdvice = adjustedNDL < ndlTime ? 
        'Extended surface interval recommended' : 
        'Normal safety stop at 5m for 3 minutes';
    
    document.getElementById('ndlTime').textContent = adjustedNDL;
    document.getElementById('residualNitrogen').textContent = residualNitrogen;
    document.getElementById('safetyAdvice').textContent = safetyAdvice;
    
    resultsDiv.style.display = 'block';
}

/**
 * Surface Interval Calculator
 */
function calculateSurfaceInterval() {
    const firstDepth = parseFloat(document.getElementById('firstDiveDepth').value);
    const firstTime = parseFloat(document.getElementById('firstDiveTime').value);
    const secondDepth = parseFloat(document.getElementById('secondDiveDepth').value);
    const secondTime = parseFloat(document.getElementById('desiredSecondTime').value);
    const resultsDiv = document.getElementById('surfaceResults');
    
    // Convert to metric if needed
    const firstDepthM = window.unitsManager && window.unitsManager.currentSystem === 'imperial' ? 
        firstDepth / 3.28084 : firstDepth;
    const secondDepthM = window.unitsManager && window.unitsManager.currentSystem === 'imperial' ? 
        secondDepth / 3.28084 : secondDepth;
    
    // Simplified nitrogen loading calculation
    const nitrogenLoad = Math.min(firstDepthM * firstTime / 1000, 1.0);
    const requiredOffgassing = nitrogenLoad * (secondDepthM * secondTime / 1000);
    
    // Calculate minimum surface interval (simplified)
    const minInterval = Math.max(30, requiredOffgassing * 120);
    const recInterval = minInterval * 1.5;
    
    // Nitrogen group estimation
    const nitrogenGroup = nitrogenLoad > 0.7 ? 'D' : nitrogenLoad > 0.4 ? 'C' : nitrogenLoad > 0.2 ? 'B' : 'A';
    
    document.getElementById('minSurfaceTime').textContent = Math.round(minInterval);
    document.getElementById('recSurfaceTime').textContent = Math.round(recInterval);
    document.getElementById('nitrogenGroup').textContent = `Group ${nitrogenGroup}`;
    
    resultsDiv.style.display = 'block';
}

/**
 * Buoyancy Calculator
 */
function calculateBuoyancy() {
    const waterType = document.getElementById('waterType').value;
    const bodyWeight = parseFloat(document.getElementById('bodyWeight').value);
    const wetsuitType = document.getElementById('wetsuitType').value;
    const resultsDiv = document.getElementById('buoyancyResults');
    
    // Base weight calculation (% of body weight)
    let weightPercentage = waterType === 'salt' ? 0.025 : 0.05; // 2.5% salt, 5% fresh
    
    // Wetsuit adjustments
    const wetsuitAdjustment = {
        'none': 0,
        'thin': 1.5,
        'medium': 3,
        'thick': 4.5,
        'drysuit': 6
    };
    
    const baseWeight = bodyWeight * weightPercentage;
    const wetsuitWeight = wetsuitAdjustment[wetsuitType] || 0;
    const totalWeight = baseWeight + wetsuitWeight;
    
    // Distribution (60% belt, 40% pockets for balanced diving)
    const beltWeight = Math.round(totalWeight * 0.6 * 10) / 10;
    const pocketWeight = Math.round(totalWeight * 0.4 * 10) / 10;
    
    document.getElementById('recommendedWeight').textContent = totalWeight.toFixed(1);
    document.getElementById('beltWeight').textContent = beltWeight.toFixed(1);
    document.getElementById('pocketWeight').textContent = pocketWeight.toFixed(1);
    
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
    // Comprehensive zero-cost rule-based AI chatbot
    const lowerMessage = message.toLowerCase();
    
    // Physics and Theory
    if (lowerMessage.includes('boyle') || lowerMessage.includes('pressure') || lowerMessage.includes('volume')) {
        return "Boyle's Law: P1V1 = P2V2. At depth, increased pressure compresses air spaces in your body. At 10m (33ft), pressure doubles from 1 to 2 ATM. This affects ears, sinuses, lungs, and BCD. Essential for understanding equalization and buoyancy changes during descent/ascent.";
    }
    
    if (lowerMessage.includes('dalton') || lowerMessage.includes('partial pressure')) {
        return "Dalton's Law: Total pressure = sum of partial pressures. In air at 1 ATM: PPO₂ = 0.21 ATM, PPN₂ = 0.79 ATM. At 30m (4 ATM): PPO₂ = 0.84 ATM, PPN₂ = 3.16 ATM. Critical for understanding gas toxicity limits and narcosis onset.";
    }
    
    if (lowerMessage.includes('henry') || lowerMessage.includes('absorption') || lowerMessage.includes('solubility')) {
        return "Henry's Law: Gas dissolves into liquids proportionally to pressure. Higher pressure = more nitrogen absorbed into tissues. Rapid ascent causes supersaturation and bubble formation (DCS). This is why we need controlled ascent rates and safety stops.";
    }
    
    // MOD and Gas Calculations
    if (lowerMessage.includes('mod') || lowerMessage.includes('maximum operating depth')) {
        return "MOD = (PPO₂ ÷ O₂%) × 10 - 10 meters. For EAN32 at 1.4 PPO₂: MOD = (1.4 ÷ 0.32) × 10 - 10 = 33.75m. Use 1.4 PPO₂ for working dives, 1.6 PPO₂ maximum emergency exposure. Exceeding MOD risks oxygen toxicity seizures.";
    }
    
    if (lowerMessage.includes('best mix') || lowerMessage.includes('optimal mix')) {
        return "Best Mix formula: O₂% = (desired PPO₂ ÷ absolute pressure) × 100. For 30m dive at 1.4 PPO₂: O₂% = (1.4 ÷ 4.0) × 100 = 35%. Always round down to nearest standard mix (32%, 36%) for safety margin.";
    }
    
    if (lowerMessage.includes('ead') || lowerMessage.includes('equivalent air depth')) {
        return "EAD calculates nitrogen narcosis for nitrox: EAD = ((depth + 10) × 0.79 ÷ N₂%) - 10. For EAN32 at 30m: EAD = ((30 + 10) × 0.79 ÷ 0.68) - 10 = 36.5m equivalent narcosis effect.";
    }
    
    // NDL and Decompression
    if (lowerMessage.includes('ndl') || lowerMessage.includes('no decompression limit')) {
        return "NDL times (PADI RDP): 18m=56min, 21m=40min, 24m=29min, 27m=22min, 30m=20min. Based on M-values and tissue compartment loading. Conservative estimates assuming square profile and air breathing gas.";
    }
    
    if (lowerMessage.includes('decompression') || lowerMessage.includes('deco') || lowerMessage.includes('stops')) {
        return "Decompression allows nitrogen off-gassing to prevent DCS. Safety stop: 3-5min at 5m, recommended for all dives >10m. Mandatory stops required when exceeding NDL. Ascent rate: 9-18m/min maximum, slower in final 6m.";
    }
    
    if (lowerMessage.includes('tissue compartment') || lowerMessage.includes('half-time')) {
        return "Tissue compartments model nitrogen absorption/elimination. Fast tissues (5min half-time): blood, lungs. Medium (20-40min): muscle, skin. Slow (120-480min): joints, tendons. Each has different M-values for bubble formation limits.";
    }
    
    // Gas Management and SAC
    if (lowerMessage.includes('sac') || lowerMessage.includes('air consumption') || lowerMessage.includes('breathing rate')) {
        return "SAC = (tank pressure used × tank volume) ÷ (dive time × average pressure). Normal SAC: 15-25 L/min surface equivalent. Factors affecting SAC: fitness, anxiety, cold, current, workload. Lower SAC = longer dives, better gas planning.";
    }
    
    if (lowerMessage.includes('rule of thirds') || lowerMessage.includes('gas planning') || lowerMessage.includes('turn pressure')) {
        return "Rule of Thirds: 1/3 outbound, 1/3 return, 1/3 emergency reserve. Turn pressure = starting pressure - (starting pressure ÷ 3). Example: 200 bar start → turn at 133 bar. For overhead environments or deep dives, use more conservative ratios.";
    }
    
    if (lowerMessage.includes('minimum gas') || lowerMessage.includes('rock bottom')) {
        return "Minimum Gas = gas needed to ascend from maximum depth with stressed breathing (1.5-2× normal SAC). Include ascent time, safety stops, and buddy sharing. Formula: (depth/9 × ascent time × stressed SAC × 2 divers) + safety margin.";
    }
    
    // Emergency Procedures
    if (lowerMessage.includes('emergency') || lowerMessage.includes('out of air') || lowerMessage.includes('oom')) {
        return "Out-of-Air Protocol: 1) Stay calm - don't panic, 2) Signal buddy (cut-throat), 3) Share air (donate primary, take alternate), 4) Establish positive contact, 5) Begin controlled ascent, 6) Make safety stop if gas permits. Practice regularly!";
    }
    
    if (lowerMessage.includes('cesa') || lowerMessage.includes('emergency ascent')) {
        return "CESA (Controlled Emergency Swimming Ascent) - LAST RESORT only: 1) Look up, 2) Start swimming up, 3) Exhale continuously (say 'Ahhh'), 4) Keep airway open, 5) Ascend with your smallest bubbles. High DCS risk - only if no other option.";
    }
    
    if (lowerMessage.includes('dcs') || lowerMessage.includes('decompression sickness') || lowerMessage.includes('bends')) {
        return "DCS symptoms: joint pain ('bends'), skin rash, fatigue, neurological problems, breathing difficulty. Treatment: 100% oxygen, maintain body temperature, evacuate to hyperbaric chamber ASAP. DAN Emergency: +1-919-684-9111. Never ignore symptoms!";
    }
    
    // Environmental and Safety
    if (lowerMessage.includes('narcosis') || lowerMessage.includes('nitrogen narcosis') || lowerMessage.includes('narked')) {
        return "Nitrogen narcosis: impaired judgment starting ~30m (100ft). Symptoms: euphoria, overconfidence, poor decision-making, memory loss. 'Martini Law': every 15m = one martini effect. Solution: ascend to shallower depth or use trimix for deep diving.";
    }
    
    if (lowerMessage.includes('oxygen toxicity') || lowerMessage.includes('oxtox') || lowerMessage.includes('convulsion')) {
        return "CNS oxygen toxicity risk above 1.6 PPO₂. Symptoms (VENTID): Vision problems, Ears ringing, Nausea, Twitching, Irritability, Dizziness. Can cause underwater convulsions. Stay within MOD limits, monitor exposure time, use lower PPO₂ for longer dives.";
    }
    
    if (lowerMessage.includes('buoyancy') || lowerMessage.includes('neutral') || lowerMessage.includes('weighting')) {
        return "Neutral buoyancy = displaced water weight equals diver weight. Start with 10% body weight in salt water, 5% fresh water. Add for wetsuit thickness: 3mm +1.5kg, 5mm +3kg, 7mm +4.5kg. Check at surface with empty BCD, normal breathing.";
    }
    
    // Equipment and Diving Procedures
    if (lowerMessage.includes('ascent rate') || lowerMessage.includes('ascent speed')) {
        return "Maximum ascent rate: 18m/min (60ft/min). Recommended: 9m/min (30ft/min). Final 6m (20ft): slow to 3m/min (10ft/min). Watch your depth gauge continuously. Follow your smallest bubbles as reference for safe ascent speed.";
    }
    
    if (lowerMessage.includes('safety stop') || lowerMessage.includes('3 minute stop')) {
        return "Safety stop: 3-5 minutes at 5m (15ft). Recommended for all dives deeper than 10m (30ft). Allows additional nitrogen off-gassing and establishes controlled ascent habit. Mandatory after multiple dives, deep dives, or computer recommendations.";
    }
    
    if (lowerMessage.includes('surface interval') || lowerMessage.includes('repetitive dive')) {
        return "Surface intervals allow nitrogen elimination between dives. Minimum 15 minutes, longer intervals = more bottom time on next dive. Use PADI RDP or dive computer. Popular intervals: 1 hour (good), 3+ hours (significant off-gassing).";
    }
    
    // Dive Tables and Computers
    if (lowerMessage.includes('dive table') || lowerMessage.includes('rdp') || lowerMessage.includes('padi table')) {
        return "Dive tables (RDP) provide NDL times for square profiles using air. Conservative approach with safety margins. Advantages: no battery, reliable backup. Limitations: single gas, square profiles only. Modern computers offer real-time multilevel calculations.";
    }
    
    if (lowerMessage.includes('dive computer') || lowerMessage.includes('computer algorithm')) {
        return "Dive computers calculate real-time decompression using algorithms (Bühlmann, RGBM, VPM). Track actual dive profile, multiple gases, altitude, temperature. More liberal than tables for multilevel dives. Always have backup (tables, second computer).";
    }
    
    // Training and Certification
    if (lowerMessage.includes('training') || lowerMessage.includes('certification') || lowerMessage.includes('course')) {
        return "Proper training is essential for safe diving. Progressive levels: Open Water → Advanced → Rescue → Specialty courses (Nitrox, Deep, Wreck). Never exceed your training limits. Regular skills practice and continuing education improve safety and enjoyment.";
    }
    
    // Calculations and Formulas
    if (lowerMessage.includes('calculate') || lowerMessage.includes('formula') || lowerMessage.includes('equation')) {
        return "Key diving formulas: 1) Pressure = depth/10 + 1 ATM, 2) MOD = (PPO₂/O₂%) × 10 - 10, 3) SAC = (pressure used × tank volume)/(time × avg pressure), 4) Gas needed = SAC × pressure × time. Use calculators above for precise results!";
    }
    
    // Weather and Conditions
    if (lowerMessage.includes('weather') || lowerMessage.includes('current') || lowerMessage.includes('visibility')) {
        return "Dive conditions affect safety and enjoyment. Check weather, sea state, currents, visibility before diving. Cancel dives in unsafe conditions. Strong currents increase air consumption and fatigue. Poor visibility increases disorientation risk.";
    }
    
    // Marine Life and Environment
    if (lowerMessage.includes('marine life') || lowerMessage.includes('coral') || lowerMessage.includes('fish')) {
        return "Observe marine life respectfully: don't touch, chase, or feed animals. Maintain good buoyancy to avoid coral damage. Coral reefs are fragile ecosystems - one touch can kill decades of growth. Take only pictures, leave only bubbles!";
    }
    
    // Equipment specific
    if (lowerMessage.includes('regulator') || lowerMessage.includes('breathing') || lowerMessage.includes('second stage')) {
        return "Regulators reduce high-pressure tank air to ambient pressure. First stage connects to tank, second stage to mouth. Always breathe continuously - never hold breath while scuba diving. Service annually, rinse after salt water use.";
    }
    
    if (lowerMessage.includes('bcd') || lowerMessage.includes('buoyancy control') || lowerMessage.includes('jacket')) {
        return "BCD (Buoyancy Control Device) allows neutral buoyancy adjustment. Add air when descending, release when ascending. Use small adjustments - breath control fine-tunes buoyancy. Inflate orally at surface if power inflator fails.";
    }
    
    // Greetings and general
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('help')) {
        return "Hello! I'm your ScuPlan diving assistant. I can help with dive physics, gas calculations, safety procedures, equipment questions, and dive planning. Ask me about MOD, SAC rates, decompression, emergencies, or any diving topic!";
    }
    
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
        return "You're welcome! Safe diving is my priority. Remember: plan your dive, dive your plan, and never exceed your training limits. If you have more diving questions, I'm here to help. Have a great dive!";
    }
    
    // Pattern matching for numbers (depth/time questions)
    const depthMatch = lowerMessage.match(/(\d+)\s*(m|meter|ft|foot|feet)/);
    const timeMatch = lowerMessage.match(/(\d+)\s*(min|minute|hour)/);
    
    if (depthMatch && lowerMessage.includes('ndl')) {
        const depth = parseInt(depthMatch[1]);
        const unit = depthMatch[2];
        const depthM = unit.startsWith('f') ? Math.round(depth * 0.3048) : depth;
        
        const ndlTable = {12: 147, 15: 80, 18: 56, 21: 40, 24: 29, 27: 22, 30: 20, 33: 16, 36: 14, 39: 13, 42: 11};
        let ndl = 20;
        for (let tableDepth in ndlTable) {
            if (depthM <= parseInt(tableDepth)) {
                ndl = ndlTable[tableDepth];
                break;
            }
        }
        return `At ${depth}${unit}, the NDL time is approximately ${ndl} minutes (using PADI RDP for air). This assumes a square profile and first dive of the day. Use dive computer or tables for precise planning.`;
    }
    
    // Default responses based on question type
    if (lowerMessage.includes('?')) {
        const questionStarters = [
            "That's a great diving question! ",
            "Good question for dive safety! ",
            "Important to understand this for safe diving! "
        ];
        const starter = questionStarters[Math.floor(Math.random() * questionStarters.length)];
        
        if (lowerMessage.includes('what') || lowerMessage.includes('how') || lowerMessage.includes('why')) {
            return starter + "For specific calculations, try the calculators above. For detailed procedures, check the Dive Theory section. Can you be more specific about what aspect you'd like to know?";
        }
    }
    
    // Fallback responses
    const defaultResponses = [
        "I can help with dive physics, gas calculations, safety procedures, and equipment questions. Try asking about MOD calculations, SAC rates, decompression theory, or emergency procedures.",
        "For dive planning help, I can explain NDL limits, gas consumption, buoyancy calculations, and safety procedures. What specific diving topic interests you?",
        "I'm knowledgeable about diving physics (Boyle's, Dalton's, Henry's laws), decompression theory, gas mixing, and safety protocols. What would you like to learn about?",
        "Ask me about dive calculations, safety procedures, equipment usage, or diving theory. I can help with MOD, EAD, SAC rates, gas planning, and emergency protocols."
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