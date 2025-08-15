/**
 * Playful Marine Life Interaction Tooltips
 * Adds fun marine life tooltips that appear randomly on the page
 */

class MarineLifeTooltips {
    constructor() {
        this.marineLifeData = [
            {
                emoji: "🐠",
                name: "Clownfish",
                fact: "Clownfish can change gender during their lifetime!",
                sound: "bubble"
            },
            {
                emoji: "🐙",
                name: "Octopus",
                fact: "Octopuses have three hearts and blue blood!",
                sound: "deep"
            },
            {
                emoji: "🦈",
                name: "Shark",
                fact: "Sharks have been around for over 400 million years!",
                sound: "whoosh"
            },
            {
                emoji: "🐢",
                name: "Sea Turtle",
                fact: "Sea turtles can live over 100 years!",
                sound: "gentle"
            },
            {
                emoji: "🐋",
                name: "Whale",
                fact: "Blue whales' hearts can weigh as much as a car!",
                sound: "whale"
            },
            {
                emoji: "🦑",
                name: "Squid",
                fact: "Giant squids have eyes as big as dinner plates!",
                sound: "bubble"
            },
            {
                emoji: "⭐",
                name: "Starfish",
                fact: "Starfish can regenerate lost arms completely!",
                sound: "gentle"
            },
            {
                emoji: "🦀",
                name: "Crab",
                fact: "Crabs walk sideways because of their leg structure!",
                sound: "click"
            },
            {
                emoji: "🐡",
                name: "Pufferfish",
                fact: "Pufferfish can inflate to 3 times their normal size!",
                sound: "bubble"
            },
            {
                emoji: "🦞",
                name: "Lobster",
                fact: "Lobsters were once considered poor people's food!",
                sound: "click"
            }
        ];
        
        this.activeTooltips = new Set();
        this.isEnabled = localStorage.getItem('marineLifeTooltips') !== 'false';
        
        if (this.isEnabled) {
            this.init();
        }
    }

    init() {
        this.createToggleButton();
        this.startRandomAppearance();
        this.setupPageInteractions();
    }

    createToggleButton() {
        const toggleButton = document.createElement('button');
        toggleButton.className = 'marine-life-toggle btn btn-sm btn-outline-info';
        toggleButton.innerHTML = '🐠 Marine Life';
        toggleButton.title = 'Toggle Marine Life Tooltips';
        toggleButton.style.cssText = `
            position: fixed;
            top: 120px;
            right: 20px;
            z-index: 1040;
            border-radius: 25px;
            padding: 8px 12px;
            font-size: 12px;
            backdrop-filter: blur(10px);
            background-color: rgba(255, 255, 255, 0.9);
        `;
        
        toggleButton.addEventListener('click', () => {
            this.isEnabled = !this.isEnabled;
            localStorage.setItem('marineLifeTooltips', this.isEnabled);
            
            if (this.isEnabled) {
                toggleButton.classList.remove('btn-outline-secondary');
                toggleButton.classList.add('btn-outline-info');
                this.startRandomAppearance();
            } else {
                toggleButton.classList.remove('btn-outline-info');
                toggleButton.classList.add('btn-outline-secondary');
                this.clearAllTooltips();
            }
        });
        
        document.body.appendChild(toggleButton);
    }

    startRandomAppearance() {
        if (!this.isEnabled) return;
        
        // Show marine life every 15-30 seconds
        const interval = 15000 + Math.random() * 15000;
        
        setTimeout(() => {
            this.showRandomMarineLife();
            this.startRandomAppearance(); // Continue the cycle
        }, interval);
    }

    showRandomMarineLife() {
        if (!this.isEnabled || this.activeTooltips.size >= 3) return;
        
        const creature = this.marineLifeData[Math.floor(Math.random() * this.marineLifeData.length)];
        const position = this.getRandomPosition();
        
        this.createMarineLifeTooltip(creature, position);
    }

    getRandomPosition() {
        const margin = 100;
        const maxX = window.innerWidth - margin;
        const maxY = window.innerHeight - margin;
        
        return {
            x: margin + Math.random() * (maxX - margin),
            y: margin + Math.random() * (maxY - margin)
        };
    }

