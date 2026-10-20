// Audio Engine using Web Audio API (procedural sound design, zero external assets)

// Soundtrack rotation (track ids from music.js): every app open and every new game
// moves to the next track. Boss levels draw from the upbeat set instead.
const BGM_ROTATION = ['lattice', 'drift', 'cascade', 'prism', 'coffee', 'nebula', 'afterglow'];
const BGM_BOSS = ['overclock', 'neonrun'];
const BGM_MIN_PLAY = 45; // seconds a track plays before a new game rotates it


// Cascade ladder: each merge or blast in one turn climbs a C major pentatonic scale
const CASCADE_SCALE = [0, 2, 4, 7, 9]; // semitones above the root: C D E G A
const CASCADE_ROOT_HZ = 261.63;        // C4
const CASCADE_TOP_STEP = 10;           // two octaves up, then the run holds its top note

// Master bus: effects go through a compressor so stacked cascades don't clip;
// music joins after it through its own gain, which dips under big blasts
const SFX_COMP = { threshold: -14, knee: 10, ratio: 4, attack: 0.003, release: 0.2 };
const DUCK_LEVEL = 0.4;    // music level while ducked
const DUCK_ATTACK = 0.05;  // seconds to dip
const DUCK_HOLD = 0.15;    // seconds held low
const DUCK_RELEASE = 0.5;  // seconds to come back
const MUFFLE_OPEN_HZ = 20000; // music low-pass when the board is safe
const MUFFLE_DANGER_HZ = 650; // at full danger
const MUFFLE_TIME = 0.25;     // seconds (time constant) to glide between them

function cascadeNoteHz(step) {
    const octave = Math.floor(step / CASCADE_SCALE.length);
    const semis = octave * 12 + CASCADE_SCALE[step % CASCADE_SCALE.length];
    return CASCADE_ROOT_HZ * Math.pow(2, semis / 12);
}

