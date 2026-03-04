function renderProposalsPage() {
  const page = document.getElementById('proposals-page');
  const list = DB.getSavedProposals();
  page.innerHTML = `
    <div class="page-header"><h2>保存した提案</h2><p>保存・採用した飾り方の一覧</p></div>
    <div class="page-content">
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${list.length === 0
          ? `<div class="empty-state"><p>保存した提案はまだありません</p><button class="btn btn-primary" data-page="gallery">ギャラリーを見る</button></div>`
          : list.map(p => proposalCard(p)).join('')
        }
      </div>
    </div>`;
}