/* ============================================
   AUDIO-ENGINE.JS — SAS_ARCHIVE.EXE
   Звуковой движок для сайта-музея «Дело SAS»
   Фоновые шумы и звуковые триггеры
   ============================================ */

const AudioEngine = {
    context: null,
    masterGain: null,
    isPlaying: false,

    // Audio buffers
    buffers: {
        hum: null,
        hiss: null,
        whisper: null,
        glitch: null,
        tapeClick: null,
    },

    // Sound nodes
    nodes: {
        hum: null,
        hiss: null,
        whisper: null,
        glitch: null,
    },

    config: {
        masterVolume: 0.3,
        humVolume: 0.25,
        hissVolume: 0.15,
        whisperVolume: 0.08,
        glitchVolume: 0.4,
        tapeClickInterval: 60000,  // avg 60s between clicks
    },

    // Initialize audio engine
    async init() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = this.config.masterVolume;
            this.masterGain.connect(this.context.destination);

            // Start ambient sounds
            this.createHum();
            this.createHiss();
            this.scheduleTapeClick();

            this.isPlaying = true;
        } catch (e) {
            console.warn('Audio engine failed to initialize:', e);
        }
    },

    // Generate VHS hum (60Hz + harmonics)
    createHum() {
        if (!this.context) return;

        // Use multiple oscillators for a richer hum
        const freqs = [60, 120, 180, 240];
        const oscillators = freqs.map(freq => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            // Higher harmonics are quieter
            const gainValue = this.config.humVolume / (freq / 60);
            gain.gain.value = gainValue;
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start();
            
            return { osc, gain };
        });

        this.nodes.hum = oscillators;
    },

    // Generate VHS hiss (filtered noise)
    createHiss() {
        if (!this.context) return;

        const bufferSize = this.context.sampleRate * 2;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const bandpass = this.context.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 4000;
        bandpass.Q.value = 0.5;

        const gain = this.context.createGain();
        gain.gain.value = this.config.hissVolume;

        source.connect(bandpass);
        bandpass.connect(gain);
        gain.connect(this.masterGain);
        source.start();

        this.nodes.hiss = source;
    },

    // Schedule random tape clicks
    scheduleTapeClick() {
        if (!this.context) return;

        const delay = Math.random() * this.config.tapeClickInterval + 20000;
        
        setTimeout(() => {
            this.playTapeClick();
            this.scheduleTapeClick();
        }, delay);
    },

    // Play a tape click sound
    playTapeClick() {
        if (!this.context) return;

        const bufferSize = this.context.sampleRate * 0.05; // 50ms
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        // Create a short click/ pop sound
        for (let i = 0; i < bufferSize; i++) {
            const envelope = Math.exp(-i / (bufferSize * 0.1));
            data[i] = (Math.random() - 0.5) * envelope * 0.3;
        }

        const source = this.context.createBufferSource();
        source.buffer = buffer;

        const gain = this.context.createGain();
        gain.gain.value = 0.2;

        source.connect(gain);
        gain.connect(this.masterGain);
        source.start();
    },

    // Play glitch sound effect
    playGlitch() {
        if (!this.context) return;

        const duration = 0.1 + Math.random() * 0.2;
        const bufferSize = this.context.sampleRate * duration;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const t = i / this.context.sampleRate;
            const freq = 100 + Math.random() * 2000;
            const envelope = Math.exp(-i / (bufferSize * 0.2));
            data[i] = (Math.sin(2 * Math.PI * freq * t) + (Math.random() - 0.5) * 0.5) * envelope * 0.4;
        }

        const source = this.context.createBufferSource();
        source.buffer = buffer;

        const gain = this.context.createGain();
        gain.gain.value = this.config.glitchVolume;

        source.connect(gain);
        gain.connect(this.masterGain);
        source.start();
    },

    // Play tape rewind effect
    playTapeRewind() {
        if (!this.context) return;

        const duration = 1.5;
        const bufferSize = this.context.sampleRate * duration;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const t = i / this.context.sampleRate;
            const freq = 200 + t * 800; // Rising pitch
            const envelope = Math.sin(Math.PI * t / duration);
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.15;
        }

        const source = this.context.createBufferSource();
        source.buffer = buffer;

        const gain = this.context.createGain();
        gain.gain.value = 0.3;

        source.connect(gain);
        gain.connect(this.masterGain);
        source.start();
    },

    // Play distorted siren sound
    playSiren() {
        if (!this.context) return;

        const duration = 2.0;
        const bufferSize = this.context.sampleRate * duration;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const t = i / this.context.sampleRate;
            const freq = 400 + Math.sin(2 * Math.PI * 2 * t) * 200;
            const envelope = Math.sin(Math.PI * t / duration);
            const distortion = Math.tanh(Math.sin(2 * Math.PI * freq * t) * 3);
            data[i] = distortion * envelope * 0.2;
        }

        const source = this.context.createBufferSource();
        source.buffer = buffer;

        const gain = this.context.createGain();
        gain.gain.value = 0.25;

        source.connect(gain);
        gain.connect(this.masterGain);
        source.start();
    },

    // Play voice-like sound (SAS: "you wanted to know the truth")
    playSASVoice() {
        if (!this.context) return;

        const duration = 3.0;
        const bufferSize = this.context.sampleRate * duration;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        // Create distorted, low voice-like sound
        for (let i = 0; i < bufferSize; i++) {
            const t = i / this.context.sampleRate;
            const envelope = Math.sin(Math.PI * t / duration) * 0.8;
            const freq = 80 + Math.sin(2 * Math.PI * 0.5 * t) * 30;
            const modulation = Math.sin(2 * Math.PI * 4 * t) * 0.3 + 0.7;
            data[i] = Math.sin(2 * Math.PI * freq * t * modulation) * envelope * 0.3;
        }

        const source = this.context.createBufferSource();
        source.buffer = buffer;

        // Add distortion
        const distortion = this.context.createWaveShaper();
        distortion.curve = this.makeDistortionCurve(50);

        const gain = this.context.createGain();
        gain.gain.value = 0.3;

        source.connect(distortion);
        distortion.connect(gain);
        gain.connect(this.masterGain);
        source.start();
    },

    // Helper: make distortion curve
    makeDistortionCurve(amount) {
        const samples = 256;
        const curve = new Float32Array(samples);
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
        }
        return curve;
    },

    // Play audio for cutierover scream
    playCutieScream() {
        if (!this.context) return;

        const duration = 2.0;
        const bufferSize = this.context.sampleRate * duration;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const t = i / this.context.sampleRate;
            const envelope = Math.sin(Math.PI * t / duration);
            // Chaotic high frequencies for scream effect
            const chaos = Math.sin(2 * Math.PI * (500 + t * 1000) * t + Math.random() * 0.5);
            data[i] = chaos * envelope * 0.2;
        }

        const source = this.context.createBufferSource();
        source.buffer = buffer;

        const gain = this.context.createGain();
        gain.gain.value = 0.2;

        source.connect(gain);
        gain.connect(this.masterGain);
        source.start();
    },

    // Play audio for criswave call
    playCrisCall() {
        if (!this.context) return;

        const duration = 4.0;
        const bufferSize = this.context.sampleRate * duration;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const t = i / this.context.sampleRate;
            const envelope = Math.sin(Math.PI * t / duration);
            
            // Phone-like filtered sound
            let signal = Math.sin(2 * Math.PI * 300 * t + Math.random() * 0.1);
            
            // Add silence gap in middle (like call interruption)
            if (t > 0.3 && t < 0.5) {
                signal *= 0.3; // quiet
            }
            if (t > 0.5 && t < 0.7) {
                signal *= 0; // silence
            }
            
            data[i] = signal * envelope * 0.15;
        }

        const source = this.context.createBufferSource();
        source.buffer = buffer;

        const bandpass = this.context.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 1000;
        bandpass.Q.value = 2;

        const gain = this.context.createGain();
        gain.gain.value = 0.3;

        source.connect(bandpass);
        bandpass.connect(gain);
        gain.connect(this.masterGain);
        source.start();
    },

    // Play tape stop effect
    playTapeStop() {
        if (!this.context) return;

        const duration = 1.0;
        const bufferSize = this.context.sampleRate * duration;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const t = i / this.context.sampleRate;
            const freq = 200 - t * 100; // Falling pitch
            const envelope = Math.exp(-t * 5);
            data[i] = Math.sin(2 * Math.PI * Math.max(freq, 20) * t) * envelope * 0.2;
        }

        const source = this.context.createBufferSource();
        source.buffer = buffer;

        const gain = this.context.createGain();
        gain.gain.value = 0.3;

        source.connect(gain);
        gain.connect(this.masterGain);
        source.start();
    },

    // Stop all sounds
    stop() {
        if (this.nodes.hum) {
            this.nodes.hum.forEach(({ osc }) => {
                try { osc.stop(); } catch(e) {}
            });
            this.nodes.hum = null;
        }
        if (this.nodes.hiss) {
            try { this.nodes.hiss.stop(); } catch(e) {}
            this.nodes.hiss = null;
        }
        if (this.context && this.context.state !== 'closed') {
            this.context.close();
        }
        this.isPlaying = false;
    },

    // Resume audio context (needed for user interaction)
    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }
};