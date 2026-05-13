const express = require('express');
const router = express.Router();
const { getDB, generateNumericId } = require('../database/db');

// ── Helpers ────────────────────────────────────────────────────────────────────

function getMesAbreviado(dateString) {
    if (!dateString) return '';
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const parts = dateString.split('-');
    if (parts.length === 3) {
        const idx = parseInt(parts[1], 10) - 1;
        if (idx >= 0 && idx < 12) return meses[idx];
    }
    return '';
}

function getDia(dateString) {
    if (!dateString) return '';
    const parts = dateString.split('-');
    return parts.length === 3 ? parts[2] : '';
}

function getHorarioFormatado(timeString) {
    if (!timeString) return '';
    const parts = timeString.split(':');
    if (parts.length >= 2) {
        return parts[1] === '00' ? `${parts[0]}h` : `${parts[0]}h${parts[1]}`;
    }
    return timeString;
}

function computeStatus(date, startTime, endTime) {
    if (!date || !startTime) return 'upcoming';
    const now = new Date();
    const start = new Date(`${date}T${startTime}:00`);
    const end = endTime ? new Date(`${date}T${endTime}:00`) : null;
    if (isNaN(start.getTime())) return 'upcoming';
    if (now < start) return 'upcoming';
    if (end && !isNaN(end.getTime()) && now > end) return 'finished';
    return 'live';
}

function matchesFilters(event, { date, type, status, search }) {
    if (date && event.date !== date) return false;
    if (type && event.type !== type) return false;
    if (status && event.status !== status) return false;
    if (search) {
        const q = search.toLowerCase();
        if (!event.artist.toLowerCase().includes(q) && !String(event.id).toLowerCase().includes(q)) return false;
    }
    return true;
}

function sortEvents(a, b) {
    return (a.date ? a.date.localeCompare(b.date) : 0) || (a.start_time ? a.start_time.localeCompare(b.start_time) : 0);
}

const PROJ = { projection: { _id: 0 } };

// ── Routes ─────────────────────────────────────────────────────────────────────

// GET /api/events
router.get('/', async (req, res, next) => {
    try {
        const { date, type, status, search, page = 1, limit = 500 } = req.query;
        const db = await getDB();
        let events = await db.collection('events').find({}, PROJ).toArray();
        events = events
            .map(e => ({ ...e, status: computeStatus(e.date, e.start_time, e.end_time) }))
            .filter(e => matchesFilters(e, { date, type, status, search }))
            .sort(sortEvents);
        const total = events.length;
        const start = (parseInt(page) - 1) * parseInt(limit);
        events = events.slice(start, start + parseInt(limit));
        res.json({ data: events, total, page: parseInt(page) });
    } catch (err) { next(err); }
});

// GET /api/events/export/json
router.get('/export/json', async (req, res, next) => {
    try {
        const db = await getDB();
        const events = await db.collection('events').find({}, PROJ).toArray();
        res.setHeader('Content-Disposition', 'attachment; filename="sj2026-events.json"');
        res.json(events);
    } catch (err) { next(err); }
});

