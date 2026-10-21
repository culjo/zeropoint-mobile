// Nullfall - cut showcase captures into publisher videos with ffmpeg
// Every capture (captures/<name>.webm) has a log (captures/<name>.json) whose times match the video,
// so turns can be cut without scrubbing.
//
//   node tools/showcase/cut.js raw <name> [--out file.mp4]
//       The whole run as H.264/AAC 60 fps: trims the lead-in, ends after game over.
//   node tools/showcase/cut.js rank <name…>
//       Lists each run's turns by intensity (combo × score gain).
//   node tools/showcase/cut.js reel --open <name> --runs <name,name> --seconds 55 [--by orb|save] [--out file.mp4]
//       Cold open (a whole set-piece run), then the most intense turns from the runs in the order
//       they happened, then an end card. --by orb takes the turn each new orb size first appears instead;
//       --by save takes turns that start near the red line and pull the board back.

'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const CAPS = path.join(ROOT, 'captures');
const FONT = path.join(ROOT, 'www', 'fonts');
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const W = 1080;
const H = 2260;
const FPS = 60;

const load = (name) => JSON.parse(fs.readFileSync(path.join(CAPS, `${name}.json`), 'utf8'));
const video = (name) => path.join(CAPS, `${name}.webm`);
const sec = (ms) => (ms / 1000).toFixed(3);

function ffmpeg(list) {
    console.log(`ffmpeg ${list.join(' ').slice(0, 300)}…`);
    execFileSync('ffmpeg', ['-v', 'error', '-y', ...list], { stdio: 'inherit' });
}

function fontFile() {
    const files = fs.existsSync(FONT) ? fs.readdirSync(FONT) : [];
    const pick = files.find((f) => /inter.*(black|extrabold|bold)/i.test(f) && /\.(ttf|otf)$/i.test(f))
        || files.find((f) => /\.(ttf|otf)$/i.test(f));
    return pick ? path.join(FONT, pick) : '/System/Library/Fonts/Supplemental/Arial Black.ttf';
}

// Turns with the window that shows them: from the previous turn's end (think + drag) to just after it settles
function turns(name) {
    const { log } = load(name);
    const out = [];
    let prev = log.find((e) => e.kind === 'start').t;
    let prevCombo = 1;
    let bestOrb = 0;
    let prevHeight = 0;
    log.forEach((e) => {
        if (e.kind !== 'turn') return;
        const firstOrb = (e.maxOrb || 0) > bestOrb; // biggest orb of the run so far
        bestOrb = Math.max(bestOrb, e.maxOrb || 0);
        const gain = Math.max(0, e.gain || 0);
        out.push({
            name, start: prev, end: e.t, combo: e.combo, gain, action: e.action, maxOrb: e.maxOrb || 0, firstOrb,
            heightBefore: prevHeight, height: e.maxHeight || 0,
            // Long chains and combos kept alive across turns both count
            heat: gain * Math.max(1, e.combo - prevCombo + 1) + (e.combo >= 6 ? e.combo * 400 : 0)
        });
        prev = e.t;
        prevHeight = e.maxHeight || 0;
        prevCombo = e.combo > 1 ? e.combo : 1;
    });
    return out;
}

// One clip per segment, normalised to 1080×2260 @ 60 fps with short audio fades so cuts don't click
function clip(src, startMs, endMs, file) {
    const d = (endMs - startMs) / 1000;
    const fade = Math.min(0.06, d / 4);
    ffmpeg([
        '-ss', sec(startMs), '-t', d.toFixed(3), '-i', src,
        '-vf', `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=0x0b0e18,fps=${FPS},format=yuv420p`,
        '-af', `aresample=48000,afade=t=in:d=${fade},afade=t=out:st=${(d - fade).toFixed(3)}:d=${fade}`,
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-c:a', 'aac', '-b:a', '256k', file
    ]);
}

