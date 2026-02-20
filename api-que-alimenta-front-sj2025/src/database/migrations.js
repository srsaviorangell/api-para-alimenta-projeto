const { loadDB, saveDB } = require('./db');
const { v4: uuidv4 } = require('uuid');

function runMigrations() {
    const db = loadDB();
    // Ensure all tables exist
    if (!db.events) db.events = [];
    if (!db.venues) db.venues = [];
    if (!db.map_points) db.map_points = [];
    if (!db.useful_info) db.useful_info = [];
    saveDB(db);
    console.log('✅ DB inicializado com sucesso.');
}

module.exports = { runMigrations };
