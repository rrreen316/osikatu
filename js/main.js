/* =========================================================
   INIT
   ========================================================= */
document.addEventListener('DOMContentLoaded', async () => {
  window.navigation = new Navigation();

  // ローディング表示
  document.getElementById('home-page').innerHTML =
    '<div style="text-align:center;padding:60px 20px;color:#687076;">読み込み中...</div>';

  try {
    await renderHomePage();
  } catch(e) {
    console.error('初期化エラー:', e);
    document.getElementById('home-page').innerHTML =
      '<div style="text-align:center;padding:60px 20px;color:#ef4444;">接続エラーが発生しました。<br>ページを再読み込みしてください。</div>';
  }
});