/**
 * MongoDB Atlas adapter.
 * Substitui o adaptador de arquivo JSON.
 * Conexão singleton reutilizada em toda a aplicação.
 */
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI não definida no .env');

let _db = null;

async function getDB() {
    if (_db) return _db;
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
    await client.connect();
    _db = client.db('sj2026');
    console.log('✅ Conectado ao MongoDB Atlas');
    return _db;
}

/**
 * Gera um ID numérico sequencial dentro de uma coleção.
 * @param {import('mongodb').Collection} collection
 */
async function generateNumericId(collection) {
    const docs = await collection.find({}, { projection: { id: 1, _id: 0 } }).toArray();
    let maxId = 0;
    docs.forEach(doc => {
        const n = parseInt(doc.id, 10);
        if (!isNaN(n) && n > maxId) maxId = n;
    });
    return String(maxId + 1);
}

module.exports = { getDB, generateNumericId };
