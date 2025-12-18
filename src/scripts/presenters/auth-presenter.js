import { setAuthToken } from '../data/auth-store';

export default class AuthPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  async register({ name, email, password }) {
    try {
      this.#view.clearFeedback();
      this.#view.showSubmitting();
      await this.#model.register({ name, email, password });
      this.#view.showRegisterSuccess();
    } catch (err) {
      this.#view.showError(err);
    } finally {
      this.#view.hideSubmitting();
    }
  }

  async login({ email, password }) {
    try {
      this.#view.clearFeedback();
      this.#view.showSubmitting();
      const res = await this.#model.login({ email, password });
      const token = res?.loginResult?.token;
      if (!token) {
        throw new Error('Token tidak ditemukan dari response login');
      }
      setAuthToken(token);
      this.#view.showLoginSuccess();
    } catch (err) {
      this.#view.showError(err);
    } finally {
      this.#view.hideSubmitting();
    }
  }
}
