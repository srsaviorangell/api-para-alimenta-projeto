// ── SPA Router & App Shell ──────────────────────────────────
const Router = (() => {
    let currentPage = 'dashboard';
    let currentParams = {};

    const pages = {
        dashboard: () => renderDashboard(),
        events: () => renderEvents(),
        'event-form': (p) => renderEventForm(p),
        venues: () => renderVenues(),
        mappoints: () => renderMapPoints(),
        usefulinfo: () => renderUsefulInfo(),
        apiexplorer: () => renderApiExplorer(),
    };

    function go(page, params = {}) {
        currentPage = page;
        currentParams = params;

        // Update nav active state
        document.querySelectorAll('.nav-item').forEach(el => {
            el.classList.toggle('active', el.dataset.page === page || (page === 'event-form' && el.dataset.page === 'events'));
        });

        // Render page
        if (pages[page]) {
            pages[page](params);
        } else {
            document.getElementById('content').innerHTML =
                `<div class="empty-state"><div class="empty-icon">❓</div><div class="empty-title">Página não encontrada</div></div>`;
        }
    }

    return { go, current: () => currentPage };
})();

// ── Confirm Dialog (single, clean implementation) ────────────
window.Confirm = (() => {
    let _cb = null;

    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('confirmOk').addEventListener('click', () => {
            document.getElementById('confirmModal').style.display = 'none';
            if (typeof _cb === 'function') { _cb(); }
            _cb = null;
        });
        document.getElementById('confirmCancel').addEventListener('click', () => {
            document.getElementById('confirmModal').style.display = 'none';
            _cb = null;
        });
        // Close on backdrop click
        document.getElementById('confirmModal').addEventListener('click', e => {
            if (e.target === document.getElementById('confirmModal')) {
                document.getElementById('confirmModal').style.display = 'none';
                _cb = null;
            }
        });
    });

    return {
        show(title, msg, onOk) {
            _cb = onOk;
            document.getElementById('confirmTitle').textContent = title;
            document.getElementById('confirmMsg').innerHTML = msg;
            document.getElementById('confirmModal').style.display = 'flex';
        }
    };
})();

// ── Sidebar Toggle ──────────────────────────────────────────
function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainWrapper = document.getElementById('mainWrapper');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const topbarToggle = document.getElementById('topbarToggle');

    function toggle() {
        sidebar.classList.toggle('collapsed');
        mainWrapper.classList.toggle('expanded');
        const collapsed = sidebar.classList.contains('collapsed');
        document.documentElement.style.setProperty('--sidebar-w', collapsed ? '70px' : '260px');
    }

    sidebarToggle?.addEventListener('click', toggle);
    topbarToggle?.addEventListener('click', toggle);
}

// ── Nav Clicks ──────────────────────────────────────────────
function setupNav() {
    document.querySelectorAll('.nav-item[data-page]').forEach(el => {
        el.addEventListener('click', e => {
            e.preventDefault();
            Router.go(el.dataset.page);
        });
    });
}

// ── API Health Check ────────────────────────────────────────
async function checkApiHealth() {
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    try {
        const res = await fetch('/api/health');
        if (res.ok) {
            dot.classList.add('online'); dot.classList.remove('offline');
            text.textContent = 'API Online';
        } else throw new Error();
    } catch {
        dot.classList.add('offline'); dot.classList.remove('online');
        text.textContent = 'API Offline';
    }
}

// ── Update events badge ─────────────────────────────────────
async function updateEventsBadge() {
    try {
        const res = await api.get('/events?limit=500');
        const badge = document.getElementById('badge-events');
        if (badge) badge.textContent = (res.data || []).length;
    } catch { }
}

// ── Boot ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    setupSidebar();
    setupNav();
    await checkApiHealth();
    await updateEventsBadge();
    Router.go('dashboard');

    setInterval(checkApiHealth, 30000);
});
