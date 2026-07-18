const VHSPlayer = {
    players: {},

    init() {
        document.querySelectorAll('.vhs-player').forEach(playerEl => {
            const id = playerEl.dataset.video;
            if (!id) return;

            const canvas = playerEl.querySelector('.vhs-canvas');
            const video = playerEl.querySelector('.vhs-video');
            const playBtn = playerEl.querySelector('.play-btn');
            const stopBtn = playerEl.querySelector('.stop-btn');

            if (id === 'final') {
                const vid = playerEl.querySelector('video');
                this.players[id] = {
                    el: playerEl,
                    video: vid,
                    isPlaying: false,
                };

                const status = document.getElementById('finalStatus');

                if (playBtn) {
                    playBtn.addEventListener('click', () => this.play(id));
                }
                if (stopBtn) {
                    stopBtn.addEventListener('click', () => this.stop(id));
                }
                return;
            }

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

            this.drawStatic(id);

            if (playBtn) {
                playBtn.addEventListener('click', () => this.play(id));
            }
            if (stopBtn) {
                stopBtn.addEventListener('click', () => this.stop(id));
            }
        });
    },

    drawStatic(id) {
        const player = this.players[id];
        if (!player) return;

        const { canvas, ctx } = player;
        const w = canvas.width = canvas.clientWidth;
        const h = canvas.height = canvas.clientHeight;

        const imageData = ctx.createImageData(w, h);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 30;
            const colorShift = Math.random() < 0.01 ? 50 : 0;
            data[i] = 10 + noise + (Math.random() * colorShift);
            data[i+1] = 10 + noise * 0.8;
            data[i+2] = 15 + noise * 0.7 + (Math.random() * colorShift);
            data[i+3] = 255;
        }

        ctx.putImageData(imageData, 0, 0);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        for (let y = 0; y < h; y += 20 + Math.random() * 30) {
            ctx.fillRect(0, y, w, 1 + Math.random() * 2);
        }
    },

    play(id) {
        const player = this.players[id];
        if (!player || player.isPlaying) return;

        player.isPlaying = true;

        if (player.video) {
            player.video.muted = false;
            player.video.currentTime = 0;
            player.video.play().catch(() => {});
            const status = document.getElementById('finalStatus');
            if (status) status.textContent = '[ВОССТАНОВЛЕНИЕ...]';
            setTimeout(() => {
                if (status) status.textContent = '[ФАЙЛ ВОССТАНОВЛЕН]';
            }, 2000);
            this.playAudioEffect(id);
            return;
        }

        this.playAudioEffect(id);

        const animate = () => {
            if (!player.isPlaying) return;

            player.frameCount++;
            player.time += 0.016;

            const { canvas, ctx } = player;
            const w = canvas.width = canvas.clientWidth;
            const h = canvas.height = canvas.clientHeight;

            const imageData = ctx.createImageData(w, h);
            const data = imageData.data;

            const time = player.time;

            for (let i = 0; i < data.length; i += 4) {
                const x = (i / 4) % w;
                const y = Math.floor((i / 4) / w);

                let noise = Math.random() * 40;
                const colorWobble = Math.sin(time * 0.5 + y * 0.01) * 20;
                const trackingY = (time * 50) % h;
                const isTracking = Math.abs(y - trackingY) < 3;

                if (isTracking) {
                    noise += 80 + Math.random() * 40;
                }

                const glitchChance = 0.001 + (Math.sin(time * 3) * 0.0005 + 0.0005);
                const isGlitch = Math.random() < glitchChance;

                if (isGlitch) {
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

            ctx.fillStyle = `rgba(255, 255, 255, ${0.03 + Math.sin(time * 2) * 0.02})`;
            const barY = (time * 60 + Math.sin(time * 5) * 10) % h;
            ctx.fillRect(0, barY, w, 2 + Math.sin(time * 3) * 1);

            ctx.fillStyle = `rgba(255, 0, 68, ${0.02 + Math.sin(time * 4) * 0.01})`;
            const colorBarY = (time * 40 + 100) % h;
            ctx.fillRect(0, colorBarY, w, 4);

            if (Math.random() < 0.005) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(0, 0, w, h);
            }

            player.animationId = requestAnimationFrame(animate);
        };

        animate();
    },

    stop(id) {
        const player = this.players[id];
        if (!player) return;

        player.isPlaying = false;

        if (player.video) {
            player.video.pause();
            player.video.currentTime = 0;
            const status = document.getElementById('finalStatus');
            if (status) status.textContent = '[ФАЙЛ НЕСТАБИЛЕН]';
            return;
        }

        if (player.animationId) {
            cancelAnimationFrame(player.animationId);
            player.animationId = null;
        }

        this.drawStatic(id);
    },

    playAudioEffect(id) {
        switch(id) {
            case 'dasha':
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
                if (window.GlitchEngine) {
                    GlitchEngine.triggerHeavy();
                }
                break;
        }
    },

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