class Navigation {
  constructor() {
    this.currentPage = 'home';

    // ナビボタン
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        this.switchPage(btn.dataset.page);
      });
    });

    // ホームボタン
    const hb = document.getElementById('home-button');
    if (hb) hb.addEventListener('click', () => this.switchPage('home'));

    // data-page リンク（イベント委譲）
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-page]');
      if (!t || t.classList.contains('nav-btn')) return;
      e.preventDefault();
      this.switchPage(t.dataset.page);
    });
  }

  switchPage(name) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(name + '-page');
    if (page) { page.classList.add('active'); this.currentPage = name; }

    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.page === name);
    });

    const hb = document.getElementById('home-button');
    if (hb) hb.classList.toggle('hidden', name === 'register' || name === 'post');

    window.scrollTo(0, 0);

    const renders = {
      home:       renderHomePage,
      register:   renderRegisterPage,
      'my-goods': renderMyGoodsPage,
      gallery:    renderGalleryPage,
      post:       renderPostPage,
      proposals:  renderProposalsPage,
    };
    if (renders[name]) renders[name]();
  }
}