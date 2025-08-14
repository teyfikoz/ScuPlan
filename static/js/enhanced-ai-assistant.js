/**
 * Enhanced AI Assistant with Extended Knowledge Base
 * Zero-cost, offline-capable diving assistant with comprehensive knowledge
 */

class EnhancedDiveAssistant {
    constructor() {
        this.knowledgeBase = null;
        this.loadKnowledgeBase();
        this.setupEventListeners();
    }

    /**
     * Load knowledge base from JSON file
     */
    async loadKnowledgeBase() {
        try {
            const response = await fetch('/static/data/diving-knowledge.json');
            this.knowledgeBase = await response.json();
            console.log('Diving knowledge base loaded successfully');
        } catch (error) {
            console.warn('Could not load knowledge base, using basic responses');
            this.knowledgeBase = null;
        }
    }

    /**
     * Setup event listeners for enhanced functionality
     */
    setupEventListeners() {
        // Listen for chat interactions
        document.addEventListener('DOMContentLoaded', () => {
            this.enhanceChatInterface();
        });
    }

    /**
     * Enhance existing chat interface with new knowledge
     */
    enhanceChatInterface() {
        // Override the existing generateAIResponse function if it exists
        if (typeof window.generateAIResponse === 'function') {
            window.originalGenerateAIResponse = window.generateAIResponse;
            window.generateAIResponse = (message) => this.generateEnhancedResponse(message);
        }
    }

    /**
     * Generate enhanced AI response using knowledge base
     */
    generateEnhancedResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Try knowledge base responses first
        const knowledgeResponse = this.getKnowledgeResponse(lowerMessage);
        if (knowledgeResponse) {
            return knowledgeResponse;
        }

        // Fall back to original response system
        if (typeof window.originalGenerateAIResponse === 'function') {
            return window.originalGenerateAIResponse(message);
        }

