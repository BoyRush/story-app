import AuthModel from '../../models/auth-model';
import AuthPresenter from '../../presenters/auth-presenter';

export default class LoginPage {
  #presenter;
  #isSubmitting = false;

  async render() {
    return `
      <section class="container narrow">
        <h1>Login</h1>
        <p class="sub">Masuk untuk melihat dan membuat story.</p>

        <a class="skip-to" href="#main-content">Skip to content</a>

        <div id="auth-feedback" class="feedback" aria-live="polite"></div>

        <form id="login-form" class="form" novalidate>
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" autocomplete="email" required />
            <p class="field-hint" id="email-hint">Gunakan email yang sudah terdaftar.</p>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" name="password" type="password" autocomplete="current-password" minlength="8" required />
          </div>

          <button class="button" type="submit" id="submit-btn">Masuk</button>
        </form>

        <p class="helper">
          Belum punya akun? <a href="#/register">Register</a>
        </p>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new AuthPresenter({ model: new AuthModel(), view: this });

    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (this.#isSubmitting) return;

      const email = form.email.value.trim();
      const password = form.password.value;

      // simple validation (Skilled criteria for feedback)
      if (!email || !password || password.length < 8) {
        this.showError(new Error('Email wajib diisi dan password minimal 8 karakter.'));
        return;
      }

      await this.#presenter.login({ email, password });
    });
  }

  clearFeedback() {
    const el = document.getElementById('auth-feedback');
    if (el) el.innerHTML = '';
  }

  showSubmitting() {
    this.#isSubmitting = true;
    const btn = document.getElementById('submit-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Memproses...';
    }
  }

  hideSubmitting() {
    this.#isSubmitting = false;
    const btn = document.getElementById('submit-btn');
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Masuk';
    }
  }

  showLoginSuccess() {
    const el = document.getElementById('auth-feedback');
    if (el) el.innerHTML = `<p class="success">Login berhasil.</p>`;
    // go to home
    location.hash = '#/';
  }

  showRegisterSuccess() {
    // unused here
  }

  showError(err) {
    const el = document.getElementById('auth-feedback');
    if (el) el.innerHTML = `<p class="error">${this.#escape(err.message)}</p>`;
  }

  #escape(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}
