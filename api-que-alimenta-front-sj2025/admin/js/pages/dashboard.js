// ── Dashboard Page ──────────────────────────────────────────
let _dashAllEvents = [];
let _dashVenues = [];
let _dashMap = [];

async function renderDashboard() {
  document.getElementById('topbarTitle').textContent = 'Dashboard';
  const content = document.getElementById('content');
  content.innerHTML = '<div class="loading-screen"><div class="spinner"></div><p>Carregando...</p></div>';

  try {
    const [eventsRes, venuesRes, mapRes] = await Promise.all([
      api.get('/events?limit=500'),
      api.get('/venues'),
      api.get('/map-points'),
    ]);

    _dashAllEvents = eventsRes.data || [];
    _dashVenues = venuesRes.data || [];
    _dashMap = mapRes.data || [];

    const total = _dashAllEvents.length;
    const upcoming = _dashAllEvents.filter(e => e.status === 'upcoming').length;
    const live = _dashAllEvents.filter(e => e.status === 'live').length;

    // Dynamic date grouping
    const dateCount = {};
    _dashAllEvents.forEach(e => {
      if (e.date) dateCount[e.date] = (dateCount[e.date] || 0) + 1;
    });
    const sortedDates = Object.keys(dateCount).sort();

    // Type grouping
    const byType = {};
    _dashAllEvents.forEach(e => { if (e.type) byType[e.type] = (byType[e.type] || 0) + 1; });

    const palette = ['#a855f7', '#eab308', '#4ade80', '#fb923c', '#60a5fa', '#ec4899', '#f87171', '#34d399'];
    const kpiColors = ['yellow', 'pink', 'blue', 'orange', 'purple', 'green'];

    // Build date KPI cards (no complex template inside data attrs)
    const dateKpiCards = sortedDates.map((date, i) => {
      const count = dateCount[date];
      const colorClass = kpiColors[i % kpiColors.length];
      return `
              <div class="kpi-card ${colorClass} kpi-clickable" id="kpi-date-${i}" data-action="dayDash" data-date="${date}">
                <div class="kpi-icon">📅</div>
                <div class="kpi-info">
                  <div class="kpi-value">${count}</div>
                  <div class="kpi-label">${fmtDate(date)}</div>
                </div>
                <div class="kpi-hint">Ver dia →</div>
              </div>`;
    }).join('');

    const nextEvents = _dashAllEvents.filter(e => e.status === 'upcoming').slice(0, 5);

    content.innerHTML = `
      <div class="page-header">
        <div>
          <div class="page-title">📊 Dashboard</div>
          <div class="page-subtitle">Visão geral — São João de Irecê</div>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card purple kpi-clickable" id="kpi-total" data-action="eventsList">
          <div class="kpi-icon">🎵</div>
          <div class="kpi-info">
            <div class="kpi-value">${total}</div>
            <div class="kpi-label">Total de Eventos</div>
          </div>
          <div class="kpi-hint">Ver todos →</div>
        </div>

        ${dateKpiCards}

        <div class="kpi-card green kpi-clickable" id="kpi-live" data-action="eventsLive">
          <div class="kpi-icon">🔴</div>
          <div class="kpi-info">
            <div class="kpi-value">${live}</div>
            <div class="kpi-label">Ao Vivo Agora</div>
          </div>
          <div class="kpi-hint">Ver ao vivo →</div>
        </div>

        <div class="kpi-card orange kpi-clickable" id="kpi-upcoming" data-action="eventsUpcoming">
          <div class="kpi-icon">⏰</div>
          <div class="kpi-info">
            <div class="kpi-value">${upcoming}</div>
            <div class="kpi-label">Próximos Eventos</div>
          </div>
          <div class="kpi-hint">Ver próximos →</div>
        </div>

        <div class="kpi-card purple kpi-clickable" id="kpi-venues" data-action="venuesDash">
          <div class="kpi-icon">🍺</div>
          <div class="kpi-info">
            <div class="kpi-value">${_dashVenues.length}</div>
            <div class="kpi-label">Barracas</div>
          </div>
          <div class="kpi-hint">Ver dashboard →</div>
        </div>

        <div class="kpi-card blue kpi-clickable" id="kpi-map" data-action="mapDash">
          <div class="kpi-icon">📍</div>
          <div class="kpi-info">
            <div class="kpi-value">${_dashMap.length}</div>
            <div class="kpi-label">Pontos de Apoio</div>
          </div>
          <div class="kpi-hint">Ver dashboard →</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="panel">
          <div class="panel-title"><span class="dot purple"></span>Eventos por Tipo</div>
          <div class="chart-wrap"><canvas id="typeChart"></canvas></div>
        </div>
        <div class="panel">
          <div class="panel-title"><span class="dot yellow"></span>Eventos por Dia</div>
          <div class="chart-wrap"><canvas id="dayChart"></canvas></div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title"><span class="dot purple"></span>Próximos Eventos</div>
        ${nextEvents.length ? `
          <div class="table-wrap">
            <table>
              <thead><tr><th>Artista</th><th>Título</th><th>Data</th><th>Hora</th><th>Circuito</th><th>Tipo</th></tr></thead>
              <tbody>
                ${nextEvents.map(e => `
                  <tr style="cursor:pointer" onclick="renderDayDash('${e.date}')">
                    <td class="td-bold">${e.artist || '—'}</td>
                    <td>${e.title || '—'}</td>
                    <td>${fmtDate(e.date)}</td>
                    <td>${e.start_time || ''}${e.end_time ? ' – ' + e.end_time : ''}</td>
                    <td><span class="badge badge-${e.circuit}">${e.circuit || '—'}</span></td>
                    <td><span class="badge badge-${e.type}">${e.type || '—'}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : '<div class="empty-state"><div class="empty-icon">🎉</div><div class="empty-title">Nenhum evento próximo</div></div>'}
      </div>

      <!-- Floating tooltip -->
      <div id="kpiTooltip" style="
        position:fixed;display:none;z-index:9999;
        background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);
        padding:0.9rem 1rem;min-width:220px;max-width:290px;
        box-shadow:0 8px 32px rgba(0,0,0,0.5);
        pointer-events:none;font-size:0.82rem;color:var(--text-secondary);
      "></div>
    `;

    // ── Attach tooltips via JS (safe from escaping issues) ──
    const tooltip = document.getElementById('kpiTooltip');

    // Build tooltip content functions
    function buildDateTooltip(date) {
      const evs = _dashAllEvents.filter(e => e.date === date);
      const el = document.createElement('div');
      const title = document.createElement('div');
      title.style.cssText = 'font-weight:700;font-size:0.85rem;margin-bottom:0.5rem';
      title.textContent = '📅 ' + fmtDate(date);
      el.appendChild(title);
      evs.slice(0, 4).forEach(e => {
        const row = document.createElement('div');
        row.style.cssText = 'padding:0.25rem 0;border-bottom:1px solid rgba(255,255,255,0.06)';
        row.innerHTML = '<b>' + (e.artist || e.title || '—') + '</b><br><span style="color:var(--text-muted);font-size:0.7rem">' + (e.start_time || '') + (e.stage ? ' · ' + e.stage : '') + '</span>';
        el.appendChild(row);
      });
      if (evs.length > 4) {
        const more = document.createElement('div');
        more.style.cssText = 'color:var(--accent);font-size:0.72rem;margin-top:0.4rem';
        more.textContent = '+' + (evs.length - 4) + ' mais...';
        el.appendChild(more);
      }
      const hint = document.createElement('div');
      hint.style.cssText = 'color:var(--accent);margin-top:0.5rem;font-size:0.72rem';
      hint.textContent = 'Clique para o dashboard do dia →';
      el.appendChild(hint);
      return el.innerHTML;
    }

    function buildSimpleTooltip(icon, title, lines, hint) {
      const parts = ['<div style="font-weight:700;font-size:0.85rem;margin-bottom:0.5rem">' + icon + ' ' + title + '</div>'];
      lines.forEach(l => { parts.push('<div style="padding:0.2rem 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:0.78rem">' + l + '</div>'); });
      if (hint) parts.push('<div style="color:var(--accent);font-size:0.72rem;margin-top:0.5rem">' + hint + '</div>');
      return parts.join('');
    }

    // Assign tooltip content
    const kpiTotal = document.getElementById('kpi-total');
    if (kpiTotal) kpiTotal._tipHtml = buildSimpleTooltip('🎵', 'Total de Eventos', ['Todos os eventos cadastrados'], 'Ver lista completa →');

    const kpiLive = document.getElementById('kpi-live');
    if (kpiLive) {
      const liveEvs = _dashAllEvents.filter(e => e.status === 'live').slice(0, 4);
      kpiLive._tipHtml = buildSimpleTooltip('🔴', 'Ao Vivo Agora',
        liveEvs.length ? liveEvs.map(e => (e.artist || e.title || '—')) : ['Nenhum evento ao vivo'],
        'Ver eventos ao vivo →');
    }

    const kpiUpcoming = document.getElementById('kpi-upcoming');
    if (kpiUpcoming) kpiUpcoming._tipHtml = buildSimpleTooltip('⏰', 'Próximos Eventos', [upcoming + ' evento(s) agendados'], 'Ver próximos →');

    const kpiVenues = document.getElementById('kpi-venues');
    if (kpiVenues) {
      kpiVenues._tipHtml = buildSimpleTooltip('🍺', 'Barracas & Parceiros',
        _dashVenues.slice(0, 4).map(v => v.name + (v.type ? ' · ' + v.type : '')),
        'Ver dashboard de barracas →');
    }

    const kpiMapEl = document.getElementById('kpi-map');
    if (kpiMapEl) {
      kpiMapEl._tipHtml = buildSimpleTooltip('📍', 'Pontos de Apoio',
        _dashMap.slice(0, 4).map(p => p.name + (p.category ? ' · ' + p.category : '')),
        'Ver dashboard de pontos →');
    }

    sortedDates.forEach((date, i) => {
      const card = document.getElementById('kpi-date-' + i);
      if (card) card._tipHtml = buildDateTooltip(date);
    });

    // ── Wire hover + click on all clickable cards ────────
    function positionTooltip(e) {
      const x = e.clientX + 16;
      const y = e.clientY - 10;
      const tw = tooltip.offsetWidth || 240;
      const th = tooltip.offsetHeight || 120;
      tooltip.style.left = (x + tw > window.innerWidth ? e.clientX - tw - 8 : x) + 'px';
      tooltip.style.top = (y + th > window.innerHeight ? e.clientY - th - 8 : y) + 'px';
    }

    document.querySelectorAll('.kpi-clickable').forEach(card => {
      card.addEventListener('mouseenter', e => {
        if (card._tipHtml) {
          tooltip.innerHTML = card._tipHtml;
          tooltip.style.display = 'block';
          positionTooltip(e);
        }
      });
      card.addEventListener('mousemove', positionTooltip);
      card.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });

      card.addEventListener('click', () => {
        tooltip.style.display = 'none';
        const action = card.dataset.action;
        if (action === 'dayDash') renderDayDash(card.dataset.date);
        else if (action === 'eventsList') Router.go('events');
        else if (action === 'eventsLive') renderStatusDash('live');
        else if (action === 'eventsUpcoming') renderStatusDash('upcoming');
        else if (action === 'venuesDash') renderVenuesDash();
        else if (action === 'mapDash') renderMapDash();
      });
    });

    // ── Charts ──────────────────────────────────────────
    const typeKeys = Object.keys(byType);
    if (typeKeys.length) {
      new Chart(document.getElementById('typeChart'), {
        type: 'doughnut',
        data: {
          labels: typeKeys,
          datasets: [{ data: typeKeys.map(k => byType[k]), backgroundColor: typeKeys.map((_, i) => palette[i % palette.length]), borderWidth: 2, borderColor: '#1a1a35' }]
        },
        options: { plugins: { legend: { position: 'bottom', labels: { color: '#a09dc0', font: { size: 11 } } } }, cutout: '65%', maintainAspectRatio: false }
      });
    }

    if (sortedDates.length) {
      new Chart(document.getElementById('dayChart'), {
        type: 'bar',
        data: {
          labels: sortedDates.map(d => fmtDate(d)),
          datasets: [{ label: 'Eventos', data: sortedDates.map(d => dateCount[d]), backgroundColor: sortedDates.map((_, i) => palette[i % palette.length]), borderRadius: 8 }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#a09dc0' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { ticks: { color: '#a09dc0', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } }
          },
          maintainAspectRatio: false
        }
      });
    }

  } catch (e) {
    content.innerHTML = '<div class="empty-state"><div class="empty-icon">❌</div><div class="empty-title">Erro ao carregar dashboard</div><div class="empty-sub">' + e.message + '</div></div>';
  }
}

