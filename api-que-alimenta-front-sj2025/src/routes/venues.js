const express = require('express');
const router = express.Router();
const { loadDB, saveDB, generateNumericId } = require('../database/db');

router.get('/', (req, res) => {
    const { type, search } = req.query;
    const db = loadDB();
    let venues = db.venues;
    if (type) venues = venues.filter(v => v.type === type);
    if (search) { const q = search.toLowerCase(); venues = venues.filter(v => v.name.toLowerCase().includes(q) || (v.address || '').toLowerCase().includes(q)); }
    venues = [...venues].sort((a, b) => (b.patrocinado ? 1 : 0) - (a.patrocinado ? 1 : 0) || a.name.localeCompare(a.name));
    res.json({ data: venues, total: venues.length });
});

router.get('/:id', (req, res) => {
    const db = loadDB();
    const venue = db.venues.find(v => v.id === req.params.id);
    if (!venue) return res.status(404).json({ error: true, message: 'Barraca não encontrada.' });
    res.json({ data: venue });
});

router.post('/', (req, res) => {
    const { name, type, latitude, longitude, address, phone, horario, patrocinado, description } = req.body;
    if (!name || !type || latitude == null || longitude == null) {
        return res.status(400).json({ error: true, message: 'Campos obrigatórios: name, type, latitude, longitude.' });
    }
    const db = loadDB();
    const now = new Date().toISOString();
    const venue = { id: generateNumericId(db), name, type, latitude: parseFloat(latitude), longitude: parseFloat(longitude), address: address || null, phone: phone || null, horario: horario || null, patrocinado: !!patrocinado, description: description || null, created_at: now, updated_at: now };
    db.venues.push(venue);
    saveDB(db);
    res.status(201).json({ data: venue });
});

router.put('/:id', (req, res) => {
    const db = loadDB();
    const idx = db.venues.findIndex(v => v.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: true, message: 'Barraca não encontrada.' });
    const e = db.venues[idx];
    const { name, type, latitude, longitude, address, phone, horario, patrocinado, description } = req.body;
    db.venues[idx] = { ...e, name: name || e.name, type: type || e.type, latitude: latitude != null ? parseFloat(latitude) : e.latitude, longitude: longitude != null ? parseFloat(longitude) : e.longitude, address: address !== undefined ? address : e.address, phone: phone !== undefined ? phone : e.phone, horario: horario !== undefined ? horario : e.horario, patrocinado: patrocinado !== undefined ? !!patrocinado : e.patrocinado, description: description !== undefined ? description : e.description, updated_at: new Date().toISOString() };
    saveDB(db);
    res.json({ data: db.venues[idx] });
});

router.delete('/:id', (req, res) => {
    const db = loadDB();
    const idx = db.venues.findIndex(v => v.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: true, message: 'Barraca não encontrada.' });
    db.venues.splice(idx, 1);
    saveDB(db);
    res.json({ message: 'Barraca excluída com sucesso.' });
});

module.exports = router;
