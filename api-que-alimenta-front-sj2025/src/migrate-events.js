const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../sj2026.json');

function getMesAbreviado(dateString) {
    if (!dateString) return '';
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const parts = dateString.split('-');
    if (parts.length === 3) {
        const monthIndex = parseInt(parts[1], 10) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
            return meses[monthIndex];
        }
    }
    return '';
}

function getDia(dateString) {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return parts[2];
    }
    return '';
}

function getHorarioFormatado(timeString) {
    if (!timeString) return '';
    const parts = timeString.split(':');
    if (parts.length >= 2) {
        const h = parts[0];
        const m = parts[1];
        if (m === '00') {
            return `${h}h`;
        } else {
            return `${h}h${m}`;
        }
    }
    return timeString;
}

try {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    
    if (data.events && Array.isArray(data.events)) {
        data.events = data.events.map(event => {
            return {
                ...event,
                dia: getDia(event.date),
                mes: getMesAbreviado(event.date),
                horario: getHorarioFormatado(event.start_time),
                gif: event.gif || ""
            };
        });
        
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
        console.log('Migração concluída com sucesso!');
    } else {
        console.log('Nenhum evento encontrado para migrar.');
    }
} catch (error) {
    console.error('Erro na migração:', error);
}