// ── Day Drill-Down Dashboard ─────────────────────────────────
function renderDayDash(date) {
  const content = document.getElementById('content');
  document.getElementById('topbarTitle').textContent = 'Dia ' + fmtDate(date);
  const evs = _dashAllEvents.filter(e => e.date === date).sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
  const byCircuit = {};
  evs.forEach(e => { if (e.circuit) byCircuit[e.circuit] = (byCircuit[e.circuit] || 0) + 1; });
  const byType = {};
  evs.forEach(e => { if (e.type) byType[e.type] = (byType[e.type] || 0) + 1; });
  const palette = ['#a855f7', '#eab308', '#60a5fa', '#fb923c', '#4ade80', '#ec4899'];

  const circuitKpis = Object.entries(byCircuit).map(([c, n], i) =>
    '<div class="kpi-card blue"><div class="kpi-icon">🎪</div><div class="kpi-info"><div class="kpi-value">' + n + '</div><div class="kpi-label">' + c + '</div></div></div>'
  ).join('');
  const typeKpis = Object.entries(byType).map(([t, n], i) =>
    '<div class="kpi-card yellow"><div class="kpi-icon">🎸</div><div class="kpi-info"><div class="kpi-value">' + n + '</div><div class="kpi-label">' + t + '</div></div></div>'
  ).join('');

  const rows = evs.map(e =>
    '<tr>' +
    '<td class="td-mono">' + (e.start_time || '—') + (e.end_time ? ' – ' + e.end_time : '') + '</td>' +
    '<td class="td-bold">' + (e.artist || '—') + '</td>' +
    '<td>' + (e.title || '—') + '</td>' +
    '<td><span class="badge badge-' + (e.circuit || '') + '">' + (e.circuit || '—') + '</span></td>' +
    '<td>' + (e.stage || '—') + '</td>' +
    '<td><span class="badge badge-' + (e.type || '') + '">' + (e.type || '—') + '</span></td>' +
    '<td><span class="badge badge-' + e.status + '">' + ({ upcoming: 'Em Breve', live: 'Ao Vivo', finished: 'Encerrado' }[e.status] || e.status) + '</span></td>' +
    '</tr>'
  ).join('');

  content.innerHTML =
    '<div class="page-header">' +
    '<div><div class="page-title">📅 ' + fmtDate(date) + '</div><div class="page-subtitle">' + evs.length + ' evento(s) neste dia</div></div>' +
    '<button class="btn btn-ghost" onclick="renderDashboard()">← Dashboard</button>' +
    '</div>' +
    '<div class="kpi-grid">' +
    '<div class="kpi-card purple"><div class="kpi-icon">🎵</div><div class="kpi-info"><div class="kpi-value">' + evs.length + '</div><div class="kpi-label">Eventos no dia</div></div></div>' +
    circuitKpis + typeKpis +
    '</div>' +
    '<div class="panel">' +
    '<div class="panel-title"><span class="dot purple"></span>Programação — ' + fmtDate(date) + '</div>' +
    (evs.length
      ? '<div class="table-wrap"><table><thead><tr><th>Hora</th><th>Artista</th><th>Título</th><th>Circuito</th><th>Palco</th><th>Tipo</th><th>Status</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
      : '<div class="empty-state"><div class="empty-icon">📅</div><div class="empty-title">Nenhum evento para este dia</div></div>') +
    '</div>';
}

