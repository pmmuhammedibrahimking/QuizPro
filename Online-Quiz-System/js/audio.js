/**
 * Web Audio API Sound Generator for QuizPro
 * Provides synthetic audio feedback (Clicks, Correct, Wrong, Warning, Victory)
 * without needing external audio file dependencies.
 */

const QuizAudio = {
    audioCtx: null,

    init: function() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioCtx = new AudioContext();
            }
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    },

    isEnabled: function() {
        if (typeof StorageHelper !== 'undefined') {
            return StorageHelper.getSettings().sound !== false;
        }
        return true;
    },

    playClick: function() {
        if (!this.isEnabled()) return;
        this.init();
        if (!this.audioCtx) return;

        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 0.05);

            gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.05);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.05);
        } catch (e) {
            console.debug('Audio playback warning:', e);
        }
    },

    playCorrect: function() {
        if (!this.isEnabled()) return;
        this.init();
        if (!this.audioCtx) return;

        try {
            const now = this.audioCtx.currentTime;
            const osc1 = this.audioCtx.createOscillator();
            const osc2 = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc1.type = 'triangle';
            osc2.type = 'sine';

            // Arpeggio C5 -> E5 -> G5
            osc1.frequency.setValueAtTime(523.25, now);
            osc1.frequency.setValueAtTime(659.25, now + 0.08);
            osc1.frequency.setValueAtTime(783.99, now + 0.16);

            osc2.frequency.setValueAtTime(1046.50, now + 0.16);

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc1.start(now);
            osc2.start(now + 0.16);
            osc1.stop(now + 0.35);
            osc2.stop(now + 0.35);
        } catch (e) {
            console.debug('Audio playback warning:', e);
        }
    },

    playWrong: function() {
        if (!this.isEnabled()) return;
        this.init();
        if (!this.audioCtx) return;

        try {
            const now = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.linearRampToValueAtTime(110, now + 0.25);

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(now);
            osc.stop(now + 0.25);
        } catch (e) {
            console.debug('Audio playback warning:', e);
        }
    },

    playWarning: function() {
        if (!this.isEnabled()) return;
        this.init();
        if (!this.audioCtx) return;

        try {
            const now = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.setValueAtTime(440, now + 0.1);

            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(now);
            osc.stop(now + 0.2);
        } catch (e) {
            console.debug('Audio playback warning:', e);
        }
    },

    playComplete: function() {
        if (!this.isEnabled()) return;
        this.init();
        if (!this.audioCtx) return;

        try {
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                const now = this.audioCtx.currentTime + (idx * 0.1);
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);

                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

                osc.connect(gain);
                gain.connect(this.audioCtx.destination);

                osc.start(now);
                osc.stop(now + 0.4);
            });
        } catch (e) {
            console.debug('Audio playback warning:', e);
        }
    }
};

// Global click sound listener for interactive buttons
document.addEventListener('click', (e) => {
    if (e.target.closest('.btn, .option-btn, .palette-btn, .nav-icon-btn, .category-card, .theme-toggle, .tab-btn')) {
        QuizAudio.playClick();
    }
});
