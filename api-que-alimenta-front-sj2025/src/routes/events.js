const express = require('express');
const router = express.Router();
const { loadDB, saveDB, generateNumericId } = require('../database/db');
const { upload, processAndSaveImage } = require('../middleware/upload');

// Helper: compute event status based on current datetime
function computeStatus(date, startTime, endTime) {
    // If no date or no start time, can't determine — default to upcoming
    if (!date || !startTime) return 'upcoming';
    const now = new Date();
    const start = new Date(`${date}T${startTime}:00`);
    const end = endTime ? new Date(`${date}T${endTime}:00`) : null;
    // Guard against invalid dates
    if (isNaN(start.getTime())) return 'upcoming';
    if (now < start) return 'upcoming';
    if (end && !isNaN(end.getTime()) && now > end) return 'finished';
    return 'live';
}

// Filter helpers
function matchesFilters(event, { date, circuit, type, status, search }) {
    if (date && event.date !== date) return false;
    if (circuit && event.circuit !== circuit) return false;
    if (type && event.type !== type) return false;
    if (status && event.status !== status) return false;
    if (search) {
        const q = search.toLowerCase();
        if (!event.title.toLowerCase().includes(q) &&
            !event.artist.toLowerCase().includes(q) &&
            !event.id.toLowerCase().includes(q)) return false;
    }
    return true;
}

function sortEvents(a, b) {
    return a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time);
}


// GET /api/events
router.get('/', (req, res) => {
    const { date, circuit, type, status, search, page = 1, limit = 500 } = req.query;
    const db = loadDB();
    let events = db.events
        .map(e => ({ ...e, status: computeStatus(e.date, e.start_time, e.end_time) }))
        .filter(e => matchesFilters(e, { date, circuit, type, status, search }))
        .sort(sortEvents);
    const total = events.length;
    const start = (parseInt(page) - 1) * parseInt(limit);
    events = events.slice(start, start + parseInt(limit));
    res.json({ data: events, total, page: parseInt(page) });
});

// GET /api/events/export/json
router.get('/export/json', (req, res) => {
    const db = loadDB();
    res.setHeader('Content-Disposition', 'attachment; filename="sj2026-events.json"');
    res.json(db.events);
});

// GET /api/events/export/csv
router.get('/export/csv', (req, res) => {
    const db = loadDB();
    const events = db.events;
    if (!events.length) { res.send(''); return; }
    const headers = Object.keys(events[0]);
    const csv = [
        headers.join(','),
        ...events.map(e => headers.map(h => `"${String(e[h] ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="sj2026-events.csv"');
    res.send('\uFEFF' + csv);
});

// GET /api/events/:id
router.get('/:id', (req, res) => {
    const db = loadDB();
    const event = db.events.find(e => e.id === req.params.id);
    if (!event) return res.status(404).json({ error: true, message: 'Evento não encontrado.' });
    res.json({ data: { ...event, status: computeStatus(event.date, event.start_time, event.end_time) } });
});

// POST /api/events
router.post('/', (req, res) => {
    const { title, artist, date, start_time, end_time, circuit, stage, type, location, latitude, longitude, description, image_url, card_color } = req.body;
    const db = loadDB();
    const now = new Date().toISOString();
    const newEvent = {
        id: generateNumericId(db), title, artist, date, start_time, end_time: end_time || null,
        circuit, stage, type, location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        description: description || null, image_url: image_url || null,
        card_color: card_color || '#7B2D8B',
        status: computeStatus(date, start_time, end_time),
        created_at: now, updated_at: now
    };
    db.events.push(newEvent);
    saveDB(db);
    res.status(201).json({ data: newEvent });
});

// PUT /api/events/:id
router.put('/:id', (req, res) => {
    const db = loadDB();
    const idx = db.events.findIndex(e => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: true, message: 'Evento não encontrado.' });
    const existing = db.events[idx];
    const { title, artist, date, start_time, end_time, circuit, stage, type, location, latitude, longitude, description, image_url, card_color } = req.body;
    const newDate = date || existing.date;
    const newStart = start_time || existing.start_time;
    const newEnd = end_time !== undefined ? end_time : existing.end_time;
    if (newEnd && newStart && newEnd <= newStart) {
        // Soft — just warn in response but still save
    }
    const updated = {
        ...existing,
        title: title || existing.title, artist: artist || existing.artist,
        date: newDate, start_time: newStart, end_time: newEnd || null,
        circuit: circuit || existing.circuit, stage: stage || existing.stage,
        type: type || existing.type, location: location || existing.location,
        latitude: latitude != null ? parseFloat(latitude) : existing.latitude,
        longitude: longitude != null ? parseFloat(longitude) : existing.longitude,
        description: description !== undefined ? description : existing.description,
        image_url: image_url !== undefined ? image_url : existing.image_url,
        card_color: card_color || existing.card_color,
        status: computeStatus(newDate, newStart, newEnd),
        updated_at: new Date().toISOString()
    };
    db.events[idx] = updated;
    saveDB(db);
    res.json({ data: updated });
});

// DELETE /api/events/:id
router.delete('/:id', (req, res) => {
    const db = loadDB();
    const idx = db.events.findIndex(e => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: true, message: 'Evento não encontrado.' });
    db.events.splice(idx, 1);
    saveDB(db);
    res.json({ message: 'Evento excluído com sucesso.' });
});

// POST /api/events/:id/duplicate
router.post('/:id/duplicate', (req, res) => {
    const db = loadDB();
    const original = db.events.find(e => e.id === req.params.id);
    if (!original) return res.status(404).json({ error: true, message: 'Evento não encontrado.' });
    const now = new Date().toISOString();
    const dup = { ...original, id: generateNumericId(db), title: `${original.title} (Cópia)`, status: 'upcoming', image_url: null, created_at: now, updated_at: now };
    db.events.push(dup);
    saveDB(db);
    res.status(201).json({ data: dup });
});

// POST /api/events/:id/image
router.post('/:id/image', upload.single('image'), async (req, res, next) => {
    const db = loadDB();
    const idx = db.events.findIndex(e => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: true, message: 'Evento não encontrado.' });
    if (!req.file) return res.status(400).json({ error: true, message: 'Nenhuma imagem enviada.' });
    try {
        const imageUrl = await processAndSaveImage(req.file.buffer, req.params.id);
        db.events[idx].image_url = imageUrl;
        db.events[idx].updated_at = new Date().toISOString();
        saveDB(db);
        res.json({ data: { image_url: imageUrl } });
    } catch (err) { next(err); }
});

module.exports = router;
