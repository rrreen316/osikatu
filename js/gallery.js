async function renderGalleryPage() {
  const page = document.getElementById('gallery-page');
  page.innerHTML = `
    <div class="page-header">
      <div style="display:flex;justify-content:space-between;align-items:center;width:100%;">
        <h2>ギャラリー</h2>
        <button class="btn btn-primary" id="goto-post-btn" style="font-size:13px;padding:8px 14px;">📸 投稿</button>
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
      <div id="gallery-grid" class="gallery-grid">
        <div style="text-align:center;padding:40px;color:#687076;">読み込み中...</div>
      </div>
    </div>`;

  document.getElementById('goto-post-btn').addEventListener('click', e => {
    e.preventDefault(); e.stopPropagation();
    navigation.switchPage('post');
  });

  const posts = await DB.getAllGalleryPosts();
  document.getElementById('gallery-grid').innerHTML = buildGrid(posts);

  document.getElementById('gallery-sort').addEventListener('change', async e => {
    let ps = await DB.getAllGalleryPosts();
    if (e.target.value === 'smallest')
      ps.sort((a,b) => ((a.dimensions?.width||0)*(a.dimensions?.depth||0)) - ((b.dimensions?.width||0)*(b.dimensions?.depth||0)));
    document.getElementById('gallery-grid').innerHTML = buildGrid(ps);
  });
}

function buildGrid(posts) {
  if (!posts.length) return '<div class="empty-state"><p>ギャラリーはまだ空です</p></div>';
  return posts.map(p => {
    const k = cachePost(p);
    return `<div class="gallery-item" data-action="gallery-open" data-key="${k}" style="cursor:pointer;">
      ${p.imageUri
        ? `<img src="${p.imageUri}" alt="${p.title}" style="pointer-events:none;">`
        : `<div style="width:100%;height:80%;display:flex;align-items:center;justify-content:center;color:#999;font-size:12px;padding:8px;text-align:center;pointer-events:none;">${p.title}</div>`}
      <div class="gallery-item-info" style="pointer-events:none;"><h4>${p.title}</h4></div>
    </div>`;
  }).join('');
}

function galleryOpen(key) {
  const p = _cache.get(key); if (!p) return;
  const dims = formatDimensions(p.dimensions?.width, p.dimensions?.depth, p.dimensions?.height);
  const k2 = cachePost(p);
  showModal(`
    <div style="display:flex;flex-direction:column;gap:14px;">
      ${p.imageUri ? `<img src="${p.imageUri}" style="width:100%;max-height:280px;object-fit:cover;border-radius:8px;">` : ''}
      <div><label style="font-weight:600;font-size:12px;color:#687076;">タイトル</label><p style="margin-top:4px;">${p.title}</p></div>
      ${p.goods ? `<div><label style="font-weight:600;font-size:12px;color:#687076;">使用したグッズ</label><p style="margin-top:4px;">${p.goods}</p></div>` : ''}
      ${p.tools?.length ? `<div><label style="font-weight:600;font-size:12px;color:#687076;">使用した道具</label><div style="margin-top:4px;">${p.tools.map(t=>`<p>${t.name}${t.store?` (${t.store})`:''}</p>`).join('')}</div></div>` : ''}
      ${dims.length ? `<div><label style="font-weight:600;font-size:12px;color:#687076;">寸法</label><div style="margin-top:4px;">${dims.map(d=>`<p>${d}</p>`).join('')}</div></div>` : ''}
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:6px;">
        <button class="btn btn-primary btn-block" data-action="gallery-save" data-key="${k2}">💾 保存する</button>
        <button class="btn btn-secondary btn-block" data-action="gallery-adopt" data-key="${k2}">✅ 飾り方を採用する</button>
      </div>
      <div style="border-top:1px solid #e5e7eb;padding-top:14px;margin-top:2px;">
        <p style="font-size:12px;color:#687076;font-weight:600;margin-bottom:8px;">📢 この飾り方をシェア</p>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-block" data-action="share-x" data-key="${k2}"
            style="background:#000;color:#fff;font-size:13px;">𝕏 でシェア</button>
          <button class="btn btn-block" data-action="share-line" data-key="${k2}"
            style="background:#06C755;color:#fff;font-size:13px;">LINE</button>
          <button class="btn btn-block" data-action="share-instagram" data-key="${k2}"
            style="background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);color:#fff;font-size:13px;">Instagram</button>
        </div>
      </div>
    </div>`, p.title);
}

async function gallerySave(key) {
  const p = _cache.get(key); if (!p) { showToast('エラー: データなし'); return; }
  await DB.saveProposal({...p, isSaved: true, description: p.description || p.goods || ''});
  showToast('保存しました！');
  closeModal();
}

async function galleryAdopt(key) {
  const p = _cache.get(key); if (!p) { showToast('エラー: データなし'); return; }
  await DB.saveProposal({...p, isSaved: true, isAdopted: true, description: p.description || p.goods || ''});
  showToast('飾り方を採用しました🎉');
  closeModal();
  navigation.switchPage('home');
}

function buildShareText(p) {
  const lines = [`【${p.title}】`];
  if (p.goods) lines.push(`グッズ: ${p.goods}`);
  if (p.tools?.length) lines.push(`道具: ${p.tools.map(t => t.name).join('、')}`);
  lines.push('#推しグッズ収納 #推し活');
  return lines.join('\n');
}

function shareX(key) {
  const p = _cache.get(key); if (!p) return;
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(buildShareText(p))}`, '_blank');
}

function shareLine(key) {
  const p = _cache.get(key); if (!p) return;
  window.open(`https://social-plugins.line.me/lineit/share?text=${encodeURIComponent(buildShareText(p))}`, '_blank');
}

function shareInstagram(key) {
  const p = _cache.get(key); if (!p) return;
  if (p.imageUri) {
    const a = document.createElement('a');
    a.href = p.imageUri; a.download = `${p.title||'oshi-goods'}.jpg`; a.click();
    setTimeout(() => { showToast('画像を保存しました。Instagramで投稿してください📸'); window.open('instagram://', '_blank'); }, 800);
  } else {
    const text = buildShareText(p);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('テキストをコピーしました📋'); setTimeout(() => window.open('instagram://', '_blank'), 500);
      });
    } else { window.open('instagram://', '_blank'); }
  }
}