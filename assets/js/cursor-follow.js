/* ============================================
   CURSOR-FOLLOW.JS — SAS_ARCHIVE.EXE
   Кастомный курсор с эффектами для сайта-музея
   ============================================ */

const CursorFX = {
    trail: [],
    isActive: false,
    config: {
        trailLength: 8,
        trailInterval: 50,  // ms between trail dots
        glowSize: 20,
        jitterZone: false,
    },

    lastTrailTime: 0,
    jitterTimer: null,

    // Initialize cursor effects
    init() {
        // Apply victim name hover effect
        document.querySelectorAll('.victim-name').forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.style.cursor = 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\'><text y=\'18\' font-size=\'18\'>⚠</text></svg>"), auto';
            });
            el.addEventListener('mouseleave', () => {
                document.body.style.cursor = 'default';
            });
        });

        // SAS name hover (green cursor)
        document.querySelectorAll('.sas-name, .sas-graffiti, .sas-message').forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.style.cursor = 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\'><text y=\'18\' font-size=\'18\' fill=\'%2300cc44\'>▼</text></svg>"), auto';
            });
            el.addEventListener('mouseleave', () => {
                document.body.style.cursor = 'default';
            });
        });

        // Survivor name hover (blue cursor)
        document.querySelectorAll('.survivor-name, .card-survivor').forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.style.cursor = 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\'><text y=\'18\' font-size=\'18\' fill=\'%234488ff\'>◆</text></svg>"), auto';
            });
            el.addEventListener('mouseleave', () => {
                document.body.style.cursor = 'default';
            });
        });

        // Glitch zone hover (unstable cursor)
        document.querySelectorAll('.glitch-text, .gb-sas, .final-warning').forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.startJitter();
            });
            el.addEventListener('mouseleave', () => {
                this.stopJitter();
            });
        });

        // Map markers
        document.querySelectorAll('.map-marker').forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.style.cursor = 'pointer';
            });
            el.addEventListener('mouseleave', () => {
                document.body.style.cursor = 'default';
            });
        });
    },

    // Start cursor jitter (unstable cursor in glitch zones)
    startJitter() {
        if (this.jitterTimer) return;
        let jitterCount = 0;

        this.jitterTimer = setInterval(() => {
            jitterCount++;
            const x = (Math.random() - 0.5) * 10;
            const y = (Math.random() - 0.5) * 10;
            document.body.style.cursor = `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><text y='${18 + y}' x='${x}' font-size='18'>🗡</text></svg>"), auto`;

            if (jitterCount > 20) {
                this.stopJitter();
                document.body.style.cursor = 'default';
            }
        }, 100);

        // Auto-stop after 2 seconds
        setTimeout(() => this.stopJitter(), 2000);
    },

    // Stop cursor jitter
    stopJitter() {
        if (this.jitterTimer) {
            clearInterval(this.jitterTimer);
            this.jitterTimer = null;
        }
        document.body.style.cursor = 'default';
    },

    // Create a visual cursor trail (optional)
    createTrail(e) {
        const now = Date.now();
        if (now - this.lastTrailTime < this.config.trailInterval) return;
        this.lastTrailTime = now;

        const dot = document.createElement('div');
        dot.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: rgba(204, 0, 0, 0.3);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            transition: opacity 0.5s ease;
        `;
        document.body.appendChild(dot);

        this.trail.push(dot);
        if (this.trail.length > this.config.trailLength) {
            const old = this.trail.shift();
            if (old.parentNode) {
                old.style.opacity = '0';
                setTimeout(() => {
                    if (old.parentNode) old.parentNode.removeChild(old);
                }, 500);
            }
        }
    },

    // Clean up trail
    cleanup() {
        this.trail.forEach(dot => {
            if (dot.parentNode) dot.parentNode.removeChild(dot);
        });
        this.trail = [];
    }
};