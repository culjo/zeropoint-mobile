// Nullfall - capture a showcase run in Chrome (video + game audio)
// Opens Chrome as a phone-sized window, starts the showcase autoplay (www/showcase.js) and records
// the tab with getDisplayMedia; the page uploads the .webm and its event log to the capture server.
// Needs the capture server running (node tools/showcase/server.js). Runs headless at 2.5× by
// default; --headless 0 shows the window (keep it uncovered: Chrome stops painting covered windows).
//   node tools/showcase/capture.js --name chaser-01 --style chaser [--setpiece cascade] [--turns 200]
//        [--best 0] [--heat 0] [--minutes 6] [--marker 1] [--boss 10 --sector 1]

'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const NAME = arg('name', `run-${Date.now()}`);
const SERVER = arg('server', 'http://localhost:8790');
const CHROME = arg('chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
const PORT = Number(arg('cdp', 9333));
// 432 × 936 CSS px at 2.5× = a 1080 × 2340 recording
const W = 432;
const H = 936;
const DPR = Number(arg('dpr', 2.5));
const HEADLESS = arg('headless', '1') !== '0';

const playOpts = {
    style: arg('style', 'chaser'),
    turns: Number(arg('turns', 400)),
    lead: Number(arg('lead', 1200)),
    tail: Number(arg('tail', 3000)),
    best: arg('best') != null ? Number(arg('best')) : undefined,
    setpiece: arg('setpiece') || undefined,
    stopAfterScript: arg('stop-after-script') === '1'
};
if (arg('heat')) playOpts.stage = { heat: Number(arg('heat')) };
// Boss Run: --boss 10 [--sector 1] taps from the home screen through the map into that boss
if (arg('boss')) Object.assign(playOpts, { boss: Number(arg('boss')), sector: Number(arg('sector', 1)) });
const MINUTES = Number(arg('minutes', 6));
const MARKER = arg('marker', '1') !== '0';

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

async function evaluate(c, expression, timeoutMs = 30000) {
    const r = await Promise.race([
        c.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true }),
        sleep(timeoutMs).then(() => { throw new Error(`timed out: ${expression.slice(0, 60)}`); })
    ]);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception ? r.exceptionDetails.exception.description : r.exceptionDetails.text);
    return r.result.value;
}

(async () => {
    const profile = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), 'nullfall-capture-'));
    const chrome = spawn(CHROME, [
        `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
        '--no-first-run', '--no-default-browser-check', '--disable-extensions',
        '--auto-accept-this-tab-capture', '--autoplay-policy=no-user-gesture-required',
        '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding', '--disable-background-timer-throttling',
        `--force-device-scale-factor=${DPR}`,
        ...(HEADLESS ? ['--headless=new', `--window-size=${W},${H}`] : [`--window-size=${W + 40},${H + 120}`, '--window-position=40,20']),
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
        // Headless: the window is the viewport (an override would change the captured surface)
        if (!HEADLESS) await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: DPR, mobile: true });
        await c.send('Emulation.setFocusEmulationEnabled', { enabled: true });
        await c.send('Page.reload', {});
        await sleep(2500);
        await evaluate(c, `NullfallShowcase.showMarker(${MARKER}); true`);
        console.log(`recording ${NAME} (${playOpts.setpiece || playOpts.style})…`);
        await evaluate(c, `window.__cap = null; NullfallShowcase.capture(${JSON.stringify(NAME)}, ${JSON.stringify(playOpts)})`
            + `.then((r) => { window.__cap = r; }, (e) => { window.__cap = { error: String(e && e.stack || e) }; }); true`);
        // Poll; past the time limit, end the run and let the page finish uploading
        const t0 = Date.now();
        let stopped = false;
        let result = null;
        while (!result) {
            await sleep(2000);
            result = await evaluate(c, 'window.__cap');
            if (!result && !stopped && Date.now() - t0 > MINUTES * 60000) {
                console.log('time limit: ending the run');
                await evaluate(c, 'NullfallShowcase.stop(); true');
                stopped = true;
            }
        }
        console.log(JSON.stringify(result));
        c.close();
    } finally {
        chrome.kill();
        await exited;
        fs.rmSync(profile, { recursive: true, force: true });
    }
})().catch((e) => { console.error(e); process.exit(1); });
