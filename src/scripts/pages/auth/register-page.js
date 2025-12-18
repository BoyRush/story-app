import AuthModel from '../../models/auth-model';
import AuthPresenter from '../../presenters/auth-presenter';

export default class RegisterPage {
  #presenter;
  #isSubmitting = false;

  async render() {
    return `
      <section class="container narrow">
        <h1>Register</h1>
        <p class="sub">Buat akun untuk berbagi story.</p>

        <div id="auth-feedback" class="feedback" aria-live="polite"></div>

        <form id="register-form" class="form" novalidate>
          <div class="form-group">
            <label for="name">Nama</label>
            <input id="name" name="name" type="text" autocomplete="name" required />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" autocomplete="email" required />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" name="password" type="password" autocomplete="new-password" minlength="8" required />
            <p class="field-hint">Minimal 8 karakter.</p>
          </div>

          <button class="button" type="submit" id="submit-btn">Daftar</button>
        </form>

        <p class="helper">
          Sudah punya akun? <a href="#/login">Login</a>
        </p>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new AuthPresenter({ model: new AuthModel(), view: this });

    const form = document.getElementById('register-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (this.#isSubmitting) return;

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value;

      if (!name || !email || !password || password.length < 8) {
        this.showError(new Error('Nama, email, wajib diisi dan password minimal 8 karakter.'));
        return;
      }

      await this.#presenter.register({ name, email, password });
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
      btn.textContent = 'Daftar';
    }
  }

  showRegisterSuccess() {
    const el = document.getElementById('auth-feedback');
    if (el) el.innerHTML = `<p class="success">Akun berhasil dibuat. Silakan login.</p>`;
    location.hash = '#/login';
  }

  showLoginSuccess() {
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
