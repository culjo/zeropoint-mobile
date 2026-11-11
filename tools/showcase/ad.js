// Null Fall - social ad videos from a gameplay master
// Frames a gameplay master (1080×2260, from cut.js edl) in a rounded window on the game's space
// background at each ad size, adds an end card (icon, name, tagline, DOWNLOAD NOW) and encodes
// H.264 30 fps + AAC for Meta placements. The background and end card are rendered with headless Chrome.
//   node tools/showcase/ad.js --master captures/work/ad-master.mp4 [--sizes 1080x1920,1080x1350,1440x1800]
//        [--end 1.8] [--tagline "Cancel numbers.\n*Chain blasts.*"] [--out captures/ads]
// 9:16 leaves the bottom ~11% free for the CTA button Meta draws there; 4:5 lets the gameplay fill the height.

'use strict';

const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const MASTER = path.resolve(arg('master', path.join(ROOT, 'captures', 'work', 'ad-master.mp4')));
const OUT = path.resolve(arg('out', path.join(ROOT, 'captures', 'ads')));
const SIZES = arg('sizes', '1080x1920,1080x1350,1440x1800').split(',').map((s) => s.split('x').map(Number));
const END = Number(arg('end', 1.8));
const TAGLINE = arg('tagline', 'Cancel numbers.\n*Chain blasts.*').replace(/\\n/g, '\n');
const NAME = arg('name', 'Null Fall');
const CHROME = arg('chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
const PORT = Number(arg('cdp', 9336));
const FONT = `file://${path.join(ROOT, 'www', 'fonts', 'inter-latin-var.woff2')}`;
const ICON = `file://${path.join(ROOT, 'resources', 'icon', 'png', 'icon-master.png')}`;
const GAME_ASPECT = 1080 / 2260;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const even = (n) => Math.round(n / 2) * 2;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const titleHtml = (t) => esc(t).split('\n').map((l) => l.replace(/\*([^*]+)\*/g, '<em>$1</em>')).join('<br>');

// Where the gameplay sits on a W×H canvas; fill (Shorts) lets a tall canvas use its full height
function windowFor(W, H, fill = false) {
    const tall = H / W >= 1.7;
    if (fill && tall) {
        const w = even(H * GAME_ASPECT);
        return { x: even((W - w) / 2), y: 0, w, h: H };
    }
    const h = even(H * (tall ? 0.86 : 0.94));
    const w = even(h * GAME_ASPECT);
    return { x: even((W - w) / 2), y: even(tall ? H * 0.03 : (H - h) / 2), w, h };
}

const BG_CSS = `
@font-face { font-family: 'Inter'; font-weight: 400 900; src: url(${FONT}) format('woff2'); }
html, body { margin: 0; padding: 0; overflow: hidden; background: transparent; font-family: 'Inter', sans-serif; color: #f0f4fc; }
em { font-style: normal; background: linear-gradient(90deg, #00f2fe, #7ff8ff 45%, #f9d423);
  -webkit-background-clip: text; background-clip: text; color: transparent; }`;

// Space background with a rounded hole where the gameplay shows through, and a glowing bezel
function frameHtml(W, H, win) {
    const r = Math.round(win.w * 0.06);
    const bezel = Math.max(4, Math.round(win.w * 0.012));
    return `<!doctype html><html><head><meta charset="utf-8"><style>${BG_CSS} body { width: ${W}px; height: ${H}px; }</style></head>
<body><canvas id="c" width="${W}" height="${H}"></canvas><script>
const c = document.getElementById('c'), g = c.getContext('2d'), W = ${W}, H = ${H};
const lin = g.createLinearGradient(0, 0, 0, H);
lin.addColorStop(0, '#0b0f1d'); lin.addColorStop(0.55, '#080a11'); lin.addColorStop(1, '#0d0a1a');
g.fillStyle = lin; g.fillRect(0, 0, W, H);
const glow = (x, y, rad, col) => { const rg = g.createRadialGradient(x, y, 0, x, y, rad); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H); };
glow(W * 0.15, H * 0.1, W * 0.7, 'rgba(0, 242, 254, 0.20)');
glow(W * 0.9, H * 0.9, W * 0.7, 'rgba(196, 113, 237, 0.26)');
let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
for (let i = 0; i < Math.round(W * H / 9000); i++) { g.fillStyle = 'rgba(255,255,255,' + (0.25 + rnd() * 0.5) + ')'; g.beginPath(); g.arc(rnd() * W, rnd() * H, 0.6 + rnd() * 1.6, 0, 7); g.fill(); }
const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
// Soft cyan glow behind the window, then cut the window out
g.save(); g.shadowColor = 'rgba(0, 242, 254, 0.35)'; g.shadowBlur = ${Math.round(win.w * 0.12)}; g.fillStyle = '#1b2133';
rr(${win.x - bezel}, ${win.y - bezel}, ${win.w + 2 * bezel}, ${win.h + 2 * bezel}, ${r + bezel}); g.fill(); g.restore();
g.strokeStyle = 'rgba(0, 242, 254, 0.45)'; g.lineWidth = ${Math.max(2, Math.round(bezel / 3))};
rr(${win.x - bezel}, ${win.y - bezel}, ${win.w + 2 * bezel}, ${win.h + 2 * bezel}, ${r + bezel}); g.stroke();
g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; rr(${win.x}, ${win.y}, ${win.w}, ${win.h}, ${r}); g.fill();
</script></body></html>`;
}

function endCardHtml(W, H) {
    const u = Math.min(W, H * 0.75) / 100;
    return `<!doctype html><html><head><meta charset="utf-8"><style>${BG_CSS}
body { width: ${W}px; height: ${H}px; background: #080a11; position: relative; }
.bg { position: absolute; inset: 0; background:
    radial-gradient(60% 40% at 50% 30%, rgba(0, 242, 254, 0.22), transparent 70%),
    radial-gradient(60% 40% at 50% 95%, rgba(196, 113, 237, 0.30), transparent 70%),
    linear-gradient(180deg, #0b0f1d 0%, #080a11 55%, #0d0a1a 100%); }
.wrap { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.icon { width: ${Math.round(u * 34)}px; height: ${Math.round(u * 34)}px; border-radius: ${Math.round(u * 7.5)}px;
  box-shadow: 0 ${Math.round(u * 2)}px ${Math.round(u * 9)}px rgba(249, 212, 35, 0.35), 0 0 0 ${Math.max(2, Math.round(u * 0.4))}px rgba(255,255,255,0.1); }
.name { margin-top: ${Math.round(u * 6)}px; font-weight: 900; font-size: ${Math.round(u * 15)}px; letter-spacing: -0.03em; line-height: 0.95; }
.sub { margin-top: ${Math.round(u * 3.5)}px; font-weight: 800; font-size: ${Math.round(u * 6.4)}px; line-height: 1.15; }
.cta { margin-top: ${Math.round(u * 8)}px; padding: ${Math.round(u * 3.6)}px ${Math.round(u * 9)}px; border-radius: 999px;
  background: linear-gradient(#ffe45c, #f9d423 55%, #e8b80f); color: #1a1302; font-weight: 900; font-size: ${Math.round(u * 6)}px; letter-spacing: 0.02em;
  box-shadow: 0 ${Math.round(u * 1.2)}px 0 #a8820a, 0 ${Math.round(u * 2)}px ${Math.round(u * 8)}px rgba(249, 212, 35, 0.4); }
</style></head><body><div class="bg"></div><div class="wrap">
<img class="icon" src="${ICON}"><div class="name">${esc(NAME.toUpperCase())}</div>
<div class="sub">${titleHtml(TAGLINE)}</div><div class="cta">DOWNLOAD NOW</div></div></body></html>`;
}

async function cdp(wsUrl) {
    const ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let id = 0;
    const pending = new Map();
    ws.onmessage = (m) => {
        const msg = JSON.parse(m.data);
        if (msg.id && pending.has(msg.id)) {
            const { res, rej } = pending.get(msg.id);
            pending.delete(msg.id);
            if (msg.error) rej(new Error(msg.error.message)); else res(msg.result);
        }
    };
    return {
        send(method, params = {}) {
            return new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
        },
        close() { ws.close(); }
    };
}

async function renderPngs(jobs) {
    const profile = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), 'nullfall-ad-'));
    const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--headless=new',
        '--hide-scrollbars', '--no-first-run', '--allow-file-access-from-files', '--window-size=1200,1200', 'about:blank'], { stdio: 'ignore' });
    const exited = new Promise((r) => chrome.on('exit', r));
    try {
        let page = null;
        for (let i = 0; i < 50 && !page; i++) {
            await sleep(200);
            try { page = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page'); } catch (e) { /* starting */ }
        }
        if (!page) throw new Error('Chrome page not found');
        const c = await cdp(page.webSocketDebuggerUrl);
        await c.send('Page.enable');
        await c.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
        for (const job of jobs) {
            await c.send('Emulation.setDeviceMetricsOverride', { width: job.w, height: job.h, deviceScaleFactor: 1, mobile: false });
            await c.send('Page.navigate', { url: `file://${job.html}` });
            await sleep(900);
            await c.send('Runtime.evaluate', { expression: 'document.fonts.ready.then(() => Promise.all([...document.images].map((i) => i.decode())))', awaitPromise: true });
            const shot = await c.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: job.w, height: job.h, scale: 1 } });
            fs.writeFileSync(job.out, Buffer.from(shot.data, 'base64'));
        }
        c.close();
    } finally {
        chrome.kill();
        await exited;
        try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch (e) { /* Chrome may still be writing its profile */ }
    }
}

