import { openDB } from 'idb';

const DB_NAME = 'dicoding-story-db';
const DB_VERSION = 1;

export async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('savedStories')) {
        db.createObjectStore('savedStories', { keyPath: 'id' });
      }
    },
  });
}
