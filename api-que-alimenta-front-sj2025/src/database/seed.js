const { getDB } = require('./db');

async function seedDatabase() {
    const db = await getDB();
    const eventsCol = db.collection('events');

    const count = await eventsCol.countDocuments();
    if (count > 0) {
        console.log('ℹ️  Banco já possui dados. Seed ignorado.');
        return;
    }

    const now = new Date().toISOString();

    // Helper functions
    const getMesAbreviado = (dateString) => {
        if (!dateString) return '';
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const idx = parseInt(parts[1], 10) - 1;
            if (idx >= 0 && idx < 12) return meses[idx];
        }
        return '';
    };
    const getDia = (dateString) => {
        if (!dateString) return '';
        const parts = dateString.split('-');
        return parts.length === 3 ? parts[2] : '';
    };
    const getHorarioFormatado = (timeString) => {
        if (!timeString) return '';
        const parts = timeString.split(':');
        if (parts.length >= 2) {
            return parts[1] === '00' ? `${parts[0]}h` : `${parts[0]}h${parts[1]}`;
        }
        return timeString;
    };

    const rawEvents = [
        { id: '1',  artist: 'Wesley Safadão',   date: '2026-05-20', start: '20:00', end: '22:00', stage: 'Palco Principal',    type: 'forro',     color: '#E63946' },
        { id: '2',  artist: 'Flávio José',       date: '2026-05-20', start: '22:30', end: '00:30', stage: 'Palco Principal',    type: 'forro',     color: '#F4A261' },
        { id: '3',  artist: 'Padre Fábio de Melo',date:'2026-05-20', start: '18:00', end: '20:00', stage: 'Barracão Zé Bigode', type: 'gospel',    color: '#2A9D8F' },
        { id: '4',  artist: 'Jorge & Mateus',    date: '2026-05-21', start: '21:00', end: '23:00', stage: 'Palco Principal',    type: 'sertanejo', color: '#8338EC' },
        { id: '5',  artist: 'Elba Ramalho',      date: '2026-05-21', start: '19:00', end: '21:00', stage: 'Barracão Zé Bigode', type: 'forro',     color: '#FB8500' },
        { id: '6',  artist: 'Galinha Pintadinha', date: '2026-05-21', start: '16:00', end: '18:00', stage: 'Palco Principal',    type: 'infantil',  color: '#06D6A0' },
        { id: '7',  artist: 'Xand Avião',        date: '2026-05-22', start: '22:00', end: '00:00', stage: 'Palco Principal',    type: 'forro',     color: '#E63946' },
        { id: '8',  artist: 'Gusttavo Lima',     date: '2026-05-22', start: '20:00', end: '22:00', stage: 'Palco Principal',    type: 'sertanejo', color: '#7209B7' },
        { id: '9',  artist: 'Fernandinho',       date: '2026-05-22', start: '17:00', end: '19:00', stage: 'Barracão Zé Bigode', type: 'gospel',    color: '#4CC9F0' },
        { id: '10', artist: 'Forró do Muído',    date: '2026-05-22', start: '00:30', end: '02:30', stage: 'Barracão Zé Bigode', type: 'forro',     color: '#F72585' },
    ];

    const events = rawEvents.map(e => ({
        id: e.id,
        artist: e.artist, date: e.date,
        start_time: e.start, end_time: e.end,
        dia: getDia(e.date), mes: getMesAbreviado(e.date),
        horario: getHorarioFormatado(e.start),
        gallery: [], stage: e.stage, type: e.type,
        description: `Show de ${e.artist} no ${e.stage}`,
        image_url: null, card_color: e.color,
        status: 'upcoming', created_at: now, updated_at: now
    }));

    await eventsCol.insertMany(events);

    await db.collection('venues').insertMany([
        { id: '11', name: 'Barraca do Zé', type: 'comida', latitude: -11.3040, longitude: -41.8555, address: 'Rua das Flores, 10', phone: '(74) 99999-0001', horario: '17h-02h', patrocinado: false, description: 'Comida típica nordestina', created_at: now, updated_at: now },
        { id: '12', name: 'Bar da Festa', type: 'bebida', latitude: -11.3035, longitude: -41.8545, address: 'Av. Principal, 50', phone: '(74) 99999-0002', horario: '18h-03h', patrocinado: true, description: 'Coquetéis e cervejas geladas', created_at: now, updated_at: now },
        { id: '13', name: 'Restaurante São João', type: 'restaurante', latitude: -11.3042, longitude: -41.8560, address: 'Rua do Cruzeiro, 22', phone: '(74) 99999-0003', horario: '12h-23h', patrocinado: false, description: 'Buffet completo', created_at: now, updated_at: now },
    ]);

    await db.collection('map_points').insertMany([
        { id: '14', name: 'UPA Central', category: 'saude', latitude: -11.3050, longitude: -41.8570, address: 'Rua da Saúde, 100', phone: '192', opening_hours: '24h', created_at: now, updated_at: now },
        { id: '15', name: 'Posto da PM', category: 'seguranca', latitude: -11.3038, longitude: -41.8549, address: 'Praça Humberto Souto', phone: '190', opening_hours: '24h', created_at: now, updated_at: now },
        { id: '16', name: 'Banheiros Módulo A', category: 'banheiro', latitude: -11.3036, longitude: -41.8547, address: 'Área do Palco Principal', phone: null, opening_hours: '17h-03h', created_at: now, updated_at: now },
        { id: '17', name: 'Palco Principal', category: 'palco', latitude: -11.3038, longitude: -41.8549, address: 'Praça Humberto Souto', phone: null, opening_hours: '18h-02h', created_at: now, updated_at: now },
    ]);

    await db.collection('useful_info').insertMany([
        { id: '18', category: 'saude', title: 'Pronto-Socorro', content: 'UPA Central, Rua da Saúde, 100. Atendimento 24h durante o evento.', phone: '192', icon_name: 'medical-bag', order_index: 1, created_at: now, updated_at: now },
        { id: '19', category: 'seguranca', title: 'Polícia Militar', content: 'Posto avançado na Praça Humberto Souto. Em caso de emergência ligue 190.', phone: '190', icon_name: 'shield', order_index: 2, created_at: now, updated_at: now },
        { id: '20', category: 'regras', title: 'Itens Proibidos', content: 'Não é permitido: bebidas em garrafas de vidro, fogos de artifício, armas brancas.', phone: null, icon_name: 'alert-circle', order_index: 3, created_at: now, updated_at: now },
        { id: '21', category: 'acessibilidade', title: 'Acessibilidade', content: 'Rampas de acesso, banheiros adaptados e área reservada para cadeirantes ao lado do palco.', phone: null, icon_name: 'wheelchair', order_index: 4, created_at: now, updated_at: now },
    ]);

    console.log('✅ Seed executado: 10 eventos, 3 venues, 4 pontos, 4 infos úteis.');
}

module.exports = { seedDatabase };
