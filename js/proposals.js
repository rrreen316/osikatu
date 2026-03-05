async function renderProposalsPage() {
  const page = document.getElementById('proposals-page');
  page.innerHTML = `
    <div class="page-header"><h2>保存した提案</h2><p>保存・採用した飾り方の一覧</p></div>
    <div class="page-content">
      <div id="proposals-list" style="display:flex;flex-direction:column;gap:12px;">
        <div style="text-align:center;padding:40px;color:#687076;">読み込み中...</div>
      </div>
    </div>`;

  const list = await DB.getSavedProposals();
  document.getElementById('proposals-list').innerHTML = list.length === 0
    ? `<div class="empty-state"><p>保存した提案はまだありません</p>
       <button class="btn btn-primary" data-page="gallery">ギャラリーを見る</button></div>`
    : list.map(p => proposalCard(p)).join('');
}