// ── Toast Notification System ───────────────────────────────
const Toast = (() => {
    const container = () => document.getElementById('toast-container');

    function show(type, message, duration = 4000) {
        const icons = { success: '✅', error: '❌', info: 'ℹ️' };
        const div = document.createElement('div');
        div.className = `toast ${type}`;
        div.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
      <span class="toast-msg">${message}</span>
      <button class="toast-remove" onclick="this.parentElement.remove()">✕</button>
    `;
        container().appendChild(div);
        setTimeout(() => {
            div.classList.add('leaving');
            div.addEventListener('animationend', () => div.remove());
        }, duration);
    }

    return {
        success: msg => show('success', msg),
        error: msg => show('error', msg),
        info: msg => show('info', msg)
    };
})();