module.exports = { windowFor, frameHtml, endCardHtml, renderPngs, cdp, BG_CSS, FONT, GAME_ASPECT };

if (require.main === module) (async () => {
    if (!fs.existsSync(MASTER)) throw new Error(`no master at ${MASTER} (make one with cut.js edl)`);
    const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', MASTER]).toString());
    const work = path.join(OUT, 'work');
    fs.mkdirSync(work, { recursive: true });
    const jobs = [];
    SIZES.forEach(([W, H]) => {
        const win = windowFor(W, H);
        const tag = `${W}x${H}`;
        fs.writeFileSync(path.join(work, `frame-${tag}.html`), frameHtml(W, H, win));
        fs.writeFileSync(path.join(work, `end-${tag}.html`), endCardHtml(W, H));
        jobs.push({ html: path.join(work, `frame-${tag}.html`), out: path.join(work, `frame-${tag}.png`), w: W, h: H });
        jobs.push({ html: path.join(work, `end-${tag}.html`), out: path.join(work, `end-${tag}.png`), w: W, h: H });
    });
    await renderPngs(jobs);

    SIZES.forEach(([W, H]) => {
        const win = windowFor(W, H);
        const tag = `${W}x${H}`;
        const out = path.join(OUT, `null-fall-ad-${tag}.mp4`);
        const total = dur + END;
        const filter = [
            `[0:v]fps=30,scale=${win.w}:${win.h}:flags=lanczos,setsar=1,pad=${W}:${H}:${win.x}:${win.y}:color=0x080a11[g]`,
            `[g][1:v]overlay=0:0:format=auto:shortest=1[main]`,
            `[2:v]scale=${W}:${H},setsar=1,fps=30,format=yuv420p,fade=t=in:st=0:d=0.25[endv]`,
            `[main]format=yuv420p[mainv]`,
            `[mainv][endv]concat=n=2:v=1:a=0[v]`,
            `[0:a]aresample=48000,apad=whole_dur=${total.toFixed(3)},afade=t=out:st=${(dur - 0.15).toFixed(3)}:d=${(END + 0.1).toFixed(3)}[a]`
        ].join(';');
        execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', MASTER,
            '-loop', '1', '-i', path.join(work, `frame-${tag}.png`),
            '-loop', '1', '-t', String(END), '-i', path.join(work, `end-${tag}.png`),
            '-filter_complex', filter, '-map', '[v]', '-map', '[a]', '-t', total.toFixed(3),
            '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', '18', '-maxrate', '14M', '-bufsize', '28M', '-r', '30',
            '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-ac', '2', '-movflags', '+faststart', out], { stdio: 'inherit' });
        console.log(`${path.relative(ROOT, out)} ${W}×${H} ${total.toFixed(1)}s`);
    });
})().catch((e) => { console.error(e); process.exit(1); });
