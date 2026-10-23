// Nullfall - burst stills for store screenshots
// Plays a showcase scenario in headless Chrome at native device resolution and saves a PNG every
// --every ms, so the best frame of a cascade can be picked afterwards. No touch marker.
// Needs the capture server running (node tools/showcase/server.js).
//   node tools/showcase/stills.js --scene cascade [--device iphone|ipad] [--every 150] [--seconds 20]
// Scenes: cascade, singularity, brinkclear, brink (set-pieces), boss (map → boss → stars),
//         classic (Cascade Chaser from Heat 2), builder (Build Bigger from Heat 2)

'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const SCENE = arg('scene', 'cascade');
const DEVICE = arg('device', 'iphone');
const EVERY = Number(arg('every', 150));
const SECONDS = Number(arg('seconds', 20));
const SERVER = arg('server', 'http://localhost:8790');
const CHROME = arg('chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
const PORT = Number(arg('cdp', 9334));
// iPhone 6.9" (1290 × 2796) and iPad 13" (2064 × 2752), the App Store's required sizes
const DEVICES = { iphone: { w: 430, h: 932, dpr: 3 }, ipad: { w: 1032, h: 1376, dpr: 2 } };
const D = DEVICES[DEVICE];
const OUT = path.resolve(arg('out', path.join(__dirname, '..', '..', 'captures', 'stills', DEVICE, SCENE)));

const BEST = 63840;
const SCENES = {
    cascade: `NullfallShowcase.play({ setpiece: 'cascade', stopAfterScript: true, best: ${BEST}, lead: 600 })`,
    singularity: `NullfallShowcase.play({ setpiece: 'singularity', stopAfterScript: true, best: ${BEST}, lead: 600 })`,
    brinkclear: `NullfallShowcase.play({ setpiece: 'brinkclear', stopAfterScript: true, best: ${BEST}, lead: 600 })`,
    brink: `NullfallShowcase.play({ setpiece: 'brink', stopAfterScript: true, best: ${BEST}, lead: 600 })`,
    boss: 'NullfallShowcase.bossRun({ sector: 1, boss: 10, lead: 600 })',
    classic: `NullfallShowcase.play({ style: 'chaser', stage: { heat: 2 }, best: ${BEST}, lead: 400 })`,
    builder: `NullfallShowcase.play({ style: 'builder', stage: { heat: 2 }, best: ${BEST}, lead: 400 })`
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
    if (!SCENES[SCENE]) throw new Error(`unknown scene ${SCENE}`);
    fs.rmSync(OUT, { recursive: true, force: true });
    fs.mkdirSync(OUT, { recursive: true });
    const profile = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), 'nullfall-stills-'));
    const chrome = spawn(CHROME, [
        `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--headless=new',
        '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--hide-scrollbars',
        '--autoplay-policy=no-user-gesture-required', `--window-size=${D.w},${D.h}`,
        `--app=${SERVER}/maingameplay.html?debug=1`
    ], { stdio: 'ignore' });
    const exited = new Promise((r) => chrome.on('exit', r));
    try {
        let page = null;
        for (let i = 0; i < 50 && !page; i++) {
            await sleep(200);
            try {
                const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
                page = list.find((t) => t.type === 'page' && t.url.includes('maingameplay'));
            } catch (e) { /* Chrome still starting */ }
        }
        if (!page) throw new Error('Chrome page not found');
        const c = await cdp(page.webSocketDebuggerUrl);
        await c.send('Emulation.setDeviceMetricsOverride', { width: D.w, height: D.h, deviceScaleFactor: D.dpr, mobile: true });
        await c.send('Emulation.setFocusEmulationEnabled', { enabled: true });
        await c.send('Page.reload', {});
        await sleep(2500);
        const run = `window.__done = false; NullfallShowcase.showMarker(false); (${SCENES[SCENE]}).then(() => { window.__done = true; }, (e) => { window.__done = String(e); }); true`;
        await c.send('Runtime.evaluate', { expression: run, userGesture: true });
        const t0 = Date.now();
        let n = 0;
        let doneAt = 0;
        while (Date.now() - t0 < SECONDS * 1000) {
            const shot = await c.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
            const ms = Date.now() - t0;
            fs.writeFileSync(path.join(OUT, `${String(n++).padStart(4, '0')}-${String(ms).padStart(6, '0')}.png`), Buffer.from(shot.data, 'base64'));
            const done = (await c.send('Runtime.evaluate', { expression: 'window.__done', returnByValue: true })).result.value;
            if (done && !doneAt) doneAt = Date.now();
            if (doneAt && Date.now() - doneAt > 4000) break; // keep the end screens a few seconds
            await sleep(Math.max(0, EVERY - (Date.now() - t0 - ms)));
        }
        await c.send('Runtime.evaluate', { expression: 'NullfallShowcase.stop(); true' });
        console.log(`${n} stills → ${OUT}`);
        c.close();
    } finally {
        chrome.kill();
        await exited;
        fs.rmSync(profile, { recursive: true, force: true });
    }
})().catch((e) => { console.error(e); process.exit(1); });