class SoundFX {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.initialized = false;
        this.noiseBuffer = null;
        this.cascadeStep = 0;
        this.music = null;
        this.bgmTrack = null;
        this.out = null;      // where every effect connects (compressor input)
        this.musicBus = null; // music input; its gain does the ducking
    }

    // Start of a turn: the next merge or blast plays the root again
    resetCascade() {
        this.cascadeStep = 0;
    }

    takeCascadeStep() {
        const step = Math.min(this.cascadeStep, CASCADE_TOP_STEP);
        this.cascadeStep++;
        return step;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.buildBus();
            this.initialized = true;
            this.warmUp();
        } catch (e) {
            console.warn("Web Audio not supported", e);
        }
    }

    buildBus() {
        const ctx = this.ctx;
        try {
            const master = ctx.createGain();
            master.connect(ctx.destination);
            const comp = ctx.createDynamicsCompressor();
            comp.threshold.value = SFX_COMP.threshold;
            comp.knee.value = SFX_COMP.knee;
            comp.ratio.value = SFX_COMP.ratio;
            comp.attack.value = SFX_COMP.attack;
            comp.release.value = SFX_COMP.release;
            comp.connect(master);
            // Music: duck gain → low-pass (opens fully unless the board is in danger) → master
            const music = ctx.createGain();
            const muffle = ctx.createBiquadFilter();
            muffle.type = 'lowpass';
            muffle.frequency.value = MUFFLE_OPEN_HZ;
            muffle.Q.value = 0.7;
            music.connect(muffle);
            muffle.connect(master);
            this.out = comp;
            this.musicBus = music;
            this.muffle = muffle;
        } catch (e) {
            this.out = ctx.destination;
            this.musicBus = ctx.destination;
        }
    }

    // Count-up tick: a short blip that climbs an octave as the count fills (progress 0–1)
    playCountTick(progress = 0) {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(900 * Math.pow(2, Math.max(0, Math.min(1, progress))), now);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.out);
        osc.start(now);
        osc.stop(now + 0.06);
    }

    // Victory star landing: a low thump plus a bell that rises with each star (C5, E5, A5)
    playStarStamp(index = 0) {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const thump = this.ctx.createOscillator();
        const thumpGain = this.ctx.createGain();
        thump.type = 'sine';
        thump.frequency.setValueAtTime(150, now);
        thump.frequency.exponentialRampToValueAtTime(55, now + 0.18);
        thumpGain.gain.setValueAtTime(0.35, now);
        thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        thump.connect(thumpGain);
        thumpGain.connect(this.out);
        thump.start(now);
        thump.stop(now + 0.21);

        const bellSteps = [5, 7, 9]; // cascade-ladder steps: C5, E5, A5
        const bell = this.ctx.createOscillator();
        const bellGain = this.ctx.createGain();
        bell.type = 'triangle';
        bell.frequency.setValueAtTime(cascadeNoteHz(bellSteps[Math.min(index, bellSteps.length - 1)]), now);
        bellGain.gain.setValueAtTime(0.18, now);
        bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        bell.connect(bellGain);
        bellGain.connect(this.out);
        bell.start(now);
        bell.stop(now + 0.46);
    }

    // Danger 0–1 closes the music's low-pass from fully open down to a muffled thud
    setDanger(level) {
        if (!this.ctx || !this.muffle) return;
        const hz = MUFFLE_OPEN_HZ * Math.pow(MUFFLE_DANGER_HZ / MUFFLE_OPEN_HZ, Math.max(0, Math.min(1, level)));
        this.muffle.frequency.setTargetAtTime(hz, this.ctx.currentTime, MUFFLE_TIME);
    }

    // Dip the music under a big blast, then bring it back
    duckMusic() {
        if (!this.ctx || !this.musicBus || !this.musicBus.gain) return;
        const g = this.musicBus.gain;
        const now = this.ctx.currentTime;
        g.cancelScheduledValues(now);
        g.setValueAtTime(g.value, now);
        g.linearRampToValueAtTime(DUCK_LEVEL, now + DUCK_ATTACK);
        g.setValueAtTime(DUCK_LEVEL, now + DUCK_ATTACK + DUCK_HOLD);
        g.linearRampToValueAtTime(1, now + DUCK_ATTACK + DUCK_HOLD + DUCK_RELEASE);
    }

    // Start the audio hardware and build shared buffers up front (on the first
    // menu tap) so the first in-game sound doesn't stall a frame.
    warmUp() {
        if (!this.ctx) return;
        try {
            this.resume();
            const silent = this.ctx.createBuffer(1, 1, this.ctx.sampleRate);
            const src = this.ctx.createBufferSource();
            src.buffer = silent;
            src.connect(this.out);
            src.start(0);
            // Silent oscillator so the first real tone doesn't pay the node setup cost
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0, now);
            osc.connect(gain);
            gain.connect(this.out);
            osc.start(now);
            osc.stop(now + 0.02);
            this.getNoiseBuffer();
        } catch (e) {}
    }

    // One second of white noise, reused by every blast (offset varies per play)
    getNoiseBuffer() {
        if (!this.noiseBuffer && this.ctx) {
            const size = this.ctx.sampleRate;
            const buffer = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
            this.noiseBuffer = buffer;
        }
        return this.noiseBuffer;
    }

    resume() {
        try {
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume().catch(() => {});
            }
        } catch (e) {}
    }

    playMove() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.04);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.out);

        osc.start(now);
        osc.stop(now + 0.04);
    }

    // Short, soft "tock" for menu and game buttons
    playTap() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(980, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.05);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.09, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(this.out);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    playDrop() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.09);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(this.out);

        osc.start(now);
        osc.stop(now + 0.09);
    }

    playMerge() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;

        // Pitch is the next note of the cascade ladder
        const baseFreq = cascadeNoteHz(this.takeCascadeStep());

        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc2.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.03, now + 0.12);

        osc2.frequency.setValueAtTime(baseFreq * 2, now);
        osc2.frequency.exponentialRampToValueAtTime(baseFreq * 2.06, now + 0.12);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(this.out);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.15);
        osc2.stop(now + 0.15);
    }

    playAnnihilate(combo = 1, tier = 1) {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;

        if (tier >= 4) this.duckMusic(); // Supernova and up get the room to themselves

        const duration = 0.35 + Math.min(tier * 0.12, 0.5);
        const subFreq = Math.max(35, 110 - tier * 15);

        // 1. Heavy Sub-Bass Boom (Lower and heavier for higher tiers)
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(subFreq + combo * 8, now);
        sub.frequency.exponentialRampToValueAtTime(20, now + duration);

        const subVol = Math.min(0.35 + tier * 0.08, 0.7);
        subGain.gain.setValueAtTime(subVol, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        sub.connect(subGain);
        subGain.connect(this.out);
        sub.start(now);
        sub.stop(now + duration);

        // 2. Laser / Ion Cannon zap for Cross Laser (Tier 3+)
        if (tier >= 3) {
            const laser = this.ctx.createOscillator();
            const laserGain = this.ctx.createGain();
            laser.type = 'sawtooth';
            laser.frequency.setValueAtTime(900, now);
            laser.frequency.exponentialRampToValueAtTime(80, now + 0.25);

            laserGain.gain.setValueAtTime(0.2, now);
            laserGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            laser.connect(laserGain);
            laserGain.connect(this.out);
            laser.start(now);
            laser.stop(now + 0.25);
        }

        // 3. Multi-Harmonic Shimmer Glass Chime, rooted an octave above the next cascade note
        const root = this.takeCascadeStep() + CASCADE_SCALE.length;
        const chordSteps = [0, 2, 3, 5]; // root, third, fifth, octave on C
        const noteCount = Math.min(tier + 1, chordSteps.length);
        for (let i = 0; i < noteCount; i++) {
            const chime = this.ctx.createOscillator();
            const chimeGain = this.ctx.createGain();
            const freq = cascadeNoteHz(root + chordSteps[i]);

            chime.type = 'triangle';
            chime.frequency.setValueAtTime(freq, now + i * 0.02);
            chime.frequency.exponentialRampToValueAtTime(freq * 1.04, now + i * 0.02 + 0.25);

            chimeGain.gain.setValueAtTime(0.18, now + i * 0.02);
            chimeGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.02 + 0.3);

            chime.connect(chimeGain);
            chimeGain.connect(this.out);
            chime.start(now + i * 0.02);
            chime.stop(now + i * 0.02 + 0.3);
        }

        // 4. Filtered Noise Blast (Larger for higher tiers)
        this.playNoiseBlast(0.15 + tier * 0.06, 0.15 + tier * 0.05);
    }

    playSpecial() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.out);

        osc.start(now);
        osc.stop(now + 0.22);
    }

    playCrack() {
        if (this.muted || !this.ctx) return;
        this.playNoiseBlast(0.08, 0.25);
    }

    playNoiseBlast(duration = 0.1, volume = 0.2) {
        if (!this.ctx) return;
        const buffer = this.getNoiseBuffer();
        const len = Math.min(duration, buffer.duration);
        const offset = Math.random() * Math.max(0, buffer.duration - len);

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        filter.Q.value = 3;

        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.out);

        noise.start(now, offset, len);
    }

    playWarning() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(330, now + 0.08);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(this.out);

        osc.start(now);
        osc.stop(now + 0.16);
    }

    playGameOver() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.8);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

        osc.connect(gain);
        gain.connect(this.out);

        osc.start(now);
        osc.stop(now + 0.85);
    }

    playOverdriveReady() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);
            gain.gain.setValueAtTime(0.18, now + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.35);
            osc.connect(gain);
            gain.connect(this.out);
            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.35);
        });
    }

    playOverdriveActivate() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.3);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(this.out);
        osc.start(now);
        osc.stop(now + 0.4);
        this.playNoiseBlast(0.3, 0.25);
    }

    playBlackHole() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;

        const suction = this.ctx.createOscillator();
        const suctionGain = this.ctx.createGain();
        suction.type = 'sine';
        suction.frequency.setValueAtTime(700, now);
        suction.frequency.exponentialRampToValueAtTime(30, now + 0.55);

        suctionGain.gain.setValueAtTime(0.35, now);
        suctionGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        suction.connect(suctionGain);
        suctionGain.connect(this.out);
        suction.start(now);
        suction.stop(now + 0.55);

        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(60, now + 0.2);
        sub.frequency.exponentialRampToValueAtTime(18, now + 0.65);
        subGain.gain.setValueAtTime(0.4, now + 0.2);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        sub.connect(subGain);
        subGain.connect(this.out);
        sub.start(now + 0.2);
        sub.stop(now + 0.65);

        this.playNoiseBlast(0.4, 0.25);
    }

    playQuantumSwap() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;

        [320, 480].forEach((baseFreq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = i === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, now + 0.08);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + 0.18);

            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

            osc.connect(gain);
            gain.connect(this.out);

            osc.start(now);
            osc.stop(now + 0.18);
        });
    }

    playBountyComplete() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;

        const notes = [698.46, 880.00, 1046.50];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            const time = now + idx * 0.07;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(0.2, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

            osc.connect(gain);
            gain.connect(this.out);

            osc.start(time);
            osc.stop(time + 0.3);
        });
    }

    playPowerup() {
        if (this.muted || !this.ctx) return;
        this.resume();
        try {
            const now = this.ctx.currentTime;
            const freqs = [523.25, 659.25, 783.99, 1046.50];
            freqs.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const time = now + idx * 0.05;

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, time);
                osc.frequency.exponentialRampToValueAtTime(freq * 1.15, time + 0.12);

                gain.gain.setValueAtTime(0.18, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

                osc.connect(gain);
                gain.connect(this.out);

                osc.start(time);
                osc.stop(time + 0.18);
            });
        } catch (e) {
            // Audio errors should never crash gameplay
        }
    }

    playSingularitySuction() {
        if (this.muted || !this.ctx) return;
        this.resume();
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(260, now);
            osc.frequency.exponentialRampToValueAtTime(65, now + 0.22);

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.linearRampToValueAtTime(0.24, now + 0.16);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);

            osc.connect(gain);
            gain.connect(this.out);

            osc.start(now);
            osc.stop(now + 0.23);
        } catch (e) {}
    }

    playVictory() {
        if (this.muted || !this.ctx) return;
        this.resume();
        try {
            const now = this.ctx.currentTime;
            const arpeggio = [523.25, 659.25, 783.99, 1046.50, 1318.51];
            arpeggio.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const noteTime = now + idx * 0.08;

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, noteTime);

                gain.gain.setValueAtTime(0.2, noteTime);
                gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

                osc.connect(gain);
                gain.connect(this.out);

                osc.start(noteTime);
                osc.stop(noteTime + 0.4);
            });
        } catch (e) {}
    }

    // Ambient soundtrack lives in music.js; the track comes from rotateBGM / playBGMTrack
    startBGM() {
        if (this.muted || !this.ctx || !window.AmbientMusic) return;
        if (!this.music) this.music = new AmbientMusic(this.ctx, this.musicBus);
        if (this.music.playing) return;
        if (!this.bgmTrack) this.rotateBGM();
        this.resume();
        try {
            this.music.start(this.bgmTrack, { volume: 0.5, fadeIn: 3 });
        } catch (e) {
            console.warn("Could not start BGM", e);
        }
    }

    // Next track in the rotation (or the boss set). A track that only just started is kept,
    // so opening the app and tapping Play straight away doesn't cut the first track short.
    rotateBGM(boss = false) {
        const current = this.bgmTrack;
        const m = this.music;
        const fresh = m && m.playing && this.ctx.currentTime - m.startedAt < BGM_MIN_PLAY;
        if (current && BGM_BOSS.includes(current) === boss && fresh) return;
        const list = boss ? BGM_BOSS : BGM_ROTATION;
        const key = boss ? 'nullfall_bgm_boss_next' : 'nullfall_bgm_next';
        let i = 0;
        try { i = (parseInt(localStorage.getItem(key), 10) || 0) % list.length; } catch (e) {}
        try { localStorage.setItem(key, String((i + 1) % list.length)); } catch (e) {}
        this.playBGMTrack(list[i]);
    }

    onBossTrack() {
        return BGM_BOSS.includes(this.bgmTrack);
    }

    // Switch track; crossfades if music is playing, otherwise it's used on the next start
    playBGMTrack(trackId) {
        if (trackId === this.bgmTrack && this.music && this.music.playing) return;
        this.bgmTrack = trackId;
        if (this.music && this.music.playing) this.music.start(trackId, { volume: 0.5, fadeIn: 2 });
    }

    // Dev tools: play any track now, even with music or sound switched off
    previewBGM(trackId) {
        this.init();
        if (!this.ctx || !window.AmbientMusic) return;
        if (!this.music) this.music = new AmbientMusic(this.ctx, this.musicBus);
        this.resume();
        this.bgmTrack = trackId;
        this.music.start(trackId, { volume: 0.5, fadeIn: 1 });
    }

    playingBGM() {
        return this.music && this.music.playing ? this.music.trackId : null;
    }

    stopBGM() {
        if (this.music) this.music.stop(0.8);
    }

    toggleBGM(enable) {
        if (enable) {
            this.startBGM();
        } else {
            this.stopBGM();
        }
    }
}

window.soundFX = new SoundFX();