        // Basic fallback
        return this.getBasicResponse(lowerMessage);
    }

    /**
     * Get response from loaded knowledge base
     */
    getKnowledgeResponse(lowerMessage) {
        if (!this.knowledgeBase) return null;

        // Deep diving physics
        if (lowerMessage.includes('derin') || lowerMessage.includes('deep') || lowerMessage.includes('basınç') || lowerMessage.includes('pressure')) {
            return this.formatKnowledgeResponse(this.knowledgeBase.deepDiving);
        }

        // Underwater vision and light
        if (lowerMessage.includes('görme') || lowerMessage.includes('vision') || lowerMessage.includes('ışık') || lowerMessage.includes('light') || lowerMessage.includes('renk') || lowerMessage.includes('color')) {
            return this.formatKnowledgeResponse(this.knowledgeBase.underwaterVision);
        }

        // Cold water diving
        if (lowerMessage.includes('soğuk') || lowerMessage.includes('cold') || lowerMessage.includes('hipotermi') || lowerMessage.includes('hypothermia')) {
            return this.formatKnowledgeResponse(this.knowledgeBase.coldWaterDiving);
        }

        // Night diving
        if (lowerMessage.includes('gece') || lowerMessage.includes('night') || lowerMessage.includes('fener') || lowerMessage.includes('light') || lowerMessage.includes('karanlık') || lowerMessage.includes('dark')) {
            return this.formatKnowledgeResponse(this.knowledgeBase.nightDiving);
        }

        // Marine life
        if (lowerMessage.includes('balık') || lowerMessage.includes('fish') || lowerMessage.includes('deniz') || lowerMessage.includes('marine') || lowerMessage.includes('canlı') || lowerMessage.includes('life') || lowerMessage.includes('köpek') || lowerMessage.includes('shark')) {
            return this.formatKnowledgeResponse(this.knowledgeBase.marineLife);
        }

        return null;
    }

    /**
     * Format knowledge base response for display
     */
    formatKnowledgeResponse(knowledgeSection) {
        if (!knowledgeSection) return null;

        let response = `📚 **${knowledgeSection.title}**\n\n`;
        
        knowledgeSection.content.forEach((item, index) => {
            if (index < 2) { // Limit to first 2 items for concise response
                response += `🔹 **${item.topic}:** ${item.info}`;
                
                if (item.formula) {
                    response += `\n   📝 *Formül: ${item.formula}*`;
                }
                
                if (item.safety) {
                    response += `\n   ⚠️ *Güvenlik: ${item.safety}*`;
                }
                
                if (item.symptoms) {
                    response += `\n   🚨 *Belirtiler: ${item.symptoms}*`;
                }

                if (item.practical) {
                    response += `\n   💡 *Pratik: ${item.practical}*`;
                }

                response += '\n\n';
            }
        });

        response += "💬 Daha detaylı bilgi için specific sorular sorabilirsiniz!";
        return response;
    }

    /**
     * Get basic response when knowledge base fails
     */
    getBasicResponse(lowerMessage) {
        // Turkish responses for Turkish users
        if (lowerMessage.includes('merhaba') || lowerMessage.includes('selam')) {
            return "Merhaba! 🤿 ScuPlan dalış asistanınızım. Size dalış fiziği, hesaplamalar, güvenlik prosedürleri ve ekipman konularında yardımcı olabilirim. Hangi konuda bilgi almak istiyorsunuz?";
        }

        if (lowerMessage.includes('teşekkür') || lowerMessage.includes('sağol')) {
            return "Rica ederim! 🌊 Güvenli dalışlar en önemli prioritemdir. Başka dalış konularında sorularınız varsa, buradayım. İyi dalışlar!";
        }

        const topics = [
            "derin dalış fiziği ve basınç etkileri",
            "su altında görsel algı ve ışık kırılması", 
            "soğuk su dalışları ve termal koruma",
            "gece dalışı ve ekipman seçimi",
            "deniz canlıları ve güvenli gözlem teknikleri"
        ];

        return `🤿 Size şu konularda yardımcı olabilirim:\n• ${topics.join('\n• ')}\n\nHangi konu hakkında bilgi almak istiyorsunuz?`;
    }

    /**
     * Add interactive knowledge cards to education section
     */
    addKnowledgeCards() {
        if (!this.knowledgeBase) return;

        const container = document.getElementById('knowledgeCards');
        if (!container) return;

        Object.keys(this.knowledgeBase).forEach(key => {
            const section = this.knowledgeBase[key];
            const card = this.createKnowledgeCard(section, key);
            container.appendChild(card);
        });
    }

    /**
     * Create interactive knowledge card
     */
    createKnowledgeCard(section, key) {
        const card = document.createElement('div');
        card.className = 'col-md-6 mb-4';
        
        card.innerHTML = `
            <div class="card h-100 knowledge-card" data-knowledge="${key}">
                <div class="card-header">
                    <h5><i class="fas fa-book me-2"></i>${section.title}</h5>
                </div>
                <div class="card-body">
                    <p class="card-text">${section.content[0].info.substring(0, 120)}...</p>
                    <button class="btn btn-primary btn-sm" onclick="enhancedDiveAssistant.showKnowledgeDetails('${key}')">
                        <i class="fas fa-expand me-2"></i>Detayları Göster
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }

    /**
     * Show knowledge details in modal
     */
    showKnowledgeDetails(key) {
        if (!this.knowledgeBase || !this.knowledgeBase[key]) return;
        
        const section = this.knowledgeBase[key];
        const modal = this.createKnowledgeModal(section);
        document.body.appendChild(modal);
        
        // Show modal using Bootstrap
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
        
        // Remove modal when hidden
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    /**
     * Create knowledge details modal
     */
    createKnowledgeModal(section) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        
        let contentHTML = '';
        section.content.forEach(item => {
            contentHTML += `
                <div class="mb-4">
                    <h6 class="text-primary">${item.topic}</h6>
                    <p>${item.info}</p>
                    ${item.formula ? `<div class="alert alert-info small"><strong>Formül:</strong> ${item.formula}</div>` : ''}
                    ${item.safety ? `<div class="alert alert-warning small"><strong>Güvenlik:</strong> ${item.safety}</div>` : ''}
                    ${item.symptoms ? `<div class="alert alert-danger small"><strong>Belirtiler:</strong> ${item.symptoms}</div>` : ''}
                </div>
            `;
        });
        
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${section.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${contentHTML}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Kapat</button>
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }
}

// Initialize enhanced AI assistant
let enhancedDiveAssistant;
document.addEventListener('DOMContentLoaded', function() {
    enhancedDiveAssistant = new EnhancedDiveAssistant();
});