/**
 * Pure-JS JSON file database adapter.
 * Replaces better-sqlite3 to avoid native compilation on Windows.
 * Uses synchronous reads/writes for simplicity.
 */
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../sj2026.json');

function loadDB() {
    if (!fs.existsSync(DB_PATH)) {
        const initial = { events: [], venues: [], map_points: [], useful_info: [] };
        fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf8');
        return initial;
    }
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function generateNumericId(db) {
    let maxId = 0;
    // Check all main collections for the highest numeric ID
    ['events', 'venues', 'map_points', 'useful_info'].forEach(coll => {
        if (Array.isArray(db[coll])) {
            db[coll].forEach(item => {
                const num = parseInt(item.id, 10);
                if (!isNaN(num) && num > maxId) {
                    maxId = num;
                }
            });
        }
    });
    return (maxId + 1).toString();
}

module.exports = { loadDB, saveDB, generateNumericId };
