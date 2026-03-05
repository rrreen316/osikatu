function showToast(msg, ms = 3000) {
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:12px 20px;border-radius:10px;z-index:3000;font-size:14px;font-weight:600;max-width:80vw;text-align:center;pointer-events:none;';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
}

function showAlert(msg) {
  showModal(`<p style="margin-bottom:16px;">${msg}</p><button class="btn btn-primary btn-block" data-action="close-modal">OK</button>`, 'お知らせ');
}

function showModal(content, title = '') {
  const m = document.getElementById('modal');
  const o = document.getElementById('modal-overlay');
  m.innerHTML = `<div class="modal-content">
    ${title ? `<h3 class="modal-title">${title}</h3>` : ''}
    <div class="modal-body">${content}</div>
    <button class="modal-close" data-action="close-modal">✕</button>
  </div>`;
  o.style.display = 'block';
  m.style.display = 'block';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-overlay').style.display = 'none';
}

function formatDimensions(w, d, h) {
  const r = [];
  if (w) r.push(`幅: 約${w * 25}cm (箱ティッシュ${w}個分)`);
  if (d) r.push(`奥行き: 約${d * 10}cm (箱ティッシュ${d}個分)`);
  if (h) r.push(`高さ: 約${h * 20}cm (ペットボトル${h}個分)`);
  return r;
}

function formatDate(s) {
  const d = new Date(s);
  return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日`;
}

function generateDimensionOptions() {
  const o = [];
  for (let i = 0.5; i <= 10; i += 0.5) o.push(i);
  return o;
}

// ========== グローバルイベント委譲 ==========
// iOSでinnerHTML内のonclickが動かない問題を解決
// data-action属性でボタンの種類を識別する
document.addEventListener('click', function(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();

  const action = btn.dataset.action;
  const key    = btn.dataset.key || '';

  switch(action) {
    case 'close-modal':      closeModal(); break;
    case 'gallery-open':     galleryOpen(key); break;
    case 'gallery-save':     gallerySave(key); break;
    case 'gallery-adopt':    galleryAdopt(key); break;
    case 'proposal-adopt':   proposalAdopt(key); break;
    case 'proposal-unadopt': proposalUnadopt(key); break;
    case 'proposal-view':    proposalView(key); break;
    case 'proposal-remove':  proposalRemove(key); break;
    case 'goods-detail':     openGoodsDetail(key); break;
    case 'goods-delete':     deleteGoods(key); break;
    case 'goods-edit':       closeModal(); editGoods(key); break;
    case 'add-tool':         addTool(); break;
    case 'remove-tool':      removeTool(btn); break;
    case 'gallery-delete':   galleryDelete(key); break;
    case 'share-x':          shareX(key); break;
    case 'share-line':       shareLine(key); break;
    case 'share-instagram':  shareInstagram(key); break;
  }
});