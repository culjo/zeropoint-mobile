// Procedural ambient soundtrack (Web Audio, zero external assets).
// Each track is plain data: a looping chord progression, a pad, a bass, one or
// more melodic voices and optional texture / soft percussion. The engine runs on
// a single step clock and schedules a little ahead of the audio clock.
(function () {
    const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

    // mix: [dry, reverb send, delay send] per layer; gain: loudness trim so tracks match
    const TRACKS = {
        drift: {
            name: 'Drift',
            mood: 'Warm, slow-breathing pads with distant bells. Calm and unobtrusive.',
            tag: 'ambient', labels: ['Dmaj9', 'Bm9', 'Gmaj7', 'Asus4'],
            bpm: 66, subdiv: 2, chordBeats: 8,
            scale: [2, 4, 6, 7, 9, 11, 1],
            chords: [
                { bass: 38, pad: [54, 57, 61, 64] }, // Dmaj9
                { bass: 35, pad: [54, 57, 61, 62] }, // Bm9
                { bass: 43, pad: [55, 59, 62, 66] }, // Gmaj7
                { bass: 45, pad: [52, 57, 62, 64] }  // Asus4(add9)
            ],
            pad: { wave: 'sawtooth', detune: 9, cutoff: 820, attack: 3, release: 4, level: 0.13 },
            bass: { level: 0.12 },
            leads: [
                { voice: 'bell', mode: 'random', density: 0.2, lo: 69, hi: 88, level: 0.06, decay: 3.5, ratio: 3.5, index: 1.6 }
            ],
            reverb: { seconds: 5, decay: 2.6, level: 0.7 },
            delay: { beats: 0.75, feedback: 0.38 },
            tone: 5200,
            mix: { pad: [0.6, 0.6, 0], bass: [1, 0.1, 0], lead: [0.5, 0.8, 0.45] }
        },

        nebula: {
            name: 'Nebula',
            mood: 'Dark, deep-space drift. Minor chords, solar wind, rare glass tones.',
            tag: 'ambient', labels: ['Cm(add9)', 'Abmaj7', 'Fm7', 'Gsus4'],
            bpm: 54, subdiv: 2, chordBeats: 12,
            scale: [0, 2, 3, 5, 7, 8, 10],
            chords: [
                { bass: 36, pad: [51, 55, 60, 62] }, // Cm(add9)
                { bass: 32, pad: [51, 55, 56, 60] }, // Abmaj7
                { bass: 41, pad: [53, 56, 60, 63] }, // Fm7
                { bass: 43, pad: [50, 55, 60, 62] }  // Gsus4
            ],
            pad: { wave: 'sawtooth', detune: 12, cutoff: 560, attack: 5, release: 6, level: 0.12 },
            bass: { level: 0.15 },
            leads: [
                { voice: 'glass', mode: 'random', density: 0.09, lo: 63, hi: 82, level: 0.06, decay: 5 }
            ],
            texture: { level: 0.05, lo: 250, hi: 1400, rate: 0.03 },
            reverb: { seconds: 7, decay: 2.2, level: 0.8 },
            delay: { beats: 1.5, feedback: 0.45 },
            tone: 4200,
            mix: { pad: [0.6, 0.7, 0], bass: [1, 0.15, 0], lead: [0.4, 0.9, 0.5], texture: [0.6, 0.6, 0] }
        },

        lattice: {
            name: 'Lattice',
            mood: 'Gentle pulsing arpeggio for focus. Most "puzzle game" of the set.',
            tag: 'ambient', labels: ['Am9', 'Fmaj7', 'Cmaj9', 'G6'],
            bpm: 88, subdiv: 2, chordBeats: 8,
            scale: [9, 11, 0, 2, 4, 5, 7],
            chords: [
                { bass: 45, pad: [55, 59, 60, 64] }, // Am9
                { bass: 41, pad: [53, 57, 60, 64] }, // Fmaj7
                { bass: 48, pad: [52, 55, 59, 62] }, // Cmaj9
                { bass: 43, pad: [50, 55, 59, 64] }  // G6
            ],
            pad: { wave: 'triangle', detune: 6, cutoff: 1800, attack: 1.5, release: 3, level: 0.1 },
            bass: { level: 0.12 },
            leads: [
                { voice: 'pluck', mode: 'sequence', pattern: [0, 2, 1, 3, 2, 4, 3, 5], density: 0.9, lo: 64, hi: 86, level: 0.07, decay: 0.9, accent: true },
                { voice: 'bell', mode: 'random', density: 0.05, lo: 79, hi: 93, level: 0.035, decay: 3, ratio: 3.5, index: 1.2 }
            ],
            reverb: { seconds: 3.5, decay: 3, level: 0.6 },
            delay: { beats: 0.75, feedback: 0.3 },
            tone: 6000,
            mix: { pad: [0.6, 0.5, 0], bass: [1, 0.1, 0], lead: [0.7, 0.5, 0.35] }
        },

        cascade: {
            name: 'Cascade',
            mood: 'Lo-fi chill: electric-piano chords, soft kick and a swung shaker.',
            tag: 'lofi', labels: ['Dm9', 'G13', 'Cmaj9', 'Am9'],
            bpm: 74, subdiv: 2, chordBeats: 8, swing: 0.14,
            scale: [2, 4, 5, 7, 9, 11, 0],
            chords: [
                { bass: 38, pad: [53, 57, 60, 64] }, // Dm9
                { bass: 43, pad: [53, 57, 59, 64] }, // G13
                { bass: 36, pad: [52, 55, 59, 62] }, // Cmaj9
                { bass: 45, pad: [55, 59, 60, 64] }  // Am9
            ],
            pad: { wave: 'triangle', detune: 5, cutoff: 900, attack: 2, release: 3, level: 0.08 },
            keys: { pattern: [1, 0, 0, 0.55, 0, 0, 0.7, 0, 0, 0, 0.8, 0, 0, 0.5, 0, 0], level: 0.16, decay: 2.4, strum: 0.025 },
            bass: { level: 0.2, pattern: [1, 0, 0, 0, 0, 0.7, 0, 0, 1, 0, 0, 0, 0, 0, 0.6, 0] },
            leads: [
                { voice: 'bell', mode: 'random', density: 0.1, lo: 72, hi: 86, level: 0.065, decay: 2.5, ratio: 4, index: 1 }
            ],
            perc: {
                kick: [1, 0, 0, 0, 0, 0, 0.6, 0, 0, 0, 1, 0, 0, 0, 0, 0], kickLevel: 0.2,
                hat: [0, 1, 0, 1, 0, 1, 0, 1], hatLevel: 0.022
            },
            reverb: { seconds: 2.5, decay: 3, level: 0.5 },
            delay: { beats: 0.75, feedback: 0.25 },
            tone: 3400,
            gain: 2,
            mix: { pad: [0.7, 0.4, 0], bass: [1, 0.05, 0], keys: [0.8, 0.4, 0.15], lead: [0.5, 0.6, 0.4], perc: [1, 0.15, 0] }
        },

        prism: {
            name: 'Prism',
            mood: 'Crystalline and bright. Twinkling FM bells over airy Lydian chords.',
            tag: 'ambient', labels: ['Fmaj9', 'G', 'Em7', 'Am(add9)'],
            bpm: 72, subdiv: 4, chordBeats: 8,
            scale: [5, 7, 9, 11, 0, 2, 4],
            chords: [
                { bass: 41, pad: [57, 60, 64, 67] }, // Fmaj9
                { bass: 43, pad: [55, 59, 62, 67] }, // G (Lydian II)
                { bass: 40, pad: [55, 59, 62, 64] }, // Em7
                { bass: 45, pad: [57, 60, 64, 71] }  // Am(add9)
            ],
            pad: { wave: 'sine', detune: 4, octave: true, cutoff: 3000, attack: 3, release: 4, level: 0.15 },
            bass: { level: 0.08 },
            leads: [
                { voice: 'bell', mode: 'random', density: 0.14, lo: 74, hi: 96, level: 0.06, decay: 4, ratio: 3.01, index: 1.2 },
                { voice: 'glass', mode: 'random', density: 0.03, lo: 62, hi: 76, level: 0.05, decay: 5 }
            ],
            reverb: { seconds: 6, decay: 2.4, level: 0.8 },
            delay: { beats: 0.75, feedback: 0.45 },
            tone: 7000,
            gain: 1.5,
            mix: { pad: [0.5, 0.7, 0], bass: [1, 0.2, 0], lead: [0.45, 0.8, 0.55] }
        },
        coffee: {
            name: 'Coffee Break',
            mood: 'Jazzy lo-fi boom-bap. Lazy Rhodes, warm bass, a little bell melody.',
            tag: 'lofi', labels: ['Ebmaj9', 'Cm9', 'Fm9', 'Bb13'],
            bpm: 82, subdiv: 2, chordBeats: 4, swing: 0.16,
            scale: [3, 5, 7, 8, 10, 0, 2],
            chords: [
                { bass: 39, pad: [55, 58, 62, 65] }, // Ebmaj9
                { bass: 36, pad: [55, 58, 62, 63] }, // Cm9
                { bass: 41, pad: [55, 56, 60, 63] }, // Fm9
                { bass: 46, pad: [56, 60, 62, 67] }  // Bb13
            ],
            pad: { wave: 'triangle', detune: 5, cutoff: 800, attack: 1, release: 2, level: 0.06 },
            keys: { pattern: [1, 0, 0, 0.5, 0, 0.6, 0, 0], level: 0.15, decay: 2, strum: 0.03 },
            bass: { level: 0.2, pattern: [1, 0, 0, 0.6, 0, 0, 0.8, 0], notes: [0, 0, 0, 12, 0, 0, 7, 0] },
            leads: [
                { voice: 'bell', mode: 'random', density: 0.16, lo: 70, hi: 84, level: 0.06, decay: 2, ratio: 4, index: 0.8 }
            ],
            perc: {
                kick: [1, 0, 0, 0.5, 0, 0, 0, 0, 1, 0, 0.7, 0, 0, 0, 0, 0], kickLevel: 0.22,
                snare: [0, 0, 1, 0, 0, 0, 1, 0], snareLevel: 0.07,
                hat: [0.9, 0.6, 0.9, 0.6, 0.9, 0.6, 0.9, 0.7], hatLevel: 0.02
            },
            reverb: { seconds: 2.2, decay: 3, level: 0.45 },
            delay: { beats: 0.75, feedback: 0.25 },
            tone: 3200,
            gain: 1.8,
            mix: { pad: [0.7, 0.4, 0], bass: [1, 0.05, 0], keys: [0.8, 0.35, 0.1], lead: [0.55, 0.5, 0.4], perc: [1, 0.12, 0] }
        },

        afterglow: {
            name: 'Afterglow',
            mood: 'Mellow sunset lo-fi. Two-bar chords, slow plucked melody, soft brushes.',
            tag: 'lofi', labels: ['Fmaj9', 'Em7', 'Dm9', 'Cmaj7'],
            bpm: 76, subdiv: 2, chordBeats: 8, swing: 0.18,
            scale: [5, 7, 9, 10, 0, 2, 4],
            chords: [
                { bass: 41, pad: [55, 57, 60, 64] }, // Fmaj9
                { bass: 40, pad: [55, 59, 62, 64] }, // Em7
                { bass: 38, pad: [53, 57, 60, 64] }, // Dm9
                { bass: 36, pad: [52, 55, 59, 64] }  // Cmaj7
            ],
            pad: { wave: 'sawtooth', detune: 8, cutoff: 650, attack: 2.5, release: 3, level: 0.08 },
            keys: { pattern: [1, 0, 0, 0, 0, 0, 0.5, 0, 0, 0, 0.7, 0, 0, 0, 0, 0], level: 0.12, decay: 3, strum: 0.04 },
            bass: { level: 0.18, pattern: [1, 0, 0, 0, 0, 0, 0.6, 0, 0.8, 0, 0, 0, 0, 0, 0, 0], notes: [0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
            leads: [
                { voice: 'pluck', mode: 'random', density: 0.22, lo: 64, hi: 81, level: 0.05, decay: 1.2 }
            ],
            perc: {
                kick: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], kickLevel: 0.18,
                snare: [0, 0, 0, 0, 1, 0, 0, 0], snareLevel: 0.05, snareTone: false,
                hat: [0.7, 0.5, 0.7, 0.5, 0.7, 0.5, 0.7, 0.5], hatLevel: 0.014
            },
            reverb: { seconds: 3, decay: 2.8, level: 0.55 },
            delay: { beats: 0.75, feedback: 0.3 },
            tone: 3000,
            gain: 2.8,
            mix: { pad: [0.7, 0.5, 0], bass: [1, 0.05, 0], keys: [0.8, 0.4, 0.15], lead: [0.5, 0.6, 0.45], perc: [1, 0.15, 0] }
        },

        overclock: {
            name: 'Overclock',
            mood: 'Upbeat lo-fi hip-hop. Punchy swung drums, bouncing bass, chords that pump.',
            tag: 'upbeat', labels: ['Fm9', 'Dbmaj7', 'Bbm9', 'C9'],
            bpm: 96, subdiv: 4, chordBeats: 4, swing: 0.2, pump: 0.35,
            scale: [5, 7, 8, 10, 0, 1, 3],
            chords: [
                { bass: 41, pad: [56, 60, 63, 67] }, // Fm9
                { bass: 37, pad: [56, 60, 63, 65] }, // Dbmaj7
                { bass: 46, pad: [56, 60, 61, 65] }, // Bbm9
                { bass: 48, pad: [55, 58, 62, 64] }  // C9
            ],
            pad: { wave: 'sawtooth', detune: 8, cutoff: 1100, attack: 0.4, release: 1, level: 0.08 },
            keys: { pattern: [1, 0, 0, 0, 0, 0, 0.6, 0, 0, 0, 0.8, 0, 0, 0, 0.5, 0], level: 0.13, decay: 1.4, strum: 0.015 },
            bass: {
                level: 0.22,
                pattern: [1, 0, 0, 0, 0, 0, 0.7, 0, 0, 0, 1, 0, 0, 0.6, 0, 0],
                notes: [0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 7, 0, 0, 10, 0, 0]
            },
            leads: [
                { voice: 'pluck', mode: 'sequence', pattern: [0, 2, 4, 2, 1, 3, 5, 3], density: 0.35, lo: 67, hi: 86, level: 0.05, decay: 0.6, accent: true },
                { voice: 'bell', mode: 'random', density: 0.05, lo: 79, hi: 91, level: 0.04, decay: 2, ratio: 4, index: 1 }
            ],
            perc: {
                kick: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0.6, 0, 0, 1, 0, 0, 0, 0, 0], kickLevel: 0.3,
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0.3], snareLevel: 0.1,
                hat: [1, 0.4, 0.7, 0.4, 1, 0.4, 0.7, 0.5, 1, 0.4, 0.7, 0.4, 1, 0.4, 0.8, 0.6], hatLevel: 0.025
            },
            reverb: { seconds: 2, decay: 3, level: 0.4 },
            delay: { beats: 0.75, feedback: 0.25 },
            tone: 4200,
            gain: 1.45,
            mix: { pad: [0.7, 0.35, 0], bass: [1, 0.03, 0], keys: [0.8, 0.3, 0.1], lead: [0.6, 0.4, 0.35], perc: [1, 0.08, 0] }
        },

        neonrun: {
            name: 'Neon Run',
            mood: 'Driving synth-lofi for boss fights. Four-on-the-floor, pulsing bass, 16th arps.',
            tag: 'upbeat', labels: ['Em9', 'Cmaj7', 'G', 'Dsus2'],
            bpm: 112, subdiv: 4, chordBeats: 4, pump: 0.55,
            scale: [4, 6, 7, 9, 11, 0, 2],
            chords: [
                { bass: 40, pad: [55, 59, 62, 66] }, // Em9
                { bass: 36, pad: [55, 59, 62, 64] }, // Cmaj7
                { bass: 43, pad: [55, 59, 62, 67] }, // G
                { bass: 38, pad: [54, 57, 62, 64] }  // Dsus2
            ],
            pad: { wave: 'sawtooth', detune: 12, cutoff: 1500, attack: 0.3, release: 0.8, level: 0.1 },
            bass: {
                level: 0.2,
                pattern: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0.6],
                notes: [0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 12, 7]
            },
            leads: [
                { voice: 'pluck', mode: 'sequence', pattern: [0, 2, 4, 6, 4, 2, 5, 3], density: 0.85, lo: 64, hi: 88, level: 0.055, decay: 0.45, accent: true },
                { voice: 'bell', mode: 'random', density: 0.04, lo: 81, hi: 93, level: 0.035, decay: 2, ratio: 3.5, index: 1.2 }
            ],
            perc: {
                kick: [1, 0, 0, 0], kickLevel: 0.3,
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], snareLevel: 0.09,
                hat: [0.4, 0.3, 1, 0.3], hatLevel: 0.03, hatOpen: 2
            },
            reverb: { seconds: 2.5, decay: 3, level: 0.45 },
            delay: { beats: 0.75, feedback: 0.3 },
            tone: 6500,
            gain: 1.25,
            mix: { pad: [0.6, 0.4, 0], bass: [1, 0.03, 0], lead: [0.6, 0.45, 0.4], perc: [1, 0.08, 0] }
        }
    };

    const impulseCache = new WeakMap();
    function getImpulse(ctx, seconds, decay) {
        let byKey = impulseCache.get(ctx);
        if (!byKey) impulseCache.set(ctx, byKey = new Map());
        const key = seconds + ':' + decay;
        if (byKey.has(key)) return byKey.get(key);
        const rate = ctx.sampleRate;
        const len = Math.floor(rate * seconds);
        const buf = ctx.createBuffer(2, len, rate);
        for (let ch = 0; ch < 2; ch++) {
            const d = buf.getChannelData(ch);
            for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
        }
        byKey.set(key, buf);
        return buf;
    }

    // Fill every track's reverb impulse ahead of time in small idle slices, so starting
    // the music never stalls a frame (a 7 s stereo impulse is ~700k samples)
    const idle = (fn) => (window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout: 500 }) : setTimeout(fn, 16));
    function prepareImpulses(ctx, tracks) {
        let byKey = impulseCache.get(ctx);
        if (!byKey) impulseCache.set(ctx, byKey = new Map());
        const jobs = [];
        Object.values(tracks).forEach((t) => {
            if (!t.reverb) return;
            const key = t.reverb.seconds + ':' + t.reverb.decay;
            if (!jobs.some((j) => j.key === key)) jobs.push({ key, seconds: t.reverb.seconds, decay: t.reverb.decay });
        });
        const SLICE = 16384;
        const runJob = () => {
            const job = jobs.shift();
            if (!job) return;
            if (byKey.has(job.key)) { idle(runJob); return; }
            const rate = ctx.sampleRate;
            const len = Math.floor(rate * job.seconds);
            const buf = ctx.createBuffer(2, len, rate);
            const chans = [buf.getChannelData(0), buf.getChannelData(1)];
            let ch = 0, i = 0;
            const step = () => {
                if (byKey.has(job.key)) { idle(runJob); return; } // filled on demand meanwhile
                const d = chans[ch];
                const end = Math.min(len, i + SLICE);
                for (; i < end; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, job.decay);
                if (i >= len) { ch++; i = 0; }
                if (ch < 2) { idle(step); return; }
                byKey.set(job.key, buf);
                idle(runJob);
            };
            idle(step);
        };
        idle(runJob);
    }

    class AmbientMusic {
        constructor(ctx, destination) {
            this.ctx = ctx;
            this.destination = destination || ctx.destination;
            this.track = null;
            this.timer = null;
            this.nodes = null;
        }

        static get tracks() { return TRACKS; }

        static prepare(ctx) { prepareImpulses(ctx, TRACKS); }

        get playing() { return !!this.track; }

        // opts: { volume, fadeIn, manual } — manual skips the timer (offline rendering)
        start(trackId, opts = {}) {
            if (this.track) this.stop(0.6);
            const track = TRACKS[trackId];
            if (!track) return;
            this.track = track;
            this.trackId = trackId;
            this.startedAt = this.ctx.currentTime;
            this.stepLen = 60 / track.bpm / track.subdiv;
            this.stepsPerChord = track.chordBeats * track.subdiv;
            this.step = 0;
            this.nextStepTime = this.ctx.currentTime + 0.1;
            this.leadState = track.leads.map(() => ({ last: -1, count: 0 }));
            this.buildGraph(opts.volume != null ? opts.volume : 0.5, opts.fadeIn != null ? opts.fadeIn : 3);
            if (!opts.manual) {
                this.timer = setInterval(() => this.tick(), 100);
                this.tick();
            }
        }

        stop(fade = 1.5) {
            if (!this.track) return;
            clearInterval(this.timer);
            this.timer = null;
            this.track = null;
            const nodes = this.nodes;
            this.nodes = null;
            const now = this.ctx.currentTime;
            try {
                nodes.master.gain.cancelScheduledValues(now);
                nodes.master.gain.setValueAtTime(nodes.master.gain.value, now);
                nodes.master.gain.linearRampToValueAtTime(0, now + fade);
            } catch (e) {}
            setTimeout(() => {
                try {
                    nodes.sources.forEach(s => s.stop());
                    nodes.master.disconnect();
                } catch (e) {}
            }, (fade + 0.2) * 1000);
        }

        setVolume(volume) {
            if (!this.nodes) return;
            this.volume = volume;
            const now = this.ctx.currentTime;
            this.nodes.master.gain.cancelScheduledValues(now);
            this.nodes.master.gain.setTargetAtTime(volume * (this.track.gain || 1), now, 0.2);
        }

        // Fade the master out at an absolute time (used to end offline renders cleanly)
        fadeOutAt(time, fade) {
            if (!this.nodes) return;
            const g = this.nodes.master.gain;
            g.setValueAtTime(this.volume * (this.track.gain || 1), time);
            g.linearRampToValueAtTime(0, time + fade);
        }

        currentChordIndex() {
            if (!this.track) return -1;
            return Math.floor(Math.max(0, this.step - 1) / this.stepsPerChord) % this.track.chords.length;
        }

        buildGraph(volume, fadeIn) {
            const ctx = this.ctx, t = this.track, now = ctx.currentTime;
            this.volume = volume;
            volume *= t.gain || 1; // per-track loudness trim

            const master = ctx.createGain();
            master.gain.setValueAtTime(0, now);
            master.gain.linearRampToValueAtTime(volume, now + fadeIn);
            const comp = ctx.createDynamicsCompressor();
            comp.threshold.value = -18;
            comp.ratio.value = 3;
            comp.attack.value = 0.02;
            comp.release.value = 0.4;
            master.connect(comp);
            comp.connect(this.destination);

            const tone = ctx.createBiquadFilter();
            tone.type = 'lowpass';
            tone.frequency.value = t.tone || 6000;
            tone.Q.value = 0.4;
            tone.connect(master);

            const reverb = ctx.createConvolver();
            reverb.buffer = getImpulse(ctx, t.reverb.seconds, t.reverb.decay);
            const reverbDamp = ctx.createBiquadFilter();
            reverbDamp.type = 'lowpass';
            reverbDamp.frequency.value = 4500;
            const reverbOut = ctx.createGain();
            reverbOut.gain.value = t.reverb.level;
            reverb.connect(reverbDamp);
            reverbDamp.connect(reverbOut);
            reverbOut.connect(tone);

            const delay = ctx.createDelay(4);
            delay.delayTime.value = t.delay.beats * 60 / t.bpm;
            const fbFilter = ctx.createBiquadFilter();
            fbFilter.type = 'lowpass';
            fbFilter.frequency.value = 2500;
            const fb = ctx.createGain();
            fb.gain.value = t.delay.feedback;
            delay.connect(fbFilter);
            fbFilter.connect(fb);
            fb.connect(delay);
            const delayOut = ctx.createGain();
            delayOut.gain.value = 0.6;
            fbFilter.connect(delayOut);
            delayOut.connect(tone);
            delayOut.connect(reverb);

            const layers = {};
            Object.keys(t.mix).forEach(name => {
                const [dry, rev, del] = t.mix[name];
                const bus = ctx.createGain();
                const d = ctx.createGain(); d.gain.value = dry; bus.connect(d); d.connect(tone);
                if (rev) { const r = ctx.createGain(); r.gain.value = rev; bus.connect(r); r.connect(reverb); }
                if (del) { const l = ctx.createGain(); l.gain.value = del; bus.connect(l); l.connect(delay); }
                layers[name] = bus;
            });

            const sources = [];
            if (t.texture) {
                const x = t.texture;
                const src = ctx.createBufferSource();
                src.buffer = this.noise(2);
                src.loop = true;
                const bp = ctx.createBiquadFilter();
                bp.type = 'bandpass';
                bp.Q.value = 1.8;
                bp.frequency.value = (x.lo + x.hi) / 2;
                const lfo = ctx.createOscillator();
                lfo.frequency.value = x.rate;
                const lfoDepth = ctx.createGain();
                lfoDepth.gain.value = (x.hi - x.lo) / 2;
                lfo.connect(lfoDepth);
                lfoDepth.connect(bp.frequency);
                const g = ctx.createGain();
                g.gain.value = x.level;
                src.connect(bp); bp.connect(g); g.connect(layers.texture);
                src.start(now); lfo.start(now);
                sources.push(src, lfo);
            }

            this.nodes = { master, layers, sources };
        }

        noise(seconds) {
            const ctx = this.ctx;
            if (!this._noise || this._noise.duration < seconds) {
                const len = Math.floor(ctx.sampleRate * seconds);
                const buf = ctx.createBuffer(1, len, ctx.sampleRate);
                const d = buf.getChannelData(0);
                for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
                this._noise = buf;
            }
            return this._noise;
        }

        tick() {
            if (!this.track) return;
            const now = this.ctx.currentTime;
            // After a suspend (app backgrounded) don't fire a burst of missed steps
            if (this.nextStepTime < now - 0.05) this.nextStepTime = now + 0.05;
            this.scheduleUntil(now + 0.6);
        }

        scheduleUntil(end) {
            while (this.track && this.nextStepTime < end) {
                this.doStep(this.step, this.nextStepTime);
                this.step++;
                this.nextStepTime += this.stepLen;
            }
        }

        doStep(step, time) {
            const t = this.track;
            const chordStep = step % this.stepsPerChord;
            const chord = t.chords[Math.floor(step / this.stepsPerChord) % t.chords.length];
            const chordDur = this.stepsPerChord * this.stepLen;
            // Swing applies to off-beat 8ths
            const at = time + (t.swing && step % 2 === 1 ? t.swing * this.stepLen : 0);

            if (chordStep === 0) {
                this.playPad(chord, time, chordDur);
                if (!t.bass.pattern) this.playBassDrone(chord, time, chordDur);
            }
            if (t.bass.pattern) {
                const v = t.bass.pattern[step % t.bass.pattern.length];
                const shift = t.bass.notes ? t.bass.notes[step % t.bass.notes.length] : 0;
                if (v) this.playBassNote(chord.bass + shift, at, v * t.bass.level);
            }
            if (t.keys) {
                const v = t.keys.pattern[step % t.keys.pattern.length];
                if (v) this.playKeys(chord, at, v);
            }
            if (t.perc) this.playPerc(step, at);

            t.leads.forEach((lead, i) => {
                if (Math.random() >= lead.density) return;
                const state = this.leadState[i];
                const note = lead.mode === 'sequence' ? this.pickSequence(lead, state, chord) : this.pickRandom(lead, state, chord);
                const accent = lead.accent ? (step % t.subdiv === 0 ? 1 : 0.65) : 0.6 + Math.random() * 0.4;
                this.playLead(lead, mtof(note), at, lead.level * accent);
            });
        }

        // Random walk through the scale, leaning on chord tones
        pickRandom(lead, state, chord) {
            if (!lead._pool) {
                lead._pool = [];
                for (let m = lead.lo; m <= lead.hi; m++) if (this.track.scale.includes(m % 12)) lead._pool.push(m);
            }
            const pool = lead._pool;
            if (state.last < 0) state.last = Math.floor(pool.length / 2);
            const pcs = chord.pad.map(n => n % 12);
            const from = Math.max(0, state.last - 3), to = Math.min(pool.length - 1, state.last + 3);
            let total = 0;
            const weights = [];
            for (let j = from; j <= to; j++) {
                const w = (pcs.includes(pool[j] % 12) ? 3 : 1) * (j === state.last ? 0.3 : 1);
                weights.push(w);
                total += w;
            }
            let r = Math.random() * total, j = from;
            for (const w of weights) { if ((r -= w) <= 0) break; j++; }
            state.last = Math.min(j, to);
            return pool[state.last];
        }

        pickSequence(lead, state, chord) {
            const pcs = chord.pad.map(n => n % 12);
            const tones = [];
            for (let m = lead.lo; m <= lead.hi; m++) if (pcs.includes(m % 12)) tones.push(m);
            const idx = lead.pattern[state.count++ % lead.pattern.length];
            return tones[idx % tones.length];
        }

        out(node, layer, pan) {
            if (pan && this.ctx.createStereoPanner) {
                const p = this.ctx.createStereoPanner();
                p.pan.value = pan;
                node.connect(p);
                p.connect(this.nodes.layers[layer]);
            } else {
                node.connect(this.nodes.layers[layer]);
            }
        }

        playPad(chord, t0, dur) {
            const ctx = this.ctx, p = this.track.pad;
            const end = t0 + dur + p.release;
            const env = ctx.createGain();
            env.gain.setValueAtTime(0, t0);
            env.gain.linearRampToValueAtTime(p.level, t0 + p.attack);
            env.gain.setValueAtTime(p.level, t0 + dur);
            env.gain.linearRampToValueAtTime(0, end);
            // Each chord's filter slowly opens and closes so the pad breathes
            const f = ctx.createBiquadFilter();
            f.type = 'lowpass';
            f.Q.value = 0.7;
            f.frequency.setValueAtTime(p.cutoff * 0.5, t0);
            f.frequency.linearRampToValueAtTime(p.cutoff * (1 + Math.random() * 0.4), t0 + dur * 0.55);
            f.frequency.linearRampToValueAtTime(p.cutoff * 0.6, end);
            f.connect(env);
            this.out(env, 'pad');

            const notes = p.octave ? chord.pad.concat(chord.pad.slice(-2).map(n => n + 12)) : chord.pad;
            const each = 1 / (notes.length * 2);
            notes.forEach((n, i) => {
                [-p.detune, p.detune].forEach(cents => {
                    const osc = ctx.createOscillator();
                    osc.type = p.wave;
                    osc.frequency.value = mtof(n);
                    osc.detune.setValueAtTime(cents, t0);
                    osc.detune.linearRampToValueAtTime(cents * (0.4 + Math.random()), end);
                    const g = ctx.createGain();
                    g.gain.value = each * (p.octave && i >= chord.pad.length ? 0.5 : 1);
                    osc.connect(g);
                    g.connect(f);
                    osc.start(t0);
                    osc.stop(end + 0.05);
                });
            });
        }

        bassVoice(midi, t0, end) {
            const ctx = this.ctx;
            const f = ctx.createBiquadFilter();
            f.type = 'lowpass';
            f.frequency.value = 500;
            const sub = ctx.createOscillator();
            sub.type = 'sine';
            sub.frequency.value = mtof(midi);
            // Octave-up triangle so the bass still reads on phone speakers
            const up = ctx.createOscillator();
            up.type = 'triangle';
            up.frequency.value = mtof(midi + 12);
            const upGain = ctx.createGain();
            upGain.gain.value = 0.35;
            sub.connect(f);
            up.connect(upGain);
            upGain.connect(f);
            [sub, up].forEach(o => { o.start(t0); o.stop(end + 0.05); });
            return f;
        }

        playBassDrone(chord, t0, dur) {
            const ctx = this.ctx, p = this.track.pad;
            const end = t0 + dur + p.release;
            const env = ctx.createGain();
            env.gain.setValueAtTime(0, t0);
            env.gain.linearRampToValueAtTime(this.track.bass.level, t0 + p.attack);
            env.gain.setValueAtTime(this.track.bass.level, t0 + dur);
            env.gain.linearRampToValueAtTime(0, end);
            this.bassVoice(chord.bass, t0, end).connect(env);
            this.out(env, 'bass');
        }

        playBassNote(midi, t0, level) {
            const end = t0 + 1.4;
            const env = this.ctx.createGain();
            env.gain.setValueAtTime(0.0001, t0);
            env.gain.exponentialRampToValueAtTime(level, t0 + 0.015);
            env.gain.exponentialRampToValueAtTime(0.0001, end);
            this.bassVoice(midi, t0, end).connect(env);
            this.out(env, 'bass');
        }

        // Electric-piano style FM voice, strummed across the chord
        playKeys(chord, t0, vel) {
            const ctx = this.ctx, k = this.track.keys;
            chord.pad.forEach((n, i) => {
                const t = t0 + i * k.strum;
                const f = mtof(n);
                const end = t + k.decay;
                const car = ctx.createOscillator();
                const mod = ctx.createOscillator();
                const modGain = ctx.createGain();
                car.frequency.value = f;
                mod.frequency.value = f;
                modGain.gain.setValueAtTime(f * 1.4, t);
                modGain.gain.exponentialRampToValueAtTime(f * 0.08, t + 0.6);
                mod.connect(modGain);
                modGain.connect(car.frequency);
                const amp = ctx.createGain();
                const level = k.level * vel / chord.pad.length * 2;
                amp.gain.setValueAtTime(0.0001, t);
                amp.gain.exponentialRampToValueAtTime(level, t + 0.006);
                amp.gain.exponentialRampToValueAtTime(level * 0.3, t + 0.8);
                amp.gain.exponentialRampToValueAtTime(0.0001, end);
                car.connect(amp);
                this.out(amp, 'keys', (i / (chord.pad.length - 1) - 0.5) * 0.5);
                [car, mod].forEach(o => { o.start(t); o.stop(end + 0.05); });
            });
        }

        playLead(lead, f, t0, level) {
            const ctx = this.ctx;
            const end = t0 + lead.decay;
            const amp = ctx.createGain();
            const pan = (Math.random() - 0.5) * 0.9;
            const oscs = [];

            if (lead.voice === 'bell') {
                const car = ctx.createOscillator();
                const mod = ctx.createOscillator();
                const modGain = ctx.createGain();
                car.frequency.value = f;
                mod.frequency.value = f * lead.ratio;
                modGain.gain.setValueAtTime(f * lead.index, t0);
                modGain.gain.exponentialRampToValueAtTime(f * lead.index * 0.02, t0 + lead.decay * 0.5);
                mod.connect(modGain);
                modGain.connect(car.frequency);
                car.connect(amp);
                oscs.push(car, mod);
                amp.gain.setValueAtTime(0.0001, t0);
                amp.gain.exponentialRampToValueAtTime(level, t0 + 0.006);
                amp.gain.exponentialRampToValueAtTime(0.0001, end);
            } else if (lead.voice === 'glass') {
                const a = ctx.createOscillator();
                const b = ctx.createOscillator();
                a.frequency.value = f;
                b.frequency.value = f * 2.003;
                const bg = ctx.createGain();
                bg.gain.value = 0.3;
                a.connect(amp);
                b.connect(bg);
                bg.connect(amp);
                oscs.push(a, b);
                amp.gain.setValueAtTime(0.0001, t0);
                amp.gain.exponentialRampToValueAtTime(level, t0 + 0.08);
                amp.gain.exponentialRampToValueAtTime(0.0001, end);
            } else { // pluck
                const osc = ctx.createOscillator();
                osc.type = 'sawtooth';
                osc.frequency.value = f;
                const lp = ctx.createBiquadFilter();
                lp.type = 'lowpass';
                lp.Q.value = 2;
                lp.frequency.setValueAtTime(Math.min(f * 6, 9000), t0);
                lp.frequency.exponentialRampToValueAtTime(f * 1.2, t0 + lead.decay * 0.4);
                osc.connect(lp);
                lp.connect(amp);
                oscs.push(osc);
                amp.gain.setValueAtTime(0.0001, t0);
                amp.gain.exponentialRampToValueAtTime(level, t0 + 0.004);
                amp.gain.exponentialRampToValueAtTime(0.0001, end);
            }

            this.out(amp, 'lead', pan);
            oscs.forEach(o => { o.start(t0); o.stop(end + 0.05); });
        }

        playPerc(step, t0) {
            const ctx = this.ctx, p = this.track.perc;
            const kick = p.kick[step % p.kick.length];
            if (kick) {
                const osc = ctx.createOscillator();
                osc.frequency.setValueAtTime(120, t0);
                osc.frequency.exponentialRampToValueAtTime(46, t0 + 0.1);
                const g = ctx.createGain();
                g.gain.setValueAtTime(0.0001, t0);
                g.gain.exponentialRampToValueAtTime(p.kickLevel * kick, t0 + 0.004);
                g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.4);
                osc.connect(g);
                this.out(g, 'perc');
                osc.start(t0);
                osc.stop(t0 + 0.45);
                if (this.track.pump) this.pump(t0);
            }
            const snare = p.snare && p.snare[step % p.snare.length];
            if (snare) this.playSnare(t0, p.snareLevel * snare, p.snareTone !== false);
            const hat = p.hat[step % p.hat.length];
            // hatOpen: steps of a cycle of that length get a longer, open hat
            const open = p.hatOpen && step % (p.hatOpen * 2) === p.hatOpen;
            if (hat) this.noiseHit(t0, open ? 0.16 : 0.06, 'highpass', 7000, p.hatLevel * hat * (0.7 + Math.random() * 0.3), (Math.random() - 0.5) * 0.4);
            if (p.crackle) {
                for (let i = 0; i < 3; i++) {
                    if (Math.random() < p.crackle) {
                        this.noiseHit(t0 + Math.random() * this.stepLen, 0.004, 'bandpass', 2500 + Math.random() * 3000, 0.01 + Math.random() * 0.03, (Math.random() - 0.5) * 1.2);
                    }
                }
            }
        }

        playSnare(t0, level, tone) {
            this.noiseHit(t0, 0.2, 'bandpass', 1800, level, 0.05, 0.7);
            if (!tone) return;
            const osc = this.ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(200, t0);
            osc.frequency.exponentialRampToValueAtTime(140, t0 + 0.08);
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(level * 0.8, t0);
            g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.1);
            osc.connect(g);
            this.out(g, 'perc');
            osc.start(t0);
            osc.stop(t0 + 0.12);
        }

        // Sidechain-style duck of the sustained layers on each kick
        pump(t0) {
            const depth = this.track.pump;
            ['pad', 'keys'].forEach(name => {
                const bus = this.nodes.layers[name];
                if (!bus) return;
                bus.gain.setValueAtTime(1, t0);
                bus.gain.linearRampToValueAtTime(1 - depth, t0 + 0.012);
                bus.gain.linearRampToValueAtTime(1, t0 + Math.min(0.3, this.stepLen * this.track.subdiv * 0.6));
            });
        }

        noiseHit(t0, dur, type, freq, level, pan, q) {
            const ctx = this.ctx;
            const src = ctx.createBufferSource();
            src.buffer = this.noise(2);
            const f = ctx.createBiquadFilter();
            f.type = type;
            f.frequency.value = freq;
            if (q) f.Q.value = q;
            const g = ctx.createGain();
            g.gain.setValueAtTime(level, t0);
            g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
            src.connect(f);
            f.connect(g);
            this.out(g, 'perc', pan);
            src.start(t0, Math.random() * 1.5, dur + 0.02);
        }
    }

    window.AmbientMusic = AmbientMusic;
})();
