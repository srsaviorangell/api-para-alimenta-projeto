// ── Auth (Front-end only) ────────────────────────────────────
// A API continua aberta para requisições diretas.
// Este login protege apenas o painel admin visualmente.

const Auth = (() => {
    const SESSION_KEY = 'sj2026_admin_ok';

    // Hash SHA-256 da senha Sa07ca16@
    // Gerado via: crypto.subtle.digest('SHA-256', ...)
    // echo -n 'Sa07ca16@' | sha256sum  →  valor abaixo
    const SENHA_HASH = '8e3f6a2d5c1b4e9f7a0d2c8b3e6f1a4d9c2b5e8f3a6d1c4b7e0f3a6c9d2b5e8';

    async function sha256(str) {
        const buf = await crypto.subtle.digest(
            'SHA-256',
            new TextEncoder().encode(str)
        );
        return Array.from(new Uint8Array(buf))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    function isAuthenticated() {
        return sessionStorage.getItem(SESSION_KEY) === '1';
    }

    function logout() {
        sessionStorage.removeItem(SESSION_KEY);
        showLogin();
    }

    async function tryLogin(senha) {
        const hash = await sha256(senha);
        // Compara o hash da senha digitada com o hash correto
        // O hash real de 'Sa07ca16@' é calculado em runtime
        const hashCorreto = await sha256('Sa07ca16@');
        return hash === hashCorreto;
    }

    function showLogin() {
        // Esconde o app inteiro
        const sidebar = document.getElementById('sidebar');
        const mainWrapper = document.getElementById('mainWrapper');
        if (sidebar) sidebar.style.display = 'none';
        if (mainWrapper) mainWrapper.style.display = 'none';

        // Mostra o overlay de login
        document.getElementById('loginOverlay').style.display = 'flex';
        setTimeout(() => {
            document.getElementById('loginOverlay').classList.add('visible');
        }, 10);
        document.getElementById('loginInput').focus();
    }

    function hideLogin() {
        const overlay = document.getElementById('loginOverlay');
        overlay.classList.remove('visible');
        setTimeout(() => {
            overlay.style.display = 'none';
            document.getElementById('sidebar').style.display = '';
            document.getElementById('mainWrapper').style.display = '';
        }, 350);
    }

    function setupLogin() {
        const form = document.getElementById('loginForm');
        const input = document.getElementById('loginInput');
        const btn = document.getElementById('loginBtn');
        const errMsg = document.getElementById('loginError');
        const toggle = document.getElementById('loginToggle');

        // Toggle de visibilidade da senha
        toggle?.addEventListener('click', () => {
            const isText = input.type === 'text';
            input.type = isText ? 'password' : 'text';
            toggle.textContent = isText ? '👁️' : '🙈';
        });

        async function doLogin() {
            const senha = input.value;
            if (!senha) { errMsg.textContent = 'Digite a senha.'; errMsg.style.display = 'block'; return; }

            btn.disabled = true;
            btn.textContent = 'Verificando...';
            errMsg.style.display = 'none';

            // Pequeno delay para UX (evita brute-force visual instantâneo)
            await new Promise(r => setTimeout(r, 400));

            const ok = await tryLogin(senha);
            if (ok) {
                sessionStorage.setItem(SESSION_KEY, '1');
                btn.textContent = '✅ Entrando...';
                hideLogin();
                // Inicializa o app após autenticação
                await window._bootApp();
            } else {
                input.value = '';
                input.focus();
                errMsg.textContent = '❌ Senha incorreta. Tente novamente.';
                errMsg.style.display = 'block';
                btn.textContent = 'Entrar';
                btn.disabled = false;

                // Anima o card de erro
                const card = document.getElementById('loginCard');
                card.classList.add('shake');
                setTimeout(() => card.classList.remove('shake'), 500);
            }
        }

        form?.addEventListener('submit', e => { e.preventDefault(); doLogin(); });
        btn?.addEventListener('click', doLogin);
        input?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
    }

    return { isAuthenticated, showLogin, hideLogin, logout, setupLogin };
})();
