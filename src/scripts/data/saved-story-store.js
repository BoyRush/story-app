import { getDb } from './idb';

export async function saveStory(story) {
  const db = await getDb();
  await db.put('savedStories', story);
}

export async function deleteStory(id) {
  const db = await getDb();
  await db.delete('savedStories', id);
}

export async function getAllSavedStories() {
  const db = await getDb();
  return db.getAll('savedStories');
}

export async function isStorySaved(id) {
  const db = await getDb();
  const item = await db.get('savedStories', id);
  return Boolean(item);
}
