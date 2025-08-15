/**
 * Enhanced AI Diving Assistant
 * Comprehensive local knowledge base for diving questions
 */

// Enhanced diving knowledge base with all topics mentioned in the prompt
const enhancedDivingKnowledge = {
    // Original topics
    "gas mixture": {
        keywords: ["gas", "mixture", "nitrox", "trimix", "air", "oxygen", "nitrogen", "helium", "ean", "mix"],
        response: `**Gas Mixtures for Diving:**

**Air (21% O₂, 79% N₂):**
• Most common gas mixture
• MOD: ~56m (recreational limit)
• Nitrogen narcosis starts around 30m
• Cheapest and most available

**Nitrox (EANx):**
• Higher oxygen content (22-40%)
• Longer no-decompression limits
• Reduced nitrogen absorption
• Common mixes: EAN32 (32% O₂), EAN36 (36% O₂)
• Requires special certification

**Trimix (He/N₂/O₂):**
• Contains helium to reduce narcosis
• Used for deep technical diving (>40m)
• Reduces nitrogen narcosis effects
• More expensive and requires advanced training
• Example: Trimix 18/45 (18% O₂, 45% He, 37% N₂)`
    },

    "decompression": {
        keywords: ["deco", "decompression", "stops", "ndl", "no decompression", "bends", "dcs"],
        response: `**Decompression Theory:**

**No Decompression Limits (NDL):**
• Maximum time at depth without mandatory stops
• Based on nitrogen absorption models
• Varies by depth and previous dive history
• Examples: 18m = 56min, 30m = 20min

**Decompression Stops:**
• Mandatory when NDL exceeded
• Allow nitrogen to safely off-gas
• Usually performed at 3m intervals
• Safety stop: 3-5 min at 5m (recommended)

**Decompression Sickness (DCS):**
• Caused by rapid ascent
• Nitrogen forms bubbles in tissues
• Symptoms: joint pain, skin rash, fatigue
• Treatment: immediate medical attention + hyperbaric chamber

**Prevention:**
• Follow NDL tables or computer
• Ascend slowly (9m/min max)
• Always do safety stops
• Stay hydrated and avoid alcohol`
    },

    // New enhanced topics for technical diving
    "technical diving": {
        keywords: ["technical", "tec", "tech", "advanced", "deep", "overhead", "cave", "wreck penetration"],
        response: `**Technical Diving Overview:**

**Definition:**
• Diving beyond recreational limits
• Planned decompression required
• Overhead environments (caves, wrecks)
• Multiple gas mixtures used

**Key Differences from Recreational:**
• Deeper than 40m
• Decompression obligations
• Redundant equipment systems
• Advanced gas planning
• Extended bottom times

**Required Skills:**
• Precise buoyancy control
• Advanced gas management
• Emergency procedures
• Equipment configuration
• Dive planning and execution

**Equipment Requirements:**
• Multiple cylinders
• Regulators with redundancy
• Backup lights and cutting tools
• Dive computers or bottom timers
• Exposure protection

**Training Prerequisites:**
• Advanced Open Water certification
• Deep diving specialty
• Enriched Air Nitrox
• Minimum logged dives (usually 100+)
• Medical clearance`
    },

    "trimix calculations": {
        keywords: ["trimix", "trimix calculation", "helium", "heliox", "best mix", "equivalent narcotic depth", "end"],
        response: `**Trimix Calculations:**

**Equivalent Narcotic Depth (END):**
• Formula: END = ((Depth + 10m) × N₂%) ÷ 79% - 10m
• Keeps narcotic effects to acceptable level
• Target END typically ≤30m for safety

**Oxygen Toxicity Limits:**
• CNS: Partial pressure tracking over time
• PPO₂ limits: 1.4 bar working, 1.6 bar deco
• Formula: PPO₂ = (Depth + 10m) ÷ 10 × O₂%

**Example Trimix 18/45:**
• 18% Oxygen, 45% Helium, 37% Nitrogen
• At 60m: PPO₂ = 7 × 0.18 = 1.26 bar (safe)
• END = (70 × 0.37) ÷ 0.79 - 10 = 22.7m

**Gas Planning:**
• Rule of thirds for penetration dives
• Calculate gas consumption at depth
• Plan for multiple decompression mixes
• Always carry emergency bailout gas

**Mixing Procedures:**
• Continuous blending or partial pressure
• Requires gas blending certification
• Precise analysis before diving
• Document all gas mixtures used`
    },

    "underwater vision": {
        keywords: ["vision", "light", "underwater", "visibility", "optics", "color", "refraction"],
        response: `**Underwater Vision & Light Physics:**

**Light Absorption:**
• Red light: Absorbed first (3-5m depth)
• Orange: Lost by 10m
• Yellow: Fades by 20m
• Blue/Green: Penetrate deepest

**Refraction Effects:**
• Objects appear 25% larger and closer
• Caused by light bending through water/mask
• Affects distance judgment underwater
• Brain learns to compensate with experience

**Visibility Factors:**
• Water clarity (suspended particles)
• Sunlight angle and weather
• Depth and time of day
• Geographic location

**Visual Limits:**
• Human eye adapted for air vision
• Color perception changes with depth
• Need artificial light for true colors
• Peripheral vision reduced in mask

**Practical Tips:**
• Use underwater lights below 10m
• Red filters for cameras in shallow water
• Signal with bright colors (yellow/orange)
• Practice distance estimation underwater

**Night Diving Considerations:**
• Pupil dilation takes 20-30 minutes
• Use red light to preserve night vision
• Enhanced hearing and touch sensitivity
• Different marine life behavior patterns`
    },

    "cold water diving": {
        keywords: ["cold", "cold water", "hypothermia", "drysuit", "thermal protection", "ice diving"],
        response: `**Cold Water Diving Physiology:**

**Body Heat Loss:**
• Water conducts heat 25x faster than air
• Head loses 40% of body heat
• Extremities affected first (hands, feet)
• Core temperature drop is dangerous

**Physiological Effects:**
• Vasoconstriction (blood vessel narrowing)
• Increased heart rate and blood pressure
• Reduced dexterity and reaction time
• Increased breathing rate

**Hypothermia Stages:**
• Mild: Shivering, reduced coordination
• Moderate: Confusion, drowsiness
• Severe: Loss of consciousness, cardiac arrest

**Protection Strategies:**
• Proper exposure suit thickness
• Drysuit for water <15°C
• Insulation layers (undergarments)
• Hood and boots essential
• Pre-dive warm-up

**Safety Procedures:**
• Shorter dive times
• Conservative dive profiles
• Buddy monitoring for hypothermia signs
• Hot drinks and warm environment post-dive
• Emergency surface procedures

**Equipment Considerations:**
• Regulator cold water rating
• Environmental sealing
• Battery performance in cold
• Mask defog solutions`
    },

    "night diving": {
        keywords: ["night", "night diving", "darkness", "light", "torch", "flashlight", "nocturnal"],
        response: `**Night Diving Techniques & Safety:**

**Preparation:**
• Start dive before complete darkness
• Familiar dive site recommended
• Check all lights and backup systems
• Review emergency procedures

**Equipment Required:**
• Primary light (LED recommended)
• Backup light (minimum 2)
• Tank light or glow stick
• Audible signaling device
• Compass for navigation

**Light Techniques:**
• Never shine light directly in buddy's eyes
• Use red light to preserve night vision
• Move light slowly to avoid startling marine life
• Signal with light movements, not touching

**Navigation:**
• Follow natural contours and features
• Use compass headings
• Note depth and time carefully
• Stay close to buddy (arm's length)

**Marine Life Behavior:**
• Many species more active at night
• Predator-prey relationships change
• Bioluminescence may be visible
• Different fish species emerge

**Safety Considerations:**
• More conservative dive profiles
• Shorter dive times
• Enhanced buddy system
• Clear entry/exit procedures
• Emergency surface protocols

**Common Challenges:**
• Disorientation without visual references
• Equipment management in darkness
• Marine life may be more curious
• Cold temperatures often at night`
    },

    "marine life behavior": {
        keywords: ["marine life", "fish", "shark", "turtle", "coral", "behavior", "interaction", "photography"],
        response: `**Advanced Marine Life Interactions:**

**Fish Behavior Patterns:**
• Cleaning stations: Fish gather for parasite removal
• Schooling: Protection and feeding efficiency
• Territorial behavior around coral heads
• Spawning aggregations at specific times/places

**Shark Encounters:**
• Most sharks are not aggressive to humans
• Observe body language: relaxed vs. aggressive posturing
• Maintain calm, slow movements
• Never corner or chase sharks
• Back-to-back positioning with buddy

**Turtle Interactions:**
• Approach from side, never from behind
• Maintain respectful distance (3+ meters)
• Never touch or chase
• Observe feeding and resting behavior
• Note species identification features

**Coral Reef Dynamics:**
• Symbiotic relationships (clownfish/anemone)
• Feeding patterns throughout the day
• Competition for space and resources
• Bleaching stress indicators

**Photography Ethics:**
• No flash on night-adapted animals
• Don't manipulate marine life for photos
• Maintain neutral buoyancy always
• Respect cleaning stations and feeding areas

**Conservation Awareness:**
• Human impact on marine ecosystems
• Overfishing and habitat destruction
• Climate change effects on coral reefs
• Marine protected area importance

**Seasonal Patterns:**
• Migration routes and timing
• Breeding seasons and spawning
• Food chain relationships
• Water temperature effects on behavior`
    },

    // Existing topics enhanced with new information
    "safety stops": {
        keywords: ["safety stop", "safety", "stop", "5m", "3 minutes", "ascent"],
        response: `**Enhanced Safety Stop Procedures:**

**Standard Safety Stop:**
• 3-5 minutes at 5m depth
• Performed on every dive, even within NDL
• Allows micro-bubble elimination
• Reduces decompression sickness risk by 85%

**Extended Safety Stops:**
• 5-8 minutes for deeper dives (>30m)
• Longer stops for repetitive diving
• Cold water or strenuous dives
• Conservative approach for older divers

**Deep Stops (Controversial):**
• Additional stops at half maximum depth
• Theory: Control bubble growth earlier
• Modern research questions effectiveness
• Follow current training agency guidelines

**Proper Technique:**
• Maintain exact depth (±0.5m)
• Use visual reference if available
• Practice buoyancy control
• Monitor remaining air supply
• Signal "OK" to buddy regularly

**When to Skip Safety Stops:**
• Emergency ascent situations
• Low air supply (below 50 bar)
• Diver medical emergency
• Equipment malfunction requiring surface

**Alternative Procedures:**
• Slow ascent (3m/min) can substitute
• Multiple short stops vs. one long stop
• Surface interval before second dive
• Conservative computer settings`
    },

    "dive theory": {
        keywords: ["theory", "physics", "boyle", "dalton", "henry", "pressure", "gas laws"],
        response: `**Comprehensive Dive Physics:**

**Boyle's Law (Pressure/Volume):**
• P₁V₁ = P₂V₂ (temperature constant)
• Air spaces compress/expand with depth
• Affects: lungs, ears, mask, BCD
• Key to understanding squeeze and expansion

**Dalton's Law (Partial Pressures):**
• Total pressure = sum of partial pressures
• Critical for gas toxicity calculations
• Oxygen toxicity and nitrogen narcosis
• Basis for gas mixture planning

**Henry's Law (Gas Solubility):**
• Gas dissolves proportional to pressure
• Foundation of decompression theory
• Nitrogen absorption and elimination
• Explains decompression sickness

**Archimedes' Principle (Buoyancy):**
• Buoyant force equals displaced water weight
• Positive, negative, neutral buoyancy
• Wetsuit compression affects buoyancy
• Weight distribution and trim

**Practical Applications:**
• Never hold breath while ascending
• Equalize early and often
• Understand computer algorithms
• Gas consumption increases with depth
• Water temperature affects gas laws

**Advanced Concepts:**
• Tissue compartment models
• M-values and gradient factors
• Gas kinetics and half-times
• Decompression algorithm differences
• Gas density and work of breathing`
    },

    // Simple decompression estimation (as requested)
    "deco estimation": {
        keywords: ["deco time", "decompression time", "estimate", "calculate", "bottom time", "depth"],
        response: `**Basic Decompression Estimation:**

**Simple Rules of Thumb:**
⚠️ For educational purposes only - use proper dive computer or tables!

**Recreational Limits (Air):**
• 18m: 56 minutes NDL
• 24m: 29 minutes NDL  
• 30m: 20 minutes NDL
• 36m: 14 minutes NDL

**Basic Deco Estimation (if NDL exceeded):**
• First 5 minutes over NDL: ~3 minutes deco
• Each additional 5 minutes: +2-3 minutes deco
• Performed at 3m for recreational depths

**Example Calculations:**
• 30m for 25 minutes (5 min over NDL):
  - Estimated deco: 3-5 minutes at 3m
• 24m for 40 minutes (11 min over NDL):
  - Estimated deco: 6-8 minutes at 3m

**Factors Affecting Deco Time:**
• Previous dives in last 24 hours
• Depth and bottom time
• Water temperature
• Physical exertion level
• Individual physiological factors

**Critical Safety Notes:**
• Always use proper dive computer or tables
• These are rough estimates only
• Real decompression involves multiple stops
• Cold water increases deco requirements
• Previous dives significantly affect calculations

**Professional Tools:**
• Dive computers with decompression algorithms
• Navy or PADI dive tables
• Technical diving software
• Gas switching and deep stop planning`
    }
};

