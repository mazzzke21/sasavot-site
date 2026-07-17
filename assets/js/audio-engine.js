/* ============================================
   AUDIO-ENGINE.JS — SAS_ARCHIVE.EXE
   Звуковой движок для сайта-музея «Дело SAS»
   Фоновые шумы и звуковые триггеры
   ============================================ */

const AudioEngine = {
    context: null,
    masterGain: null,
    isPlaying: false,

    config: {
        masterVolume: 0.3,
    },

    // Disabled - no audio effects
    async init() {
        console.log('Audio engine disabled — safe mode');
    },

    resume() {
        // Do nothing
    },

    playGlitch() {
        // Do nothing
    },

    playTapeRewind() {
        // Do nothing
    },

    playSASVoice() {
        // Do nothing
    },

    playSiren() {
        // Do nothing
    },

    playCutieScream() {
        // Do nothing
    },

    playCrisCall() {
        // Do nothing
    },

    stop() {
        this.isPlaying = false;
    }
};