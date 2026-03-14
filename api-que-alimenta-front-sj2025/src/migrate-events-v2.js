const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../sj2026.json');

try {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

    if (data.events && Array.isArray(data.events)) {
        data.events = data.events.map(event => {
            // Remove old fields
            delete event.title;
            delete event.circuit;
            delete event.location;
            delete event.latitude;
            delete event.longitude;

            // Map single gif string to a gallery array if needed
            let gallery = [];
            if (event.gif) {
                gallery.push(event.gif);
            }
            delete event.gif;

            // Force stage to one of the matching options if it's currently something else
            let stage = event.stage || 'Palco Principal';
            if (stage.toLowerCase().includes('litorânea')) {
                stage = 'Barracão Zé Bigode';
            } else if (stage.toLowerCase().includes('infantil') || stage.toLowerCase().includes('gospel')) {
                stage = 'Palco Principal'; // default mapping for unknown stages
            }

            return {
                ...event,
                stage: stage,
                gallery: gallery
            };
        });

        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
        console.log('Migração de limpeza concluída com sucesso!');
    } else {
        console.log('Nenhum evento encontrado para migrar.');
    }
} catch (error) {
    console.error('Erro na migração:', error);
}