// Enhanced chatbot functionality
class EnhancedDivingAssistant {
    constructor() {
        this.knowledgeBase = enhancedDivingKnowledge;
        this.conversationHistory = [];
        this.initializeInterface();
    }

    initializeInterface() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupChatInterface());
        } else {
            this.setupChatInterface();
        }
    }

    setupChatInterface() {
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendMessage');
        const chatMessages = document.getElementById('chatMessages');

        if (!chatInput || !sendButton || !chatMessages) {
            console.warn('Enhanced AI Assistant: Chat elements not found');
            return;
        }

        // Add enhanced greeting
        this.addMessage('assistant', this.getEnhancedGreeting());

        // Event listeners
        sendButton.addEventListener('click', () => this.handleUserMessage());
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUserMessage();
        });

        // Add example questions
        this.addExampleQuestions();
    }

    getEnhancedGreeting() {
        return `Hello! I'm your enhanced ScuPlan diving assistant. I can help you with:

• **Technical Diving** - Trimix calculations, gas planning, decompression theory
• **Physics & Theory** - Gas laws, underwater optics, pressure effects  
• **Environmental Diving** - Cold water physiology, night diving techniques
• **Marine Life** - Behavior patterns, interaction guidelines, conservation
• **Safety Procedures** - Emergency protocols, equipment selection
• **Dive Planning** - Basic decompression estimation, gas mixture advice

I run completely locally in your browser with no external connections. Ask me anything about diving!`;
    }

    addExampleQuestions() {
        const exampleContainer = document.createElement('div');
        exampleContainer.className = 'example-questions mt-3';
        exampleContainer.innerHTML = `
            <div class="small text-muted mb-2">Example questions:</div>
            <div class="d-flex flex-wrap gap-1">
                <button class="btn btn-outline-primary btn-sm" onclick="window.enhancedAI.askExample('What is trimix?')">
                    Trimix basics
                </button>
                <button class="btn btn-outline-primary btn-sm" onclick="window.enhancedAI.askExample('How does light work underwater?')">
                    Underwater vision
                </button>
                <button class="btn btn-outline-primary btn-sm" onclick="window.enhancedAI.askExample('Cold water diving tips?')">
                    Cold water diving
                </button>
                <button class="btn btn-outline-primary btn-sm" onclick="window.enhancedAI.askExample('Night diving safety?')">
                    Night diving
                </button>
                <button class="btn btn-outline-primary btn-sm" onclick="window.enhancedAI.askExample('Estimate deco for 30m, 25 minutes')">
                    Deco estimation
                </button>
            </div>
        `;
        
        const chatContainer = document.querySelector('.ai-chat-container');
        if (chatContainer) {
            chatContainer.appendChild(exampleContainer);
        }
    }

    askExample(question) {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = question;
            this.handleUserMessage();
        }
    }

    handleUserMessage() {
        const chatInput = document.getElementById('chatInput');
        const userMessage = chatInput.value.trim();
        
        if (!userMessage) return;

        this.addMessage('user', userMessage);
        chatInput.value = '';

        // Process message with enhanced knowledge base
        setTimeout(() => {
            const response = this.generateEnhancedResponse(userMessage);
            this.addMessage('assistant', response);
        }, 500);
    }

    generateEnhancedResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Check for exact matches in enhanced knowledge base
        for (const [topic, data] of Object.entries(this.knowledgeBase)) {
            if (data.keywords.some(keyword => message.includes(keyword))) {
                this.conversationHistory.push({
                    topic: topic,
                    question: userMessage,
                    timestamp: new Date()
                });
                return data.response;
            }
        }

        // Enhanced fallback responses for specific diving topics
        if (this.isDecoCalculationRequest(message)) {
            return this.handleDecoCalculation(message);
        }

        if (this.isGasMixtureQuestion(message)) {
            return this.handleGasMixtureAdvice(message);
        }

        if (this.isDepthTimeQuestion(message)) {
            return this.handleDepthTimeAdvice(message);
        }

        // Default enhanced response
        return this.getEnhancedFallbackResponse(message);
    }

    isDecoCalculationRequest(message) {
        const decoKeywords = ['deco', 'decompression', 'calculate', 'estimate', 'bottom time'];
        const hasDepth = /\d+\s*m|\d+\s*meters|\d+\s*ft|\d+\s*feet/.test(message);
        const hasTime = /\d+\s*min|\d+\s*minutes|\d+\s*hour/.test(message);
        
        return decoKeywords.some(keyword => message.includes(keyword)) && (hasDepth || hasTime);
    }

    handleDecoCalculation(message) {
        // Extract depth and time from message
        const depthMatch = message.match(/(\d+)\s*(?:m|meters|ft|feet)/);
        const timeMatch = message.match(/(\d+)\s*(?:min|minutes)/);
        
        if (depthMatch && timeMatch) {
            const depth = parseInt(depthMatch[1]);
            const time = parseInt(timeMatch[1]);
            
            return `**Decompression Estimation for ${depth}m, ${time} minutes:**

⚠️ **This is a rough educational estimate only - always use proper dive computer or tables!**

Based on standard air diving:
• Approximate NDL at ${depth}m: ${this.getNDL(depth)} minutes
• Your dive time: ${time} minutes
• Estimated decompression: ${this.estimateDeco(depth, time)}

**Important Notes:**
• This assumes first dive of the day on air
• Cold water increases decompression requirements
• Always add safety margin
• Use certified dive computer for actual diving

**Recommendation:** Use proper dive planning tools like dive computers or certified tables for actual dive planning.`;
        }
        
        return this.knowledgeBase["deco estimation"].response;
    }

    getNDL(depth) {
        // Simple NDL table for air
        const ndlTable = {
            12: 147, 15: 80, 18: 56, 21: 40, 24: 29, 27: 22, 30: 20, 33: 16, 36: 14, 39: 11, 42: 9
        };
        
        // Find closest depth
        const depths = Object.keys(ndlTable).map(Number).sort((a, b) => a - b);
        const closestDepth = depths.reduce((prev, curr) => 
            Math.abs(curr - depth) < Math.abs(prev - depth) ? curr : prev
        );
        
        return ndlTable[closestDepth] || "See dive tables";
    }

    estimateDeco(depth, time) {
        const ndl = this.getNDL(depth);
        if (time <= ndl) {
            return "No decompression required (within NDL)";
        }
        
        const overtime = time - ndl;
        const decoTime = Math.ceil(overtime * 0.3) + 3; // Very rough estimation
        
        return `Approximately ${decoTime} minutes at 3m`;
    }

    isGasMixtureQuestion(message) {
        return ['mix', 'nitrox', 'trimix', 'gas', 'oxygen', 'mod', 'best mix'].some(keyword => 
            message.includes(keyword)
        );
    }

    handleGasMixtureAdvice(message) {
        if (message.includes('mod') || message.includes('maximum operating depth')) {
            return `**Maximum Operating Depth (MOD) Calculation:**

**Formula:** MOD = (PPO₂ ÷ O₂%) × 10 - 10

**Standard PPO₂ Limits:**
• Working limit: 1.4 bar
• Emergency limit: 1.6 bar

**Examples:**
• Air (21% O₂): MOD = 56m at 1.4 PPO₂
• EAN32 (32% O₂): MOD = 33.8m at 1.4 PPO₂
• EAN36 (36% O₂): MOD = 28.9m at 1.4 PPO₂

**Safety Considerations:**
• Always round down for safety margin
• Consider higher risk activities (deeper limits)
• Account for accidental depth excursions
• Monitor CNS oxygen tracking

For specific MOD calculations, tell me the oxygen percentage and desired PPO₂ limit.`;
        }
        
        return this.knowledgeBase["gas mixture"].response;
    }

    isDepthTimeQuestion(message) {
        return ['how long', 'bottom time', 'ndl', 'no decompression limit'].some(keyword => 
            message.includes(keyword)
        );
    }

    handleDepthTimeAdvice(message) {
        return `**No Decompression Limits (NDL) for Air:**

**Standard NDL Times:**
• 12m (40ft): 147 minutes
• 15m (50ft): 80 minutes  
• 18m (60ft): 56 minutes
• 21m (70ft): 40 minutes
• 24m (80ft): 29 minutes
• 27m (90ft): 22 minutes
• 30m (100ft): 20 minutes
• 33m (110ft): 16 minutes
• 36m (120ft): 14 minutes

**Factors Affecting NDL:**
• Previous dives (residual nitrogen)
• Water temperature (cold reduces NDL)
• Physical exertion
• Altitude diving
• Age and fitness level

**Nitrox Benefits:**
• EAN32 at 24m: 45 minutes vs 29 minutes on air
• EAN36 at 21m: 85 minutes vs 40 minutes on air

For specific depth/time questions, tell me your planned depth and I'll provide the NDL.`;
    }

    getEnhancedFallbackResponse(message) {
        const responses = [
            "I specialize in diving topics like gas mixtures, decompression theory, marine life behavior, and safety procedures. Could you rephrase your question focusing on these diving-related areas?",
            
            "I can help with technical diving calculations, underwater physics, marine life interactions, and safety protocols. What specific diving topic would you like to explore?",
            
            "My expertise covers dive planning, gas mixture calculations, decompression theory, and underwater environment topics. What diving question can I assist you with?",
            
            "I'm designed to help with diving physics, safety procedures, marine life behavior, and technical diving topics. Could you ask about a specific diving-related subject?"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)] + 
               "\n\n**Popular topics I can help with:**\n• Gas mixture calculations and MOD\n• Decompression theory and NDL limits\n• Technical diving and trimix\n• Underwater physics and vision\n• Cold water and night diving\n• Marine life behavior and interactions";
    }

    addMessage(sender, message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message mb-3`;
        
        const messageContent = document.createElement('div');
        messageContent.className = `message-content p-3 rounded ${sender === 'user' ? 'bg-primary text-white ms-auto' : 'bg-light'}`;
        messageContent.style.maxWidth = '85%';
        
        if (sender === 'assistant') {
            // Format assistant messages with markdown-like styling
            messageContent.innerHTML = this.formatMessage(message);
        } else {
            messageContent.textContent = message;
        }
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    formatMessage(message) {
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/•/g, '•')
            .replace(/⚠️/g, '⚠️')
            .replace(/\n/g, '<br>');
    }
}

// Initialize enhanced assistant when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('chatMessages')) {
        window.enhancedAI = new EnhancedDivingAssistant();
        console.log('Enhanced AI Diving Assistant initialized');
    }
});

// Export for global access
window.EnhancedDivingAssistant = EnhancedDivingAssistant;