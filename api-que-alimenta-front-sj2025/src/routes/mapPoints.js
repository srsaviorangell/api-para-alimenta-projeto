const express = require('express');
const router = express.Router();
const { loadDB, saveDB, generateNumericId } = require('../database/db');

router.get('/', (req, res) => {
    const { category, search } = req.query;
    const db = loadDB();
    let pts = db.map_points;
    if (category) pts = pts.filter(p => p.category === category);
    if (search) { const q = search.toLowerCase(); pts = pts.filter(p => p.name.toLowerCase().includes(q)); }
    res.json({ data: pts, total: pts.length });
});

router.get('/:id', (req, res) => {
    const db = loadDB();
    const p = db.map_points.find(x => x.id === req.params.id);
    if (!p) return res.status(404).json({ error: true, message: 'Ponto não encontrado.' });
    res.json({ data: p });
});

router.post('/', (req, res) => {
    const { name, category, latitude, longitude, address, phone, opening_hours } = req.body;
    if (!name || !category || latitude == null || longitude == null) {
        return res.status(400).json({ error: true, message: 'Campos obrigatórios: name, category, latitude, longitude.' });
    }
    const db = loadDB();
    const now = new Date().toISOString();
    const pt = { id: generateNumericId(db), name, category, latitude: parseFloat(latitude), longitude: parseFloat(longitude), address: address || null, phone: phone || null, opening_hours: opening_hours || null, created_at: now, updated_at: now };
    db.map_points.push(pt);
    saveDB(db);
    res.status(201).json({ data: pt });
});

router.put('/:id', (req, res) => {
    const db = loadDB();
    const idx = db.map_points.findIndex(x => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: true, message: 'Ponto não encontrado.' });
    const e = db.map_points[idx];
    const { name, category, latitude, longitude, address, phone, opening_hours } = req.body;
    db.map_points[idx] = { ...e, name: name || e.name, category: category || e.category, latitude: latitude != null ? parseFloat(latitude) : e.latitude, longitude: longitude != null ? parseFloat(longitude) : e.longitude, address: address !== undefined ? address : e.address, phone: phone !== undefined ? phone : e.phone, opening_hours: opening_hours !== undefined ? opening_hours : e.opening_hours, updated_at: new Date().toISOString() };
    saveDB(db);
    res.json({ data: db.map_points[idx] });
});

router.delete('/:id', (req, res) => {
    const db = loadDB();
    const idx = db.map_points.findIndex(x => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: true, message: 'Ponto não encontrado.' });
    db.map_points.splice(idx, 1);
    saveDB(db);
    res.json({ message: 'Ponto excluído com sucesso.' });
});

module.exports = router;
