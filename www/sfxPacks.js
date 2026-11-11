// Gameplay sound packs: alternative drop / merge / blast / crack voices for SoundFX.
// Picked in dev tools ('original' keeps the voices in audio.js). Design rules, from the
// number/match games that sound best (Two Dots, Threes!, Peggle, Tetris Effect):
//  - tonal, not noisy: every event is a note, so a cascade plays a little melody
//  - chains climb a scale in the music's key, so effects and soundtrack agree
//  - soft attacks and low-mid body; small peaks so a 6-step cascade never gets harsh
//  - bigger blasts add layers (more chord notes, a sparkle, a low thump), not raw volume
//  - drops and cracks vary slightly in pitch so repeats don't feel mechanical
(function () {
    const jitter = (amount = 0.02) => 1 + (Math.random() - 0.5) * amount;

    function tone(fx, t, freq, { type = 'sine', peak = 0.08, attack = 0.004, decay = 0.2, glide = 0, glideTime = 0.05, lowpass = 0 } = {}) {
        const ctx = fx.ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        if (glide) osc.frequency.exponentialRampToValueAtTime(glide, t + glideTime);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(peak, t + attack);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
        let node = osc;
        if (lowpass) {
            const lp = ctx.createBiquadFilter();
            lp.type = 'lowpass';
            lp.frequency.value = lowpass;
            osc.connect(lp);
            node = lp;
        }
        node.connect(gain);
        gain.connect(fx.packBus());
        osc.start(t);
        osc.stop(t + decay + 0.03);
    }

    // FM voice: ratio 1 = soft piano / felt, ~3.5 = bell
    function fm(fx, t, freq, { ratio = 1, index = 1, indexEnd = 0.05, indexTime = 0.3, peak = 0.08, attack = 0.004, decay = 0.5, lowpass = 0 } = {}) {
        const ctx = fx.ctx;
        const car = ctx.createOscillator();
        const mod = ctx.createOscillator();
        const modGain = ctx.createGain();
        const amp = ctx.createGain();
        car.frequency.value = freq;
        mod.frequency.value = freq * ratio;
        modGain.gain.setValueAtTime(freq * index, t);
        modGain.gain.exponentialRampToValueAtTime(Math.max(0.01, freq * indexEnd), t + indexTime);
        mod.connect(modGain);
        modGain.connect(car.frequency);
        amp.gain.setValueAtTime(0.0001, t);
        amp.gain.exponentialRampToValueAtTime(peak, t + attack);
        amp.gain.exponentialRampToValueAtTime(0.0001, t + decay);
        let node = car;
        if (lowpass) {
            const lp = ctx.createBiquadFilter();
            lp.type = 'lowpass';
            lp.frequency.value = lowpass;
            car.connect(lp);
            node = lp;
        }
        node.connect(amp);
        amp.connect(fx.packBus());
        [car, mod].forEach(o => { o.start(t); o.stop(t + decay + 0.03); });
    }

    // Filtered noise; sweepTo glides the filter (a soft "whoosh" or "fwump")
    function noise(fx, t, { type = 'bandpass', freq = 1200, q = 1, peak = 0.04, attack = 0.002, decay = 0.05, sweepTo = 0 } = {}) {
        const buffer = fx.getNoiseBuffer();
        if (!buffer) return;
        const ctx = fx.ctx;
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const f = ctx.createBiquadFilter();
        f.type = type;
        f.Q.value = q;
        f.frequency.setValueAtTime(freq, t);
        if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + decay);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(peak, t + attack);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
        src.connect(f);
        f.connect(gain);
        gain.connect(fx.packBus());
        const len = Math.min(decay + 0.05, buffer.duration);
        src.start(t, Math.random() * Math.max(0, buffer.duration - len), len);
    }

    // Shared blast skeleton: a rolled chord (more notes per tier), a low thump and air.
    // Each pack passes its own note voice and texture.
    function blastBody(fx, t, { tier, chord, sparkle }, note, opts) {
        const roll = opts.roll || 0.03;
        chord.forEach((f, i) => note(f, t + i * roll, i));
        tone(fx, t, opts.thumpHz || 90, {
            glide: (opts.thumpHz || 90) * 0.55, glideTime: 0.12 + tier * 0.03,
            peak: Math.min(0.06 + tier * 0.025, 0.18), decay: 0.16 + tier * 0.05
        });
        if (opts.air) opts.air(tier);
        if (tier >= 4 && sparkle) note(sparkle, t + chord.length * roll + 0.06, chord.length);
    }

    const PACKS = {
        pebble: {
            name: 'Pebble',
            desc: 'Warm wood and marimba. Cosy and tactile.',
            drop(fx, t) {
                const r = jitter();
                tone(fx, t, 200 * r, { glide: 150 * r, glideTime: 0.06, peak: 0.09, decay: 0.09 });
                tone(fx, t, 200 * 2.6 * r, { peak: 0.018, decay: 0.03 });
                noise(fx, t, { freq: 2600, q: 1.2, peak: 0.025, decay: 0.015 });
            },
            merge(fx, t, f) {
                tone(fx, t, f, { peak: 0.1, attack: 0.003, decay: 0.28 });
                tone(fx, t, f * 3.93, { peak: 0.022, attack: 0.002, decay: 0.045 });
                tone(fx, t, f * 0.5, { peak: 0.025, decay: 0.12 });
            },
            blast(fx, t, b) {
                const note = (f, at) => {
                    tone(fx, at, f, { peak: 0.075, attack: 0.003, decay: 0.42 });
                    tone(fx, at, f * 3.93, { peak: 0.014, attack: 0.002, decay: 0.05 });
                };
                blastBody(fx, t, b, note, {
                    thumpHz: 95,
                    air: tier => noise(fx, t, { type: 'lowpass', freq: 2400, q: 0.7, peak: 0.012 + tier * 0.007, attack: 0.01, decay: 0.2 + tier * 0.06, sweepTo: 300 })
                });
            },
            crack(fx, t) {
                const r = jitter(0.06);
                noise(fx, t, { freq: 1800 * r, q: 2, peak: 0.05, decay: 0.03 });
                tone(fx, t, 320 * r, { glide: 230 * r, glideTime: 0.03, peak: 0.04, decay: 0.045 });
            }
        },

        // Pebble without the extra marimba note on top of tier 4-5 blasts
        pebbleplain: {
            name: 'Pebble Plain',
            desc: 'Pebble with no extra top note on big blasts.',
            drop(fx, t) { PACKS.pebble.drop(fx, t); },
            merge(fx, t, f) { PACKS.pebble.merge(fx, t, f); },
            blast(fx, t, b) { PACKS.pebble.blast(fx, t, { ...b, sparkle: null }); },
            crack(fx, t) { PACKS.pebble.crack(fx, t); }
        },

        glass: {
            name: 'Glass',
            desc: 'Crystal bells over a soft body. Bright and clean.',
            drop(fx, t) {
                const r = jitter();
                tone(fx, t, 165 * r, { glide: 125 * r, glideTime: 0.06, peak: 0.075, decay: 0.08 });
                tone(fx, t, 990 * r, { peak: 0.022, attack: 0.002, decay: 0.05 });
            },
            merge(fx, t, f) {
                tone(fx, t, f * 2, { peak: 0.06, attack: 0.003, decay: 0.55 });
                tone(fx, t, f * 2 * 2.76, { peak: 0.012, attack: 0.002, decay: 0.14 });
                tone(fx, t, f, { peak: 0.04, attack: 0.004, decay: 0.3 });
            },
            blast(fx, t, b) {
                const note = (f, at) => {
                    tone(fx, at, f * 2, { peak: 0.045, attack: 0.003, decay: 0.7 });
                    tone(fx, at, f * 2 * 2.76, { peak: 0.009, attack: 0.002, decay: 0.16 });
                };
                blastBody(fx, t, b, note, {
                    roll: 0.04, thumpHz: 85,
                    air: tier => noise(fx, t, { type: 'highpass', freq: 5000, q: 0.7, peak: 0.006 + tier * 0.004, attack: 0.04, decay: 0.35 + tier * 0.08 })
                });
            },
            crack(fx, t) {
                const r = jitter(0.06);
                tone(fx, t, 2400 * r, { peak: 0.022, attack: 0.001, decay: 0.05 });
                tone(fx, t, 3560 * r, { peak: 0.012, attack: 0.001, decay: 0.035 });
                noise(fx, t, { type: 'highpass', freq: 5000, q: 0.7, peak: 0.03, decay: 0.02 });
            }
        },

        bubble: {
            name: 'Bubble',
            desc: 'Round, rising bloops. Matches the Round Drop button sound.',
            drop(fx, t) {
                const r = jitter();
                tone(fx, t, 300 * r, { glide: 165 * r, glideTime: 0.06, peak: 0.08, decay: 0.09 });
                tone(fx, t, 150 * r, { glide: 85 * r, glideTime: 0.06, peak: 0.05, decay: 0.09 });
            },
            merge(fx, t, f) {
                // Rises into the ladder note, doubled and slightly detuned for a round body
                [0.996, 1.004].forEach(d => tone(fx, t, f * 0.72 * d, { glide: f * d, glideTime: 0.05, peak: 0.06, attack: 0.006, decay: 0.2 }));
                tone(fx, t, f * 0.5, { peak: 0.03, attack: 0.006, decay: 0.12 });
            },
            blast(fx, t, b) {
                const note = (f, at) => {
                    [0.996, 1.004].forEach(d => tone(fx, at, f * 0.72 * d, { glide: f * d, glideTime: 0.05, peak: 0.045, attack: 0.006, decay: 0.3 }));
                };
                blastBody(fx, t, b, note, {
                    thumpHz: 110,
                    air: tier => {
                        // A scatter of tiny bubbles that grows with the tier
                        for (let i = 0; i < (tier - 1) * 2; i++) {
                            const f = b.chord[0] * 2 * Math.pow(2, Math.floor(Math.random() * 8) / 12);
                            tone(fx, t + 0.05 + Math.random() * 0.25, f * 0.8, { glide: f, glideTime: 0.03, peak: 0.02, attack: 0.004, decay: 0.06 });
                        }
                    }
                });
            },
            crack(fx, t) {
                const r = jitter(0.06);
                tone(fx, t, 900 * r, { glide: 520 * r, glideTime: 0.03, peak: 0.045, decay: 0.04 });
                noise(fx, t, { freq: 1500 * r, q: 1.5, peak: 0.02, decay: 0.02 });
            }
        },

        felt: {
            name: 'Felt',
            desc: 'Soft felt piano. The most subtle and musical.',
            drop(fx, t) {
                const r = jitter();
                fm(fx, t, 130 * r, { ratio: 1, index: 0.6, indexTime: 0.06, peak: 0.085, decay: 0.12, lowpass: 900 });
                noise(fx, t, { type: 'lowpass', freq: 700, q: 0.7, peak: 0.03, decay: 0.03 });
            },
            merge(fx, t, f) {
                fm(fx, t, f, { ratio: 1, index: 1.2, indexEnd: 0.08, indexTime: 0.3, peak: 0.09, decay: 0.6, lowpass: 2400 });
                tone(fx, t, f * 2, { peak: 0.012, decay: 0.25 });
            },
            blast(fx, t, b) {
                const note = (f, at) => fm(fx, at, f, { ratio: 1, index: 1.1, indexEnd: 0.06, indexTime: 0.35, peak: 0.065, decay: 0.9, lowpass: 2400 });
                blastBody(fx, t, b, note, {
                    roll: 0.035, thumpHz: 80,
                    air: tier => fm(fx, t, b.chord[0] / 2, { ratio: 1, index: 0.8, indexTime: 0.2, peak: 0.03 + tier * 0.01, decay: 0.8, lowpass: 800 })
                });
            },
            crack(fx, t) {
                const r = jitter(0.06);
                noise(fx, t, { freq: 1200 * r, q: 1, peak: 0.045, decay: 0.025 });
                tone(fx, t, 210 * r, { peak: 0.035, decay: 0.04 });
            }
        }
    };

    window.SfxPacks = PACKS;
})();