// GET /api/events/export/csv
router.get('/export/csv', async (req, res, next) => {
    try {
        const db = await getDB();
        const events = await db.collection('events').find({}, PROJ).toArray();
        if (!events.length) { res.send(''); return; }
        const headers = Object.keys(events[0]);
        const csv = [
            headers.join(','),
            ...events.map(e => headers.map(h => `"${String(e[h] ?? '').replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="sj2026-events.csv"');
        res.send('\uFEFF' + csv);
    } catch (err) { next(err); }
});

// GET /api/events/:id
router.get('/:id', async (req, res, next) => {
    try {
        const db = await getDB();
        const event = await db.collection('events').findOne({ id: req.params.id }, PROJ);
        if (!event) return res.status(404).json({ error: true, message: 'Evento não encontrado.' });
        res.json({ data: { ...event, status: computeStatus(event.date, event.start_time, event.end_time) } });
    } catch (err) { next(err); }
});

// POST /api/events
router.post('/', async (req, res, next) => {
    try {
        const { artist, date, start_time, end_time, stage, type, description, image_url, card_color, gallery } = req.body;
        const db = await getDB();
        const col = db.collection('events');
        const now = new Date().toISOString();
        const defaultStage = (stage === 'Palco Principal' || stage === 'Barracão Zé Bigode') ? stage : 'Palco Principal';
        const newEvent = {
            id: await generateNumericId(col),
            artist, date,
            start_time, end_time: end_time || null,
            dia: getDia(date), mes: getMesAbreviado(date), horario: getHorarioFormatado(start_time),
            gallery: Array.isArray(gallery) ? gallery : [],
            stage: defaultStage, type,
            description: description || null,
            image_url: image_url || null,
            card_color: card_color || '#7B2D8B',
            status: computeStatus(date, start_time, end_time),
            created_at: now, updated_at: now
        };
        await col.insertOne(newEvent);
        const { _id, ...response } = newEvent;
        res.status(201).json({ data: response });
    } catch (err) { next(err); }
});

// PUT /api/events/:id
router.put('/:id', async (req, res, next) => {
    try {
        const db = await getDB();
        const col = db.collection('events');
        const existing = await col.findOne({ id: req.params.id }, PROJ);
        if (!existing) return res.status(404).json({ error: true, message: 'Evento não encontrado.' });

        const { artist, date, start_time, end_time, stage, type, description, image_url, card_color, gallery } = req.body;
        const newDate  = date       !== undefined ? date       : existing.date;
        const newStart = start_time !== undefined ? start_time : existing.start_time;
        const newEnd   = end_time   !== undefined ? end_time   : existing.end_time;

        let defaultStage = stage !== undefined ? stage : existing.stage;
        if (defaultStage !== 'Palco Principal' && defaultStage !== 'Barracão Zé Bigode') defaultStage = 'Palco Principal';

        const updated = {
            ...existing,
            artist:      artist      !== undefined ? artist      : existing.artist,
            date: newDate, start_time: newStart, end_time: newEnd || null,
            dia: getDia(newDate), mes: getMesAbreviado(newDate), horario: getHorarioFormatado(newStart),
            gallery:     Array.isArray(gallery) ? gallery : existing.gallery || [],
            stage:       defaultStage,
            type:        type        !== undefined ? type        : existing.type,
            description: description !== undefined ? description : existing.description,
            image_url:   image_url   !== undefined ? image_url   : existing.image_url,
            card_color:  card_color  !== undefined ? card_color  : existing.card_color,
            status:      computeStatus(newDate, newStart, newEnd),
            updated_at:  new Date().toISOString()
        };
        await col.updateOne({ id: req.params.id }, { $set: updated });
        res.json({ data: updated });
    } catch (err) { next(err); }
});

// DELETE /api/events/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const db = await getDB();
        const result = await db.collection('events').deleteOne({ id: req.params.id });
        if (result.deletedCount === 0) return res.status(404).json({ error: true, message: 'Evento não encontrado.' });
        res.json({ message: 'Evento excluído com sucesso.' });
    } catch (err) { next(err); }
});

// POST /api/events/:id/duplicate
router.post('/:id/duplicate', async (req, res, next) => {
    try {
        const db = await getDB();
        const col = db.collection('events');
        const original = await col.findOne({ id: req.params.id }, PROJ);
        if (!original) return res.status(404).json({ error: true, message: 'Evento não encontrado.' });
        const now = new Date().toISOString();
        const dup = {
            ...original,
            id: await generateNumericId(col),
            artist: `${original.artist} (Cópia)`,
            gallery: original.gallery || [],
            status: 'upcoming', image_url: null,
            created_at: now, updated_at: now
        };
        await col.insertOne(dup);
        const { _id, ...response } = dup;
        res.status(201).json({ data: response });
    } catch (err) { next(err); }
});

module.exports = router;
