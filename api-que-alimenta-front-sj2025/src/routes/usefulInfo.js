const express = require('express');
const router = express.Router();
const { loadDB, saveDB, generateNumericId } = require('../database/db');

router.get('/', (req, res) => {
    const { category } = req.query;
    const db = loadDB();
    let items = db.useful_info;
    if (category) items = items.filter(i => i.category === category);
    items = [...items].sort((a, b) => (a.order_index || 0) - (b.order_index || 0) || a.title.localeCompare(b.title));
    res.json({ data: items, total: items.length });
});

router.get('/:id', (req, res) => {
    const db = loadDB();
    const item = db.useful_info.find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: true, message: 'Informação não encontrada.' });
    res.json({ data: item });
});

router.post('/', (req, res) => {
    const { category, title, content, phone, icon_name, order_index } = req.body;
    if (!category || !title || !content) {
        return res.status(400).json({ error: true, message: 'Campos obrigatórios: category, title, content.' });
    }
    const db = loadDB();
    const now = new Date().toISOString();
    const item = { id: generateNumericId(db), category, title, content, phone: phone || null, icon_name: icon_name || null, order_index: order_index || 0, created_at: now, updated_at: now };
    db.useful_info.push(item);
    saveDB(db);
    res.status(201).json({ data: item });
});

router.put('/:id', (req, res) => {
    const db = loadDB();
    const idx = db.useful_info.findIndex(i => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: true, message: 'Informação não encontrada.' });
    const e = db.useful_info[idx];
    const { category, title, content, phone, icon_name, order_index } = req.body;
    db.useful_info[idx] = { ...e, category: category || e.category, title: title || e.title, content: content || e.content, phone: phone !== undefined ? phone : e.phone, icon_name: icon_name !== undefined ? icon_name : e.icon_name, order_index: order_index != null ? order_index : e.order_index, updated_at: new Date().toISOString() };
    saveDB(db);
    res.json({ data: db.useful_info[idx] });
});

router.delete('/:id', (req, res) => {
    const db = loadDB();
    const idx = db.useful_info.findIndex(i => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: true, message: 'Informação não encontrada.' });
    db.useful_info.splice(idx, 1);
    saveDB(db);
    res.json({ message: 'Informação excluída com sucesso.' });
});

module.exports = router;
