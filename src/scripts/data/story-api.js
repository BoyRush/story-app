import CONFIG from '../config';

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = isJson && data && data.message ? data.message : response.statusText;
    const error = new Error(message);
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
}

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORIES_GUEST: `${CONFIG.BASE_URL}/stories/guest`,
  STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

export async function register({ name, email, password }) {
  return fetchJson(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
}

export async function login({ email, password }) {
  return fetchJson(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function getStories({ page, size, withLocation = true, token }) {
  const params = new URLSearchParams();
  if (page) params.set('page', String(page));
  if (size) params.set('size', String(size));
  params.set('location', withLocation ? '1' : '0');

  return fetchJson(`${ENDPOINTS.STORIES}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getStoryDetail({ id, token }) {
  return fetchJson(ENDPOINTS.STORY_DETAIL(id), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function addStory({ formData, token }) {
  return fetchJson(ENDPOINTS.STORIES, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // DO NOT set Content-Type for multipart; browser will set boundary.
    },
    body: formData,
  });
}

export async function addStoryGuest({ formData }) {
  return fetchJson(ENDPOINTS.STORIES_GUEST, {
    method: 'POST',
    body: formData,
  });
}

export async function subscribeNotification({ subscription, token }) {
  const payload = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.toJSON().keys.p256dh,
      auth: subscription.toJSON().keys.auth,
    },
  };

  return fetchJson(ENDPOINTS.SUBSCRIBE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function unsubscribeNotification({ endpoint, token }) {
  return fetchJson(ENDPOINTS.SUBSCRIBE, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ endpoint }),
  });
}