const AudioEngine = {
    context: null,
    masterGain: null,
    isPlaying: false,

    config: {
        masterVolume: 0.3,
    },

    async init() {
        console.log('Audio engine disabled — safe mode');
    },

    resume() {
    },

    playGlitch() {
    },

    playTapeRewind() {
    },

    playSASVoice() {
    },

    playSiren() {
    },

    playCutieScream() {
    },

    playCrisCall() {
    },

    stop() {
        this.isPlaying = false;
    }
};