const express = require('express');
const router = express.Router();
const { getDB, generateNumericId } = require('../database/db');

const PROJ = { projection: { _id: 0 } };

// GET /api/venues
router.get('/', async (req, res, next) => {
    try {
        const { type, search } = req.query;
        const db = await getDB();
        let venues = await db.collection('venues').find({}, PROJ).toArray();
        if (type)   venues = venues.filter(v => v.type === type);
        if (search) {
            const q = search.toLowerCase();
            venues = venues.filter(v =>
                v.name.toLowerCase().includes(q) ||
                (v.address || '').toLowerCase().includes(q)
            );
        }
        venues = venues.sort((a, b) => (b.patrocinado ? 1 : 0) - (a.patrocinado ? 1 : 0) || a.name.localeCompare(b.name));
        res.json({ data: venues, total: venues.length });
    } catch (err) { next(err); }
});

// GET /api/venues/:id
router.get('/:id', async (req, res, next) => {
    try {
        const db = await getDB();
        const venue = await db.collection('venues').findOne({ id: req.params.id }, PROJ);
        if (!venue) return res.status(404).json({ error: true, message: 'Barraca não encontrada.' });
        res.json({ data: venue });
    } catch (err) { next(err); }
});

// POST /api/venues
router.post('/', async (req, res, next) => {
    try {
        const { name, type, latitude, longitude, address, phone, horario, patrocinado, description } = req.body;
        if (!name || !type || latitude == null || longitude == null) {
            return res.status(400).json({ error: true, message: 'Campos obrigatórios: name, type, latitude, longitude.' });
        }
        const db = await getDB();
        const col = db.collection('venues');
        const now = new Date().toISOString();
        const venue = {
            id: await generateNumericId(col),
            name, type,
            latitude: parseFloat(latitude), longitude: parseFloat(longitude),
            address: address || null, phone: phone || null,
            horario: horario || null, patrocinado: !!patrocinado,
            description: description || null,
            created_at: now, updated_at: now
        };
        await col.insertOne(venue);
        const { _id, ...response } = venue;
        res.status(201).json({ data: response });
    } catch (err) { next(err); }
});

// PUT /api/venues/:id
router.put('/:id', async (req, res, next) => {
    try {
        const db = await getDB();
        const col = db.collection('venues');
        const existing = await col.findOne({ id: req.params.id }, PROJ);
        if (!existing) return res.status(404).json({ error: true, message: 'Barraca não encontrada.' });
        const { name, type, latitude, longitude, address, phone, horario, patrocinado, description } = req.body;
        const updated = {
            ...existing,
            name:        name        || existing.name,
            type:        type        || existing.type,
            latitude:    latitude    != null ? parseFloat(latitude)  : existing.latitude,
            longitude:   longitude   != null ? parseFloat(longitude) : existing.longitude,
            address:     address     !== undefined ? address     : existing.address,
            phone:       phone       !== undefined ? phone       : existing.phone,
            horario:     horario     !== undefined ? horario     : existing.horario,
            patrocinado: patrocinado !== undefined ? !!patrocinado : existing.patrocinado,
            description: description !== undefined ? description : existing.description,
            updated_at: new Date().toISOString()
        };
        await col.updateOne({ id: req.params.id }, { $set: updated });
        res.json({ data: updated });
    } catch (err) { next(err); }
});

// DELETE /api/venues/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const db = await getDB();
        const result = await db.collection('venues').deleteOne({ id: req.params.id });
        if (result.deletedCount === 0) return res.status(404).json({ error: true, message: 'Barraca não encontrada.' });
        res.json({ message: 'Barraca excluída com sucesso.' });
    } catch (err) { next(err); }
});

module.exports = router;
