const _goodsCache = new Map();

function renderMyGoodsPage() {
  const page = document.getElementById('my-goods-page');
  const all = DB.getAllGoods();
  const map = new Map();
  all.forEach(g => {
    if (!map.has(g.groupName)) map.set(g.groupName, []);
    map.get(g.groupName).push(g);
  });

  page.innerHTML = `
    <div class="page-header"><h2>所持グッズ</h2></div>
    <div class="page-content">
      <div class="goods-list">
        ${map.size === 0
          ? `<div class="empty-state"><p>グッズがまだ登録されていません</p>
             <button class="btn btn-primary" data-page="register">グッズを登録</button></div>`
          : Array.from(map.entries()).map(([gn, items]) => `
            <div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--border);">
                <span style="font-size:16px;font-weight:700;">${gn}</span>
                <span style="background:#22c55e;color:#fff;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;">計${items.length}個</span>
              </div>
              <div style="display:flex;flex-direction:column;gap:8px;">
                ${items.map(g => {
                  const k = 'g_' + g.id;
                  _goodsCache.set(k, g);
                  return `<div class="goods-card" data-action="goods-detail" data-key="${k}" style="cursor:pointer;">
                    <div style="display:flex;justify-content:space-between;align-items:center;pointer-events:none;">
                      <div>
                        <div style="font-weight:600;font-size:14px;">${g.genre}</div>
                        <div style="font-size:12px;color:#687076;margin-top:2px;">${formatDate(g.createdAt)}</div>
                      </div>
                      <span class="goods-card-genre">${g.genre}</span>
                    </div>
                    ${g.memo ? `<div class="goods-card-memo" style="pointer-events:none;"><p>${g.memo}</p></div>` : ''}
                  </div>`;
                }).join('')}
              </div>
            </div>`).join('')
        }
      </div>
    </div>`;
}

function openGoodsDetail(key) {
  const g = _goodsCache.get(key); if (!g) return;
  const dims = formatDimensions(g.dimensions?.width, g.dimensions?.depth, g.dimensions?.height);
  showModal(`
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div><label style="font-weight:600;font-size:12px;color:#687076;">グループ</label><p style="margin-top:4px;">${g.groupName}</p></div>
      <div><label style="font-weight:600;font-size:12px;color:#687076;">ジャンル</label><p style="margin-top:4px;">${g.genre}</p></div>
      ${dims.length ? `<div><label style="font-weight:600;font-size:12px;color:#687076;">寸法</label><div style="margin-top:4px;">${dims.map(d=>`<p>${d}</p>`).join('')}</div></div>` : ''}
      ${g.memo ? `<div><label style="font-weight:600;font-size:12px;color:#687076;">メモ</label><p style="margin-top:4px;">${g.memo}</p></div>` : ''}
      <div style="display:flex;gap:10px;margin-top:8px;">
        <button class="btn btn-secondary" style="flex:1;" data-action="goods-edit" data-key="${key}">編集</button>
        <button class="btn btn-secondary" style="flex:1;background:#ef4444;color:#fff;" data-action="goods-delete" data-key="${key}">削除</button>
      </div>
    </div>`, `${g.groupName} - ${g.genre}`);
}

function deleteGoods(key) {
  const g = _goodsCache.get(key); if (!g) return;
  if (!confirm('このグッズを削除しますか？')) return;
  DB.deleteGoods(g.id);
  closeModal();
  renderMyGoodsPage();
}

function editGoods(key) {
  const g = _goodsCache.get(key); if (!g) return;
  editingGoodsId = g.id;
  navigation.switchPage('register');
  setTimeout(() => {
    document.getElementById('group-name').value = g.groupName || '';
    document.getElementById('genre').value       = g.genre     || '';
    if (g.dimensions?.width)  document.getElementById('width').value  = g.dimensions.width;
    if (g.dimensions?.depth)  document.getElementById('depth').value  = g.dimensions.depth;
    if (g.dimensions?.height) document.getElementById('height').value = g.dimensions.height;
    if (g.memo) document.getElementById('memo').value = g.memo;
  }, 100);
}