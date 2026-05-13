const express = require('express');
const router = express.Router();
const { getDB, generateNumericId } = require('../database/db');

const PROJ = { projection: { _id: 0 } };

// GET /api/useful-info
router.get('/', async (req, res, next) => {
    try {
        const { category } = req.query;
        const db = await getDB();
        let items = await db.collection('useful_info').find({}, PROJ).toArray();
        if (category) items = items.filter(i => i.category === category);
        items = items.sort((a, b) => (a.order_index || 0) - (b.order_index || 0) || a.title.localeCompare(b.title));
        res.json({ data: items, total: items.length });
    } catch (err) { next(err); }
});

// GET /api/useful-info/:id
router.get('/:id', async (req, res, next) => {
    try {
        const db = await getDB();
        const item = await db.collection('useful_info').findOne({ id: req.params.id }, PROJ);
        if (!item) return res.status(404).json({ error: true, message: 'Informação não encontrada.' });
        res.json({ data: item });
    } catch (err) { next(err); }
});

// POST /api/useful-info
router.post('/', async (req, res, next) => {
    try {
        const { category, title, content, phone, icon_name, order_index } = req.body;
        if (!category || !title || !content) {
            return res.status(400).json({ error: true, message: 'Campos obrigatórios: category, title, content.' });
        }
        const db = await getDB();
        const col = db.collection('useful_info');
        const now = new Date().toISOString();
        const item = {
            id: await generateNumericId(col),
            category, title, content,
            phone: phone || null,
            icon_name: icon_name || null,
            order_index: order_index || 0,
            created_at: now, updated_at: now
        };
        await col.insertOne(item);
        const { _id, ...response } = item;
        res.status(201).json({ data: response });
    } catch (err) { next(err); }
});

// PUT /api/useful-info/:id
router.put('/:id', async (req, res, next) => {
    try {
        const db = await getDB();
        const col = db.collection('useful_info');
        const existing = await col.findOne({ id: req.params.id }, PROJ);
        if (!existing) return res.status(404).json({ error: true, message: 'Informação não encontrada.' });
        const { category, title, content, phone, icon_name, order_index } = req.body;
        const updated = {
            ...existing,
            category:    category    || existing.category,
            title:       title       || existing.title,
            content:     content     || existing.content,
            phone:       phone       !== undefined ? phone       : existing.phone,
            icon_name:   icon_name   !== undefined ? icon_name   : existing.icon_name,
            order_index: order_index != null       ? order_index : existing.order_index,
            updated_at: new Date().toISOString()
        };
        await col.updateOne({ id: req.params.id }, { $set: updated });
        res.json({ data: updated });
    } catch (err) { next(err); }
});

// DELETE /api/useful-info/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const db = await getDB();
        const result = await db.collection('useful_info').deleteOne({ id: req.params.id });
        if (result.deletedCount === 0) return res.status(404).json({ error: true, message: 'Informação não encontrada.' });
        res.json({ message: 'Informação excluída com sucesso.' });
    } catch (err) { next(err); }
});

module.exports = router;
