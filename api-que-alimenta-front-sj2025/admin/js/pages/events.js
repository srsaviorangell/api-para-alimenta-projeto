// ── Events List Page ────────────────────────────────────────
const typeLabels = { forro: 'Forró', sertanejo: 'Sertanejo', gospel: 'Gospel', infantil: 'Infantil', outros: 'Outros' };
const circuitLabels = { praca: 'Praça', centro: 'Centro', litoranea: 'Litorânea' };
const statusLabels = { upcoming: 'Em breve', live: 'Ao Vivo', finished: 'Encerrado' };

async function renderEvents() {
  document.getElementById('topbarTitle').textContent = 'Eventos';
  const content = document.getElementById('content');
  content.innerHTML = `<div class="loading-screen"><div class="spinner"></div><p>Carregando...</p></div>`;

  let filters = { search: '', circuit: '', type: '', date: '' };
  let allEvents = [];

  async function loadEvents() {
    const params = new URLSearchParams({ limit: 500 });
    if (filters.circuit) params.set('circuit', filters.circuit);
    if (filters.type) params.set('type', filters.type);
    if (filters.date) params.set('date', filters.date);
    if (filters.search) params.set('search', filters.search);
    const res = await api.get('/events?' + params.toString());
    allEvents = res.data || [];
    // update badge
    const badge = document.getElementById('badge-events');
    if (badge) badge.textContent = allEvents.length;
  }

  function renderTable() {
    const tbody = document.getElementById('events-tbody');
    if (!tbody) return;
    if (!allEvents.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">🎵</div><div class="empty-title">Nenhum evento encontrado</div></div></td></tr>`;
      return;
    }
    tbody.innerHTML = allEvents.map(e => `
      <tr>
        <td class="td-mono">${e.id.substring(0, 8)}…</td>
        <td class="td-bold">${e.artist}</td>
        <td>${e.title}</td>
        <td>${fmtDate(e.date)}</td>
        <td>${e.start_time}${e.end_time ? `<br><small style="color:var(--text-muted)">→ ${e.end_time}</small>` : ''}</td>
        <td><span class="badge badge-${e.circuit}">${circuitLabels[e.circuit] || e.circuit}</span></td>
        <td><span class="badge badge-${e.type}">${typeLabels[e.type] || e.type}</span></td>
        <td><span class="badge badge-${e.status}">${statusLabels[e.status] || e.status}</span></td>
        <td>
          <div class="actions-row">
            <button class="btn-icon success" title="Editar" onclick="Router.go('event-form',{id:'${e.id}'})">✏️</button>
            <button class="btn-icon" title="Duplicar" onclick="duplicateEvent('${e.id}')">📋</button>
            <button class="btn-icon danger" title="Excluir" onclick="deleteEvent('${e.id}','${e.artist} – ${e.title.replace(/'/g, "'")}')">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  try {
    await loadEvents();
    content.innerHTML = `
      <div class="page-header">
        <div>
          <div class="page-title">🎵 Gerenciar Eventos</div>
          <div class="page-subtitle">${allEvents.length} evento(s) cadastrado(s)</div>
        </div>
        <div class="actions-row">
          <button class="btn btn-ghost btn-sm" onclick="downloadUrl('/api/events/export/json','sj2026-events.json')">⬇️ JSON</button>
          <button class="btn btn-ghost btn-sm" onclick="downloadUrl('/api/events/export/csv','sj2026-events.csv')">⬇️ CSV</button>
          <button class="btn btn-primary" onclick="Router.go('event-form')">+ Novo Evento</button>
        </div>
      </div>

      <div class="filter-bar">
        <div class="search-wrap">
          <input id="search-input" class="form-input" placeholder="Buscar por artista, título ou ID..." value="${filters.search}" />
        </div>
        <select id="filter-circuit" class="form-input">
          <option value="">Todos os Circuitos</option>
          <option value="praca">Praça</option>
          <option value="centro">Centro</option>
          <option value="litoranea">Litorânea</option>
        </select>
        <select id="filter-type" class="form-input">
          <option value="">Todos os Tipos</option>
          <option value="forro">Forró</option>
          <option value="sertanejo">Sertanejo</option>
          <option value="gospel">Gospel</option>
          <option value="infantil">Infantil</option>
          <option value="outros">Outros</option>
        </select>
        <input id="filter-date" class="form-input" type="date" style="min-width:160px" title="Filtrar por data" />
        <button class="btn btn-ghost btn-sm" id="clear-filters">✕ Limpar</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Artista</th><th>Título</th><th>Data</th>
              <th>Horário</th><th>Circuito</th><th>Tipo</th><th>Status</th><th>Ações</th>
            </tr>
          </thead>
          <tbody id="events-tbody"></tbody>
        </table>
      </div>
    `;

    renderTable();

    // Wire up filters
    let searchTimer;
    document.getElementById('search-input').addEventListener('input', e => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(async () => {
        filters.search = e.target.value;
        await loadEvents(); renderTable();
      }, 350);
    });

    ['filter-circuit', 'filter-type', 'filter-date'].forEach(id => {
      document.getElementById(id).addEventListener('change', async e => {
        const key = id.replace('filter-', '');
        filters[key] = e.target.value;
        await loadEvents(); renderTable();
      });
    });

    document.getElementById('clear-filters').addEventListener('click', async () => {
      filters = { search: '', circuit: '', type: '', date: '' };
      document.getElementById('search-input').value = '';
      document.getElementById('filter-circuit').value = '';
      document.getElementById('filter-type').value = '';
      document.getElementById('filter-date').value = '';
      await loadEvents(); renderTable();
    });

  } catch (e) {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><div class="empty-title">Erro ao carregar eventos</div><div class="empty-sub">${e.message}</div></div>`;
  }
}

async function deleteEvent(id, name) {
  Confirm.show(`Excluir evento?`, `Tem certeza que deseja excluir: <strong>${name}</strong>? Esta ação não pode ser desfeita.`, async () => {
    try {
      await api.delete(`/events/${id}`);
      Toast.success('Evento excluído com sucesso!');
      renderEvents();
    } catch (e) { Toast.error(e.message); }
  });
}

async function duplicateEvent(id) {
  try {
    await api.post(`/events/${id}/duplicate`);
    Toast.success('Evento duplicado!');
    renderEvents();
  } catch (e) { Toast.error(e.message); }
}
