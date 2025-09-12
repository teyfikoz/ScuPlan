/**
 * Enhanced AI Diving Assistant v2.0
 * Advanced diving assistant with comprehensive knowledge base, quick actions, and analysis capabilities
 */

class EnhancedDivingAssistant {
    constructor() {
        this.conversationHistory = [];
        this.currentDivePlan = null;
        this.userPreferences = this.loadUserPreferences();
        this.knowledgeBase = this.initializeKnowledgeBase();
        this.initializeInterface();
    }

    initializeInterface() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupInterface());
        } else {
            this.setupInterface();
        }
    }

    setupInterface() {
        this.setupChatInterface();
        this.setupQuickActionButtons();
        this.setupPresetTemplates();
        this.setupVoiceInput();
        this.loadConversationHistory();
    }

    setupChatInterface() {
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendMessage');
        const chatMessages = document.getElementById('chatMessages');

        if (!chatInput || !sendButton || !chatMessages) {
            console.warn('Enhanced AI Assistant: Chat elements not found');
            return;
        }

        // Enhanced greeting with current dive plan context
        this.addMessage('assistant', this.getContextualGreeting());

        // Event listeners
        sendButton.addEventListener('click', () => this.handleUserMessage());
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserMessage();
            }
        });

        // Auto-resize textarea
        chatInput.addEventListener('input', () => this.autoResizeInput(chatInput));
    }

    setupQuickActionButtons() {
        const chatContainer = document.querySelector('.ai-chat-container');
        if (!chatContainer) {
            console.warn('Chat container not found, skipping quick actions setup');
            return;
        }

        const cardBody = chatContainer.querySelector('.card-body');
        if (!cardBody) {
            console.warn('Card body not found, skipping quick actions setup');
            return;
        }

        // Create quick actions panel
        const quickActionsHtml = `
            <div class="quick-actions-panel p-2 border-bottom bg-light">
                <div class="row g-1">
                    <div class="col-6">
                        <button class="btn btn-outline-primary btn-sm w-100" onclick="window.aiAssistant && window.aiAssistant.quickAction('analyzePlan')">
                            <i class="fas fa-search me-1"></i>Analyze Plan
                        </button>
                    </div>
                    <div class="col-6">
                        <button class="btn btn-outline-success btn-sm w-100" onclick="window.aiAssistant && window.aiAssistant.quickAction('safetyCheck')">
                            <i class="fas fa-shield-alt me-1"></i>Safety Check
                        </button>
                    </div>
                    <div class="col-6">
                        <button class="btn btn-outline-info btn-sm w-100" onclick="window.aiAssistant && window.aiAssistant.quickAction('gasCalc')">
                            <i class="fas fa-flask me-1"></i>Gas Calc
                        </button>
                    </div>
                    <div class="col-6">
                        <button class="btn btn-outline-warning btn-sm w-100" onclick="window.aiAssistant && window.aiAssistant.quickAction('emergency')">
                            <i class="fas fa-exclamation-triangle me-1"></i>Emergency
                        </button>
                    </div>
                </div>
            </div>
        `;

        cardBody.insertAdjacentHTML('afterbegin', quickActionsHtml);
    }

    setupPresetTemplates() {
        // Add preset question templates
        const presetsHtml = `
            <div class="preset-questions mt-2">
                <small class="text-muted">Quick questions:</small>
                <div class="d-flex flex-wrap gap-1 mt-1">
                    <button class="btn btn-outline-secondary btn-xs" onclick="window.aiAssistant && window.aiAssistant.askPreset('What is the MOD for Nitrox 32 at 1.4 pO2?')">
                        MOD Calc
                    </button>
                    <button class="btn btn-outline-secondary btn-xs" onclick="window.aiAssistant && window.aiAssistant.askPreset('What are safety stop requirements?')">
                        Safety Stops
                    </button>
                    <button class="btn btn-outline-secondary btn-xs" onclick="window.aiAssistant && window.aiAssistant.askPreset('How do I plan a deep dive?')">
                        Deep Diving
                    </button>
                </div>
            </div>
        `;

        const inputContainer = document.querySelector('.border-top.p-3');
        if (inputContainer) {
            inputContainer.insertAdjacentHTML('afterbegin', presetsHtml);
        } else {
            console.warn('Input container not found, skipping preset templates setup');
        }
    }

    setupVoiceInput() {
        // Voice input capability (if supported)
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const chatInput = document.querySelector('#chatInput');
            if (!chatInput) {
                console.warn('Chat input not found, skipping voice input setup');
                return;
            }

            const inputGroup = chatInput.closest('.input-group');
            if (!inputGroup) {
                console.warn('Input group not found, skipping voice input setup');
                return;
            }

            this.speechRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            this.speechRecognition.continuous = false;
            this.speechRecognition.interimResults = false;
            this.speechRecognition.lang = 'en-US';

            const voiceButton = `
                <button class="btn btn-outline-secondary ms-1" type="button" id="voiceInputBtn" title="Voice Input">
                    <i class="fas fa-microphone"></i>
                </button>
            `;

            inputGroup.insertAdjacentHTML('beforeend', voiceButton);

            const voiceBtn = document.getElementById('voiceInputBtn');
            if (voiceBtn) {
                voiceBtn.addEventListener('click', () => {
                    this.startVoiceInput();
                });
            }
        }
    }

    getContextualGreeting() {
        const currentTime = new Date().getHours();
        let greeting = currentTime < 12 ? 'Good morning' : currentTime < 18 ? 'Good afternoon' : 'Good evening';
        
        return `${greeting}! I'm your enhanced ScuPlan diving assistant. 🤿

I can help you with:
• Real-time dive plan analysis
• Gas mixture calculations & MOD planning  
• Safety recommendations & emergency procedures
• Equipment compatibility checks
• Technical diving & decompression theory
• Marine biology & environmental questions

Try the quick action buttons above or ask me anything about diving!`;
    }

    async handleUserMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (!message) return;

        // Add user message
        this.addMessage('user', message);
        chatInput.value = '';
        this.autoResizeInput(chatInput);

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Process message and get response
            const response = await this.processMessage(message);
            this.hideTypingIndicator();
            this.addMessage('assistant', response);
            
            // Save to history
            this.saveToHistory(message, response);
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('assistant', 'I apologize, but I encountered an error processing your message. Please try again or rephrase your question.');
            console.error('AI Assistant Error:', error);
        }
    }

    async processMessage(message) {
        // Enhanced message processing with multiple analysis layers
        const analysis = this.analyzeMessage(message);
        
        // Check if it's a dive plan related question
        if (analysis.isDivePlanRelated && this.getCurrentDivePlan()) {
            return this.analyzeDivePlan(message, analysis);
        }
        
        // Check for specific diving topics
        if (analysis.topic) {
            return this.getTopicResponse(analysis.topic, message);
        }

        // Calculate diving-related questions
        if (analysis.needsCalculation) {
            return this.performCalculation(analysis.calculationType, message);
        }

        // General knowledge base search
        return this.searchKnowledgeBase(message);
    }

    analyzeMessage(message) {
        const lowerMessage = message.toLowerCase();
        
        return {
            isDivePlanRelated: /current.*plan|this.*dive|my.*plan/.test(lowerMessage),
            topic: this.detectTopic(lowerMessage),
            needsCalculation: this.detectCalculationNeed(lowerMessage),
            calculationType: this.detectCalculationType(lowerMessage),
            urgency: /emergency|urgent|help|danger/.test(lowerMessage) ? 'high' : 'normal'
        };
    }

    detectTopic(message) {
        const topics = {
            'safety': /safety|safe|danger|risk|accident|emergency/,
            'gas': /gas|mix|nitrox|trimix|oxygen|o2|mod|end|ead/,
            'decompression': /deco|decompression|stop|ndl|nitrogen/,
            'equipment': /equipment|gear|tank|regulator|bcd|mask|fin/,
            'technical': /technical|tec|deep|cave|wreck|overhead/,
            'marine_life': /fish|coral|shark|turtle|marine|sea life/,
            'physics': /pressure|depth|buoyancy|physics|law/,
            'certification': /cert|course|training|padi|ssi|naui/
        };

        for (const [topic, regex] of Object.entries(topics)) {
            if (regex.test(message)) return topic;
        }
        return null;
    }

    detectCalculationNeed(message) {
        return /calculate|compute|what.*depth|how.*deep|mod|end|sac|consumption/.test(message);
    }

    detectCalculationType(message) {
        if (/mod|maximum.*operating.*depth/.test(message)) return 'mod';
        if (/end|equivalent.*narcotic/.test(message)) return 'end';
        if (/sac|consumption/.test(message)) return 'sac';
        if (/deco|decompression/.test(message)) return 'deco';
        return 'general';
    }

    async quickAction(actionType) {
        this.showTypingIndicator();

        let response = '';
        switch (actionType) {
            case 'analyzePlan':
                response = await this.performDivePlanAnalysis();
                break;
            case 'safetyCheck':
                response = await this.performSafetyCheck();
                break;
            case 'gasCalc':
                response = await this.performGasCalculations();
                break;
            case 'emergency':
                response = await this.provideEmergencyGuidance();
                break;
        }

        this.hideTypingIndicator();
        this.addMessage('assistant', response);
    }

    async performDivePlanAnalysis() {
        const divePlan = this.getCurrentDivePlan();
        
        if (!divePlan) {
            return `No active dive plan found. Please create a dive plan first and I'll analyze it for:

🔍 **Safety Assessment**
• Depth and time limits
• Gas requirements
• Decompression needs

📊 **Risk Analysis** 
• Environmental factors
• Equipment requirements
• Experience level match

💡 **Recommendations**
• Optimizations
• Safety margins
• Alternative profiles`;
        }

        return this.generateDivePlanAnalysis(divePlan);
    }

    async performSafetyCheck() {
        return `🛡️ **Dive Safety Checklist**

**Pre-Dive Safety:**
✅ Weather and sea conditions check
✅ Equipment inspection and functionality test
✅ Emergency action plan established
✅ Dive buddy communication signals confirmed

**Planning Safety:**
✅ Maximum depth within certification limits
✅ Adequate gas supply with reserves
✅ Emergency ascent procedures planned
✅ Surface interval calculations verified

**Equipment Safety:**
✅ Primary and backup systems checked
✅ Buoyancy control tested
✅ Emergency signaling devices ready

❓ Need specific safety guidance for your dive plan?`;
    }

    async performGasCalculations() {
        return `⚗️ **Gas Mixture Calculations**

**MOD (Maximum Operating Depth):**
Formula: MOD = ((pO₂ max / FO₂) - 1) × 10

**END (Equivalent Narcotic Depth):**  
Formula: END = ((Depth + 10) × FN₂ / 0.79) - 10

**Best Mix Calculation:**
- Target depth and max pO₂ required
- Consider narcosis limits (END)

🧮 **Quick Examples:**
• Nitrox 32 at 1.4 pO₂ = 33.7m MOD
• Air at 30m = 30m END
• Trimix 18/45 reduces narcosis significantly

Need specific gas calculations? Tell me your mix and depth!`;
    }

    async provideEmergencyGuidance() {
        return `🚨 **Emergency Procedures**

**Immediate Actions:**
1️⃣ Stay calm and assess situation
2️⃣ Signal diving emergency if needed
3️⃣ Assist affected diver safely

**Common Emergencies:**

**🆘 Out of Air:**
• Share air with buddy using alternate air source
• Make controlled emergency ascent if no buddy
• Never hold breath during ascent

**🤿 Equipment Failure:**
• Switch to backup/alternate equipment
• Signal buddy for assistance
• Consider dive termination

**⚠️ Decompression Illness:**
• Get diver to surface safely
• Administer oxygen if available
• Seek immediate medical attention
• Contact DAN (Divers Alert Network)

**📞 Emergency Contacts:**
• Local emergency services: 911/112
• DAN Emergency Hotline: +1-919-684-9111

Need specific emergency guidance?`;
    }

    askPreset(question) {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = question;
            this.handleUserMessage();
        } else {
            console.warn('Chat input not found, cannot set preset question');
        }
    }

    getCurrentDivePlan() {
        // Try to get current dive plan from the main application
        if (window.app && window.app.currentPlan) {
            return window.app.currentPlan;
        }

        // Try to extract from form inputs
        const depthInput = document.getElementById('diveDepth');
        const timeInput = document.getElementById('bottomTime');
        
        if (depthInput && timeInput && depthInput.value && timeInput.value) {
            return {
                depth: parseFloat(depthInput.value),
                bottomTime: parseFloat(timeInput.value),
                location: document.getElementById('diveLocation')?.value || '',
                diveType: document.getElementById('diveType')?.value || 'recreational',
                tanks: window.app?.tanks || [],
                buddies: window.app?.buddies || []
            };
        }

        return null;
    }

    generateDivePlanAnalysis(plan) {
        let analysis = `📋 **Dive Plan Analysis**\n\n`;
        
        // Basic parameters
        analysis += `**Current Plan:**\n`;
        analysis += `• Depth: ${plan.depth}m\n`;
        analysis += `• Bottom Time: ${plan.bottomTime} minutes\n`;
        analysis += `• Type: ${plan.diveType}\n`;
        if (plan.location) analysis += `• Location: ${plan.location}\n`;

        // Safety analysis
        analysis += `\n🔍 **Safety Analysis:**\n`;
        
        if (plan.depth > 30) {
            analysis += `⚠️ Deep dive - requires advanced certification\n`;
        }
        
        if (plan.depth > 18 && plan.diveType === 'recreational') {
            analysis += `💡 Consider deep diving specialty training\n`;
        }

        // NDL check (simplified)
        const ndl = this.calculateSimpleNDL(plan.depth);
        if (plan.bottomTime > ndl) {
            analysis += `⚠️ Exceeds No Decompression Limit (${ndl} min)\n`;
            analysis += `🛑 Decompression stops required\n`;
        } else {
            analysis += `✅ Within No Decompression Limits\n`;
        }

        // Gas analysis
        if (plan.tanks && plan.tanks.length > 0) {
            analysis += `\n⚗️ **Gas Analysis:**\n`;
            plan.tanks.forEach((tank, i) => {
                const gasType = tank.gasType || 'air';
                analysis += `• Tank ${i+1}: ${tank.size || 12}L ${gasType.toUpperCase()}\n`;
                
                if (gasType === 'air' && plan.depth > 30) {
                    analysis += `  💡 Consider Nitrox for extended bottom time\n`;
                }
            });
        }

        // Recommendations
        analysis += `\n💡 **Recommendations:**\n`;
        analysis += `• Plan safety stop at 5m for 3 minutes\n`;
        analysis += `• Maintain 50 bar gas reserve\n`;
        analysis += `• Check weather conditions before dive\n`;

        return analysis;
    }

    calculateSimpleNDL(depth) {
        // Simplified NDL calculation for analysis
        const ndlTable = {
            12: 147, 15: 80, 18: 56, 21: 40, 24: 29, 27: 22, 30: 16,
            33: 13, 36: 10, 39: 8, 42: 7, 45: 6, 48: 5, 51: 4
        };
        
        for (const [d, t] of Object.entries(ndlTable)) {
            if (depth <= parseInt(d)) return t;
        }
        return 3; // Deep dives
    }

    startVoiceInput() {
        if (!this.speechRecognition) return;

        const voiceBtn = document.getElementById('voiceInputBtn');
        voiceBtn.innerHTML = '<i class="fas fa-stop text-danger"></i>';
        voiceBtn.title = 'Stop Recording';

        this.speechRecognition.start();

        this.speechRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('chatInput').value = transcript;
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            voiceBtn.title = 'Voice Input';
        };

        this.speechRecognition.onerror = () => {
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            voiceBtn.title = 'Voice Input';
        };

        this.speechRecognition.onend = () => {
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            voiceBtn.title = 'Voice Input';
        };
    }

    addMessage(sender, message) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message mb-2`;
        
        const isUser = sender === 'user';
        messageDiv.innerHTML = `
            <div class="d-flex ${isUser ? 'justify-content-end' : 'justify-content-start'}">
                <div class="message-bubble ${isUser ? 'bg-primary text-white' : 'bg-light'} p-2 rounded max-width-80">
                    ${isUser ? message : this.formatMessage(message)}
                </div>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    formatMessage(message) {
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/^([🔍💡⚠️✅🛑⚗️🚨📋🤿💪🆘📞].*)$/gm, '<strong>$1</strong>');
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'typingIndicator';
        indicator.className = 'message assistant-message mb-2';
        indicator.innerHTML = `
            <div class="d-flex justify-content-start">
                <div class="message-bubble bg-light p-2 rounded">
                    <div class="typing-animation">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>
        `;

        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.appendChild(indicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }

    autoResizeInput(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    saveToHistory(question, answer) {
        this.conversationHistory.push({
            timestamp: Date.now(),
            question,
            answer
        });

        // Keep only last 50 conversations
        if (this.conversationHistory.length > 50) {
            this.conversationHistory = this.conversationHistory.slice(-50);
        }

        // Save to localStorage
        try {
            localStorage.setItem('scuplan_ai_history', JSON.stringify(this.conversationHistory));
        } catch (error) {
            console.warn('Could not save conversation history:', error);
        }
    }

    loadConversationHistory() {
        try {
            const saved = localStorage.getItem('scuplan_ai_history');
            if (saved) {
                this.conversationHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Could not load conversation history:', error);
            this.conversationHistory = [];
        }
    }

    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('scuplan_ai_preferences');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            return {};
        }
    }

    initializeKnowledgeBase() {
        // Initialize a simple knowledge base object
        return {
            topics: {
                safety: {
                    responses: [
                        'Always follow the buddy system and plan your dive.',
                        'Never hold your breath during ascent.',
                        'Check your equipment before every dive.',
                        'Maintain proper ascent rates (9-10m/min).',
                        'Plan emergency procedures before diving.'
                    ]
                },
                gas: {
                    responses: [
                        'MOD = ((pO₂ max / FO₂) - 1) × 10',
                        'END = ((Depth + 10) × FN₂ / 0.79) - 10',
                        'Nitrox provides extended bottom times at recreational depths.',
                        'Always analyze your gas mixture before diving.',
                        'Plan gas reserves (rule of thirds for overhead environments).'
                    ]
                },
                decompression: {
                    responses: [
                        'No decompression limits vary by depth and time.',
                        'Safety stops are recommended even within NDL.',
                        'Use proper decompression tables or dive computers.',
                        'Ascent rate is critical for decompression safety.',
                        'Plan dive profiles to minimize decompression obligations.'
                    ]
                },
                equipment: {
                    responses: [
                        'Regular equipment maintenance is essential for safety.',
                        'Always carry backup equipment for critical systems.',
                        'Test all equipment before entering the water.',
                        'Proper fit and familiarity with gear is important.',
                        'Choose equipment appropriate for your certification level.'
                    ]
                }
            }
        };
    }

    analyzeDivePlan(message, analysis) {
        const divePlan = this.getCurrentDivePlan();
        if (!divePlan) {
            return "I don't see an active dive plan to analyze. Please create a dive plan first.";
        }

        return this.generateDivePlanAnalysis(divePlan);
    }

    getTopicResponse(topic, message) {
        const topicData = this.knowledgeBase.topics[topic];
        if (!topicData || !topicData.responses) {
            return this.searchKnowledgeBase(message);
        }

        // Get a random response from the topic
        const responses = topicData.responses;
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        return `🎯 **${topic.charAt(0).toUpperCase() + topic.slice(1)} Information:**\n\n${randomResponse}\n\nNeed more specific information about ${topic}? Feel free to ask!`;
    }

    performCalculation(calculationType, message) {
        switch (calculationType) {
            case 'mod':
                return `🧮 **MOD Calculation:**\n\nMOD = ((pO₂ max / FO₂) - 1) × 10\n\n**Example:**\n• Nitrox 32 at 1.4 pO₂ = 33.7m MOD\n• Nitrox 36 at 1.4 pO₂ = 28.9m MOD\n\nTell me your O₂ percentage and max pO₂ for a specific calculation!`;
            
            case 'end':
                return `🧠 **END Calculation:**\n\nEND = ((Depth + 10) × FN₂ / 0.79) - 10\n\n**Purpose:** Shows narcotic effect equivalent to air diving\n\n**Example:**\n• Air at 30m = 30m END\n• Trimix 21/35 at 45m = 20m END\n\nProvide depth and gas mix for specific calculation!`;
            
            case 'sac':
                return `💨 **SAC Rate Information:**\n\nSAC (Surface Air Consumption) varies by:\n• Experience level (12-25 L/min typical)\n• Activity level during dive\n• Stress and comfort\n• Physical fitness\n\n**Calculation:** Actual consumption ÷ (depth/10 + 1)\n\nProvide tank size, pressures, and dive details for calculation!`;
            
            default:
                return this.searchKnowledgeBase(message);
        }
    }

    // Enhanced knowledge base integration
    searchKnowledgeBase(query) {
        // Simplified knowledge base search - can be expanded
        const responses = {
            'mod': 'MOD (Maximum Operating Depth) is calculated using: MOD = ((pO₂ max / FO₂) - 1) × 10. For Nitrox 32 at 1.4 pO₂, MOD = 33.7 meters.',
            'end': 'END (Equivalent Narcotic Depth) shows narcotic effect: END = ((Depth + 10) × FN₂ / 0.79) - 10',
            'safety': 'Always follow the buddy system, plan your dive and dive your plan, maintain proper ascent rates (9m/min), and never hold your breath.',
            'nitrox': 'Nitrox is enriched air with higher oxygen content than air (21%). Common mixes are EANx32 (32% O₂) and EANx36 (36% O₂).',
            'decompression': 'Decompression stops are required when you exceed No Decompression Limits (NDL). Always use dive tables or computers for accurate planning.'
        };

        const lowerQuery = query.toLowerCase();
        for (const [key, response] of Object.entries(responses)) {
            if (lowerQuery.includes(key)) {
                return response;
            }
        }

        return "I'd be happy to help with your diving question! I can assist with gas calculations, safety procedures, equipment advice, and dive planning. Could you be more specific about what you'd like to know?";
    }
}

// CSS for typing animation and chat styling
const assistantStyles = `
<style>
.typing-animation {
    display: inline-flex;
    align-items: center;
}

.typing-animation span {
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: #6c757d;
    margin: 0 1px;
    animation: typing 1.4s infinite ease-in-out;
}

.typing-animation span:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-animation span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes typing {
    0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.4;
    }
    30% {
        transform: translateY(-10px);
        opacity: 1;
    }
}

.max-width-80 {
    max-width: 80%;
}

.btn-xs {
    padding: 0.125rem 0.375rem;
    font-size: 0.75rem;
    line-height: 1.2;
}

.quick-actions-panel .btn {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
}
</style>
`;

// Initialize Enhanced AI Assistant
document.addEventListener('DOMContentLoaded', function() {
    // Add styles
    document.head.insertAdjacentHTML('beforeend', assistantStyles);
    
    // Initialize assistant
    window.aiAssistant = new EnhancedDivingAssistant();
    console.log('Enhanced AI Diving Assistant v2.0 initialized');
});