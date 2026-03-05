let editingGoodsId = null;
let currentPhotoData = null;

function renderRegisterPage() {
  const page = document.getElementById('register-page');
  const opts = generateDimensionOptions();

  page.innerHTML = `
    <div class="page-header"><h2>グッズ登録</h2></div>
    <div class="page-content">
      <div class="register-tabs">
        <button class="tab-btn active" data-tab="manual">手入力で登録</button>
        <button class="tab-btn" data-tab="photo">写真で登録</button>
      </div>
      <div id="manual-tab" class="tab-content active">
        <div class="form">
          <div class="form-group">
            <label for="group-name">グループ名 *</label>
            <input type="text" id="group-name" placeholder="例: 推しグループA">
          </div>
          <div class="form-group">
            <label for="genre">ジャンル *</label>
            <input type="text" id="genre" placeholder="例: アクスタ">
          </div>
          <div class="form-group">
            <label>寸法（任意）</label>
            <div class="dimension-inputs">
              <div class="dimension-group"><label>幅（1個 ≈ 約25cm）</label>
                <select id="width"><option value="">選択</option>${opts.map(o=>`<option value="${o}">${o}個（約${o*25}cm）</option>`).join('')}</select></div>
              <div class="dimension-group"><label>奥行き（1個 ≈ 約10cm）</label>
                <select id="depth"><option value="">選択</option>${opts.map(o=>`<option value="${o}">${o}個（約${o*10}cm）</option>`).join('')}</select></div>
              <div class="dimension-group"><label>高さ（1個 ≈ 約20cm）</label>
                <select id="height"><option value="">選択</option>${opts.map(o=>`<option value="${o}">${o}個（約${o*20}cm）</option>`).join('')}</select></div>
            </div>
          </div>
          <div class="form-group">
            <label for="memo">メモ（任意）</label>
            <textarea id="memo" placeholder="このグッズについてのメモ" rows="3"></textarea>
          </div>
          <button type="button" class="btn btn-primary btn-block" id="register-submit-btn">登録する</button>
        </div>
      </div>
      <div id="photo-tab" class="tab-content">
        <div class="form">
          <div class="form-group">
            <label>写真</label>
            <div class="photo-upload">
              <div id="reg-photo-preview" class="photo-preview" style="display:none;">
                <img id="reg-preview-img" src="" alt="プレビュー">
                <button type="button" class="btn btn-secondary" id="reg-remove-photo">削除</button>
              </div>
              <div id="reg-photo-buttons" class="photo-buttons">
                <button type="button" class="btn btn-secondary" id="reg-camera-btn">📷 カメラで撮影</button>
                <button type="button" class="btn btn-secondary" id="reg-library-btn">🖼️ ライブラリから選択</button>
              </div>
              <input type="file" id="reg-photo-input" accept="image/*" style="display:none;">
            </div>
          </div>
          <div class="form-group">
            <label for="photo-group-name">グループ名 *</label>
            <input type="text" id="photo-group-name" placeholder="例: 推しグループA">
          </div>
          <div class="form-group">
            <label for="photo-genre">ジャンル *</label>
            <input type="text" id="photo-genre" placeholder="例: アクスタ">
          </div>
          <div class="form-group">
            <label for="photo-memo">メモ（任意）</label>
            <textarea id="photo-memo" placeholder="このグッズについてのメモ" rows="3"></textarea>
          </div>
          <button type="button" class="btn btn-primary btn-block" id="photo-submit-btn">登録する</button>
        </div>
      </div>
    </div>`;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab + '-tab').classList.add('active');
    });
  });

  document.getElementById('register-submit-btn').addEventListener('click', async () => {
    const groupName = document.getElementById('group-name').value.trim();
    const genre     = document.getElementById('genre').value.trim();
    if (!groupName || !genre) { showAlert('グループ名とジャンルは必須です'); return; }
    const btn = document.getElementById('register-submit-btn');
    btn.disabled = true; btn.textContent = '登録中...';
    try {
      const data = {
        groupName, genre,
        dimensions: {
          width:  document.getElementById('width').value  ? parseFloat(document.getElementById('width').value)  : null,
          depth:  document.getElementById('depth').value  ? parseFloat(document.getElementById('depth').value)  : null,
          height: document.getElementById('height').value ? parseFloat(document.getElementById('height').value) : null,
        },
        memo: document.getElementById('memo').value,
      };
      if (editingGoodsId) { data.id = editingGoodsId; editingGoodsId = null; }
      await DB.saveGoods(data);
      showToast('グッズを登録しました！');
      navigation.switchPage('home');
    } catch(e) {
      showAlert('登録に失敗しました。通信状況を確認してください。');
      btn.disabled = false; btn.textContent = '登録する';
    }
  });

  document.getElementById('photo-submit-btn').addEventListener('click', async () => {
    const groupName = document.getElementById('photo-group-name').value.trim();
    const genre     = document.getElementById('photo-genre').value.trim();
    if (!groupName || !genre) { showAlert('グループ名とジャンルは必須です'); return; }
    const btn = document.getElementById('photo-submit-btn');
    btn.disabled = true; btn.textContent = '登録中...';
    try {
      const data = {
        groupName, genre,
        dimensions: { width: null, depth: null, height: null },
        memo: document.getElementById('photo-memo').value,
        imageUri: currentPhotoData || null,
      };
      if (editingGoodsId) { data.id = editingGoodsId; editingGoodsId = null; }
      await DB.saveGoods(data);
      showToast('グッズを登録しました！');
      currentPhotoData = null;
      navigation.switchPage('home');
    } catch(e) {
      showAlert('登録に失敗しました。通信状況を確認してください。');
      btn.disabled = false; btn.textContent = '登録する';
    }
  });

  const ri = document.getElementById('reg-photo-input');
  document.getElementById('reg-camera-btn').addEventListener('click', () => {
    ri.setAttribute('capture', 'environment'); ri.setAttribute('accept', 'image/*');
    setTimeout(() => ri.click(), 50);
  });
  document.getElementById('reg-library-btn').addEventListener('click', () => {
    ri.removeAttribute('capture'); ri.setAttribute('accept', 'image/*');
    setTimeout(() => ri.click(), 50);
  });
  document.getElementById('reg-remove-photo').addEventListener('click', () => {
    currentPhotoData = null;
    document.getElementById('reg-photo-preview').style.display = 'none';
    document.getElementById('reg-photo-buttons').style.display = 'flex';
    ri.value = '';
  });
  ri.addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      currentPhotoData = ev.target.result;
      document.getElementById('reg-preview-img').src = currentPhotoData;
      document.getElementById('reg-photo-preview').style.display = 'block';
      document.getElementById('reg-photo-buttons').style.display = 'none';
    };
    reader.readAsDataURL(file);
  });
}