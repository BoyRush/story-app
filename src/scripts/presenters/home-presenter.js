export default class HomePresenter {
  #model;
  #view;
  #token;

  constructor({ model, view, token }) {
    this.#model = model;
    this.#view = view;
    this.#token = token;
  }

  async loadStories() {
    try {
      this.#view.showLoading();
      const { listStory } = await this.#model.getStories({
        page: 1,
        size: 20,
        withLocation: true,
        token: this.#token,
      });
      this.#view.renderStories(listStory);
      this.#view.renderMap(listStory);
    } catch (err) {
      this.#view.showError(err);
    }
  }
}
