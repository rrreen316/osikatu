let postPhotoData = null;

function renderPostPage() {
  const page = document.getElementById('post-page');
  const opts = generateDimensionOptions();
  postPhotoData = null;

  page.innerHTML = `
    <div class="page-header"><h2>飾り方を投稿</h2></div>
    <div class="page-content">
      <div class="form">
        <div class="form-group">
          <label>写真（任意）</label>
          <div class="photo-upload">
            <div id="post-photo-preview" class="photo-preview" style="display:none;">
              <img id="post-preview-img" src="" alt="プレビュー">
              <button type="button" class="btn btn-secondary" id="post-remove-photo">削除</button>
            </div>
            <div id="post-photo-buttons" class="photo-buttons">
              <button type="button" class="btn btn-secondary" id="post-camera-btn">📷 カメラで撮影</button>
              <button type="button" class="btn btn-secondary" id="post-library-btn">🖼️ ライブラリから選択</button>
            </div>
            <input type="file" id="post-photo-input" accept="image/*" style="display:none;">
          </div>
        </div>
        <div class="form-group">
          <label for="post-title">タイトル *</label>
          <input type="text" id="post-title" placeholder="例: デスク上の飾り方">
        </div>
        <div class="form-group">
          <label for="post-goods">使用したグッズ *</label>
          <input type="text" id="post-goods" placeholder="例: アクスタ、ぬいぐるみ">
        </div>
        <div class="form-group">
          <label>使用した道具（任意）</label>
          <div id="post-tools-container">
            <div class="tool-input">
              <input type="text" class="tool-name" placeholder="道具の名前">
              <input type="text" class="tool-store" placeholder="購入した店">
              <button type="button" class="btn btn-secondary" data-action="remove-tool">削除</button>
            </div>
          </div>
          <button type="button" class="btn btn-secondary" id="add-tool-btn" style="margin-top:8px;">➕ 道具を追加</button>
        </div>
        <div class="form-group">
          <label>寸法（任意）</label>
          <div class="dimension-inputs">
            <div class="dimension-group"><label>幅（1個 ≈ 約25cm）</label>
              <select id="post-width"><option value="">選択</option>${opts.map(o=>`<option value="${o}">${o}個（約${o*25}cm）</option>`).join('')}</select></div>
            <div class="dimension-group"><label>奥行き（1個 ≈ 約10cm）</label>
              <select id="post-depth"><option value="">選択</option>${opts.map(o=>`<option value="${o}">${o}個（約${o*10}cm）</option>`).join('')}</select></div>
            <div class="dimension-group"><label>高さ（1個 ≈ 約20cm）</label>
              <select id="post-height"><option value="">選択</option>${opts.map(o=>`<option value="${o}">${o}個（約${o*20}cm）</option>`).join('')}</select></div>
          </div>
        </div>
        <button type="button" class="btn btn-primary btn-block" id="post-submit-btn" style="margin-top:8px;">投稿する</button>
      </div>
    </div>`;

  const input = document.getElementById('post-photo-input');
  document.getElementById('post-camera-btn').addEventListener('click', () => {
    input.setAttribute('capture', 'environment'); input.setAttribute('accept', 'image/*');
    setTimeout(() => input.click(), 50);
  });
  document.getElementById('post-library-btn').addEventListener('click', () => {
    input.removeAttribute('capture'); input.setAttribute('accept', 'image/*');
    setTimeout(() => input.click(), 50);
  });
  document.getElementById('post-remove-photo').addEventListener('click', () => {
    postPhotoData = null;
    document.getElementById('post-photo-preview').style.display = 'none';
    document.getElementById('post-photo-buttons').style.display = 'flex';
    input.value = '';
  });
  input.addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      postPhotoData = ev.target.result;
      document.getElementById('post-preview-img').src = postPhotoData;
      document.getElementById('post-photo-preview').style.display = 'block';
      document.getElementById('post-photo-buttons').style.display = 'none';
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('add-tool-btn').addEventListener('click', () => addTool());

  document.getElementById('post-submit-btn').addEventListener('click', async () => {
    const title = document.getElementById('post-title').value.trim();
    const goods = document.getElementById('post-goods').value.trim();
    if (!title || !goods) { showAlert('タイトルと使用したグッズは必須です'); return; }
    const tools = [];
    document.querySelectorAll('#post-tools-container .tool-input').forEach(row => {
      const n = row.querySelector('.tool-name')?.value?.trim();
      const s = row.querySelector('.tool-store')?.value?.trim();
      if (n) tools.push({ name: n, store: s || '' });
    });
    const btn = document.getElementById('post-submit-btn');
    btn.disabled = true; btn.textContent = '投稿中...';
    try {
      await DB.saveGalleryPost({
        title, description: goods, goods, tools,
        dimensions: {
          width:  document.getElementById('post-width').value  ? parseFloat(document.getElementById('post-width').value)  : null,
          depth:  document.getElementById('post-depth').value  ? parseFloat(document.getElementById('post-depth').value)  : null,
          height: document.getElementById('post-height').value ? parseFloat(document.getElementById('post-height').value) : null,
        },
        imageUri: postPhotoData || null,
      });
      showToast('投稿しました！');
      postPhotoData = null;
      navigation.switchPage('gallery');
    } catch(e) {
      showAlert('投稿に失敗しました。通信状況を確認してください。');
      btn.disabled = false; btn.textContent = '投稿する';
    }
  });
}

function addTool() {
  const c = document.getElementById('post-tools-container');
  const d = document.createElement('div');
  d.className = 'tool-input';
  d.innerHTML = `<input type="text" class="tool-name" placeholder="道具の名前">
    <input type="text" class="tool-store" placeholder="購入した店">
    <button type="button" class="btn btn-secondary" data-action="remove-tool">削除</button>`;
  c.appendChild(d);
}

function removeTool(btn) {
  btn.closest('.tool-input').remove();
}