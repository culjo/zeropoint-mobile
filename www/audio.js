// Audio Engine using Web Audio API (procedural sound design, zero external assets)
class SoundFX {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.initialized = true;
        } catch (e) {
            console.warn("Web Audio not supported", e);
        }
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
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
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
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.09);
    }

    playMerge(value = 2) {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;

        // Base frequency scales musically with number magnitude
        const baseFreq = 220 * Math.pow(1.08, Math.min(Math.abs(value), 32));

        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc2.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.12);

        osc2.frequency.setValueAtTime(baseFreq * 2, now);
        osc2.frequency.exponentialRampToValueAtTime(baseFreq * 2.5, now + 0.12);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.15);
        osc2.stop(now + 0.15);
    }

    playAnnihilate(combo = 1, tier = 1) {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;

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
        subGain.connect(this.ctx.destination);
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
            laserGain.connect(this.ctx.destination);
            laser.start(now);
            laser.stop(now + 0.25);
        }

        // 3. Multi-Harmonic Shimmer Glass Chime
        const baseChord = [523.25, 659.25, 783.99, 1046.50]; // C5 Pentatonic
        const noteCount = Math.min(tier + 1, baseChord.length);
        for (let i = 0; i < noteCount; i++) {
            const chime = this.ctx.createOscillator();
            const chimeGain = this.ctx.createGain();
            const freq = baseChord[i] * Math.pow(1.12, Math.min(combo, 6));

            chime.type = 'triangle';
            chime.frequency.setValueAtTime(freq, now + i * 0.02);
            chime.frequency.exponentialRampToValueAtTime(freq * 1.5, now + i * 0.02 + 0.25);

            chimeGain.gain.setValueAtTime(0.18, now + i * 0.02);
            chimeGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.02 + 0.3);

            chime.connect(chimeGain);
            chimeGain.connect(this.ctx.destination);
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
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.22);
    }

    playCrack() {
        if (this.muted || !this.ctx) return;
        this.playNoiseBlast(0.08, 0.25);
    }

    playNoiseBlast(duration = 0.1, volume = 0.2) {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

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
        gain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + duration);
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
        gain.connect(this.ctx.destination);

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
        gain.connect(this.ctx.destination);

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
            gain.connect(this.ctx.destination);
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
        gain.connect(this.ctx.destination);
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
        suctionGain.connect(this.ctx.destination);
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
        subGain.connect(this.ctx.destination);
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
            gain.connect(this.ctx.destination);

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
            gain.connect(this.ctx.destination);

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
                gain.connect(this.ctx.destination);

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
            gain.connect(this.ctx.destination);

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
                gain.connect(this.ctx.destination);

                osc.start(noteTime);
                osc.stop(noteTime + 0.4);
            });
        } catch (e) {}
    }

    startBGM() {
        if (this.muted || !this.ctx || this.bgmNodes) return;
        this.resume();
        try {
            const now = this.ctx.currentTime;
            const masterBgmGain = this.ctx.createGain();
            masterBgmGain.gain.setValueAtTime(0.001, now);
            masterBgmGain.gain.exponentialRampToValueAtTime(0.045, now + 2); // Soft 2s fade in

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(320, now);

            // Ambient chord frequencies: C2 (65.41), G2 (98.00), C3 (130.81), Eb3 (155.56)
            const freqs = [65.41, 98.00, 130.81, 155.56];
            const oscs = [];

            freqs.forEach((f, i) => {
                const osc = this.ctx.createOscillator();
                osc.type = i % 2 === 0 ? 'sine' : 'triangle';
                osc.frequency.setValueAtTime(f, now);
                // Subtle detune for rich analog drone texture
                osc.detune.setValueAtTime((i - 1.5) * 4, now);
                osc.connect(filter);
                osc.start(now);
                oscs.push(osc);
            });

            filter.connect(masterBgmGain);
            masterBgmGain.connect(this.ctx.destination);

            this.bgmNodes = {
                gain: masterBgmGain,
                filter: filter,
                oscs: oscs
            };
        } catch (e) {
            console.warn("Could not start BGM", e);
        }
    }

    stopBGM() {
        if (!this.bgmNodes || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const nodes = this.bgmNodes;
            this.bgmNodes = null;
            nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
            nodes.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
            setTimeout(() => {
                try {
                    nodes.oscs.forEach(o => o.stop());
                } catch (e) {}
            }, 850);
        } catch (e) {}
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
