function renderHomePage() {
  const page = document.getElementById('home-page');
  const saved = DB.getSavedProposals();
  const groups = DB.getGroups();

  page.innerHTML = `
    <div class="page-header"><h2>ホーム</h2><p>あなたのグッズを素敵に飾ろう</p></div>
    <div class="page-content">
      <section class="section">
        <div class="section-header">
          <h3>保存した提案</h3>
          <a href="#" class="section-link" data-page="proposals">すべて見る →</a>
        </div>
        ${saved.length === 0
          ? `<div class="empty-state"><p>保存した提案はまだありません</p>
             <button class="btn btn-primary" data-page="gallery">ギャラリーを見る</button></div>`
          : saved.slice(0, 3).map(p => proposalCard(p)).join('') +
            (saved.length > 3
              ? `<div style="text-align:center;margin-top:10px;">
                 <button class="btn btn-secondary btn-block" data-page="proposals">すべて見る（${saved.length}件）→</button></div>`
              : '')
        }
      </section>
      <section class="section">
        <div class="section-header">
          <h3>所持グッズ</h3>
          <a href="#" class="section-link" data-page="my-goods">すべて見る →</a>
        </div>
        ${groups.length === 0
          ? `<div class="empty-state"><p>グッズがまだ登録されていません</p>
             <button class="btn btn-primary" data-page="register">グッズを登録</button></div>`
          : `<div class="goods-summary">${groups.map(g => `
              <div class="goods-group">
                <div class="goods-group-header">
                  <span style="font-weight:700;">${g.name}</span>
                  <span class="goods-group-count">計${g.count}個</span>
                </div>
                <div class="goods-tags">${g.genres.map(ge => `<span class="goods-tag">${ge}</span>`).join('')}</div>
              </div>`).join('')}</div>`
        }
      </section>
    </div>`;
}

function proposalCard(p) {
  const k = cachePost(p);
  return `<div class="proposal-card">
    ${p.imageUri ? `<img src="${p.imageUri}" style="width:100%;max-height:150px;object-fit:cover;border-radius:8px;margin-bottom:8px;">` : ''}
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px;">
      <div class="proposal-title" style="flex:1;">${p.title}</div>
      ${p.isAdopted ? '<span style="background:#22c55e;color:#fff;font-size:11px;padding:2px 8px;border-radius:20px;font-weight:600;">✅ 採用中</span>' : ''}
    </div>
    ${p.description ? `<div class="proposal-description">${p.description}</div>` : ''}
    <div class="proposal-actions">
      ${p.isAdopted
        ? `<button class="btn btn-secondary" style="color:#ef4444;border-color:#ef4444;" data-action="proposal-unadopt" data-key="${k}">採用解除</button>`
        : `<button class="btn btn-primary" data-action="proposal-adopt" data-key="${k}">✅ 採用する</button>`
      }
      <button class="btn btn-secondary" data-action="proposal-view" data-key="${k}">詳細</button>
      <button class="btn btn-secondary" data-action="proposal-remove" data-key="${k}">削除</button>
    </div>
  </div>`;
}

function proposalAdopt(key) {
  const p = _cache.get(key); if (!p) return;
  const saved = DB.saveProposal({...p, isAdopted: true});
  _cache.set(key, saved);
  showToast('採用しました🎉');
  renderCurrentProposalPage();
}

function proposalUnadopt(key) {
  const p = _cache.get(key); if (!p) return;
  const saved = DB.saveProposal({...p, isAdopted: false});
  _cache.set(key, saved);
  showToast('採用を解除しました');
  renderCurrentProposalPage();
}

function proposalView(key) {
  const p = _cache.get(key); if (!p) return;
  const dims = formatDimensions(p.dimensions?.width, p.dimensions?.depth, p.dimensions?.height);
  showModal(`
    <div style="display:flex;flex-direction:column;gap:14px;">
      ${p.imageUri ? `<img src="${p.imageUri}" style="width:100%;max-height:280px;object-fit:cover;border-radius:8px;">` : ''}
      <div><label style="font-weight:600;font-size:12px;color:#687076;">タイトル</label><p style="margin-top:4px;">${p.title}</p></div>
      ${p.description ? `<div><label style="font-weight:600;font-size:12px;color:#687076;">説明</label><p style="margin-top:4px;">${p.description}</p></div>` : ''}
      ${dims.length ? `<div><label style="font-weight:600;font-size:12px;color:#687076;">寸法</label><div style="margin-top:4px;">${dims.map(d=>`<p>${d}</p>`).join('')}</div></div>` : ''}
      <div><label style="font-weight:600;font-size:12px;color:#687076;">使用したグッズ</label><p style="margin-top:4px;">${p.goods||'なし'}</p></div>
      ${p.tools?.length ? `<div><label style="font-weight:600;font-size:12px;color:#687076;">使用した道具</label><div style="margin-top:4px;">${p.tools.map(t=>`<p>${t.name}${t.store?` (${t.store})`:''}</p>`).join('')}</div></div>` : ''}
    </div>`, p.title);
}

function proposalRemove(key) {
  const p = _cache.get(key); if (!p) return;
  if (!confirm('この提案を削除しますか？')) return;
  DB.deleteProposal(p.id);
  showToast('削除しました');
  renderCurrentProposalPage();
}

function renderCurrentProposalPage() {
  if (navigation?.currentPage === 'proposals') renderProposalsPage();
  else renderHomePage();
}