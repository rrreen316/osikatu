function renderGalleryPage() {
  const page = document.getElementById('gallery-page');
  const opts = generateDimensionOptions();
  const posts = DB.getAllGalleryPosts();
  page.innerHTML = `
    <div class="page-header">
      <div style="display:flex;justify-content:space-between;align-items:center;width:100%;">
        <h2>ギャラリー</h2>
        <button class="btn btn-primary" data-page="post" style="font-size:13px;padding:8px 14px;">📸 投稿</button>
      </div>
      <div style="margin-top:12px;">
        <label style="color:#fff;font-size:13px;">ソート:
          <select id="gallery-sort" style="margin-left:6px;padding:6px 10px;border-radius:6px;border:1px solid rgba(255,255,255,.4);background:rgba(255,255,255,.15);color:#fff;font-size:13px;">
            <option value="newest">新しい順</option>
            <option value="smallest">寸法が狭い順</option>
          </select>
        </label>
      </div>
    </div>
    <div class="page-content">
      <div id="gallery-grid" class="gallery-grid">${buildGrid(posts)}</div>
    </div>`;
  document.getElementById('gallery-sort').addEventListener('change', e => {
    let ps = DB.getAllGalleryPosts();
    if (e.target.value === 'smallest')
      ps.sort((a,b)=>((a.dimensions?.width||0)*(a.dimensions?.depth||0))-((b.dimensions?.width||0)*(b.dimensions?.depth||0)));
    else ps.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    document.getElementById('gallery-grid').innerHTML = buildGrid(ps);
  });
}
function buildGrid(posts) {
  if (!posts.length) return '<div class="empty-state"><p>ギャラリーはまだ空です</p></div>';
  return posts.map(p => {
    const k = cachePost(p);
    return `<div class="gallery-item" onclick="galleryOpen('${k}')">
      ${p.imageUri ? `<img src="${p.imageUri}" alt="${p.title}">` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#999;font-size:12px;padding:8px;text-align:center;">${p.title}</div>`}
      <div class="gallery-item-info"><h4>${p.title}</h4></div>
    </div>`;
  }).join('');
}
function galleryOpen(key) {
  const p = _cache.get(key); if (!p) return;
  const dims = formatDimensions(p.dimensions?.width, p.dimensions?.depth, p.dimensions?.height);
  const k2 = cachePost(p);
  showModal(`
    <div style="display:flex;flex-direction:column;gap:14px;">
      ${p.imageUri ? `<img src="${p.imageUri}" style="width:100%;max-height:320px;object-fit:cover;border-radius:8px;">` : ''}
      <div><label style="font-weight:600;font-size:12px;color:var(--muted);">タイトル</label><p style="margin-top:4px;">${p.title}</p></div>
      ${p.goods ? `<div><label style="font-weight:600;font-size:12px;color:var(--muted);">使用したグッズ</label><p style="margin-top:4px;">${p.goods}</p></div>` : ''}
      ${p.tools?.length ? `<div><label style="font-weight:600;font-size:12px;color:var(--muted);">使用した道具</label><div style="margin-top:4px;">${p.tools.map(t=>`<p>${t.name}${t.store?` (${t.store})`:''}</p>`).join('')}</div></div>` : ''}
      ${dims.length ? `<div><label style="font-weight:600;font-size:12px;color:var(--muted);">寸法</label><div style="margin-top:4px;">${dims.map(d=>`<p>${d}</p>`).join('')}</div></div>` : ''}
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:6px;">
        <button class="btn btn-primary btn-block" onclick="gallerySave('${k2}')">💾 保存する</button>
        <button class="btn btn-secondary btn-block" onclick="galleryAdopt('${k2}')">✅ 飾り方を採用する</button>
      </div>
    </div>`, p.title);
}
function gallerySave(key) {
  const p = _cache.get(key); if (!p) { showToast('エラー:データなし'); return; }
  DB.saveProposal({...p, isSaved:true, description:p.description||p.goods||''});
  showToast('保存しました！'); closeModal();
}
function galleryAdopt(key) {
  const p = _cache.get(key); if (!p) { showToast('エラー:データなし'); return; }
  DB.saveProposal({...p, isSaved:true, isAdopted:true, description:p.description||p.goods||''});
  showToast('飾り方を採用しました🎉'); closeModal();
  navigation.switchPage('home');
}