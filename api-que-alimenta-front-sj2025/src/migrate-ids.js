const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../sj2026.json');

if (!fs.existsSync(dbPath)) {
    console.log('DB not found.');
    process.exit(0);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let nextId = 1;

['events', 'venues', 'mapPoints', 'usefulInfo'].forEach(collection => {
    if (db[collection]) {
        db[collection].forEach(item => {
            // Only replace if it looks like a long UUID (length > 10) or isn't numeric
            if (isNaN(item.id)) {
                console.log(`Migrating ${collection} ID: ${item.id} -> ${nextId}`);
                item.id = nextId.toString();
                nextId++;
            }
        });
    }
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Migration complete. Max ID is now', nextId - 1);
