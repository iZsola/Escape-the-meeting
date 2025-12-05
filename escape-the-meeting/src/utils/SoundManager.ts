import coffeeSound from '../../escape-the-meeting/public/coffee.mp3';
import dialogBgMusic from '../../escape-the-meeting/public/dialog-bg-music.mp3';
import wrongAnswerSound from '../../escape-the-meeting/public/wrong-answer.mp3';
import gameOverSound from '../../escape-the-meeting/public/game-over.mp3';
import correctAnswerSound from '../../escape-the-meeting/public/correct-answer.mp3';
import themeMusic from '../../escape-the-meeting/public/theme-music.mp3';

export class SoundManager {
    private static context: AudioContext | null = null;
    private static masterGain: GainNode | null = null;
    
    private static coffeeUrl = coffeeSound;
    private static dialogMusicUrl = dialogBgMusic;
    private static wrongAnswerUrl = wrongAnswerSound;
    private static gameOverUrl = gameOverSound;
    private static correctAnswerUrl = correctAnswerSound;
    private static themeMusicUrl = themeMusic;
    
    // Single track for all file-based audio to ensure no overlap
    private static activeAudio: HTMLAudioElement | null = null;
    // Separate track for background theme music to allow layering if needed, or easier control
    private static themeAudio: HTMLAudioElement | null = null;

    private static _muted = false;

    static get muted() {
        return this._muted;
    }

    static toggleMute() {
        this._muted = !this._muted;
        
        // Update master gain for oscillators
        if (this.masterGain) {
            this.masterGain.gain.value = this._muted ? 0 : 0.3;
        }

        // Update file-based audio
        if (this.activeAudio) {
            this.activeAudio.muted = this._muted;
        }
        if (this.themeAudio) {
            this.themeAudio.muted = this._muted;
        }

        return this._muted;
    }

    static init() {
        if (!this.context) {
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);
            this.masterGain.gain.value = this._muted ? 0 : 0.3; // Use current muted state
        }
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    // Stop the currently playing file-based audio (if any)
    static stopActiveAudio() {
        if (this.activeAudio) {
            this.activeAudio.pause();
            this.activeAudio.currentTime = 0;
            this.activeAudio = null;
        }
    }

    private static playAudioFile(url: string, loop: boolean = false, volume: number = 0.5) {
        this.stopActiveAudio(); // Ensure previous sound is stopped

        // Pause theme music if playing another track (like dialog music or SFX)
        // Strategy: If dialogue music starts, pause theme. If SFX starts, maybe just play over?
        // For simplicity and clarity based on previous requests: 
        // Let's assume "theme music" is the main background. "Dialogue music" replaces it during encounters.
        if (url !== this.themeMusicUrl && this.themeAudio && !this.themeAudio.paused) {
             this.themeAudio.pause();
        }

        try {
            const audio = new Audio(url);
            audio.loop = loop;
            audio.volume = volume;
            audio.muted = this._muted; // Apply current mute state
            audio.play().catch(e => console.warn(`Audio play failed for ${url}`, e));
            this.activeAudio = audio;
            
            if (!loop) {
                // Auto-clear reference when done
                audio.onended = () => {
                    if (this.activeAudio === audio) {
                        this.activeAudio = null;
                        // Resume theme music if it was paused and we are not in dialogue
                        if (this.themeAudio && this.themeAudio.paused && url !== this.gameOverUrl) {
                             this.themeAudio.play().catch(e => console.warn("Theme resume failed", e));
                        }
                    }
                };
            }
        } catch (e) {
            console.warn("Audio creation failed", e);
        }
    }

    private static createOscillator(type: OscillatorType, freq: number, duration: number, startTime: number = 0) {
        if (!this.context || !this.masterGain) return;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.context.currentTime + startTime);
        
        gain.connect(this.masterGain);
        osc.connect(gain);
        
        osc.start(this.context.currentTime + startTime);
        osc.stop(this.context.currentTime + startTime + duration);
        
