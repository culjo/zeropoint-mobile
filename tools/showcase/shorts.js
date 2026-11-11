// Null Fall - Shorts ad videos (Reels / TikTok / YouTube Shorts) from the hand-marker takes
// Each short is one or more clips from cut.js raw masters (captures/work/<take>-raw.mp4), with
// cyan-to-gold gradient captions that pop in (rendered frame by frame in headless Chrome, since
// ffmpeg's drawtext can't do gradients), then the ad.js end card. Plan: docs/shorts-ad-plan.md.
//   node tools/showcase/shorts.js [v1,v2,v3,v4] [--sizes 1080x1920,1080x1350] [--end 2] [--out captures/ads/shorts]
// 9:16 lets the gameplay fill the full height (Shorts have no letterbox); 4:5 frames it like ad.js.
// Caption text: \n breaks a line, *WORD* gets a bigger size and a second pop.

'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ad = require('./ad.js');

const ROOT = path.join(__dirname, '..', '..');
const WORK = path.join(ROOT, 'captures', 'work');
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const ONLY = (args[0] && !args[0].startsWith('--') ? args[0] : 'v1,v2,v3,v4').split(',');
const SIZES = arg('sizes', '1080x1920,1080x1350').split(',').map((s) => s.split('x').map(Number));
const END = Number(arg('end', 2));
const OUT = path.resolve(arg('out', path.join(ROOT, 'captures', 'ads', 'shorts')));
const FPS = 30;

// clips: [take, from, to] in seconds of that take's raw master. Caption times are on the short's
// own timeline (0 = first frame). y is where the caption's centre sits, as a fraction of the game window.
const SHORTS = {
    v1: {
        clips: [['short-v1-hand3', 1.2, 14.6]],
        captions: [
            { kind: 'hook', text: 'Cancel opposite\nnumbers to *ZERO*', from: 0, to: 4.6, y: 0.22 },
            { kind: 'payoff', text: '*ZERO POINT!*', from: 10.9, to: 13.4, y: 0.27 }
        ]
    },
    v2: {
        clips: [['short-v2', 1.2, 14.2]],
        captions: [
            { kind: 'hook', text: 'Merge same numbers\nto *GROW* them', from: 0, to: 4.6, y: 0.22 },
            { kind: 'payoff', text: '*BIGGER BOOM*', from: 10.5, to: 13.0, y: 0.27 }
        ]
    },
    v3: {
        clips: [['short-v3', 1.6, 16.4], ['short-v3-map', 3.3, 7.6]],
        captions: [
            { kind: 'hook', text: 'Line up number\n*CASCADES*\nand unlock new sectors', from: 0, to: 4.4, y: 0.275 },
            { kind: 'payoff', text: '*16x COMBO*', from: 12.6, to: 14.8, y: 0.27 },
            { kind: 'payoff', text: 'NEW SECTOR\n*UNLOCKED*', from: 15.9, to: 19.1, y: 0.5 }
        ]
    },
    v4: {
        clips: [['short-v4', 1.2, 16.4]],
        captions: [
            { kind: 'hook', text: 'Clear the board\nbefore it *FILLS* up', from: 0, to: 4.6, y: 0.225 },
            { kind: 'payoff', text: '*SAVED!*', from: 13.9, to: 15.2, y: 0.27 }
        ]
    }
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
// Every run of text gets its own span: Chrome misplaces background-clip text on a parent whose children are transformed
const lineHtml = (t) => esc(t).split('\n').map((l) => l.split(/(\*[^*]+\*)/).filter(Boolean)
    .map((p) => (p.startsWith('*') ? `<em>${p.slice(1, -1)}</em>` : `<span>${p}</span>`)).join('')).join('<br>');
const dur = (f) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());

