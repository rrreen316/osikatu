/**
 * actions.js
 * ギャラリー投稿・保存・採用の操作を一元管理する
 * postデータをメモリのMapに保持し、onclickにはキーだけ渡す
 */

// メモリ上のpostキャッシュ
const _postCache = new Map();

function cachePost(post) {
    const key = post.id || ('tmp_' + Date.now() + '_' + Math.random().toString(36).slice(2));
    _postCache.set(key, post);
    return key;
}

function getCachedPost(key) {
    return _postCache.get(key) || null;
}

// ─── ギャラリー詳細を開く ───────────────────────────────
function galleryOpen(key) {
    const post = getCachedPost(key);
    if (!post) { showToast('データが見つかりません'); return; }

    const dims = formatDimensions(
        post.dimensions?.width,
        post.dimensions?.depth,
        post.dimensions?.height
    );

    showModal(`
        <div style="display:flex;flex-direction:column;gap:14px;">
            ${post.imageUri
                ? `<img src="${post.imageUri}" style="width:100%;max-height:340px;object-fit:cover;border-radius:8px;">`
                : ''}
            <div>
                <label style="font-weight:600;font-size:12px;color:#687076;">タイトル</label>
                <p style="margin-top:4px;">${post.title}</p>
            </div>
            ${post.goods ? `
            <div>
                <label style="font-weight:600;font-size:12px;color:#687076;">使用したグッズ</label>
                <p style="margin-top:4px;">${post.goods}</p>
            </div>` : ''}
            ${post.tools?.length ? `
            <div>
                <label style="font-weight:600;font-size:12px;color:#687076;">使用した道具</label>
                <div style="margin-top:4px;">
                    ${post.tools.map(t => `<p>${t.name}${t.store ? ` (${t.store})` : ''}</p>`).join('')}
                </div>
            </div>` : ''}
            ${dims.length ? `
            <div>
                <label style="font-weight:600;font-size:12px;color:#687076;">寸法</label>
                <div style="margin-top:4px;">${dims.map(d => `<p>${d}</p>`).join('')}</div>
            </div>` : ''}
            <div style="display:flex;flex-direction:column;gap:8px;margin-top:4px;">
                <button class="btn btn-primary" style="width:100%;"
                    onclick="gallerySave('${key}')">💾 保存する</button>
                <button class="btn btn-secondary" style="width:100%;"
                    onclick="galleryAdopt('${key}')">✅ 飾り方を採用する</button>
            </div>
        </div>
    `, post.title);
}

// ─── 保存 ────────────────────────────────────────────────
function gallerySave(key) {
    const post = getCachedPost(key);
    if (!post) { showToast('データが見つかりません'); return; }
    new Storage().saveProposal({
        ...post,
        isSaved: true,
        description: post.description || post.goods || ''
    });
    showToast('保存しました！');
    closeModal();
}

// ─── 採用 ────────────────────────────────────────────────
function galleryAdopt(key) {
    const post = getCachedPost(key);
    if (!post) { showToast('データが見つかりません'); return; }
    new Storage().saveProposal({
        ...post,
        isSaved: true,
        isAdopted: true,
        description: post.description || post.goods || ''
    });
    showToast('飾り方を採用しました🎉');
    closeModal();
    navigation.switchPage('home');
}

// ─── 提案の採用/解除（home・proposals共通） ──────────────
function proposalAdopt(key) {
    const p = getCachedPost(key);
    if (!p) return;
    new Storage().saveProposal({ ...p, isAdopted: true });
    showToast('採用しました🎉');
    // 現在のページを再描画
    _refreshCurrentPage();
}

function proposalUnadopt(key) {
    const p = getCachedPost(key);
    if (!p) return;
    new Storage().saveProposal({ ...p, isAdopted: false });
    showToast('採用を解除しました');
    _refreshCurrentPage();
}

function proposalView(key) {
    const p = getCachedPost(key);
    if (p) showProposalDetail(p);
}

function proposalRemove(key) {
    const p = getCachedPost(key);
    if (!p) return;
    if (!confirm('この提案を削除しますか？')) return;
    new Storage().removeProposal(p.id);
    showToast('削除しました');
    _refreshCurrentPage();
}

function _refreshCurrentPage() {
    const current = navigation?.currentPage;
    if (current === 'proposals' && typeof renderProposalsPage === 'function') renderProposalsPage();
    else if (typeof renderHomePage === 'function') renderHomePage();
}