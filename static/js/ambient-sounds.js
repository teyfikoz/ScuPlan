/**
 * Underwater Ambient Sound Customization
 * Provides immersive underwater soundscape for diving application
 */

class AmbientSounds {
    constructor() {
        this.isSupported = 'webkitAudioContext' in window || 'AudioContext' in window;
        this.isEnabled = localStorage.getItem('ambientSounds') !== 'false';
        this.volume = parseFloat(localStorage.getItem('ambientVolume')) || 0.3;
        this.currentTheme = localStorage.getItem('ambientTheme') || 'tropical';
        
        this.audioContext = null;
        this.currentLoop = null;
        this.gainNode = null;
        
        this.themes = {
            tropical: {
                name: "🐠 Tropical Reef",
                description: "Gentle bubbles with tropical fish sounds",
                color: "#20B2AA"
            },
            deep: {
                name: "🌊 Deep Ocean",
                description: "Mysterious deep-sea ambiance",
                color: "#191970"
            },
            cave: {
                name: "🕳️ Underwater Cave",
                description: "Echoing cave sounds with water drops",
                color: "#2F4F4F"
            },
            wreck: {
                name: "⚓ Shipwreck",
                description: "Haunting metal creaks and currents",
                color: "#8B4513"
            },
            night: {
                name: "🌙 Night Dive",
                description: "Peaceful nighttime ocean sounds",
                color: "#483D8B"
            },
            current: {
                name: "🌊 Strong Current",
                description: "Energetic water movement sounds",
                color: "#1E90FF"
            }
        };
        
        if (this.isSupported) {
            this.init();
        }
    }

    init() {
        this.createAudioContext();
        this.createControlPanel();
        
        if (this.isEnabled) {
            this.startAmbientSounds();
        }
    }

    createAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = this.volume;
        } catch (e) {
            console.warn('Audio context not supported:', e);
            this.isSupported = false;
        }
    }

    createControlPanel() {
        const panel = document.createElement('div');
        panel.className = 'ambient-sound-panel';
        panel.style.cssText = `
            position: fixed;
            top: 160px;
            right: 20px;
            z-index: 1040;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 15px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            width: 280px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            border: 1px solid rgba(0,123,255,0.2);
        `;

        panel.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="mb-0">🎧 Ambient Sounds</h6>
                <button class="btn btn-sm btn-outline-primary" id="toggleAmbientPanel">
                    <i class="fas fa-chevron-left"></i>
                </button>
            </div>
            
            <div class="mb-3">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="ambientToggle" ${this.isEnabled ? 'checked' : ''}>
                    <label class="form-check-label" for="ambientToggle">
                        Enable Sounds
                    </label>
                </div>
            </div>

            <div class="mb-3">
                <label class="form-label small">Volume</label>
                <input type="range" class="form-range" id="volumeSlider" 
                       min="0" max="1" step="0.1" value="${this.volume}">
                <div class="d-flex justify-content-between small text-muted">
                    <span>🔇</span>
                    <span>🔊</span>
                </div>
            </div>

            <div class="mb-3">
                <label class="form-label small">Theme</label>
                <div id="themeButtons" class="d-grid gap-1">
                    ${Object.entries(this.themes).map(([key, theme]) => `
                        <button class="btn btn-sm ${key === this.currentTheme ? 'btn-primary' : 'btn-outline-primary'}" 
                                data-theme="${key}"
                                style="background-color: ${key === this.currentTheme ? theme.color : 'transparent'}; 
                                       border-color: ${theme.color}; 
                                       color: ${key === this.currentTheme ? 'white' : theme.color};">
                            <div class="d-flex align-items-center">
                                <span class="me-2">${theme.name.split(' ')[0]}</span>
                                <div class="flex-grow-1 text-start">
                                    <div class="small">${theme.name.slice(2)}</div>
                                    <div class="tiny text-muted">${theme.description}</div>
                                </div>
                            </div>
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="text-center">
                <small class="text-muted">Sounds help create immersive diving experience</small>
            </div>
        `;

        document.body.appendChild(panel);
        this.setupEventListeners(panel);
        
        // Create toggle button
        this.createToggleButton(panel);
    }

    createToggleButton(panel) {
        const toggleButton = document.createElement('button');
        toggleButton.className = 'ambient-toggle-btn btn btn-sm btn-outline-primary';
        toggleButton.innerHTML = '🎧';
        toggleButton.title = 'Ambient Sounds';
        toggleButton.style.cssText = `
            position: fixed;
            top: 160px;
            right: 20px;
            z-index: 1041;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            backdrop-filter: blur(10px);
            background-color: rgba(255, 255, 255, 0.9);
        `;
        
        let panelVisible = false;
        toggleButton.addEventListener('click', () => {
            panelVisible = !panelVisible;
            panel.style.transform = panelVisible ? 'translateX(0)' : 'translateX(100%)';
            toggleButton.style.right = panelVisible ? '310px' : '20px';
        });
        
        document.body.appendChild(toggleButton);
    }

    setupEventListeners(panel) {
        // Toggle switch
        const toggle = panel.querySelector('#ambientToggle');
        toggle.addEventListener('change', (e) => {
            this.isEnabled = e.target.checked;
            localStorage.setItem('ambientSounds', this.isEnabled);
            
            if (this.isEnabled) {
                this.startAmbientSounds();
            } else {
                this.stopAmbientSounds();
            }
        });

        // Volume slider
        const volumeSlider = panel.querySelector('#volumeSlider');
        volumeSlider.addEventListener('input', (e) => {
            this.volume = parseFloat(e.target.value);
            localStorage.setItem('ambientVolume', this.volume);
            
            if (this.gainNode) {
                this.gainNode.gain.value = this.volume;
            }
        });

        // Theme buttons
        panel.querySelectorAll('[data-theme]').forEach(button => {
            button.addEventListener('click', (e) => {
                const newTheme = e.currentTarget.dataset.theme;
                this.switchTheme(newTheme);
                
                // Update button states
                panel.querySelectorAll('[data-theme]').forEach(btn => {
                    const theme = btn.dataset.theme;
                    const themeData = this.themes[theme];
                    
                    if (theme === newTheme) {
                        btn.className = 'btn btn-sm btn-primary';
                        btn.style.backgroundColor = themeData.color;
                        btn.style.borderColor = themeData.color;
                        btn.style.color = 'white';
                    } else {
                        btn.className = 'btn btn-sm btn-outline-primary';
                        btn.style.backgroundColor = 'transparent';
                        btn.style.borderColor = themeData.color;
                        btn.style.color = themeData.color;
                    }
                });
            });
        });

        // Panel toggle button
        const panelToggle = panel.querySelector('#toggleAmbientPanel');
        panelToggle.addEventListener('click', () => {
            const isVisible = panel.style.transform === 'translateX(0px)';
            panel.style.transform = isVisible ? 'translateX(100%)' : 'translateX(0px)';
            const mainToggle = document.querySelector('.ambient-toggle-btn');
            if (mainToggle) {
                mainToggle.style.right = isVisible ? '20px' : '310px';
            }
        });
    }

    switchTheme(newTheme) {
        if (this.currentTheme !== newTheme) {
            this.currentTheme = newTheme;
            localStorage.setItem('ambientTheme', newTheme);
            
            if (this.isEnabled) {
                this.stopAmbientSounds();
                setTimeout(() => {
                    this.startAmbientSounds();
                }, 500);
            }
        }
    }

    startAmbientSounds() {
        if (!this.isSupported || !this.isEnabled || !this.audioContext) return;

        this.stopAmbientSounds();
        
        // Resume audio context if suspended (required for user interaction)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.generateAmbientLoop();
    }

    stopAmbientSounds() {
        if (this.currentLoop) {
            clearInterval(this.currentLoop);
            this.currentLoop = null;
        }
    }

    generateAmbientLoop() {
        const playAmbientEffect = () => {
            if (!this.isEnabled) return;
            
            switch (this.currentTheme) {
                case 'tropical':
                    this.playBubbleEffect();
                    break;
                case 'deep':
                    this.playDeepOceanEffect();
                    break;
                case 'cave':
                    this.playCaveEffect();
                    break;
                case 'wreck':
                    this.playWreckEffect();
                    break;
                case 'night':
                    this.playNightEffect();
                    break;
                case 'current':
                    this.playCurrentEffect();
                    break;
            }
        };

        // Play initial effect
        playAmbientEffect();

        // Set up recurring effects
        this.currentLoop = setInterval(playAmbientEffect, 8000 + Math.random() * 4000);
    }

    playBubbleEffect() {
        this.createBubbleSound();
    }

    playDeepOceanEffect() {
        this.createDeepRumble();
    }

    playCaveEffect() {
        this.createEchoEffect();
    }

    playWreckEffect() {
        this.createMetallicCreak();
    }

    playNightEffect() {
        this.createGentleWaves();
    }

    playCurrentEffect() {
        this.createRushingWater();
    }

    // Audio generation methods using Web Audio API
    createBubbleSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.gainNode);
        
        oscillator.frequency.value = 800 + Math.random() * 400;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1 * this.volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }

    createDeepRumble() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.gainNode);
        
        oscillator.frequency.value = 30 + Math.random() * 50;
        oscillator.type = 'triangle';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05 * this.volume, this.audioContext.currentTime + 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 3);
    }

    createEchoEffect() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const delayNode = this.audioContext.createDelay();
        const feedbackGain = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(delayNode);
        delayNode.connect(feedbackGain);
        feedbackGain.connect(delayNode);
        delayNode.connect(this.gainNode);
        
        delayNode.delayTime.value = 0.3;
        feedbackGain.gain.value = 0.3;
        
        oscillator.frequency.value = 400 + Math.random() * 200;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.08 * this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 1);
    }

    createMetallicCreak() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.gainNode);
        
        oscillator.frequency.value = 150 + Math.random() * 100;
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0.03 * this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 2);
    }

    createGentleWaves() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.gainNode);
        
        oscillator.frequency.value = 200;
        oscillator.type = 'sine';
        
        // Create wave-like modulation
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        
        lfo.frequency.value = 0.5;
        lfo.type = 'sine';
        lfoGain.gain.value = 50;
        
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);
        
        gainNode.gain.setValueAtTime(0.02 * this.volume, this.audioContext.currentTime);
        
        oscillator.start(this.audioContext.currentTime);
        lfo.start(this.audioContext.currentTime);
        
        setTimeout(() => {
            oscillator.stop();
            lfo.stop();
        }, 4000);
    }

    createRushingWater() {
        // Create white noise for water rushing effect
        const bufferSize = this.audioContext.sampleRate * 2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        source.buffer = buffer;
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.gainNode);
        
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 1;
        
        gainNode.gain.setValueAtTime(0.04 * this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.5);
        
        source.start(this.audioContext.currentTime);
        source.stop(this.audioContext.currentTime + 1.5);
    }

    // Public method for other modules to trigger sound effects
    playEffect(effectType) {
        if (!this.isEnabled || !this.isSupported) return;
        
        switch (effectType) {
            case 'bubble':
                this.createBubbleSound();
                break;
            case 'deep':
                this.createDeepRumble();
                break;
            case 'whale':
                this.createDeepRumble();
                break;
            case 'gentle':
                this.createGentleWaves();
                break;
            case 'click':
                this.createBubbleSound();
                break;
            case 'whoosh':
                this.createRushingWater();
                break;
            default:
                this.createBubbleSound();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.ambientSounds = new AmbientSounds();
});