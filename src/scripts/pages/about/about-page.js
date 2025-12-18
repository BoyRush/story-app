export default class AboutPage {
  async render() {
    return `
      <section class="container about-page">
        <h1>Tentang Saya</h1>

        <div class="about-profile">
          <img
            src="./images/profile.jpg"
            alt="Foto Profil"
            class="about-photo"
          />
        </div>

        <p>
          Saya adalah mahasiswa Program Studi Informatika di Institut Teknologi Del
          yang memiliki minat kuat di bidang UI/UX Design, pengembangan web,
          serta analisis data. Saya terbiasa mengerjakan berbagai proyek akademik
          maupun kolaboratif yang berfokus pada perancangan antarmuka yang
          fungsional, intuitif, dan berorientasi pada kebutuhan pengguna.
        </p>

        <p>
          Selain kemampuan teknis dalam bahasa pemrograman seperti Java, Python,
          HTML, dan PHP, saya juga berpengalaman menggunakan tools desain seperti
          Figma dan Canva. Saya memiliki kemampuan problem solving yang baik,
          mampu bekerja dalam tim, serta terbiasa berpikir sistematis dalam
          menyelesaikan permasalahan.
        </p>

        <p>
          Saya terus berupaya mengembangkan diri untuk menjadi seorang UX Designer
          yang mampu menghadirkan solusi digital yang efektif, efisien, dan
          berdampak nyata bagi pengguna.
        </p>
      </section>
    `;
  }

  async afterRender() {}
}
