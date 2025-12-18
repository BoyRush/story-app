export default class StoryDetailPresenter {
  #model;
  #view;
  #token;

  constructor({ model, view, token }) {
    this.#model = model;
    this.#view = view;
    this.#token = token;
  }

  async loadDetail(id) {
    try {
      this.#view.showLoading();
      const { story } = await this.#model.getStoryDetail({ id, token: this.#token });
      this.#view.renderStory(story);
    } catch (err) {
      this.#view.showError(err);
    }
  }
}