    createMarineLifeTooltip(creature, position) {
        const tooltip = document.createElement('div');
        const id = 'marine-' + Date.now();
        tooltip.id = id;
        tooltip.className = 'marine-life-tooltip';
        
        tooltip.style.cssText = `
            position: fixed;
            left: ${position.x}px;
            top: ${position.y}px;
            z-index: 1050;
            pointer-events: auto;
            cursor: pointer;
            animation: marineFloat 3s ease-in-out infinite;
        `;
        
        tooltip.innerHTML = `
            <div class="marine-creature" style="font-size: 2em; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));">
                ${creature.emoji}
            </div>
        `;
        
        // Add click interaction
        tooltip.addEventListener('click', (e) => {
            e.preventDefault();
            this.showCreatureInfo(creature, tooltip);
        });
        
        // Auto-remove after 8-12 seconds if not clicked
        const autoRemoveTime = 8000 + Math.random() * 4000;
        setTimeout(() => {
            this.removeTooltip(id);
        }, autoRemoveTime);
        
        document.body.appendChild(tooltip);
        this.activeTooltips.add(id);
        
        // Play ambient sound
        if (window.ambientSounds) {
            window.ambientSounds.playEffect(creature.sound);
        }
    }

    showCreatureInfo(creature, tooltipElement) {
        // Create info popup
        const info = document.createElement('div');
        info.className = 'marine-info-popup';
        info.style.cssText = `
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            padding: 12px 16px;
            border-radius: 15px;
            box-shadow: 0 4px 20px rgba(0,123,255,0.3);
            white-space: nowrap;
            font-size: 13px;
            margin-bottom: 10px;
            max-width: 280px;
            white-space: normal;
            text-align: center;
            animation: marinePopIn 0.3s ease-out;
        `;
        
        info.innerHTML = `
            <div class="fw-bold mb-1">${creature.emoji} ${creature.name}</div>
            <div class="small">${creature.fact}</div>
        `;
        
        tooltipElement.appendChild(info);
        
        // Remove after 4 seconds
        setTimeout(() => {
            this.removeTooltip(tooltipElement.id);
        }, 4000);
    }

    removeTooltip(id) {
        const tooltip = document.getElementById(id);
        if (tooltip) {
            tooltip.style.animation = 'marineFloatOut 0.5s ease-in forwards';
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
                this.activeTooltips.delete(id);
            }, 500);
        }
    }

    clearAllTooltips() {
        this.activeTooltips.forEach(id => {
            const tooltip = document.getElementById(id);
            if (tooltip && tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        });
        this.activeTooltips.clear();
    }

    setupPageInteractions() {
        // Add marine life interactions to specific dive-related elements
        const diveElements = document.querySelectorAll('.dive-results, .dive-site-card, .tank-info');
        
        diveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                if (this.isEnabled && Math.random() < 0.3) { // 30% chance
                    const rect = element.getBoundingClientRect();
                    const creature = this.marineLifeData[Math.floor(Math.random() * this.marineLifeData.length)];
                    
                    const position = {
                        x: rect.right + 10,
                        y: rect.top + rect.height / 2
                    };
                    
                    this.createMarineLifeTooltip(creature, position);
                }
            });
        });
    }
}

// CSS animations
const marineLifeCSS = `
<style>
@keyframes marineFloat {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    25% { transform: translateY(-10px) rotate(-2deg); }
    50% { transform: translateY(-5px) rotate(1deg); }
    75% { transform: translateY(-8px) rotate(-1deg); }
}

@keyframes marineFloatOut {
    0% { transform: scale(1) translateY(0px); opacity: 1; }
    100% { transform: scale(0.3) translateY(-50px); opacity: 0; }
}

@keyframes marinePopIn {
    0% { transform: translateX(-50%) scale(0.8); opacity: 0; }
    100% { transform: translateX(-50%) scale(1); opacity: 1; }
}

.marine-life-tooltip {
    user-select: none;
    transition: all 0.3s ease;
}

.marine-life-tooltip:hover {
    transform: scale(1.1);
    filter: brightness(1.1);
}

.marine-creature {
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    transition: all 0.2s ease;
}

.marine-info-popup::before {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: #007bff;
}
</style>
`;

// Add CSS to document
document.head.insertAdjacentHTML('beforeend', marineLifeCSS);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.marineLifeTooltips = new MarineLifeTooltips();
});