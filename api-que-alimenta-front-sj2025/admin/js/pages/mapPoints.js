// ── Map Points Page ─────────────────────────────────────────
const mpCategoryLabels = { saude: '🏥 Saúde', seguranca: '🚔 Segurança', banheiro: '🚻 Banheiro', palco: '🎪 Palco' };

async function renderMapPoints() {
  document.getElementById('topbarTitle').textContent = 'Pontos de Apoio';
  const content = document.getElementById('content');

  let points = []; let editingId = null;

  async function reload() {
    const res = await api.get('/map-points');
    points = res.data || [];
    renderPage();
  }

  function renderPage() {
    content.innerHTML = `
      <div class="page-header">
        <div><div class="page-title">📍 Pontos de Apoio</div><div class="page-subtitle">${points.length} cadastrado(s)</div></div>
        <button class="btn btn-primary" id="newMpBtn">+ Novo Ponto</button>
      </div>
      <div id="mpFormWrap" style="display:none;margin-bottom:1.5rem"></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Nome</th><th>Categoria</th><th>Endereço</th><th>Telefone</th><th>Horário</th><th>Ações</th></tr></thead>
          <tbody>
            ${points.length ? points.map(p => `
              <tr>
                <td class="td-bold">${p.name}</td>
                <td>${mpCategoryLabels[p.category] || p.category}</td>
                <td>${p.address || '—'}</td>
                <td>${p.phone || '—'}</td>
                <td>${p.opening_hours || '—'}</td>
                <td><div class="actions-row">
                  <button class="btn-icon success" onclick="editMp('${p.id}')" title="Editar">✏️</button>
                  <button class="btn-icon danger" onclick="deleteMp('${p.id}','${p.name.replace(/'/g, '&#39;')}')" title="Excluir">🗑️</button>
                </div></td>
              </tr>`).join('') :
        `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📍</div><div class="empty-title">Nenhum ponto cadastrado</div></div></td></tr>`
      }
          </tbody>
        </table>
      </div>
    `;
    document.getElementById('newMpBtn').addEventListener('click', () => showMpForm(null));
  }

  function showMpForm(point) {
    editingId = point?.id || null;
    const v = (f, d = '') => point?.[f] ?? d;
    const wrap = document.getElementById('mpFormWrap');
    wrap.style.display = 'block';
    wrap.innerHTML = `
      <div class="form-card">
        <div class="form-section-title" style="margin-bottom:1rem">${editingId ? '✏️ Editar' : '➕ Novo'} Ponto de Apoio</div>
        <div class="form-grid">
          <div class="form-group"><label class="form-label">Nome *</label><input id="mpf-name" class="form-input" value="${v('name')}" placeholder="Ex: UPA Central"/></div>
          <div class="form-group"><label class="form-label">Categoria *</label>
            <input id="mpf-cat" class="form-input" type="text" list="mpf-cat-list" value="${v('category')}" placeholder="Ex: 🏥 Saúde, 🎪 Palco..." autocomplete="off" />
            <datalist id="mpf-cat-list">
              <option value="🏥 Saúde">
              <option value="👮 Segurança">
              <option value="🚹 Banheiro">
              <option value="🎪 Palco">
              <option value="🌳 Área de Lazer">
              <option value="🅿️ Estacionamento">
              <option value="ℹ️ Informações">
              <option value="♿ Acessibilidade">
              <option value="🚨 Emergência">
            </datalist>
          </div>
          <div class="form-group"><label class="form-label">Latitude *</label><input id="mpf-lat" class="form-input" type="number" step="0.0001" value="${v('latitude')}" placeholder="-11.3038"/></div>
          <div class="form-group"><label class="form-label">Longitude *</label><input id="mpf-lng" class="form-input" type="number" step="0.0001" value="${v('longitude')}" placeholder="-41.8549"/></div>
          <div class="form-group"><label class="form-label">Endereço</label><input id="mpf-address" class="form-input" value="${v('address')}" placeholder="Rua..."/></div>
          <div class="form-group"><label class="form-label">Telefone</label><input id="mpf-phone" class="form-input" value="${v('phone')}" placeholder="192"/></div>
          <div class="form-group form-full"><label class="form-label">Horário de Funcionamento</label><input id="mpf-hours" class="form-input" value="${v('opening_hours')}" placeholder="24h"/></div>
        </div>
        <div class="form-actions">
          <button class="btn btn-ghost" id="mpfCancel">Cancelar</button>
          <button class="btn btn-primary" id="mpfSave">${editingId ? '💾 Salvar' : '✅ Criar'}</button>
        </div>
      </div>
    `;
    wrap.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('mpfCancel').addEventListener('click', () => { wrap.style.display = 'none'; editingId = null; });
    document.getElementById('mpfSave').addEventListener('click', saveMp);
  }

  async function saveMp() {
    const body = {
      name: document.getElementById('mpf-name').value.trim(),
      category: document.getElementById('mpf-cat').value,
      latitude: parseFloat(document.getElementById('mpf-lat').value) || null,
      longitude: parseFloat(document.getElementById('mpf-lng').value) || null,
      address: document.getElementById('mpf-address').value.trim(),
      phone: document.getElementById('mpf-phone').value.trim(),
      opening_hours: document.getElementById('mpf-hours').value.trim()
    };
    if (!body.name || !body.latitude || !body.longitude) { Toast.error('Nome, latitude e longitude são obrigatórios.'); return; }
    try {
      if (editingId) await api.put(`/map-points/${editingId}`, body);
      else await api.post('/map-points', body);
      Toast.success(editingId ? 'Ponto atualizado!' : 'Ponto criado!');
      editingId = null; await reload();
    } catch (e) { Toast.error(e.message); }
  }

  window.editMp = id => { const p = points.find(x => x.id === id); if (p) showMpForm(p); };
  window.deleteMp = (id, name) => {
    Confirm.show('Excluir ponto?', `Remover <strong>${name}</strong>?`, async () => {
      try { await api.delete(`/map-points/${id}`); Toast.success('Ponto excluído!'); await reload(); }
      catch (e) { Toast.error(e.message); }
    });
  };

  await reload();
}
