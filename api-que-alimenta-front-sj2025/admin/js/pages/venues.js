// ── Venues Page ─────────────────────────────────────────────
const venueTypeLabels = { comida: '🍖 Comida', bebida: '🍺 Bebida', restaurante: '🍽️ Restaurante' };

async function renderVenues() {
  document.getElementById('topbarTitle').textContent = 'Barracas & Parceiros';
  const content = document.getElementById('content');
  content.innerHTML = `<div class="loading-screen"><div class="spinner"></div><p>Carregando...</p></div>`;

  let venues = [];
  let editingId = null;

  async function reload() {
    const res = await api.get('/venues');
    venues = res.data || [];
    renderPage();
  }

  function renderPage() {
    content.innerHTML = `
      <div class="page-header">
        <div><div class="page-title">🍺 Barracas & Parceiros</div><div class="page-subtitle">${venues.length} cadastrado(s)</div></div>
        <button class="btn btn-primary" id="newVenueBtn">+ Nova Barraca</button>
      </div>
      <div id="venueFormWrap" style="display:none;margin-bottom:1.5rem"></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Nome</th><th>Tipo</th><th>Endereço</th><th>Telefone</th><th>Horário</th><th>Patrocinado</th><th>Ações</th></tr></thead>
          <tbody id="venues-tbody">
            ${venues.length ? venues.map(v => `
              <tr>
                <td class="td-bold">${v.name}</td>
                <td>${venueTypeLabels[v.type] || v.type}</td>
                <td>${v.address || '—'}</td>
                <td>${v.phone || '—'}</td>
                <td>${v.horario || '—'}</td>
                <td>${v.patrocinado ? '⭐ Sim' : 'Não'}</td>
                <td><div class="actions-row">
                  <button class="btn-icon success" onclick="editVenue('${v.id}')" title="Editar">✏️</button>
                  <button class="btn-icon danger" onclick="deleteVenue('${v.id}','${v.name.replace(/'/g, "&#39;")}')" title="Excluir">🗑️</button>
                </div></td>
              </tr>`).join('') :
        `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">🍺</div><div class="empty-title">Nenhuma barraca cadastrada</div></div></td></tr>`
      }
          </tbody>
        </table>
      </div>
    `;
    document.getElementById('newVenueBtn').addEventListener('click', () => showVenueForm(null));
  }

  function showVenueForm(venue) {
    editingId = venue?.id || null;
    const v = (f, d = '') => venue?.[f] ?? d;
    const wrap = document.getElementById('venueFormWrap');
    wrap.style.display = 'block';
    wrap.innerHTML = `
      <div class="form-card">
        <div class="form-section-title" style="margin-bottom:1rem">${editingId ? '✏️ Editar' : '➕ Nova'} Barraca</div>
        <div class="form-grid">
          <div class="form-group"><label class="form-label">Nome *</label><input id="vf-name" class="form-input" value="${v('name')}" placeholder="Ex: Barraca do Zé"/></div>
          <div class="form-group"><label class="form-label">Tipo *</label>
            <input id="vf-type" class="form-input" type="text" list="vf-type-list" value="${v('type')}" placeholder="Ex: 🍽️ Restaurante, 🍺 Bebida..." autocomplete="off" />
            <datalist id="vf-type-list">
              <option value="🍖 Comida">
              <option value="🍺 Bebida">
              <option value="🍽️ Restaurante">
              <option value="🎉 Entretenimento">
              <option value="🛍️ Loja">
              <option value="🎭 Shows & Arte">
              <option value="🥤 Sorveteria">
              <option value="☕ Café">
            </datalist>
          </div>
          <div class="form-group"><label class="form-label">Latitude *</label><input id="vf-lat" class="form-input" type="number" step="0.0001" value="${v('latitude')}" placeholder="-11.3038"/></div>
          <div class="form-group"><label class="form-label">Longitude *</label><input id="vf-lng" class="form-input" type="number" step="0.0001" value="${v('longitude')}" placeholder="-41.8549"/></div>
          <div class="form-group"><label class="form-label">Endereço</label><input id="vf-address" class="form-input" value="${v('address')}" placeholder="Rua..."/></div>
          <div class="form-group"><label class="form-label">Telefone</label><input id="vf-phone" class="form-input" value="${v('phone')}" placeholder="(74) 99999-0000"/></div>
          <div class="form-group"><label class="form-label">Horário</label><input id="vf-horario" class="form-input" value="${v('horario')}" placeholder="17h–02h"/></div>
          <div class="form-group"><label class="form-label">Patrocinado</label>
            <select id="vf-patrocinado" class="form-input">
              <option value="0" ${!v('patrocinado') ? 'selected' : ''}>Não</option>
              <option value="1" ${v('patrocinado') ? 'selected' : ''}>⭐ Sim</option>
            </select>
          </div>
          <div class="form-group form-full"><label class="form-label">Descrição</label><textarea id="vf-desc" class="form-input">${v('description')}</textarea></div>
        </div>
        <div class="form-actions">
          <button class="btn btn-ghost" id="vfCancel">Cancelar</button>
          <button class="btn btn-primary" id="vfSave">${editingId ? '💾 Salvar' : '✅ Criar'}</button>
        </div>
      </div>
    `;
    wrap.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('vfCancel').addEventListener('click', () => { wrap.style.display = 'none'; editingId = null; });
    document.getElementById('vfSave').addEventListener('click', saveVenue);
  }

  async function saveVenue() {
    const body = {
      name: document.getElementById('vf-name').value.trim(),
      type: document.getElementById('vf-type').value,
      latitude: parseFloat(document.getElementById('vf-lat').value) || null,
      longitude: parseFloat(document.getElementById('vf-lng').value) || null,
      address: document.getElementById('vf-address').value.trim(),
      phone: document.getElementById('vf-phone').value.trim(),
      horario: document.getElementById('vf-horario').value.trim(),
      patrocinado: document.getElementById('vf-patrocinado').value === '1',
      description: document.getElementById('vf-desc').value.trim()
    };
    if (!body.name || !body.latitude || !body.longitude) { Toast.error('Nome, latitude e longitude são obrigatórios.'); return; }
    try {
      if (editingId) await api.put(`/venues/${editingId}`, body);
      else await api.post('/venues', body);
      Toast.success(editingId ? 'Barraca atualizada!' : 'Barraca criada!');
      editingId = null;
      await reload();
    } catch (e) { Toast.error(e.message); }
  }

  window.editVenue = (id) => {
    const venue = venues.find(v => v.id === id);
    if (venue) showVenueForm(venue);
  };
  window.deleteVenue = (id, name) => {
    Confirm.show('Excluir barraca?', `Remover <strong>${name}</strong>?`, async () => {
      try { await api.delete(`/venues/${id}`); Toast.success('Barraca excluída!'); await reload(); }
      catch (e) { Toast.error(e.message); }
    });
  };

  await reload();
}
