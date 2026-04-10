// ── Locais Page ───────────────────────────────────────────────
async function renderStages() {
  document.getElementById('topbarTitle').textContent = 'Locais';
  const content = document.getElementById('content');
  content.innerHTML = `<div class="loading-screen"><div class="spinner"></div><p>Carregando...</p></div>`;

  let stages = [];
  let editingId = null;

  async function reload() {
    const res = await api.get('/stages');
    stages = res.data || [];
    renderPage();
  }

  function renderPage() {
    content.innerHTML = `
      <div class="page-header">
        <div>
          <div class="page-title">📍 Locais</div>
          <div class="page-subtitle">${stages.length} local(is) cadastrado(s)</div>
        </div>
        <button class="btn btn-primary" id="newStageBtn">+ Novo Local</button>
      </div>
      <div id="stageFormWrap" style="display:none;margin-bottom:1.5rem"></div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Endereço</th>
            <th>Capacidade</th>
            <th>Destaque</th>
            <th>Maps</th>
            <th>Ações</th>
          </tr></thead>
          <tbody id="stages-tbody">
            ${stages.length ? stages.map(s => `
              <tr>
                <td class="td-bold">${s.main ? '⭐ ' : ''}${s.name}</td>
                <td>${s.type || '—'}</td>
                <td>${s.location || '—'}</td>
                <td>${s.capacity != null ? Number(s.capacity).toLocaleString('pt-BR') + ' pessoas' : '—'}</td>
                <td>${s.main ? '<span style="color:var(--success)">✅ Sim</span>' : 'Não'}</td>
                <td>${s.maps_url
                  ? `<a href="${s.maps_url}" target="_blank" rel="noopener" style="color:var(--primary);text-decoration:none" title="Abrir mapa">🗺️ Ver</a>`
                  : '—'
                }</td>
                <td><div class="actions-row">
                  <button class="btn-icon success" onclick="editStage('${s.id}')" title="Editar">✏️</button>
                  <button class="btn-icon danger" onclick="deleteStage('${s.id}','${s.name.replace(/'/g, "&#39;")}')">🗑️</button>
                </div></td>
              </tr>`).join('') :
      `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📍</div><div class="empty-title">Nenhum local cadastrado</div></div></td></tr>`
    }
          </tbody>
        </table>
      </div>
    `;
    document.getElementById('newStageBtn').addEventListener('click', () => showStageForm(null));
  }

  function showStageForm(stage) {
    editingId = stage?.id || null;
    const v = (f, d = '') => stage?.[f] ?? d;
    const wrap = document.getElementById('stageFormWrap');
    wrap.style.display = 'block';
    wrap.innerHTML = `
      <div class="form-card">
        <div class="form-section-title" style="margin-bottom:1rem">${editingId ? '✏️ Editar' : '➕ Novo'} Local</div>
        <div class="form-grid">

          <div class="form-group">
            <label class="form-label">Nome *</label>
            <input id="sf-name" class="form-input" value="${v('name')}" placeholder="Ex: Palco Principal"/>
          </div>

          <div class="form-group">
            <label class="form-label">Tipo</label>
            <input id="sf-type" class="form-input" list="sf-type-list" value="${v('type')}" placeholder="Ex: Palco, Praça, Entrada..." autocomplete="off"/>
            <datalist id="sf-type-list">
              <option value="🎤 Palco">
              <option value="🏟️ Arena">
              <option value="🌳 Praça">
              <option value="🚪 Entrada">
              <option value="🅿️ Estacionamento">
              <option value="🚻 Banheiros">
              <option value="🏥 Posto de Saúde">
              <option value="🛍️ Área Comercial">
              <option value="🎡 Parque de Diversões">
              <option value="📍 Ponto de Encontro">
            </datalist>
          </div>

          <div class="form-group">
            <label class="form-label">Endereço / Localização *</label>
            <input id="sf-location" class="form-input" value="${v('location')}" placeholder="Ex: Praça Humberto Souto"/>
          </div>

          <div class="form-group">
            <label class="form-label">Capacidade (pessoas)</label>
            <input id="sf-capacity" class="form-input" type="number" value="${v('capacity')}" placeholder="Ex: 15000"/>
          </div>

          <div class="form-group">
            <label class="form-label">Destaque / Principal?</label>
            <select id="sf-main" class="form-input">
              <option value="0" ${!v('main') ? 'selected' : ''}>Não</option>
              <option value="1" ${v('main') ? 'selected' : ''}>⭐ Sim</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Latitude</label>
            <input id="sf-lat" class="form-input" type="number" step="0.0001" value="${v('latitude')}" placeholder="-11.3038"/>
          </div>

          <div class="form-group">
            <label class="form-label">Longitude</label>
            <input id="sf-lng" class="form-input" type="number" step="0.0001" value="${v('longitude')}" placeholder="-41.8549"/>
          </div>

          <div class="form-group form-full">
            <label class="form-label">🗺️ Link de Localização (Google Maps / Waze)</label>
            <input id="sf-maps" class="form-input" type="url" value="${v('maps_url')}" placeholder="https://maps.google.com/?q=..."/>
            <span style="font-size:.75rem;color:var(--text-muted);margin-top:.25rem;display:block">Cole o link de compartilhamento do Google Maps ou Waze</span>
          </div>

          <div class="form-group form-full">
            <label class="form-label">Descrição</label>
            <textarea id="sf-desc" class="form-input">${v('description')}</textarea>
          </div>

        </div>
        <div class="form-actions">
          <button class="btn btn-ghost" id="sfCancel">Cancelar</button>
          <button class="btn btn-primary" id="sfSave">${editingId ? '💾 Salvar' : '✅ Criar'}</button>
        </div>
      </div>
    `;
    wrap.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('sfCancel').addEventListener('click', () => { wrap.style.display = 'none'; editingId = null; });
    document.getElementById('sfSave').addEventListener('click', saveStage);
  }

  async function saveStage() {
    const body = {
      name:        document.getElementById('sf-name').value.trim(),
      type:        document.getElementById('sf-type').value.trim(),
      location:    document.getElementById('sf-location').value.trim(),
      capacity:    document.getElementById('sf-capacity').value || null,
      description: document.getElementById('sf-desc').value.trim(),
      latitude:    parseFloat(document.getElementById('sf-lat').value) || null,
      longitude:   parseFloat(document.getElementById('sf-lng').value) || null,
      maps_url:    document.getElementById('sf-maps').value.trim() || null,
      main:        document.getElementById('sf-main').value === '1',
    };
    if (!body.name || !body.location) { Toast.error('Nome e localização são obrigatórios.'); return; }
    try {
      if (editingId) await api.put(`/stages/${editingId}`, body);
      else await api.post('/stages', body);
      Toast.success(editingId ? 'Local atualizado!' : 'Local criado!');
      editingId = null;
      await reload();
    } catch (e) { Toast.error(e.message); }
  }

  window.editStage = (id) => {
    const stage = stages.find(s => s.id === id);
    if (stage) showStageForm(stage);
  };
  window.deleteStage = (id, name) => {
    Confirm.show('Excluir local?', `Remover <strong>${name}</strong>?`, async () => {
      try { await api.delete(`/stages/${id}`); Toast.success('Local excluído!'); await reload(); }
      catch (e) { Toast.error(e.message); }
    });
  };

  await reload();
}
