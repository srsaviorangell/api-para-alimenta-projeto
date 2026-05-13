const express = require('express');
const router = express.Router();
const { getDB, generateNumericId } = require('../database/db');

const PROJ = { projection: { _id: 0 } };

// GET /api/stages
router.get('/', async (req, res, next) => {
    try {
        const { search, type } = req.query;
        const db = await getDB();
        let stages = await db.collection('stages').find({}, PROJ).toArray();
        if (type)   stages = stages.filter(s => s.type === type);
        if (search) {
            const q = search.toLowerCase();
            stages = stages.filter(s =>
                s.name.toLowerCase().includes(q) ||
                (s.location || '').toLowerCase().includes(q) ||
                (s.type || '').toLowerCase().includes(q)
            );
        }
        stages = stages.sort((a, b) =>
            (b.main ? 1 : 0) - (a.main ? 1 : 0) || a.name.localeCompare(b.name)
        );
        res.json({ data: stages, total: stages.length });
    } catch (err) { next(err); }
});

// GET /api/stages/:id
router.get('/:id', async (req, res, next) => {
    try {
        const db = await getDB();
        const stage = await db.collection('stages').findOne({ id: req.params.id }, PROJ);
        if (!stage) return res.status(404).json({ error: true, message: 'Local não encontrado.' });
        res.json({ data: stage });
    } catch (err) { next(err); }
});

// POST /api/stages
router.post('/', async (req, res, next) => {
    try {
        const { name, type, location, capacity, description, latitude, longitude, maps_url, main } = req.body;
        if (!name || !location) {
            return res.status(400).json({ error: true, message: 'Campos obrigatórios: name, location.' });
        }
        const db = await getDB();
        const col = db.collection('stages');
        const now = new Date().toISOString();
        const stage = {
            id:          await generateNumericId(col),
            name,
            type:        type        || null,
            location,
            capacity:    capacity    ? parseInt(capacity, 10) : null,
            description: description || null,
            latitude:    latitude    != null ? parseFloat(latitude)  : null,
            longitude:   longitude   != null ? parseFloat(longitude) : null,
            maps_url:    maps_url    || null,
            main:        !!main,
            created_at:  now,
            updated_at:  now,
        };
        await col.insertOne(stage);
        const { _id, ...response } = stage;
        res.status(201).json({ data: response });
    } catch (err) { next(err); }
});

// PUT /api/stages/:id
router.put('/:id', async (req, res, next) => {
    try {
        const db = await getDB();
        const col = db.collection('stages');
        const existing = await col.findOne({ id: req.params.id }, PROJ);
        if (!existing) return res.status(404).json({ error: true, message: 'Local não encontrado.' });
        const { name, type, location, capacity, description, latitude, longitude, maps_url, main } = req.body;
        const updated = {
            ...existing,
            name:        name        !== undefined ? name                   : existing.name,
            type:        type        !== undefined ? type                   : existing.type,
            location:    location    !== undefined ? location               : existing.location,
            capacity:    capacity    !== undefined ? parseInt(capacity, 10) : existing.capacity,
            description: description !== undefined ? description            : existing.description,
            latitude:    latitude    != null       ? parseFloat(latitude)   : existing.latitude,
            longitude:   longitude   != null       ? parseFloat(longitude)  : existing.longitude,
            maps_url:    maps_url    !== undefined ? (maps_url || null)     : existing.maps_url,
            main:        main        !== undefined ? !!main                 : existing.main,
            updated_at:  new Date().toISOString(),
        };
        await col.updateOne({ id: req.params.id }, { $set: updated });
        res.json({ data: updated });
    } catch (err) { next(err); }
});

// DELETE /api/stages/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const db = await getDB();
        const result = await db.collection('stages').deleteOne({ id: req.params.id });
        if (result.deletedCount === 0) return res.status(404).json({ error: true, message: 'Local não encontrado.' });
        res.json({ message: 'Local excluído com sucesso.' });
    } catch (err) { next(err); }
});

module.exports = router;
