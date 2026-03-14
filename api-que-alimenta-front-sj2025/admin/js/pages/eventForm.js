// ── Event Form (Create / Edit) ──────────────────────────────
async function renderEventForm(params = {}) {
  const isEdit = !!params.id;
  document.getElementById('topbarTitle').textContent = isEdit ? 'Editar Evento' : 'Novo Evento';
  const content = document.getElementById('content');
  content.innerHTML = `<div class="loading-screen"><div class="spinner"></div><p>Carregando...</p></div>`;

  let event = {};
  if (isEdit) {
    try {
      const res = await api.get(`/events/${params.id}`);
      event = res.data;
    } catch (e) {
      content.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><div class="empty-title">Evento não encontrado</div></div>`;
      return;
    }
  }

  const v = (field, def = '') => event[field] ?? def;

  content.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">${isEdit ? '✏️ Editar Evento' : '➕ Novo Evento'}</div>
        <div class="page-subtitle">${isEdit ? `ID: ${event.id}` : 'Preencha todos os campos obrigatórios (*)'}</div>
      </div>
      <button class="btn btn-ghost" onclick="Router.go('events')">← Voltar</button>
    </div>

    <div class="form-with-preview">
      <!-- FORM -->
      <div class="form-card" id="eventFormCard">
        <form id="eventForm" novalidate>

          <div class="form-section">
            <div class="form-section-title">🎤 Identificação</div>
            <div class="form-grid">
              <div class="form-group form-full">
                <label class="form-label">Artista / Atração <span class="req">*</span></label>
                <input id="f-artist" class="form-input" type="text" value="${v('artist')}" placeholder="Ex: Wesley Safadão" required />
                <span class="form-error" id="err-artist">Campo obrigatório.</span>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">📅 Programação</div>
            <div class="form-grid cols-3">
              <div class="form-group">
                <label class="form-label">Data</label>
                <input id="f-date" class="form-input" type="date" value="${v('date')}" />
              </div>
              <div class="form-group">
                <label class="form-label">Início</label>
                <input id="f-start_time" class="form-input" type="time" value="${v('start_time')}" />
              </div>
              <div class="form-group">
                <label class="form-label">Término</label>
                <input id="f-end_time" class="form-input" type="time" value="${v('end_time')}" />
                <span class="form-error" id="err-end_time">Término deve ser após o início.</span>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">📍 Local & Estilo</div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Palco <span class="req">*</span></label>
                <select id="f-stage" class="form-input" required>
                  <option value="Palco Principal" ${v('stage') === 'Palco Principal' ? 'selected' : ''}>🎪 Palco Principal</option>
                  <option value="Barracão Zé Bigode" ${v('stage') === 'Barracão Zé Bigode' ? 'selected' : ''}>🛖 Barracão Zé Bigode</option>
                </select>
                <span class="form-error" id="err-stage">Campo obrigatório.</span>
              </div>
              <div class="form-group">
                <label class="form-label">Tipo / Estilo <span class="req">*</span></label>
                <input id="f-type" class="form-input" type="text" list="list-type" value="${v('type')}" placeholder="Digite livremente (Ex: Forró, Sertanejo...)" required autocomplete="off" />
                <datalist id="list-type">
                  <option value="forro">🎸 Forró</option>
                  <option value="sertanejo">🤠 Sertanejo</option>
                  <option value="gospel">⛪ Gospel</option>
                  <option value="infantil">🧸 Infantil</option>
                  <option value="arrocha">🕺 Arrocha</option>
                </datalist>
                <span class="form-error" id="err-type">Campo obrigatório.</span>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">🎨 Aparência & Mídia</div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Cor do Card</label>
                <div class="color-row">
                  <input type="color" id="f-card_color_picker" value="${v('card_color', '#7B2D8B')}" />
                  <div class="color-preview" id="colorPreview" style="background:${v('card_color', '#7B2D8B')}"></div>
                  <input id="f-card_color" class="form-input" type="text" value="${v('card_color', '#7B2D8B')}" placeholder="#7B2D8B" style="flex:1" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Capa Principal (URL da Imagem)</label>
                <input id="f-image_url" class="form-input" type="url" value="${v('image_url')}" placeholder="https://..." />
              </div>
            </div>
            
            <div class="form-group" style="margin-top:1rem">
              <label class="form-label">Galeria (Gifs / Imagens Adicionais)</label>
              <div class="gallery-container" style="background: var(--bg-card); padding: 1rem; border-radius: 8px; border: 1px solid var(--border);">
                 <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem">Adicione pelo menos 4 URLs de mídias adicionais (GIFs ou Imagens) para o front-end.</p>
                 <div id="gallery-inputs">
                    ${(v('gallery') && v('gallery').length > 0 ? v('gallery') : ['', '', '', '']).map((url, idx) => `
                        <div class="gallery-input-row" style="display:flex; gap:0.5rem; margin-bottom: 0.5rem">
                            <input type="url" class="form-input gallery-url-field" value="${url}" placeholder="URL da mídia ${idx + 1}..." />
                            <button type="button" class="btn btn-ghost danger" onclick="this.parentElement.remove()" tabindex="-1">✕</button>
                        </div>
                    `).join('')}
                 </div>
                 <button type="button" class="btn btn-ghost btn-sm" id="addGalleryItemBtn" style="margin-top: 0.5rem">+ Adicionar Mídia</button>
              </div>
            </div>

            <div class="form-group" style="margin-top:1rem; border-top: 1px dashed var(--border); padding-top: 1rem;">
              <label class="form-label">Upload de Capa (Opcional)</label>
              <div class="drop-zone" id="dropZone">
                <input type="file" id="imageFileInput" accept="image/*" />
                <div class="drop-zone-icon">📸</div>
                <div class="drop-zone-text">Arraste e solte uma imagem aqui</div>
                <div class="drop-zone-sub">JPEG, PNG, WebP · Max 10MB · Será convertido para WebP ≤500KB</div>
                <div class="drop-zone-preview" id="imagePreview"></div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">📝 Descrição</div>
            <div class="form-group">
              <label class="form-label">Descrição Detalhada</label>
              <textarea id="f-description" class="form-input">${v('description')}</textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-ghost" onclick="Router.go('events')">Cancelar</button>
            <button type="submit" class="btn btn-primary" id="submitBtn">
              ${isEdit ? '💾 Salvar Alterações' : '✅ Criar Evento'}
            </button>
          </div>
        </form>
      </div>

      <!-- PREVIEW PANEL -->
      <div class="app-preview-wrap">
        <div class="app-preview-label">Preview no App</div>
        <div class="app-card-preview" id="cardPreview" style="background:linear-gradient(135deg,${v('card_color', '#7B2D8B')},#1a0030)">
          <div class="card-artist" id="prev-artist">${v('artist', 'Artista da Noite')}</div>
          <div class="card-meta" style="margin-top: 8px">
            <span id="prev-date">${v('date') ? fmtDate(v('date')) : 'Data'}</span>
            <span id="prev-time">${v('start_time', '00:00')}${v('end_time') ? ' – ' + v('end_time') : ''}</span>
            <span id="prev-stage" style="display:block; margin-top:4px">${v('stage', 'Palco Principal')}</span>
          </div>
        </div>
        <div style="margin-top:1rem; padding:0.75rem; background:var(--bg-card); border-radius:var(--radius-sm); border:1px solid var(--border)">
          <div style="font-size:0.7rem; color:var(--text-muted); margin-bottom:0.5rem; font-weight:600; text-transform:uppercase;">Status calculado</div>
          <span class="badge badge-${v('status', 'upcoming')}" id="prev-status">${statusLabels[v('status', 'upcoming')] || 'Em breve'}</span>
        </div>
        ${isEdit ? `
          <div style="margin-top:1rem">
            <div class="app-preview-label">Upload de Imagem</div>
            <button class="btn btn-secondary btn-sm" id="uploadImageBtn" style="width:100%">📤 Enviar Imagem</button>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  // ── Live Preview wiring ────────────────────────────────────
  // ── Live Preview & Dynamic Fields wiring ────────────────────────────────────
  const liveFields = ['artist', 'start_time', 'end_time', 'stage'];
  liveFields.forEach(f => {
    const el = document.getElementById(`f-${f}`);
    if (el) el.addEventListener('input', updatePreview);
  });
  document.getElementById('f-date').addEventListener('change', updatePreview);

  function updatePreview() {
    const c = v => document.getElementById(`f-${v}`)?.value || '';
    document.getElementById('prev-artist').textContent = c('artist') || 'Artista da Noite';
    document.getElementById('prev-date').textContent = c('date') ? fmtDate(c('date')) : 'Data';
    const st = c('start_time'), et = c('end_time');
    document.getElementById('prev-time').textContent = st ? `${st}${et ? ' – ' + et : ''}` : '00:00';
    document.getElementById('prev-stage').textContent = c('stage') || 'Palco Principal';
  }

  // Gallery dynamic inputs
  document.getElementById('addGalleryItemBtn').addEventListener('click', () => {
    const container = document.getElementById('gallery-inputs');
    const div = document.createElement('div');
    div.className = 'gallery-input-row';
    div.style.cssText = 'display:flex; gap:0.5rem; margin-bottom: 0.5rem';
    div.innerHTML = `
          <input type="url" class="form-input gallery-url-field" placeholder="URL da mídia..." />
          <button type="button" class="btn btn-ghost danger" onclick="this.parentElement.remove()" tabindex="-1">✕</button>
      `;
    container.appendChild(div);
  });

  // Color picker sync
  const colorPicker = document.getElementById('f-card_color_picker');
  const colorInput = document.getElementById('f-card_color');
  const colorPrev = document.getElementById('colorPreview');
  const cardPrev = document.getElementById('cardPreview');

  function applyColor(hex) {
    colorPrev.style.background = hex;
    cardPrev.style.background = `linear-gradient(135deg,${hex},#1a0030)`;
    colorInput.value = hex;
    colorPicker.value = hex;
  }
  colorPicker.addEventListener('input', e => applyColor(e.target.value));
  colorInput.addEventListener('input', e => {
    const val = e.target.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) applyColor(val);
  });

  // Drop zone
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('imageFileInput');
  const preview = document.getElementById('imagePreview');
  let pendingFile = null;

  function handleFile(file) {
    if (!file.type.startsWith('image/')) { Toast.error('Arquivo inválido. Apenas imagens.'); return; }
    pendingFile = file;
    const url = URL.createObjectURL(file);
    preview.innerHTML = `<img src="${url}" style="max-width:100%;border-radius:8px;margin-top:0.5rem" />`;
    document.getElementById('f-image_url').value = '';
  }

  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('dragover'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
  fileInput.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });

  // Form validation & submit
  document.getElementById('eventForm').addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Salvando...';

    const galleryUrls = Array.from(document.querySelectorAll('.gallery-url-field'))
      .map(input => input.value.trim())
      .filter(url => url !== '');

    const body = {
      artist: document.getElementById('f-artist').value.trim(),
      date: document.getElementById('f-date').value,
      start_time: document.getElementById('f-start_time').value,
      end_time: document.getElementById('f-end_time').value || null,
      stage: document.getElementById('f-stage').value,
      type: document.getElementById('f-type').value.trim(),
      description: document.getElementById('f-description').value.trim(),
      image_url: document.getElementById('f-image_url').value.trim(),
      card_color: document.getElementById('f-card_color').value || '#7B2D8B',
      gallery: galleryUrls
    };

    try {
      let savedEvent;
      if (isEdit) {
        const res = await api.put(`/events/${params.id}`, body);
        savedEvent = res.data;
      } else {
        const res = await api.post('/events', body);
        savedEvent = res.data;
      }

      // Upload image if pending
      if (pendingFile && savedEvent.id) {
        const fd = new FormData();
        fd.append('image', pendingFile);
        try {
          await api.upload(`/events/${savedEvent.id}/image`, fd);
        } catch (imgErr) { Toast.info('Evento salvo, mas erro no upload da imagem: ' + imgErr.message); }
      }

      Toast.success(isEdit ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!');
      setTimeout(() => Router.go('events'), 800);
    } catch (err) {
      Toast.error(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = isEdit ? '💾 Salvar Alterações' : '✅ Criar Evento';
    }
  });

  // Image upload for existing events
  if (isEdit) {
    document.getElementById('uploadImageBtn')?.addEventListener('click', async () => {
      if (!pendingFile) { Toast.info('Selecione uma imagem no campo acima primeiro.'); return; }
      const fd = new FormData();
      fd.append('image', pendingFile);
      try {
        const res = await api.upload(`/events/${params.id}/image`, fd);
        document.getElementById('f-image_url').value = res.data.image_url;
        Toast.success('Imagem enviada e otimizada!');
        pendingFile = null;
      } catch (e) { Toast.error(e.message); }
    });
  }
}

// All fields are optional — no blocking validation
function validateForm() {
  // Soft check: if both times filled, end should be after start
  const st = document.getElementById('f-start_time')?.value;
  const et = document.getElementById('f-end_time')?.value;
  if (st && et && et <= st) {
    Toast.info('Aviso: horário de término é igual ou anterior ao início.');
    // Not blocking — user can still save
  }
  return true;
}
