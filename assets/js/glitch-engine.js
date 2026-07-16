/* ============================================
   GLITCH-ENGINE.JS — SAS_ARCHIVE.EXE
   Глитч-движок для сайта-музея «Дело SAS»
   Периодические глитчи с RGB-split и смещением
   ============================================ */

const GlitchEngine = {
    config: {
        minInterval: 30000,    // 30s
        maxInterval: 90000,    // 90s
        duration: 150,         // ms
        maxDuration: 400,      // ms
        rgbSplitChance: 0.5,   // 50% chance of RGB split
        faceChance: 0.05,      // 5% chance of face glitch
        shakeIntensity: 8,     // max px displacement
    },

    timer: null,
    isGlitching: false,

    // Initialize glitch engine
    init() {
        this.scheduleNext();
    },

    // Schedule next random glitch
    scheduleNext() {
        const delay = Math.floor(
            Math.random() * (this.config.maxInterval - this.config.minInterval) + 
            this.config.minInterval
        );
        this.timer = setTimeout(() => this.trigger(), delay);
    },

    // Trigger a glitch effect
    trigger() {
        if (this.isGlitching) return;
        this.isGlitching = true;

        const duration = Math.floor(
            Math.random() * (this.config.maxDuration - this.config.duration) + 
            this.config.duration
        );

        // Flash the overlay
        const flash = document.getElementById('glitchFlash');
        if (flash) {
            const colors = [
                'rgba(255, 0, 68, 0.3)',
                'rgba(0, 85, 255, 0.3)',
                'rgba(0, 204, 68, 0.2)',
                'rgba(255, 255, 255, 0.15)',
            ];
            flash.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            flash.classList.add('active');
        }

        // RGB split effect
        if (Math.random() < this.config.rgbSplitChance) {
            this.rgbSplit(duration);
        }

        // Screen shake
        this.screenShake(duration);

        // Random face flash in rare cases
        if (Math.random() < this.config.faceChance) {
            this.flashFace(duration);
        }

        // Random horizontal bar
        this.createVHSBar();

        // Cleanup
        setTimeout(() => {
            if (flash) flash.classList.remove('active');
            this.isGlitching = false;
            this.scheduleNext();
        }, duration);
    },

    // RGB Split effect
    rgbSplit(duration) {
        const body = document.body;
        const originalTransform = body.style.transform;
        const x = (Math.random() - 0.5) * this.config.shakeIntensity;
        const y = (Math.random() - 0.5) * this.config.shakeIntensity;

        body.style.transform = `translate(${x}px, ${y}px)`;
        
        // Create split layers via CSS custom properties
        document.documentElement.style.setProperty('--glitch-r', `${x}px`);
        document.documentElement.style.setProperty('--glitch-b', `${-x}px`);

        setTimeout(() => {
            body.style.transform = originalTransform || '';
            document.documentElement.style.removeProperty('--glitch-r');
            document.documentElement.style.removeProperty('--glitch-b');
        }, duration);
    },

    // Screen shake
    screenShake(duration) {
        const body = document.body;
        body.classList.add('screen-shake');
        setTimeout(() => {
            body.classList.remove('screen-shake');
        }, duration);
    },

    // Flash a face in the overlay (creepy)
    flashFace(duration) {
        const flash = document.getElementById('glitchFlash');
        if (!flash) return;

        flash.innerHTML = `
            <div style="
                position: absolute; 
                top: 50%; 
                left: 50%; 
                transform: translate(-50%, -50%);
                width: 100px;
                height: 140px;
                background: #000;
                border-radius: 10px;
                opacity: 0.8;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #333;
                font-size: 60px;
                border: 2px solid #444;
            ">
                🗣
            </div>
        `;

        setTimeout(() => {
            flash.innerHTML = '';
        }, duration);
    },

    // Create a random VHS tracking bar
    createVHSBar() {
        const bar = document.createElement('div');
        bar.className = 'vhs-bar';
        bar.style.top = `${Math.random() * 100}%`;
        document.body.appendChild(bar);

        setTimeout(() => {
            if (bar.parentNode) bar.parentNode.removeChild(bar);
        }, 600);
    },

    // Trigger multiple rapid glitches (for dramatic effect)
    triggerRapid(count = 3) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.trigger();
            }, i * 200);
        }
    },

    // Trigger a heavy glitch (for final section)
    triggerHeavy() {
        const duration = 2000;
        const flash = document.getElementById('glitchFlash');
        
        if (flash) {
            flash.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            flash.classList.add('active');
        }

        document.body.classList.add('heavy-glitch');

        // Multiple bars
        for (let i = 0; i < 5; i++) {
            setTimeout(() => this.createVHSBar(), i * 100);
        }

        setTimeout(() => {
            if (flash) flash.classList.remove('active');
            document.body.classList.remove('heavy-glitch');
        }, duration);
    }
};