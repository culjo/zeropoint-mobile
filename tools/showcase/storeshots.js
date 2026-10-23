// Nullfall - store screenshots from showcase stills
// Renders captioned store images with headless Chrome from a plan of picked stills:
//   App Store iPhone 6.9" 1290×2796, 6.3" 1206×2622 and 6.1" 1179×2556, App Store iPad 13" 2064×2752,
//   Google Play phone 1080×1920
//   and the Google Play feature graphic 1024×500. Output PNGs have no alpha channel (App Store
//   Connect rejects screenshots with one).
//   node tools/showcase/storeshots.js captures/store/plan.json [--out captures/store]
//
// Plan: { "shots": [{ "id": "01-zero", "title": "Opposites cancel.\n*Hit zero.*",
//                     "iphone": "<still png>", "ipad": "<still png>" }],
//         "feature": { "shot": "<still png>", "tagline": "Cancel numbers. Chain blasts." } }
// *word* in a title is drawn in the accent colour; \n breaks the line. Android uses the iPhone still.

'use strict';

const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const PLAN = path.resolve(args[0] || path.join(ROOT, 'captures', 'store', 'plan.json'));
const OUT = path.resolve(arg('out', path.join(ROOT, 'captures', 'store')));
const CHROME = arg('chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
const PORT = Number(arg('cdp', 9335));
const FONT = `file://${path.join(ROOT, 'www', 'fonts', 'inter-latin-var.woff2')}`;
const ICON = `file://${path.join(ROOT, 'resources', 'icon', 'png', 'icon-master.png')}`;

const SETS = {
    'appstore-iphone-6.9': { w: 1290, h: 2796, still: 'iphone' },
    'appstore-iphone-6.3': { w: 1206, h: 2622, still: 'iphone' },
    'appstore-iphone-6.1': { w: 1179, h: 2556, still: 'iphone' },
    'appstore-ipad-13': { w: 2064, h: 2752, still: 'ipad' },
    'googleplay-phone': { w: 1080, h: 1920, still: 'iphone' }
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const titleHtml = (t) => esc(t).split('\n').map((line) => line.replace(/\*([^*]+)\*/g, '<em>$1</em>')).join('<br>');
const fileUrl = (p) => `file://${path.resolve(ROOT, p)}`;
const sizeOf = (p) => {
    const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', path.resolve(ROOT, p)]).toString();
    return { w: Number(/pixelWidth: (\d+)/.exec(out)[1]), h: Number(/pixelHeight: (\d+)/.exec(out)[1]) };
};

const BASE_CSS = `
@font-face { font-family: 'Inter'; font-weight: 400 900; src: url(${FONT}) format('woff2'); }
html, body { margin: 0; padding: 0; overflow: hidden; }
body { background: #080a11; font-family: 'Inter', sans-serif; color: #f0f4fc; position: relative; }
.bg { position: absolute; inset: 0;
  background:
    radial-gradient(60% 40% at 18% 8%, rgba(0, 242, 254, 0.20), transparent 70%),
    radial-gradient(55% 40% at 88% 92%, rgba(196, 113, 237, 0.26), transparent 70%),
    radial-gradient(40% 25% at 90% 30%, rgba(255, 78, 80, 0.10), transparent 70%),
    linear-gradient(180deg, #0b0f1d 0%, #080a11 55%, #0d0a1a 100%); }
.stars { position: absolute; inset: 0; opacity: 0.55;
  background-image:
    radial-gradient(1.6px 1.6px at 12% 18%, #fff, transparent), radial-gradient(1.2px 1.2px at 72% 9%, #cfefff, transparent),
    radial-gradient(1.4px 1.4px at 38% 44%, #fff, transparent), radial-gradient(1.1px 1.1px at 86% 58%, #e8d8ff, transparent),
    radial-gradient(1.5px 1.5px at 22% 77%, #fff, transparent), radial-gradient(1.2px 1.2px at 63% 86%, #cfefff, transparent);
  background-size: 37% 23%; }
em { font-style: normal; background: linear-gradient(90deg, #00f2fe, #7ff8ff 45%, #f9d423);
  -webkit-background-clip: text; background-clip: text; color: transparent; }`;

function portraitHtml(set, shot, still) {
    const { w: W, h: H } = set;
    const s = sizeOf(still);
    const aspect = s.h / s.w;
    const fontPx = Math.round(Math.min(W * 0.083, H * 0.04));
    const top = Math.round(H * 0.055);
    const titleH = fontPx * 1.08 * 2;
    const frameTop = Math.round(top + titleH + H * 0.035);
    const bottomPad = Math.round(H * 0.035);
    const frameW = Math.round(Math.min(W * (set.still === 'ipad' ? 0.8 : 0.78), (H - frameTop - bottomPad) / aspect));
    const frameH = Math.round(frameW * aspect);
    const radius = Math.round(frameW * (set.still === 'ipad' ? 0.035 : 0.075));
    const bezel = Math.max(6, Math.round(frameW * 0.014));
    return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}
body { width: ${W}px; height: ${H}px; }
h1 { position: absolute; left: 0; right: 0; top: ${top}px; margin: 0; padding: 0 ${Math.round(W * 0.06)}px; text-align: center;
  font-weight: 900; font-size: ${fontPx}px; line-height: 1.08; letter-spacing: -0.02em; text-shadow: 0 ${Math.round(fontPx * 0.05)}px ${Math.round(fontPx * 0.4)}px rgba(0,0,0,0.6); }
.frame { position: absolute; left: ${Math.round((W - frameW) / 2) - bezel}px; top: ${frameTop - bezel}px;
  width: ${frameW}px; height: ${frameH}px; border: ${bezel}px solid #1b2133; border-radius: ${radius + bezel}px; overflow: hidden;
  background: #080a11;
  box-shadow: 0 0 0 ${Math.max(2, Math.round(bezel / 4))}px rgba(0, 242, 254, 0.35), 0 ${Math.round(H * 0.012)}px ${Math.round(H * 0.04)}px rgba(0,0,0,0.65), 0 0 ${Math.round(W * 0.08)}px rgba(0, 242, 254, 0.18); }
.frame img { display: block; width: 100%; height: 100%; border-radius: ${radius}px; }
</style></head><body><div class="bg"></div><div class="stars"></div>
<h1>${titleHtml(shot.title)}</h1>
<div class="frame"><img src="${fileUrl(still)}"></div>
</body></html>`;
}

function featureHtml(feature) {
    const W = 1024;
    const H = 500;
    const s = sizeOf(feature.shot);
    const shotW = 300;
    const shotH = Math.round(shotW * s.h / s.w);
    return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}
body { width: ${W}px; height: ${H}px; }
.left { position: absolute; left: 70px; top: 0; bottom: 0; width: 560px; display: flex; flex-direction: column; justify-content: center; }
.icon { width: 132px; height: 132px; border-radius: 30px; box-shadow: 0 10px 40px rgba(249, 212, 35, 0.25), 0 0 0 2px rgba(255,255,255,0.08); }
.name { margin-top: 26px; font-weight: 900; font-size: 92px; line-height: 0.95; letter-spacing: -0.03em; }
.sub { margin-top: 14px; font-weight: 800; font-size: 34px; letter-spacing: -0.01em; }
.shot { position: absolute; right: 70px; top: 46px; width: ${shotW}px; height: ${shotH}px; border: 8px solid #1b2133;
  border-radius: 34px; overflow: hidden; transform: rotate(6deg); transform-origin: 50% 0;
  box-shadow: 0 0 0 2px rgba(0, 242, 254, 0.35), 0 20px 60px rgba(0,0,0,0.7), 0 0 80px rgba(0, 242, 254, 0.2); }
.shot img { width: 100%; height: 100%; display: block; }
</style></head><body><div class="bg"></div><div class="stars"></div>
<div class="left"><img class="icon" src="${ICON}"><div class="name">NULLFALL</div><div class="sub">${titleHtml(feature.tagline || 'Puzzle Cascade')}</div></div>
<div class="shot"><img src="${fileUrl(feature.shot)}"></div>
</body></html>`;
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

(async () => {
    const plan = JSON.parse(fs.readFileSync(PLAN, 'utf8'));
    const jobs = [];
    const htmlDir = path.join(OUT, 'html');
    fs.mkdirSync(htmlDir, { recursive: true });
    Object.entries(SETS).forEach(([setName, set]) => {
        plan.shots.forEach((shot) => {
            const still = shot[set.still];
            if (!still) return;
            const html = path.join(htmlDir, `${setName}-${shot.id}.html`);
            fs.writeFileSync(html, portraitHtml(set, shot, still));
            jobs.push({ html, w: set.w, h: set.h, out: path.join(OUT, setName, `${shot.id}.png`) });
        });
    });
    if (plan.feature) {
        const html = path.join(htmlDir, 'feature.html');
        fs.writeFileSync(html, featureHtml(plan.feature));
        jobs.push({ html, w: 1024, h: 500, out: path.join(OUT, 'googleplay-feature-graphic.png') });
    }

    const profile = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), 'nullfall-store-'));
    const chrome = spawn(CHROME, [
        `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--headless=new', '--hide-scrollbars',
        '--no-first-run', '--allow-file-access-from-files', '--window-size=1200,1200', 'about:blank'
    ], { stdio: 'ignore' });
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
        for (const job of jobs) {
            await c.send('Emulation.setDeviceMetricsOverride', { width: job.w, height: job.h, deviceScaleFactor: 1, mobile: false });
            await c.send('Page.navigate', { url: `file://${job.html}` });
            await sleep(900); // fonts and images
            await c.send('Runtime.evaluate', { expression: 'document.fonts.ready.then(() => Promise.all([...document.images].map((i) => i.decode())))', awaitPromise: true });
            const shot = await c.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: job.w, height: job.h, scale: 1 } });
            fs.mkdirSync(path.dirname(job.out), { recursive: true });
            const tmp = `${job.out}.rgba.png`;
            fs.writeFileSync(tmp, Buffer.from(shot.data, 'base64'));
            execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-pix_fmt', 'rgb24', job.out]); // drop the alpha channel
            fs.rmSync(tmp);
            console.log(`${path.relative(ROOT, job.out)} ${job.w}×${job.h}`);
        }
        c.close();
    } finally {
        chrome.kill();
        await exited;
        fs.rmSync(profile, { recursive: true, force: true });
    }
})().catch((e) => { console.error(e); process.exit(1); });
