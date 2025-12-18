import { login, register } from '../data/story-api';

export default class AuthModel {
  async register({ name, email, password }) {
    return register({ name, email, password });
  }

  async login({ email, password }) {
    return login({ email, password });
  }
}