function card(text, sub, seconds, file) {
    const font = fontFile();
    const esc = (s) => s.replace(/:/g, '\\:').replace(/'/g, "\\'");
    ffmpeg([
        '-f', 'lavfi', '-i', `color=c=0x0b0e18:s=${W}x${H}:r=${FPS}:d=${seconds}`,
        '-f', 'lavfi', '-i', `anullsrc=r=48000:cl=stereo`, '-t', String(seconds),
        '-vf', [
            `drawtext=fontfile='${font}':text='${esc(text)}':fontcolor=white:fontsize=150:x=(w-tw)/2:y=(h/2)-170`,
            `drawtext=fontfile='${font}':text='${esc(sub)}':fontcolor=0x00f2fe:fontsize=60:x=(w-tw)/2:y=(h/2)+20`,
            `fade=t=in:d=0.4`, 'format=yuv420p'
        ].join(','),
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-c:a', 'aac', '-b:a', '256k', file
    ]);
}

function concat(files, out) {
    const list = path.join(path.dirname(out), `.concat-${Date.now()}.txt`);
    fs.writeFileSync(list, files.map((f) => `file '${f}'`).join('\n'));
    ffmpeg(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', out]);
    fs.rmSync(list);
}

const cmd = args[0];
const work = path.join(CAPS, 'work');
fs.mkdirSync(work, { recursive: true });

if (cmd === 'raw') {
    const name = args[1];
    const { log } = load(name);
    const start = log.find((e) => e.kind === 'start').t + 200;
    const last = log[log.length - 1].t + 4200; // the Breach panel finishes counting about 3.5 s after game over
    const out = arg('out', path.join(CAPS, `${name}.mp4`));
    clip(video(name), start, last, out);
    console.log(`→ ${out}`);
} else if (cmd === 'rank') {
    args.slice(1).filter((a) => !a.startsWith('--')).forEach((name) => {
        const list = turns(name);
        const { log } = load(name);
        const end = log[log.length - 1];
        const top = list.slice().sort((a, b) => b.heat - a.heat).slice(0, 8);
        console.log(`\n${name}: ${list.length} turns, ${(end.t / 60000).toFixed(1)} min, final score ${end.score}, max combo ${Math.max(...list.map((t) => t.combo))}`);
        top.forEach((t) => console.log(`  ${sec(t.start).padStart(8)}–${sec(t.end).padEnd(8)} combo ×${t.combo}  +${t.gain}  heat ${t.heat}`));
    });
} else if (cmd === 'reel') {
    const seconds = Number(arg('seconds', 55));
    const out = arg('out', path.join(CAPS, 'reel.mp4'));
    const parts = [];
    const open = arg('open');
    if (open) {
        const { log } = load(open);
        const t = log.find((e) => e.kind === 'turn');
        const s = log.find((e) => e.kind === 'start').t;
        // The set-piece: from the pickup to the board settling, plus the refill
        parts.push({ name: open, start: Math.max(s + 1300, t.t - 14000), end: t.t + 1500 }); // starts on the pickup (after the 1.2 s lead)
    }
    const pool = (arg('runs', '') || '').split(',').filter(Boolean).flatMap(turns)
        .filter((t) => t.action === 'drop' || t.action === 'swap');
    let budget = seconds * 1000 - parts.reduce((a, p) => a + p.end - p.start, 0);
    const chosen = [];
    if (arg('by') === 'save') {
        // On the Brink: turns that start one or two rows from the red line and pull the board back,
        // biggest drop in height first, shown in the order they happened
        // A save reads on screen when it chains (×3+) and drops 3+ rows, or lands a ×5+ combo worth 1,000+
        pool.filter((t) => t.heightBefore >= 6 && t.heightBefore - t.height >= 2 && t.combo >= 3
            && (t.heightBefore - t.height >= 3 || (t.combo >= 5 && t.gain >= 1000)))
            .sort((a, b) => (b.heightBefore - b.height) * 1000 + b.gain - ((a.heightBefore - a.height) * 1000 + a.gain))
            .forEach((t) => {
                const len = t.end - t.start + 900;
                if (len > budget) return;
                chosen.push({ ...t, end: t.end + 900 });
                budget -= len;
            });
        chosen.sort((a, b) => (a.name === b.name ? a.start - b.start : a.name < b.name ? -1 : 1));
    } else if (arg('by') === 'orb') {
        // Build Bigger: the turn each new orb size first appears (its tier callout), smallest first,
        // taking each size from whichever run reached it soonest
        const sizes = [...new Set(pool.map((t) => t.maxOrb).filter((m) => m >= 8 && (m & (m - 1)) === 0))].sort((a, b) => a - b); // tier sizes only (Nova 8, Star 16, …)
        sizes.forEach((m) => {
            const t = pool.filter((x) => x.maxOrb === m && x.firstOrb).sort((a, b) => a.end - a.start - (b.end - b.start))[0];
            const len = t ? t.end - t.start + 1400 : 0;
            if (!t || len > budget) return;
            chosen.push({ ...t, end: t.end + 1400 });
            budget -= len;
        });
    } else {
        pool.slice().sort((a, b) => b.heat - a.heat).forEach((t) => {
            const len = t.end - t.start + 500;
            if (len > budget || t.heat <= 0) return;
            chosen.push({ ...t, end: t.end + 500 });
            budget -= len;
        });
    }
    if (!arg('by')) chosen.sort((a, b) => (a.name === b.name ? a.start - b.start : a.name < b.name ? -1 : 1));
    parts.push(...chosen);
    const files = parts.map((p, i) => {
        const f = path.join(work, `part-${String(i).padStart(2, '0')}.mp4`);
        clip(video(p.name), p.start, p.end, f);
        return f;
    });
    const end = path.join(work, 'end-card.mp4');
    card(arg('title', 'NULLFALL'), arg('sub', 'Puzzle Cascade'), 3, end);
    files.push(end);
    concat(files, out);
    console.log(`→ ${out} (${parts.length} clips)`);
} else {
    console.log('usage: cut.js raw <name> | rank <name…> | reel --open <name> --runs <a,b> --seconds 55');
}