// ── Status Drill-Down ────────────────────────────────────────
function renderStatusDash(status) {
  const labels = { live: '🔴 Ao Vivo Agora', upcoming: '⏰ Próximos Eventos', finished: '✅ Encerrados' };
  const content = document.getElementById('content');
  const evs = _dashAllEvents.filter(e => e.status === status)
    .sort((a, b) => (a.date || '').localeCompare(b.date || '') || (a.start_time || '').localeCompare(b.start_time || ''));
  document.getElementById('topbarTitle').textContent = labels[status] || status;

  const rows = evs.map(e =>
    '<tr><td>' + fmtDate(e.date) + '</td><td class="td-mono">' + (e.start_time || '—') + '</td>' +
    '<td class="td-bold">' + (e.artist || '—') + '</td><td>' + (e.title || '—') + '</td>' +
    '<td><span class="badge badge-' + (e.circuit || '') + '">' + (e.circuit || '—') + '</span></td>' +
    '<td>' + (e.stage || '—') + '</td></tr>'
  ).join('');

  content.innerHTML =
    '<div class="page-header"><div><div class="page-title">' + labels[status] + '</div><div class="page-subtitle">' + evs.length + ' evento(s)</div></div>' +
    '<button class="btn btn-ghost" onclick="renderDashboard()">← Dashboard</button></div>' +
    '<div class="panel">' +
    (evs.length
      ? '<div class="table-wrap"><table><thead><tr><th>Data</th><th>Hora</th><th>Artista</th><th>Título</th><th>Circuito</th><th>Palco</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
      : '<div class="empty-state"><div class="empty-icon">🎉</div><div class="empty-title">Nenhum evento</div></div>') +
    '</div>';
}

