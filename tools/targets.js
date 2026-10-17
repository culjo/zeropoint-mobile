// Nullfall - target bot clear rate per level slot (GDD §5.3 difficulty curve)
// Openers ~95%, bosses ~55%, main nodes fall in a sawtooth from easy to ~65% across a sector,
// bonus rifts ~80%. These are bot win rates; calibrate against real players in testing.

'use strict';

const path = require('path');
const NodeGenerator = require(path.join(__dirname, '..', 'www', 'nodeGenerator.js'));

function targetFor(id) {
    const sector = parseInt(id, 10);
    const layout = NodeGenerator.SECTOR_LAYOUTS[sector - 1] || [];
    const node = layout.find((n) => n.id === id);
    if (!node) return 0.8;
    if (node.type === 'boss') return 0.55;
    if (node.type === 'bonus') return 0.8;
    const mains = layout.filter((n) => n.type !== 'bonus' && n.type !== 'boss');
    const i = mains.findIndex((n) => n.id === id);
    if (i === 0) return 0.95;
    // Each sector starts a little harder than the last one's opener but easier than its end
    const start = 0.9 - (sector - 1) * 0.02;
    const end = 0.66;
    return start - (start - end) * (i / Math.max(1, mains.length - 1));
}

module.exports = { targetFor };
