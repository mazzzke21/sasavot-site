/* ============================================
   VHS-PLAYER.JS — SAS_ARCHIVE.EXE
   VHS-плеер с эффектами для сайта-музея «Дело SAS»
   ============================================ */

const VHSPlayer = {
    players: {},

    // Initialize all VHS players
    init() {
        document.querySelectorAll('.vhs-player').forEach(playerEl => {
            const id = playerEl.dataset.video;
            if (!id) return;

            const canvas = playerEl.querySelector('.vhs-canvas');
            const playBtn = playerEl.querySelector('.play-btn');
            const stopBtn = playerEl.querySelector('.stop-btn');

            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            this.players[id] = {
                el: playerEl,
                canvas,
                ctx,
                isPlaying: false,
                animationId: null,
                time: 0,
                frameCount: 0,
            };

            // Draw initial static frame
            this.drawStatic(id);

            // Bind controls
            if (playBtn) {
                playBtn.addEventListener('click', () => this.play(id));
            }
            if (stopBtn) {
                stopBtn.addEventListener('click', () => this.stop(id));
            }
        });
    },

    // Draw initial static / noise frame
    drawStatic(id) {
        const player = this.players[id];
        if (!player) return;

        const { canvas, ctx } = player;
        const w = canvas.width = canvas.clientWidth;
        const h = canvas.height = canvas.clientHeight;

        // Fill with dark background + noise
        const imageData = ctx.createImageData(w, h);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 30;
            const colorShift = Math.random() < 0.01 ? 50 : 0;
            data[i] = 10 + noise + (Math.random() * colorShift);     // R
            data[i+1] = 10 + noise * 0.8;                           // G
            data[i+2] = 15 + noise * 0.7 + (Math.random() * colorShift); // B
            data[i+3] = 255;
        }

        ctx.putImageData(imageData, 0, 0);

        // Add horizontal tracking lines
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        for (let y = 0; y < h; y += 20 + Math.random() * 30) {
            ctx.fillRect(0, y, w, 1 + Math.random() * 2);
        }
    },

    // Play VHS effect for a player
    play(id) {
        const player = this.players[id];
        if (!player || player.isPlaying) return;

        player.isPlaying = true;

        // Trigger audio effects based on player
        this.playAudioEffect(id);

        // Start animation
        const animate = () => {
            if (!player.isPlaying) return;

            player.frameCount++;
            player.time += 0.016; // ~60fps

            const { canvas, ctx } = player;
            const w = canvas.width = canvas.clientWidth;
            const h = canvas.height = canvas.clientHeight;

            // Generate VHS-style frame
            const imageData = ctx.createImageData(w, h);
            const data = imageData.data;

            const time = player.time;

            for (let i = 0; i < data.length; i += 4) {
                const x = (i / 4) % w;
                const y = Math.floor((i / 4) / w);

                // Base noise
                let noise = Math.random() * 40;

                // VHS color distortion
                const colorWobble = Math.sin(time * 0.5 + y * 0.01) * 20;

                // Horizontal tracking line
                const trackingY = (time * 50) % h;
                const isTracking = Math.abs(y - trackingY) < 3;

                if (isTracking) {
                    noise += 80 + Math.random() * 40;
                }

                // Random glitch lines
                const glitchChance = 0.001 + (Math.sin(time * 3) * 0.0005 + 0.0005);
                const isGlitch = Math.random() < glitchChance;

                if (isGlitch) {
                    // Shift entire line
                    const shift = (Math.random() - 0.5) * 20;
                    data[i] = Math.min(255, 20 + noise + colorWobble + shift);
                    data[i+1] = Math.min(255, 15 + noise * 0.6 - shift * 0.5);
                    data[i+2] = Math.min(255, 25 + noise * 0.5 + colorWobble * 0.3);
                } else {
                    data[i] = Math.min(255, 15 + noise + colorWobble * 0.5);
                    data[i+1] = Math.min(255, 12 + noise * 0.7);
                    data[i+2] = Math.min(255, 18 + noise * 0.6);
                }

                data[i+3] = 255;
            }

            ctx.putImageData(imageData, 0, 0);

            // VHS tracking bar overlay
            ctx.fillStyle = `rgba(255, 255, 255, ${0.03 + Math.sin(time * 2) * 0.02})`;
            const barY = (time * 60 + Math.sin(time * 5) * 10) % h;
            ctx.fillRect(0, barY, w, 2 + Math.sin(time * 3) * 1);

            // Color shift stripe
            ctx.fillStyle = `rgba(255, 0, 68, ${0.02 + Math.sin(time * 4) * 0.01})`;
            const colorBarY = (time * 40 + 100) % h;
            ctx.fillRect(0, colorBarY, w, 4);

            // Random dropout flash
            if (Math.random() < 0.005) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(0, 0, w, h);
            }

            player.animationId = requestAnimationFrame(animate);
        };

        animate();
    },

    // Stop VHS effect for a player
    stop(id) {
        const player = this.players[id];
        if (!player) return;

        player.isPlaying = false;
        if (player.animationId) {
            cancelAnimationFrame(player.animationId);
            player.animationId = null;
        }

        // Return to static
        this.drawStatic(id);
    },

    // Play audio effect based on player id
    playAudioEffect(id) {
        switch(id) {
            case 'dasha':
                // Play ambient dasha audio
                if (AudioEngine.context) AudioEngine.resume();
                setTimeout(() => {
                    if (AudioEngine.context) AudioEngine.playTapeRewind();
                }, 200);
                break;
            case 'korya':
                if (AudioEngine.context) AudioEngine.resume();
                setTimeout(() => {
                    if (AudioEngine.context) AudioEngine.playTapeRewind();
                }, 300);
                break;
            case 'final':
                if (AudioEngine.context) {
                    AudioEngine.resume();
                    setTimeout(() => AudioEngine.playGlitch(), 100);
                    setTimeout(() => AudioEngine.playSASVoice(), 500);
                    setTimeout(() => AudioEngine.playSiren(), 1500);
                }
                // Trigger heavy glitch
                if (window.GlitchEngine) {
                    GlitchEngine.triggerHeavy();
                }
                break;
        }
    },

    // Play a specific player's audio
    playAudio(audioType) {
        if (!AudioEngine.context) return;
        AudioEngine.resume();

        switch(audioType) {
            case 'cutie-scream':
                AudioEngine.playCutieScream();
                break;
            case 'cris-call':
                AudioEngine.playCrisCall();
                break;
            case 'sas-voice':
                AudioEngine.playSASVoice();
                break;
            case 'glitch':
                AudioEngine.playGlitch();
                break;
            case 'siren':
                AudioEngine.playSiren();
                break;
        }
    }
};