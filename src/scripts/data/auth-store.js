const STORAGE_KEY = 'dicoding_story_token';

export function setAuthToken(token) {
  localStorage.setItem(STORAGE_KEY, token);
}

export function getAuthToken() {
  return localStorage.getItem(STORAGE_KEY);
}

export function clearAuthToken() {
  localStorage.removeItem(STORAGE_KEY);
}

export function isLoggedIn() {
  return Boolean(getAuthToken());
}
