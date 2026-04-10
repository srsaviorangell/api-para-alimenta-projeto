const express = require('express');
const router = express.Router();
const { loadDB, saveDB, generateNumericId } = require('../database/db');

// GET /api/stages  (opcional: ?search=xxx&type=xxx)
router.get('/', (req, res) => {
    const { search, type } = req.query;
    const db = loadDB();
    let stages = db.stages || [];
    if (type)   stages = stages.filter(s => s.type === type);
    if (search) {
        const q = search.toLowerCase();
        stages = stages.filter(s =>
            s.name.toLowerCase().includes(q) ||
            (s.location || '').toLowerCase().includes(q) ||
            (s.type || '').toLowerCase().includes(q)
        );
    }
    stages = [...stages].sort((a, b) =>
        (b.main ? 1 : 0) - (a.main ? 1 : 0) || a.name.localeCompare(b.name)
    );
    res.json({ data: stages, total: stages.length });
});

// GET /api/stages/:id
router.get('/:id', (req, res) => {
    const db = loadDB();
    const stage = (db.stages || []).find(s => s.id === req.params.id);
    if (!stage) return res.status(404).json({ error: true, message: 'Local não encontrado.' });
    res.json({ data: stage });
});

// POST /api/stages
router.post('/', (req, res) => {
    const { name, type, location, capacity, description, latitude, longitude, maps_url, main } = req.body;
    if (!name || !location) {
        return res.status(400).json({ error: true, message: 'Campos obrigatórios: name, location.' });
    }
    const db = loadDB();
    if (!db.stages) db.stages = [];
    const now = new Date().toISOString();
    const stage = {
        id:          generateNumericId(db),
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
    db.stages.push(stage);
    saveDB(db);
    res.status(201).json({ data: stage });
});

// PUT /api/stages/:id
router.put('/:id', (req, res) => {
    const db = loadDB();
    if (!db.stages) db.stages = [];
    const idx = db.stages.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: true, message: 'Local não encontrado.' });
    const e = db.stages[idx];
    const { name, type, location, capacity, description, latitude, longitude, maps_url, main } = req.body;
    db.stages[idx] = {
        ...e,
        name:        name        !== undefined ? name                     : e.name,
        type:        type        !== undefined ? type                     : e.type,
        location:    location    !== undefined ? location                 : e.location,
        capacity:    capacity    !== undefined ? parseInt(capacity, 10)   : e.capacity,
        description: description !== undefined ? description              : e.description,
        latitude:    latitude    != null       ? parseFloat(latitude)     : e.latitude,
        longitude:   longitude   != null       ? parseFloat(longitude)    : e.longitude,
        maps_url:    maps_url    !== undefined ? (maps_url || null)       : e.maps_url,
        main:        main        !== undefined ? !!main                   : e.main,
        updated_at:  new Date().toISOString(),
    };
    saveDB(db);
    res.json({ data: db.stages[idx] });
});

// DELETE /api/stages/:id
router.delete('/:id', (req, res) => {
    const db = loadDB();
    if (!db.stages) db.stages = [];
    const idx = db.stages.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: true, message: 'Local não encontrado.' });
    db.stages.splice(idx, 1);
    saveDB(db);
    res.json({ message: 'Local excluído com sucesso.' });
});

module.exports = router;
