export default class AddStoryPresenter {
  #model;
  #view;
  #token;

  constructor({ model, view, token }) {
    this.#model = model;
    this.#view = view;
    this.#token = token;
  }

  async submitStory({ description, photoFile, lat, lon, asGuest }) {
    try {
      this.#view.clearFeedback();
      this.#view.showSubmitting();

      const formData = new FormData();
      formData.append('description', description);
      formData.append('photo', photoFile);
      if (lat !== null && lat !== '' && !Number.isNaN(Number(lat))) formData.append('lat', String(lat));
      if (lon !== null && lon !== '' && !Number.isNaN(Number(lon))) formData.append('lon', String(lon));

      await this.#model.addStory({
        formData,
        token: this.#token,
        asGuest,
      });

      this.#view.showSuccess();
      this.#view.resetForm();
    } catch (err) {
      this.#view.showSubmitError(err);
    } finally {
      this.#view.hideSubmitting();
    }
  }
}