        // Envelope
        gain.gain.setValueAtTime(0.1, this.context.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + startTime + duration - 0.05);
    }

    static playStep() {
        this.init();
        // Short low thump
        this.createOscillator('triangle', 100, 0.05);
    }

    static playCollect() {
        // High ping - synthesized sound removed for brevity if desired, but keeping it for menu sounds
        this.init();
        this.createOscillator('sine', 800, 0.1);
        this.createOscillator('sine', 1200, 0.1, 0.1);
    }

    static playSlurp() {
        // Try to play real sound, fallback to synth if it fails immediately (e.g. 404)
        try {
            // SFX should play OVER theme music, not stop it.
            // We'll use a one-off Audio object for SFX that doesn't interrupt the main track manager
            const audio = new Audio(this.coffeeUrl);
            audio.volume = 0.2;
            audio.muted = this._muted; // Apply mute state
            audio.play().catch(e => {
                 this.playSlurpSynth();
            });
        } catch (e) {
            this.playSlurpSynth();
        }
    }

    private static playSlurpSynth() {
        this.init();
        if (!this.context || !this.masterGain) return;

        const duration = 0.3;
        const bufferSize = this.context.sampleRate * duration;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        
        // White noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.context.createBufferSource();
        noise.buffer = buffer;

        // Filter sweep for slurp effect
        const filter = this.context.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 1;
        filter.frequency.setValueAtTime(200, this.context.currentTime);
        filter.frequency.exponentialRampToValueAtTime(2000, this.context.currentTime + duration);

        const gain = this.context.createGain();
        gain.gain.setValueAtTime(1, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
        noise.stop(this.context.currentTime + duration);
        
        // Add a little pitch rise sine wave for "gulp" finish
        this.createOscillator('sine', 400, 0.1, duration - 0.1);
    }

    static playFlush() {
        this.init();
        if (!this.context || !this.masterGain) return;

        const duration = 1.5;
        const bufferSize = this.context.sampleRate * duration;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        
        // White noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.context.createBufferSource();
        noise.buffer = buffer;

        const gain = this.context.createGain();
        // Start loud and fade out
        gain.gain.setValueAtTime(0.5, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        noise.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
        noise.stop(this.context.currentTime + duration);
    }

    static playEncounter() {
        // Remove the synth "ding" sound here - it was interfering with the vibe
        // this.init();
        // this.createOscillator('sawtooth', 150, 0.3);
        // this.createOscillator('sawtooth', 180, 0.3);
        // this.createOscillator('sawtooth', 220, 0.3);
    }

    static playThemeMusic() {
        this.stopActiveAudio(); // Stop any other tracks (like dialogue music)

        if (!this.themeAudio) {
            this.themeAudio = new Audio(this.themeMusicUrl);
            this.themeAudio.loop = true;
            this.themeAudio.volume = 0.1;
            this.themeAudio.muted = this._muted; // Apply mute state
        }
        
        if (this.themeAudio.paused) {
             this.themeAudio.play().catch(e => console.warn("Theme music play failed", e));
        }
    }

    static stopThemeMusic() {
        if (this.themeAudio) {
            this.themeAudio.pause();
            this.themeAudio.currentTime = 0; // Optional: reset to start
        }
    }

    static pauseThemeMusic() {
        if (this.themeAudio) {
            this.themeAudio.pause();
        }
    }

    static playDialogueMusic() {
        this.pauseThemeMusic(); // Duck the main theme
        
        // Use a slight delay to ensure theme is paused before dialog starts
        setTimeout(() => {
             this.playAudioFile(this.dialogMusicUrl, true, 0.4);
        }, 50);
    }

    static stopDialogueMusic() {
        this.stopActiveAudio();
        // Do not auto-resume theme music. Let the game logic handle it when the encounter ends.
    }

    static playWrongAnswer() {
        try {
            // Don't stop theme music for sfx, just play over
             const audio = new Audio(this.wrongAnswerUrl);
             audio.volume = 0.5;
             audio.muted = this._muted;
             audio.play();
        } catch (e) {
            // Fallback to simple beep
            this.init();
            this.createOscillator('sawtooth', 100, 0.3);
        }
    }

    static playCorrectAnswer() {
        try {
             const audio = new Audio(this.correctAnswerUrl);
             audio.volume = 0.5;
             audio.muted = this._muted;
             audio.play();
        } catch (e) {
            // Fallback to generic win sound
            this.playCollect();
        }
    }

    static playWin() {
        // this.stopThemeMusic(); // Removed to keep music playing on level complete
        this.init();
        // Victory arpeggio
        [440, 554, 659, 880].forEach((freq, i) => {
            this.createOscillator('square', freq, 0.2, i * 0.1);
        });
    }

    static playLose() {
        this.stopThemeMusic();
        try {
            // Using playAudioFile here would stop theme music anyway via stopActiveAudio
            // But we explicitly stopped it above to be safe
            const audio = new Audio(this.gameOverUrl);
            audio.volume = 0.2
            audio.play();
            this.activeAudio = audio; // Track this as active audio to prevent overlap
        } catch (e) {
            // Fallback to synth
            this.playLoseSynth();
        }
    }

    private static playLoseSynth() {
        this.init();
        // Sad slide
        if (!this.context || !this.masterGain) return;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        osc.type = 'sawtooth';
        gain.connect(this.masterGain);
        osc.connect(gain);
        
        osc.frequency.setValueAtTime(200, this.context.currentTime);
        osc.frequency.linearRampToValueAtTime(50, this.context.currentTime + 0.5);
        
        osc.start();
        osc.stop(this.context.currentTime + 0.5);
    }
}
