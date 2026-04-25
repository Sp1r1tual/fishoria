declare global {
  interface Window {
    currentUserId: string | null;
    checkSwagger: () => Promise<void>;
    showDocMessage: (title: string, message: string) => void;
    showModalContent: (html: string) => void;
    clearError: (id: string) => void;
    showError: (id: string, message: string) => void;
    showApiError: (formPrefix: string, message: string | string[]) => void;
    openLoginModal: () => void;
    submitLogin: () => Promise<void>;
    openBanModal: () => void;
    submitBan: () => Promise<void>;
    openUnbanModal: () => void;
    submitUnban: () => Promise<void>;
    openDoc: (filename: string) => Promise<void>;
    closeDoc: () => void;
  }
}

export const AdminDashboardScript = () => {
  let currentUserId: string | null = null;

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
  };

  const setLoading = (
    btnId: string,
    isLoading: boolean,
    defaultText: string,
  ) => {
    const btn = document.getElementById(btnId) as HTMLButtonElement;
    if (!btn) return;
    if (isLoading) {
      btn.classList.add('btn-loading');
      btn.innerHTML = `<span class="spinner"></span><span class="btn-text">Processing...</span>`;
    } else {
      btn.classList.remove('btn-loading');
      btn.innerHTML = defaultText;
    }
  };

  const setSuccess = (btnId: string, message: string) => {
    const btn = document.getElementById(btnId) as HTMLButtonElement;
    if (!btn) return;
    btn.classList.remove('btn-loading');
    btn.classList.add('btn-success');
    btn.innerHTML = `<span>✓</span> ${message}`;
    setTimeout(() => {
      window.closeDoc();
    }, 3000);
  };

  window.checkSwagger = async function () {
    try {
      const response = await fetch('/docs-json');
      if (response.ok) {
        window.location.href = '/docs';
      } else {
        window.showDocMessage(
          '🚧 Swagger Documentation',
          'The Swagger documentation is still in the formative stage. Please use the internal Wiki on the left to familiarize yourself with the architecture.',
        );
      }
    } catch {
      window.showDocMessage(
        '🚧 Swagger Documentation',
        'The API documentation service is currently unavailable or has not yet been formed.',
      );
    }
  };

  window.showDocMessage = function (title: string, message: string) {
    const html =
      '<h1>' +
      title +
      '</h1><p style="font-size: 1.1rem; margin-top: 2rem;">' +
      message +
      '</p>';
    window.showModalContent(html);
  };

  window.showModalContent = function (html: string) {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const modal = document.getElementById('modal');
    const content = document.getElementById('doc-content');

    if (modal && content) {
      modal.style.display = 'block';
      content.innerHTML = html;
    }
  };

  window.clearError = function (id: string) {
    const el = document.getElementById(id);
    const err = document.getElementById(id + '-error');

    if (el) el.classList.remove('input-error');
    if (err) err.style.display = 'none';

    const apiErrId = id.split('-')[0] + '-api-error';
    const apiErr = document.getElementById(apiErrId);

    if (apiErr) apiErr.style.display = 'none';
  };

  window.showError = function (id: string, message: string) {
    const el = document.getElementById(id);
    const err = document.getElementById(id + '-error');

    if (el) el.classList.add('input-error');
    if (err) {
      err.innerText = message;
      err.style.display = 'block';
    }
  };

  const errorTranslations: Record<string, string> = {
    'landing.auth.errors.userNotFound': 'User not found.',
    'landing.auth.errors.incorrectPassword': 'Incorrect password.',
    'landing.auth.errors.accountBanned': 'This account is banned.',
    'landing.auth.errors.googleAccount': 'This account requires Google login.',
    'landing.auth.errors.emailNotActivated': 'Email address is not activated.',
    Unauthorized: 'Unauthorized. Please check your credentials.',
    Forbidden: 'You do not have permission to perform this action.',
  };

  window.showApiError = function (
    formPrefix: string,
    message: string | string[],
  ) {
    const err = document.getElementById(formPrefix + '-api-error');
    if (err) {
      const msgText = Array.isArray(message) ? message[0] : message;

      err.innerText = errorTranslations[msgText] || msgText;
      err.style.display = 'block';
    }
  };

  window.openLoginModal = function () {
    const html = `
      <div style="max-width: 400px; margin: 0 auto; text-align: center;">
        <h2 style="margin-bottom: 2rem; color: var(--accent);">Moderator Login</h2>
        <div class="input-group">
          <label>Email</label>
          <input type="email" id="login-email" placeholder="admin@fishoria.com" oninput="clearError('login-email')" onkeypress="if(event.key === 'Enter') submitLogin()">
          <div id="login-email-error" class="error-msg"></div>
        </div>
        <div class="input-group">
          <label>Password</label>
          <input type="password" id="login-password" placeholder="********" oninput="clearError('login-password')" onkeypress="if(event.key === 'Enter') submitLogin()">
          <div id="login-password-error" class="error-msg"></div>
        </div>
        <div id="login-api-error" class="error-msg" style="margin-bottom: 1rem; text-align: center;"></div>
        <button id="btn-submit-login" class="btn" onclick="submitLogin()" style="width: 100%; border: none; cursor: pointer;">LOGIN</button>
      </div>
    `;
    window.showModalContent(html);
  };

  window.submitLogin = async function () {
    const emailEl = document.getElementById('login-email') as HTMLInputElement;
    const passwordEl = document.getElementById(
      'login-password',
    ) as HTMLInputElement;
    const email = emailEl.value.trim();
    const password = passwordEl.value.trim();

    let hasError = false;
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (!email) {
      window.showError('login-email', 'Email is required');
      hasError = true;
    } else if (!emailRegex.test(email)) {
      window.showError('login-email', 'Please enter a valid email address');
      hasError = true;
    }

    if (!password) {
      window.showError('login-password', 'Password is required');
      hasError = true;
    } else if (password.length < 6) {
      window.showError(
        'login-password',
        'Password must be at least 6 characters',
      );
      hasError = true;
    }

    if (hasError) return;

    setLoading('btn-submit-login', true, 'LOGIN');

    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') || '',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        currentUserId = data.user?.id || data.id;

        const btnLogin = document.getElementById('btn-login-mod');
        const btnBan = document.getElementById('btn-ban-user');
        const btnUnban = document.getElementById('btn-unban-user');

        if (btnLogin) btnLogin.style.display = 'none';
        if (btnBan) btnBan.style.display = 'inline-block';
        if (btnUnban) btnUnban.style.display = 'inline-block';

        window.closeDoc();
      } else {
        window.showApiError('login', data.message || 'Login failed');
      }
    } catch {
      window.showApiError('login', 'Network error or server unreachable');
    } finally {
      setLoading('btn-submit-login', false, 'LOGIN');
    }
  };

  window.openBanModal = function () {
    const html = `
      <div style="max-width: 400px; margin: 0 auto; text-align: center;">
        <h2 style="margin-bottom: 2rem; color: #ef4444;">Ban User</h2>
        <div class="input-group">
          <label>User ID</label>
          <input type="text" id="ban-user-id" placeholder="UUID..." oninput="clearError('ban-user-id')" onkeypress="if(event.key === 'Enter') submitBan()">
          <div id="ban-user-id-error" class="error-msg"></div>
        </div>
        <div class="input-group">
          <label>Reason</label>
          <input type="text" id="ban-reason" placeholder="Rule violation..." oninput="clearError('ban-reason')" onkeypress="if(event.key === 'Enter') submitBan()">
          <div id="ban-reason-error" class="error-msg"></div>
        </div>
        <div id="ban-api-error" class="error-msg" style="margin-bottom: 1rem; text-align: center;"></div>
        <button id="btn-submit-ban" class="btn" onclick="submitBan()" style="width: 100%; border: none; cursor: pointer; background: #ef4444; color: white;">BAN USER</button>
      </div>
    `;
    window.showModalContent(html);
  };

  window.submitBan = async function () {
    const userIdEl = document.getElementById('ban-user-id') as HTMLInputElement;
    const reasonEl = document.getElementById('ban-reason') as HTMLInputElement;
    const userId = userIdEl.value.trim();
    const reason = reasonEl.value.trim();

    let hasError = false;
    if (!userId) {
      window.showError('ban-user-id', 'User ID is required');
      hasError = true;
    }
    if (!reason) {
      window.showError('ban-reason', 'Reason is required');
      hasError = true;
    }

    if (hasError) return;

    if (userId === currentUserId) {
      window.showApiError('ban', '🛡️ Safety First: You cannot ban yourself!');
      return;
    }

    setLoading('btn-submit-ban', true, 'BAN USER');

    try {
      const res = await fetch('/admin/ban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') || '',
        },
        body: JSON.stringify({ userId, reason }),
      });
      if (res.ok) {
        setSuccess('btn-submit-ban', 'Banned Successfully');
        return; // Success handled
      } else {
        const data = await res.json();
        window.showApiError('ban', data.message || 'Failed to ban user');
      }
    } catch {
      window.showApiError('ban', 'Network error or not logged in as MODERATOR');
    } finally {
      const btn = document.getElementById('btn-submit-ban');
      if (btn && !btn.classList.contains('btn-success')) {
        setLoading('btn-submit-ban', false, 'BAN USER');
      }
    }
  };

  window.openUnbanModal = function () {
    const html = `
      <div style="max-width: 400px; margin: 0 auto; text-align: center;">
        <h2 style="margin-bottom: 2rem; color: #f59e0b;">Unban User</h2>
        <div class="input-group">
          <label>User ID</label>
          <input type="text" id="unban-user-id" placeholder="UUID..." oninput="clearError('unban-user-id')" onkeypress="if(event.key === 'Enter') submitUnban()">
          <div id="unban-user-id-error" class="error-msg"></div>
        </div>
        <div id="unban-api-error" class="error-msg" style="margin-bottom: 1rem; text-align: center;"></div>
        <button id="btn-submit-unban" class="btn" onclick="submitUnban()" style="width: 100%; border: none; cursor: pointer; background: #f59e0b; color: white;">UNBAN USER</button>
      </div>
    `;
    window.showModalContent(html);
  };

  window.submitUnban = async function () {
    const userIdEl = document.getElementById(
      'unban-user-id',
    ) as HTMLInputElement;
    const userId = userIdEl.value.trim();

    if (!userId) {
      window.showApiError('unban', 'User ID is required');
      return;
    }

    setLoading('btn-submit-unban', true, 'UNBAN USER');

    try {
      const checkRes = await fetch(
        '/admin/check-ban/' + userId + '?t=' + Date.now(),
        {
          headers: {
            'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') || '',
          },
          cache: 'no-store',
        },
      );
      const checkData = await checkRes.json();

      if (!checkRes.ok || !checkData.isBanned) {
        window.showApiError('unban', 'User is not currently banned.');
        return;
      }

      const res = await fetch('/admin/unban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') || '',
        },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setSuccess('btn-submit-unban', 'Unbanned Successfully');
        return;
      } else {
        const data = await res.json();
        window.showApiError('unban', data.message || 'Failed to unban user');
      }
    } catch (err: unknown) {
      window.showApiError(
        'unban',
        err instanceof Error
          ? err.message
          : 'Network error or not logged in as MODERATOR',
      );
    } finally {
      const btn = document.getElementById('btn-submit-unban');
      if (btn && !btn.classList.contains('btn-success')) {
        setLoading('btn-submit-unban', false, 'UNBAN USER');
      }
    }
  };

  window.openDoc = async function (filename: string) {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const modal = document.getElementById('modal');
    const content = document.getElementById('doc-content');

    if (modal && content) {
      modal.style.display = 'block';
      content.innerHTML =
        '<div style="text-align: center; padding: 4rem;"><h1>Loading...</h1></div>';

      try {
        const response = await fetch('/admin/api/docs-content/' + filename);
        const data = await response.json();

        content.innerHTML = data.html;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        content.innerHTML =
          '<h1>Error loading documentation</h1><p>' + errorMessage + '</p>';
      }
    }
  };

  window.closeDoc = function () {
    const modal = document.getElementById('modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  };

  window.onkeydown = function (event) {
    if (event.keyCode === 27) window.closeDoc();
  };
};
