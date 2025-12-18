import {
  addStory,
  addStoryGuest,
  getStories,
  getStoryDetail,
} from '../data/story-api';

export default class StoryModel {
  async getStories({ page = 1, size = 10, withLocation = true, token }) {
    return getStories({ page, size, withLocation, token });
  }

  async getStoryDetail({ id, token }) {
    return getStoryDetail({ id, token });
  }

  async addStory({ formData, token, asGuest = false }) {
    if (asGuest) {
      return addStoryGuest({ formData });
    }
    return addStory({ formData, token });
  }
}
