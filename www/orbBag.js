// Nullfall - Orb dealer: bag randomizer, Number Tide and fairness guarantees (GDD §3.1–3.2, §5.4–5.5)
// Pure logic with no DOM, so the playtest bot can deal the same way in Node.

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.OrbBag = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    // Tide 0 deals ±1–4; each step doubles: Tide 1 = ±2,4,6,8 · Tide 2 = ±4,8,12,16 · Tide 3 = ±8…32
    const TIDE_BASE = [1, 2, 3, 4];

    function tideScale(tide) {
        return Math.pow(2, Math.max(0, tide || 0));
    }

    function tideValues(tide, base = TIDE_BASE) {
        const k = tideScale(tide);
        return base.map((v) => v * k);
    }

    function shuffle(arr, rng) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /**
     * Deals signed number values from a shuffled bag, so there are no long droughts or streaks.
     * opts.values    magnitudes in the pool
     * opts.favor     a magnitude dealt twice as often (optional)
     * opts.pairBias  chance to deal a match for an orb on top of a column (merge-friendly tray)
     * opts.collect   { number, every }: the Collect number turns up at least every `every` deals
     * opts.rng       random source (defaults to Math.random)
     * next({ exposed }) — exposed: signed values on top of each column
     */
    function createDealer(opts) {
        const rng = opts.rng || Math.random;
        const values = (opts.values && opts.values.length) ? opts.values.slice() : TIDE_BASE.slice();
        const favor = opts.favor || 0;
        const pairBias = opts.pairBias || 0;
        const collect = opts.collect || null;
        let bag = [];
        let sinceCollect = 0;

        function refill() {
            bag = [];
            values.forEach((v) => bag.push(v, -v));
            if (favor) bag.push(favor, -favor);
            shuffle(bag, rng);
        }

        function take() {
            if (!bag.length) refill();
            return bag.pop();
        }

        function next(ctx = {}) {
            let v;
            if (collect && sinceCollect >= collect.every - 1) {
                v = (rng() < 0.5 ? 1 : -1) * collect.number;
            } else if (pairBias && ctx.exposed && ctx.exposed.length && rng() < pairBias) {
                const inPool = ctx.exposed.filter((x) => x && (values.includes(Math.abs(x)) || Math.abs(x) === favor));
                if (inPool.length) v = inPool[Math.floor(rng() * inPool.length)];
            }
            if (v === undefined) v = take();
            if (collect) sinceCollect = Math.abs(v) === collect.number ? 0 : sinceCollect + 1;
            return v;
        }

        return { next, values };
    }

    return { TIDE_BASE, tideScale, tideValues, createDealer };
}));
