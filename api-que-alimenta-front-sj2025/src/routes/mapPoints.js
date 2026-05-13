const express = require('express');
const router = express.Router();
const { getDB, generateNumericId } = require('../database/db');

const PROJ = { projection: { _id: 0 } };

// GET /api/map-points
router.get('/', async (req, res, next) => {
    try {
        const { category, search } = req.query;
        const db = await getDB();
        let pts = await db.collection('map_points').find({}, PROJ).toArray();
        if (category) pts = pts.filter(p => p.category === category);
        if (search) {
            const q = search.toLowerCase();
            pts = pts.filter(p => p.name.toLowerCase().includes(q));
        }
        res.json({ data: pts, total: pts.length });
    } catch (err) { next(err); }
});

// GET /api/map-points/:id
router.get('/:id', async (req, res, next) => {
    try {
        const db = await getDB();
        const pt = await db.collection('map_points').findOne({ id: req.params.id }, PROJ);
        if (!pt) return res.status(404).json({ error: true, message: 'Ponto não encontrado.' });
        res.json({ data: pt });
    } catch (err) { next(err); }
});

// POST /api/map-points
router.post('/', async (req, res, next) => {
    try {
        const { name, category, latitude, longitude, address, phone, opening_hours } = req.body;
        if (!name || !category || latitude == null || longitude == null) {
            return res.status(400).json({ error: true, message: 'Campos obrigatórios: name, category, latitude, longitude.' });
        }
        const db = await getDB();
        const col = db.collection('map_points');
        const now = new Date().toISOString();
        const pt = {
            id: await generateNumericId(col),
            name, category,
            latitude: parseFloat(latitude), longitude: parseFloat(longitude),
            address: address || null, phone: phone || null,
            opening_hours: opening_hours || null,
            created_at: now, updated_at: now
        };
        await col.insertOne(pt);
        const { _id, ...response } = pt;
        res.status(201).json({ data: response });
    } catch (err) { next(err); }
});

// PUT /api/map-points/:id
router.put('/:id', async (req, res, next) => {
    try {
        const db = await getDB();
        const col = db.collection('map_points');
        const existing = await col.findOne({ id: req.params.id }, PROJ);
        if (!existing) return res.status(404).json({ error: true, message: 'Ponto não encontrado.' });
        const { name, category, latitude, longitude, address, phone, opening_hours } = req.body;
        const updated = {
            ...existing,
            name:          name          || existing.name,
            category:      category      || existing.category,
            latitude:      latitude      != null ? parseFloat(latitude)  : existing.latitude,
            longitude:     longitude     != null ? parseFloat(longitude) : existing.longitude,
            address:       address       !== undefined ? address       : existing.address,
            phone:         phone         !== undefined ? phone         : existing.phone,
            opening_hours: opening_hours !== undefined ? opening_hours : existing.opening_hours,
            updated_at: new Date().toISOString()
        };
        await col.updateOne({ id: req.params.id }, { $set: updated });
        res.json({ data: updated });
    } catch (err) { next(err); }
});

// DELETE /api/map-points/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const db = await getDB();
        const result = await db.collection('map_points').deleteOne({ id: req.params.id });
        if (result.deletedCount === 0) return res.status(404).json({ error: true, message: 'Ponto não encontrado.' });
        res.json({ message: 'Ponto excluído com sucesso.' });
    } catch (err) { next(err); }
});

module.exports = router;