// ── Venues Drill-Down ────────────────────────────────────────
function renderVenuesDash() {
  const content = document.getElementById('content');
  document.getElementById('topbarTitle').textContent = 'Barracas Dashboard';
  const byType = {};
  _dashVenues.forEach(v => { const t = v.type || 'outros'; byType[t] = (byType[t] || 0) + 1; });
  const patrocinadas = _dashVenues.filter(v => v.patrocinado).length;

  const typeKpis = Object.entries(byType).map(([t, n]) =>
    '<div class="kpi-card blue"><div class="kpi-icon">🏷️</div><div class="kpi-info"><div class="kpi-value">' + n + '</div><div class="kpi-label">' + t + '</div></div></div>'
  ).join('');
  const rows = _dashVenues.map(v =>
    '<tr><td class="td-bold">' + (v.name || '—') + '</td><td>' + (v.type || '—') + '</td>' +
    '<td>' + (v.address || '—') + '</td><td>' + (v.horario || '—') + '</td>' +
    '<td>' + (v.phone || '—') + '</td><td>' + (v.patrocinado ? '⭐ Sim' : 'Não') + '</td></tr>'
  ).join('');

  content.innerHTML =
    '<div class="page-header"><div><div class="page-title">🍺 Dashboard — Barracas</div><div class="page-subtitle">' + _dashVenues.length + ' barraca(s)</div></div>' +
    '<div style="display:flex;gap:0.5rem"><button class="btn btn-secondary btn-sm" onclick="Router.go(\'venues\')">Gerenciar</button>' +
    '<button class="btn btn-ghost" onclick="renderDashboard()">← Dashboard</button></div></div>' +
    '<div class="kpi-grid">' +
    '<div class="kpi-card purple"><div class="kpi-icon">🍺</div><div class="kpi-info"><div class="kpi-value">' + _dashVenues.length + '</div><div class="kpi-label">Total</div></div></div>' +
    '<div class="kpi-card yellow"><div class="kpi-icon">⭐</div><div class="kpi-info"><div class="kpi-value">' + patrocinadas + '</div><div class="kpi-label">Patrocinadas</div></div></div>' +
    typeKpis + '</div>' +
    '<div class="panel"><div class="panel-title"><span class="dot purple"></span>Lista de Barracas</div>' +
    (_dashVenues.length
      ? '<div class="table-wrap"><table><thead><tr><th>Nome</th><th>Tipo</th><th>Endereço</th><th>Horário</th><th>Telefone</th><th>Patrocinado</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
      : '<div class="empty-state"><div class="empty-icon">🍺</div><div class="empty-title">Nenhuma barraca</div></div>') +
    '</div>';
}