// A transparent page with every caption laid out; render(t) poses them for time t and returns a key
// (frames with the same key look the same, so they're copied instead of re-shot)
function captionHtml(W, H, win, captions) {
    const u = W / 1080;
    const caps = captions.map((c, i) => {
        const size = Math.round((c.kind === 'payoff' ? 132 : 76) * u);
        const top = Math.round(win.y + win.h * c.y);
        const html = lineHtml(c.text);
        return `<div class="cap ${c.kind}" id="c${i}" style="top:${top}px;font-size:${size}px">
<div class="pose"><div class="back">${html}</div><div class="front">${html}</div></div></div>`;
    }).join('\n');
    return `<!doctype html><html><head><meta charset="utf-8"><style>${ad.BG_CSS}
body { width: ${W}px; height: ${H}px; position: relative; background: transparent; }
.cap { position: absolute; left: 0; width: ${W}px; display: flex; justify-content: center; transform: translateY(-50%); opacity: 0; }
.pose { position: relative; text-align: center; font-weight: 900; line-height: 1.04;
  letter-spacing: -0.02em; filter: drop-shadow(0 ${Math.round(8 * u)}px ${Math.round(14 * u)}px rgba(0,0,0,0.75)); }
.pose em { font-style: normal; display: inline-block; font-size: 1.22em; margin: 0 0.06em; }
.payoff .pose em { font-size: 1em; }
.back, .front { white-space: nowrap; }
.back { position: absolute; inset: 0; color: #070a14; -webkit-text-stroke: ${Math.round(14 * u)}px #070a14; }
.front { position: relative; }
.front span, .front em { background: linear-gradient(90deg, #00f2fe, #7ff8ff 45%, #f9d423); -webkit-background-clip: text; background-clip: text; color: transparent; }
.front em { background: linear-gradient(90deg, #7ff8ff, #f9d423 70%); -webkit-background-clip: text; background-clip: text; }
</style></head><body>${caps}<script>
// Shrink any caption wider than 92% of the frame until it fits
// (called once Inter has loaded, or it measures the fallback font)
window.fit = () => document.querySelectorAll('.cap').forEach((el) => {
    const pose = el.firstElementChild;
    for (let i = 0; i < 40 && pose.scrollWidth > ${Math.round(W * 0.92)}; i++) el.style.fontSize = (parseFloat(el.style.fontSize) * 0.96) + 'px';
});
const CAPS = ${JSON.stringify(captions.map((c) => ({ kind: c.kind, from: c.from, to: c.to })))};
const clamp = (x) => Math.max(0, Math.min(1, x));
const back = (t) => { const s = 1.9; t -= 1; return t * t * ((s + 1) * t + s) + 1; }; // ease out with overshoot
window.render = (t) => {
    const key = [];
    CAPS.forEach((c, i) => {
        const el = document.getElementById('c' + i);
        const pose = el.firstElementChild;
        const local = t - c.from;
        if (local < 0 || t > c.to) { el.style.opacity = 0; key.push('-'); return; }
        const pin = c.kind === 'payoff' ? 0.34 : 0.3;
        const kIn = clamp(local / pin);
        const kOut = clamp((t - (c.to - 0.22)) / 0.22);
        const grow = c.kind === 'payoff' ? 0.35 + 0.65 * back(kIn) : 0.6 + 0.4 * back(kIn);
        const scale = grow * (1 - 0.06 * kOut);
        const rot = c.kind === 'payoff' ? -4 * (1 - kIn) : 0;
        el.style.opacity = (clamp(local / 0.12) * (1 - kOut)).toFixed(3);
        pose.style.transform = 'scale(' + scale.toFixed(4) + ') rotate(' + rot.toFixed(2) + 'deg)';
        // The CAPS word pops again once the line has landed
        const kw = clamp((local - pin - 0.02) / 0.32);
        const pop = 1 + 0.16 * Math.sin(Math.PI * kw);
        pose.querySelectorAll('em').forEach((e) => { e.style.transform = 'scale(' + pop.toFixed(4) + ')'; });
        key.push(kIn < 1 || kOut > 0 || (kw > 0 && kw < 1) ? t.toFixed(3) : 'hold');
    });
    return key.join('|');
};
</script></body></html>`;
}

// Shoot the caption track as a PNG sequence (transparent), copying frames that don't change
async function renderCaptionFrames(W, H, htmlFile, frames, dir) {
    const { spawn } = require('child_process');
    const os = require('os');
    const PORT = 9337;
    const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    const profile = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), 'nullfall-shorts-'));
    const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--headless=new',
        '--hide-scrollbars', '--no-first-run', '--allow-file-access-from-files', '--window-size=1200,2000', 'about:blank'], { stdio: 'ignore' });
    const exited = new Promise((r) => chrome.on('exit', r));
    try {
        let page = null;
        for (let i = 0; i < 50 && !page; i++) {
            await sleep(200);
            try { page = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page'); } catch (e) { /* starting */ }
        }
        if (!page) throw new Error('Chrome page not found');
        const c = await ad.cdp(page.webSocketDebuggerUrl);
        await c.send('Page.enable');
        await c.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
        await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
        await c.send('Page.navigate', { url: `file://${htmlFile}` });
        await sleep(900);
        await c.send('Runtime.evaluate', { expression: "document.fonts.load('900 76px Inter').then(() => document.fonts.ready).then(() => fit())", awaitPromise: true });
        let lastKey = null;
        let lastFile = null;
        let shots = 0;
        for (let f = 0; f < frames; f++) {
            const file = path.join(dir, `${String(f).padStart(5, '0')}.png`);
            const { result } = await c.send('Runtime.evaluate', { expression: `render(${(f / FPS).toFixed(4)})`, returnByValue: true });
            if (result.value === lastKey && lastFile) { fs.copyFileSync(lastFile, file); continue; }
            const shot = await c.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: W, height: H, scale: 1 } });
            fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
            lastKey = result.value;
            lastFile = file;
            shots++;
        }
        c.close();
        return shots;
    } finally {
        chrome.kill();
        await exited;
        try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch (e) { /* Chrome may still be writing its profile */ }
    }
}

