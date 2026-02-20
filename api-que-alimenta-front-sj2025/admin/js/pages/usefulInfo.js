// ── Useful Info Page ─────────────────────────────────────────
const infoCategoryLabels = { saude: '🏥 Saúde', seguranca: '🚔 Segurança', regras: '📋 Regras', acessibilidade: '♿ Acessibilidade' };

async function renderUsefulInfo() {
  document.getElementById('topbarTitle').textContent = 'Informações Úteis';
  const content = document.getElementById('content');

  let items = []; let editingId = null;

  async function reload() {
    const res = await api.get('/useful-info');
    items = res.data || [];
    renderPage();
  }

  function renderPage() {
    content.innerHTML = `
      <div class="page-header">
        <div><div class="page-title">ℹ️ Informações Úteis</div><div class="page-subtitle">${items.length} cadastrada(s)</div></div>
        <button class="btn btn-primary" id="newInfoBtn">+ Nova Info</button>
      </div>
      <div id="infoFormWrap" style="display:none;margin-bottom:1.5rem"></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Categoria</th><th>Título</th><th>Conteúdo</th><th>Telefone</th><th>Ícone</th><th>Ações</th></tr></thead>
          <tbody>
            ${items.length ? items.map(i => `
              <tr>
                <td class="td-mono">${i.order_index}</td>
                <td>${infoCategoryLabels[i.category] || i.category}</td>
                <td class="td-bold">${i.title}</td>
                <td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${i.content}">${i.content}</td>
                <td>${i.phone || '—'}</td>
                <td class="td-mono">${i.icon_name || '—'}</td>
                <td><div class="actions-row">
                  <button class="btn-icon success" onclick="editInfo('${i.id}')" title="Editar">✏️</button>
                  <button class="btn-icon danger" onclick="deleteInfo('${i.id}','${i.title.replace(/'/g, '&#39;')}')" title="Excluir">🗑️</button>
                </div></td>
              </tr>`).join('') :
        `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">ℹ️</div><div class="empty-title">Nenhuma informação cadastrada</div></div></td></tr>`
      }
          </tbody>
        </table>
      </div>
    `;
    document.getElementById('newInfoBtn').addEventListener('click', () => showInfoForm(null));
  }

  function showInfoForm(item) {
    editingId = item?.id || null;
    const v = (f, d = '') => item?.[f] ?? d;
    const wrap = document.getElementById('infoFormWrap');
    wrap.style.display = 'block';
    wrap.innerHTML = `
      <div class="form-card">
        <div class="form-section-title" style="margin-bottom:1rem">${editingId ? '✏️ Editar' : '➕ Nova'} Informação</div>
        <div class="form-grid">
          <div class="form-group"><label class="form-label">Categoria *</label>
            <input id="if-cat" class="form-input" type="text" list="if-cat-list" value="${v('category')}" placeholder="Ex: 🏥 Saúde, 📋 Regras..." autocomplete="off" />
            <datalist id="if-cat-list">
              <option value="🏥 Saúde">
              <option value="👮 Segurança">
              <option value="📋 Regras">
              <option value="♿ Acessibilidade">
              <option value="📱 Tecnologia">
              <option value="📞 Contatos">
              <option value="📊 Informações">
              <option value="🚨 Emergência">
            </datalist>
          </div>
          <div class="form-group"><label class="form-label">Título *</label><input id="if-title" class="form-input" value="${v('title')}" placeholder="Ex: Pronto-Socorro"/></div>
          <div class="form-group"><label class="form-label">Telefone</label><input id="if-phone" class="form-input" value="${v('phone')}" placeholder="192"/></div>
          <div class="form-group"><label class="form-label">Emoji / Ícone</label>
            <input id="if-icon" class="form-input" type="text" list="if-icon-list" value="${v('icon_name')}" placeholder="Ex: 🚑 ou medical-bag" autocomplete="off" />
            <datalist id="if-icon-list">
              <option value="🏥 saúde">
              <option value="🚑 emergência">
              <option value="👮 segurança">
              <option value="🚹 banheiro">
              <option value="♿ acessibilidade">
              <option value="📋 regras">
              <option value="📞 contato">
              <option value="ℹ️ info">
              <option value="⚠️ aviso">
            </datalist>
          </div>
          <div class="form-group"><label class="form-label">Ordem</label><input id="if-order" class="form-input" type="number" value="${v('order_index', 0)}" min="0"/></div>
          <div class="form-group form-full"><label class="form-label">Conteúdo *</label><textarea id="if-content" class="form-input" style="min-height:120px">${v('content')}</textarea></div>
        </div>
        <div class="form-actions">
          <button class="btn btn-ghost" id="ifCancel">Cancelar</button>
          <button class="btn btn-primary" id="ifSave">${editingId ? '💾 Salvar' : '✅ Criar'}</button>
        </div>
      </div>
    `;
    wrap.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('ifCancel').addEventListener('click', () => { wrap.style.display = 'none'; editingId = null; });
    document.getElementById('ifSave').addEventListener('click', saveInfo);
  }

  async function saveInfo() {
    const body = {
      category: document.getElementById('if-cat').value,
      title: document.getElementById('if-title').value.trim(),
      content: document.getElementById('if-content').value.trim(),
      phone: document.getElementById('if-phone').value.trim(),
      icon_name: document.getElementById('if-icon').value.trim(),
      order_index: parseInt(document.getElementById('if-order').value) || 0
    };
    if (!body.title || !body.content) { Toast.error('Título e conteúdo são obrigatórios.'); return; }
    try {
      if (editingId) await api.put(`/useful-info/${editingId}`, body);
      else await api.post('/useful-info', body);
      Toast.success(editingId ? 'Informação atualizada!' : 'Informação criada!');
      editingId = null; await reload();
    } catch (e) { Toast.error(e.message); }
  }

  window.editInfo = id => { const i = items.find(x => x.id === id); if (i) showInfoForm(i); };
  window.deleteInfo = (id, title) => {
    Confirm.show('Excluir informação?', `Remover <strong>${title}</strong>?`, async () => {
      try { await api.delete(`/useful-info/${id}`); Toast.success('Informação excluída!'); await reload(); }
      catch (e) { Toast.error(e.message); }
    });
  };

  await reload();
}