// ── Map Points Drill-Down ────────────────────────────────────
function renderMapDash() {
  const content = document.getElementById('content');
  document.getElementById('topbarTitle').textContent = 'Pontos de Apoio Dashboard';
  const byCat = {};
  _dashMap.forEach(p => { const c = p.category || 'outros'; byCat[c] = (byCat[c] || 0) + 1; });

  const catKpis = Object.entries(byCat).map(([c, n]) =>
    '<div class="kpi-card purple"><div class="kpi-icon">🏷️</div><div class="kpi-info"><div class="kpi-value">' + n + '</div><div class="kpi-label">' + c + '</div></div></div>'
  ).join('');
  const rows = _dashMap.map(p =>
    '<tr><td class="td-bold">' + (p.name || '—') + '</td><td>' + (p.category || '—') + '</td>' +
    '<td>' + (p.address || '—') + '</td><td>' + (p.phone || '—') + '</td><td>' + (p.opening_hours || '—') + '</td></tr>'
  ).join('');

  content.innerHTML =
    '<div class="page-header"><div><div class="page-title">📍 Dashboard — Pontos de Apoio</div><div class="page-subtitle">' + _dashMap.length + ' ponto(s)</div></div>' +
    '<div style="display:flex;gap:0.5rem"><button class="btn btn-secondary btn-sm" onclick="Router.go(\'mappoints\')">Gerenciar</button>' +
    '<button class="btn btn-ghost" onclick="renderDashboard()">← Dashboard</button></div></div>' +
    '<div class="kpi-grid">' +
    '<div class="kpi-card blue"><div class="kpi-icon">📍</div><div class="kpi-info"><div class="kpi-value">' + _dashMap.length + '</div><div class="kpi-label">Total</div></div></div>' +
    catKpis + '</div>' +
    '<div class="panel"><div class="panel-title"><span class="dot blue"></span>Lista de Pontos</div>' +
    (_dashMap.length
      ? '<div class="table-wrap"><table><thead><tr><th>Nome</th><th>Categoria</th><th>Endereço</th><th>Telefone</th><th>Horário</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
      : '<div class="empty-state"><div class="empty-icon">📍</div><div class="empty-title">Nenhum ponto</div></div>') +
    '</div>';
}

// ── Helpers ──────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—';
  const parts = d.split('-');
  if (parts.length !== 3) return d;
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}
