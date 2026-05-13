require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { runMigrations } = require('./src/database/migrations');
const { seedDatabase } = require('./src/database/seed');
const errorHandler = require('./src/middleware/errorHandler');

const eventsRouter    = require('./src/routes/events');
const venuesRouter    = require('./src/routes/venues');
const stagesRouter    = require('./src/routes/stages');
const mapPointsRouter = require('./src/routes/mapPoints');
const usefulInfoRouter= require('./src/routes/usefulInfo');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static Files ───────────────────────────────────────────────
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// ── API Routes ─────────────────────────────────────────────────
app.use('/api/events',      eventsRouter);
app.use('/api/venues',      venuesRouter);
app.use('/api/stages',      stagesRouter);
app.use('/api/map-points',  mapPointsRouter);
app.use('/api/useful-info', usefulInfoRouter);

// ── Health Check ────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'São João de Irecê 2026 API', version: '2.0.0', db: 'MongoDB Atlas', timestamp: new Date().toISOString() });
});

// ── Admin Redirect ──────────────────────────────────────────────
app.get('/', (req, res) => res.redirect('/admin'));

// ── Error Handler ───────────────────────────────────────────────
app.use(errorHandler);

// ── Init DB + Start Server ──────────────────────────────────────
async function init() {
    try {
        await runMigrations();
        await seedDatabase();
        app.listen(PORT, () => {
            console.log(`\n🎉 São João de Irecê 2026 API`);
            console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
            console.log(`🖥️  Painel Admin:        http://localhost:${PORT}/admin`);
            console.log(`📡 API Health:           http://localhost:${PORT}/api/health\n`);
        });
    } catch (err) {
        console.error('❌ Falha ao iniciar a API:', err);
        process.exit(1);
    }
}

init();
module.exports = app;