async function build(id) {
    const spec = SHORTS[id];
    if (!spec) throw new Error(`no short "${id}"`);
    const clips = spec.clips.map(([take, from, to]) => {
        const file = path.join(WORK, `${take}-raw.mp4`);
        if (!fs.existsSync(file)) throw new Error(`missing ${path.relative(ROOT, file)} (record it, then cut.js raw ${take})`);
        return { file, from, to: Math.min(to, dur(file)) };
    });
    const length = clips.reduce((s, c) => s + (c.to - c.from), 0);
    const total = length + END;
    const work = path.join(OUT, 'work', id);
    fs.mkdirSync(work, { recursive: true });

    for (const [W, H] of SIZES) {
        const tag = `${W}x${H}`;
        const win = ad.windowFor(W, H, true);
        // Background frame and end card (ad.js's)
        fs.writeFileSync(path.join(work, `frame-${tag}.html`), ad.frameHtml(W, H, win));
        fs.writeFileSync(path.join(work, `end-${tag}.html`), ad.endCardHtml(W, H));
        await ad.renderPngs([
            { html: path.join(work, `frame-${tag}.html`), out: path.join(work, `frame-${tag}.png`), w: W, h: H },
            { html: path.join(work, `end-${tag}.html`), out: path.join(work, `end-${tag}.png`), w: W, h: H }
        ]);
        // Caption track
        const capDir = path.join(work, `cap-${tag}`);
        fs.rmSync(capDir, { recursive: true, force: true });
        fs.mkdirSync(capDir, { recursive: true });
        const capHtml = path.join(work, `cap-${tag}.html`);
        fs.writeFileSync(capHtml, captionHtml(W, H, win, spec.captions));
        const frames = Math.ceil(length * FPS);
        const shots = await renderCaptionFrames(W, H, capHtml, frames, capDir);
        console.log(`${id} ${tag}: ${frames} caption frames (${shots} rendered)`);

        // Clips → one gameplay track, framed, captioned, then the end card
        const inputs = [];
        const parts = [];
        clips.forEach((c, i) => {
            const d = c.to - c.from;
            inputs.push('-ss', c.from.toFixed(3), '-t', d.toFixed(3), '-i', c.file);
            parts.push(`[${i}:v]fps=${FPS},scale=${win.w}:${win.h}:flags=lanczos,setsar=1[v${i}]`);
            parts.push(`[${i}:a]aresample=48000,afade=t=in:d=0.05,afade=t=out:st=${(d - 0.08).toFixed(3)}:d=0.08[a${i}]`);
        });
        const n = clips.length;
        const F = n;
        const C = n + 1;
        const E = n + 2;
        inputs.push('-loop', '1', '-i', path.join(work, `frame-${tag}.png`));
        inputs.push('-framerate', String(FPS), '-i', path.join(capDir, '%05d.png'));
        inputs.push('-loop', '1', '-t', String(END), '-i', path.join(work, `end-${tag}.png`));
        parts.push(`${clips.map((_, i) => `[v${i}][a${i}]`).join('')}concat=n=${n}:v=1:a=1[gv][ga]`);
        parts.push(`[gv]pad=${W}:${H}:${win.x}:${win.y}:color=0x080a11[g]`);
        parts.push(`[g][${F}:v]overlay=0:0:format=auto:shortest=1[gf]`);
        parts.push(`[gf][${C}:v]overlay=0:0:format=auto:eof_action=pass,format=yuv420p,trim=duration=${length.toFixed(3)}[main]`);
        parts.push(`[${E}:v]scale=${W}:${H},setsar=1,fps=${FPS},format=yuv420p,fade=t=in:st=0:d=0.25[endv]`);
        parts.push(`[main][endv]concat=n=2:v=1:a=0[v]`);
        parts.push(`[ga]apad=whole_dur=${total.toFixed(3)},afade=t=out:st=${(length - 0.15).toFixed(3)}:d=${(END + 0.1).toFixed(3)}[a]`);
        fs.mkdirSync(OUT, { recursive: true });
        const out = path.join(OUT, `null-fall-short-${id}-${tag}.mp4`);
        execFileSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', parts.join(';'),
            '-map', '[v]', '-map', '[a]', '-t', total.toFixed(3),
            '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', '18', '-maxrate', '14M', '-bufsize', '28M', '-r', String(FPS),
            '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-ac', '2', '-movflags', '+faststart', out], { stdio: 'inherit' });
        console.log(`→ ${path.relative(ROOT, out)} ${total.toFixed(1)}s`);
    }
}

(async () => {
    for (const id of ONLY) await build(id);
})().catch((e) => { console.error(e); process.exit(1); });
