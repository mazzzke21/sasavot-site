const CursorFX = {
    trail: [],
    isActive: false,
    config: {
        trailLength: 8,
        trailInterval: 50,
        glowSize: 20,
        jitterZone: false,
    },

    lastTrailTime: 0,
    jitterTimer: null,

    init() {
        document.querySelectorAll('.victim-name').forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.style.cursor = 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\'><text y=\'18\' font-size=\'18\'>⚠</text></svg>"), auto';
            });
            el.addEventListener('mouseleave', () => {
                document.body.style.cursor = 'default';
            });
        });

        document.querySelectorAll('.sas-name, .sas-graffiti, .sas-message').forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.style.cursor = 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\'><text y=\'18\' font-size=\'18\' fill=\'%2300cc44\'>▼</text></svg>"), auto';
            });
            el.addEventListener('mouseleave', () => {
                document.body.style.cursor = 'default';
            });
        });

        document.querySelectorAll('.survivor-name, .card-survivor').forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.style.cursor = 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\'><text y=\'18\' font-size=\'18\' fill=\'%234488ff\'>◆</text></svg>"), auto';
            });
            el.addEventListener('mouseleave', () => {
                document.body.style.cursor = 'default';
            });
        });

        document.querySelectorAll('.glitch-text, .gb-sas, .final-warning').forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.startJitter();
            });
            el.addEventListener('mouseleave', () => {
                this.stopJitter();
            });
        });

        document.querySelectorAll('.map-marker').forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.style.cursor = 'pointer';
            });
            el.addEventListener('mouseleave', () => {
                document.body.style.cursor = 'default';
            });
        });
    },

    startJitter() {
    },

    stopJitter() {
    },

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

    cleanup() {
        this.trail.forEach(dot => {
            if (dot.parentNode) dot.parentNode.removeChild(dot);
        });
        this.trail = [];
    }
};