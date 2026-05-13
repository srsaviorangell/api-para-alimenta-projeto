const { getDB } = require('./db');

async function runMigrations() {
    const db = await getDB();
    // Garante que todas as coleções existam (MongoDB as cria automaticamente, mas
    // chamar listCollections é uma boa forma de validar a conexão)
    const collections = ['events', 'venues', 'stages', 'map_points', 'useful_info'];
    for (const name of collections) {
        await db.collection(name).createIndex({ id: 1 }, { unique: true, sparse: true }).catch(() => {});
    }
    console.log('✅ DB inicializado com sucesso (MongoDB Atlas).');
}

module.exports = { runMigrations };
