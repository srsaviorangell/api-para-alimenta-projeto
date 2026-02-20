// ── API Client ─────────────────────────────────────────────
const API_BASE = '/api';

const api = {
    async request(method, path, body) {
        const opts = { method, headers: {} };
        if (body && !(body instanceof FormData)) {
            opts.headers['Content-Type'] = 'application/json';
            opts.body = JSON.stringify(body);
        } else if (body instanceof FormData) {
            opts.body = body;
        }
        const res = await fetch(`${API_BASE}${path}`, opts);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.message || `Erro ${res.status}`);
        return json;
    },
    get: (path) => api.request('GET', path),
    post: (path, body) => api.request('POST', path, body),
    put: (path, body) => api.request('PUT', path, body),
    delete: (path) => api.request('DELETE', path),
    upload: async (path, formData) => {
        const res = await fetch(`${API_BASE}${path}`, { method: 'POST', body: formData });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.message || `Erro ${res.status}`);
        return json;
    }
};

// ── Download helpers ────────────────────────────────────────
function downloadUrl(url, filename) {
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
}
