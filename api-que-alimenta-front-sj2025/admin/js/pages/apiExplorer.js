// ── API Explorer Page ────────────────────────────────────────
function renderApiExplorer() {
    document.getElementById('topbarTitle').textContent = 'API Explorer';

    const BASE = window.location.origin;

    const endpoints = [
        {
            group: '🎵 Eventos',
            color: 'purple',
            routes: [
                { method: 'GET', path: '/api/events', desc: 'Listar todos os eventos', params: '?date=&circuit=&type=&status=&search=&page=&limit=' },
                { method: 'GET', path: '/api/events/{id}', desc: 'Buscar evento por ID' },
                { method: 'POST', path: '/api/events', desc: 'Criar novo evento', body: true },
                { method: 'PUT', path: '/api/events/{id}', desc: 'Atualizar evento', body: true },
                { method: 'DELETE', path: '/api/events/{id}', desc: 'Excluir evento' },
                { method: 'POST', path: '/api/events/{id}/duplicate', desc: 'Duplicar evento' },
                { method: 'POST', path: '/api/events/{id}/image', desc: 'Upload de imagem (multipart/form-data)', body: true },
                { method: 'GET', path: '/api/events/export/json', desc: 'Exportar todos como JSON ⬇️', link: true },
                { method: 'GET', path: '/api/events/export/csv', desc: 'Exportar todos como CSV ⬇️', link: true },
            ]
        },
        {
            group: '🍺 Barracas',
            color: 'yellow',
            routes: [
                { method: 'GET', path: '/api/venues', desc: 'Listar barracas', params: '?type=&search=' },
                { method: 'GET', path: '/api/venues/{id}', desc: 'Buscar barraca por ID' },
                { method: 'POST', path: '/api/venues', desc: 'Criar barraca', body: true },
                { method: 'PUT', path: '/api/venues/{id}', desc: 'Atualizar barraca', body: true },
                { method: 'DELETE', path: '/api/venues/{id}', desc: 'Excluir barraca' },
            ]
        },
        {
            group: '📍 Pontos de Apoio',
            color: 'blue',
            routes: [
                { method: 'GET', path: '/api/map-points', desc: 'Listar pontos de apoio', params: '?category=' },
                { method: 'GET', path: '/api/map-points/{id}', desc: 'Buscar ponto por ID' },
                { method: 'POST', path: '/api/map-points', desc: 'Criar ponto', body: true },
                { method: 'PUT', path: '/api/map-points/{id}', desc: 'Atualizar ponto', body: true },
                { method: 'DELETE', path: '/api/map-points/{id}', desc: 'Excluir ponto' },
            ]
        },
        {
            group: 'ℹ️ Informações Úteis',
            color: 'green',
            routes: [
                { method: 'GET', path: '/api/useful-info', desc: 'Listar informações', params: '?category=' },
                { method: 'GET', path: '/api/useful-info/{id}', desc: 'Buscar por ID' },
                { method: 'POST', path: '/api/useful-info', desc: 'Criar informação', body: true },
                { method: 'PUT', path: '/api/useful-info/{id}', desc: 'Atualizar informação', body: true },
                { method: 'DELETE', path: '/api/useful-info/{id}', desc: 'Excluir informação' },
            ]
        },
        {
            group: '💓 Sistema',
            color: 'pink',
            routes: [
                { method: 'GET', path: '/api/health', desc: 'Health check da API', link: true },
            ]
        }
    ];

    const methodColors = {
        GET: { bg: 'rgba(96,165,250,0.12)', text: '#60a5fa', border: 'rgba(96,165,250,0.25)' },
        POST: { bg: 'rgba(74,222,128,0.12)', text: '#4ade80', border: 'rgba(74,222,128,0.25)' },
        PUT: { bg: 'rgba(251,146,60,0.12)', text: '#fb923c', border: 'rgba(251,146,60,0.25)' },
        DELETE: { bg: 'rgba(248,113,113,0.12)', text: '#f87171', border: 'rgba(248,113,113,0.25)' },
    };

    const groupColorVars = { purple: 'var(--purple-400)', yellow: 'var(--yellow-400)', blue: 'var(--blue-400)', green: 'var(--green-400)', pink: 'var(--pink-500)' };

    const content = document.getElementById('content');
    content.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">🔌 API Explorer</div>
        <div class="page-subtitle">Base URL: <code style="background:var(--bg-card);padding:2px 8px;border-radius:6px;font-size:0.85rem;color:var(--purple-400)">${BASE}</code></div>
      </div>
      <div class="actions-row">
        <a href="${BASE}/api/health" target="_blank" class="btn btn-secondary btn-sm">💓 Health Check</a>
        <a href="${BASE}/api/events/export/json" target="_blank" class="btn btn-ghost btn-sm">⬇️ Export JSON</a>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:1.5rem" id="explorer-groups">
      ${endpoints.map((group, gi) => `
        <div class="panel" id="group-${gi}">
          <div class="panel-title" style="font-size:1rem;font-weight:700;color:${groupColorVars[group.color]}">
            ${group.group}
          </div>
          <div style="display:flex;flex-direction:column;gap:0.5rem">
            ${group.routes.map((r, ri) => {
        const mc = methodColors[r.method] || methodColors.GET;
        const isLink = r.link && r.method === 'GET' && !r.path.includes('{id}');
        const hasId = r.path.includes('{id}');
        const testId = `test-${gi}-${ri}`;
        const resId = `res-${gi}-${ri}`;
        const urlDisplay = r.path + (r.params ? `<span style="color:var(--text-muted)">${r.params}</span>` : '');
        return `
                <div class="api-row" id="${testId}-wrap" style="background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:0.8rem 1rem;transition:border-color 0.2s">
                  <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap">
                    <span style="background:${mc.bg};color:${mc.text};border:1px solid ${mc.border};padding:0.2rem 0.6rem;border-radius:6px;font-size:0.7rem;font-weight:700;font-family:monospace;flex-shrink:0;min-width:60px;text-align:center">${r.method}</span>
                    <code style="font-size:0.82rem;color:var(--text-primary);flex:1;word-break:break-all">${urlDisplay}</code>
                    <span style="font-size:0.75rem;color:var(--text-muted);flex-shrink:0">${r.desc}</span>
                    <div style="display:flex;gap:0.4rem;flex-shrink:0">
                      ${isLink ? `<a href="${BASE}${r.path}" target="_blank" class="btn btn-secondary btn-sm">🔗 Abrir</a>` : ''}
                      ${r.method === 'GET' && !hasId ? `<button class="btn btn-ghost btn-sm" onclick="testEndpoint('${r.path}','${resId}',this)">▶ Testar</button>` : ''}
                      ${hasId ? `<button class="btn btn-ghost btn-sm" onclick="showIdPrompt('${r.path}','${r.method}','${resId}',this)">▶ ${r.method === 'GET' ? 'Buscar' : 'Testar'}</button>` : ''}
                    </div>
                  </div>
                  <div id="${resId}" style="display:none;margin-top:0.75rem"></div>
                </div>
              `;
    }).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;

    // Hover highlight on api rows
    document.querySelectorAll('.api-row').forEach(row => {
        row.addEventListener('mouseenter', () => row.style.borderColor = 'rgba(168,85,247,0.3)');
        row.addEventListener('mouseleave', () => row.style.borderColor = 'var(--border)');
    });
}

// ── Test Endpoint ────────────────────────────────────────────
async function testEndpoint(path, resId, btn) {
    const resEl = document.getElementById(resId);
    resEl.style.display = 'block';
    resEl.innerHTML = `<div style="color:var(--text-muted);font-size:0.8rem;padding:0.5rem">⏳ Carregando...</div>`;
    btn.disabled = true;

    try {
        const res = await fetch(path);
        const json = await res.json();
        const pretty = JSON.stringify(json, null, 2);
        resEl.innerHTML = `
      <div style="position:relative">
        <div style="position:absolute;top:0.5rem;right:0.5rem;display:flex;gap:0.4rem;z-index:1">
          <span style="font-size:0.7rem;padding:0.15rem 0.5rem;border-radius:4px;background:${res.ok ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)'};color:${res.ok ? '#4ade80' : '#f87171'};font-weight:700">${res.status} ${res.statusText}</span>
          <button class="btn-icon" title="Copiar" onclick="navigator.clipboard.writeText(${JSON.stringify(pretty)}).then(()=>Toast.success('Copiado!'))" style="font-size:0.75rem;padding:0.2rem 0.5rem;">📋</button>
          <button class="btn-icon" title="Fechar" onclick="document.getElementById('${resId}').style.display='none'" style="font-size:0.75rem;padding:0.2rem 0.5rem;">✕</button>
        </div>
        <pre style="background:var(--bg-base);border:1px solid var(--border);border-radius:var(--radius-sm);padding:1rem 1rem 0.75rem;font-size:0.75rem;overflow-x:auto;max-height:320px;overflow-y:auto;color:var(--text-secondary);margin-top:0;padding-top:2rem">${escapeHtml(pretty)}</pre>
      </div>
    `;
    } catch (e) {
        resEl.innerHTML = `<div style="color:var(--red-400);font-size:0.8rem;padding:0.5rem">❌ Erro: ${e.message}</div>`;
    } finally {
        btn.disabled = false;
    }
}

// ── ID Prompt ────────────────────────────────────────────────
function showIdPrompt(pathTemplate, method, resId, btn) {
    const resEl = document.getElementById(resId);
    resEl.style.display = 'block';
    resEl.innerHTML = `
    <div style="display:flex;align-items:center;gap:0.6rem;margin-top:0.25rem;flex-wrap:wrap">
      <input id="id-input-${resId}" class="form-input" style="flex:1;min-width:200px;font-size:0.8rem;padding:0.4rem 0.7rem;font-family:monospace" placeholder="Cole o UUID aqui..." />
      <button class="btn btn-secondary btn-sm" onclick="fetchWithId('${pathTemplate}','${method}','${resId}')">▶ Executar</button>
      <button class="btn btn-ghost btn-sm" onclick="document.getElementById('${resId}').style.display='none'">✕</button>
    </div>
    <div id="${resId}-result" style="margin-top:0.5rem"></div>
  `;
    document.getElementById(`id-input-${resId}`)?.focus();
}

async function fetchWithId(pathTemplate, method, resId) {
    const id = document.getElementById(`id-input-${resId}`)?.value?.trim();
    if (!id) { Toast.error('Informe um ID válido.'); return; }
    const path = pathTemplate.replace('{id}', id);
    const resultEl = document.getElementById(`${resId}-result`);
    resultEl.innerHTML = `<div style="color:var(--text-muted);font-size:0.8rem;padding:0.4rem">⏳ Carregando...</div>`;
    try {
        const res = await fetch(path, { method });
        const json = await res.json();
        const pretty = JSON.stringify(json, null, 2);
        resultEl.innerHTML = `
      <div style="position:relative">
        <div style="position:absolute;top:0.5rem;right:0.5rem;display:flex;gap:0.4rem;z-index:1">
          <span style="font-size:0.7rem;padding:0.15rem 0.5rem;border-radius:4px;background:${res.ok ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)'};color:${res.ok ? '#4ade80' : '#f87171'};font-weight:700">${res.status}</span>
          <button class="btn-icon" title="Copiar" onclick="navigator.clipboard.writeText(${JSON.stringify(pretty)}).then(()=>Toast.success('Copiado!'))" style="font-size:0.75rem;padding:0.2rem 0.5rem;">📋</button>
        </div>
        <pre style="background:var(--bg-base);border:1px solid var(--border);border-radius:var(--radius-sm);padding:1rem 1rem 0.75rem;font-size:0.75rem;overflow-x:auto;max-height:280px;overflow-y:auto;color:var(--text-secondary);padding-top:2rem">${escapeHtml(pretty)}</pre>
      </div>
    `;
    } catch (e) {
        resultEl.innerHTML = `<div style="color:var(--red-400);font-size:0.8rem;padding:0.4rem">❌ ${e.message}</div>`;
    }
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
