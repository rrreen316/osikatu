document.addEventListener('DOMContentLoaded', () => {
  // サンプルデータ
  if (DB.getAllGoods().length === 0) {
    [{groupName:'推し1グループ',genre:'アクスタ',    dimensions:{width:1,  depth:0.5,height:1  },memo:'デスクに飾っている'},
     {groupName:'推し1グループ',genre:'ぬいぐるみ', dimensions:{width:2,  depth:1.5,height:2.5},memo:'ベッドの上に飾っている'},
     {groupName:'推し2グループ',genre:'グッズセット',dimensions:{width:1.5,depth:1,  height:2  },memo:'棚に飾っている'}
    ].forEach(g => DB.saveGoods(g));
  }
  if (DB.getAllGalleryPosts().length === 0) {
    [{title:'デスク上の飾り方',  description:'アクスタを並べてデスクを彩る',          goods:'アクスタ',  tools:[{name:'ディスプレイスタンド',store:'ニトリ'}],dimensions:{width:2,depth:0.5,height:1  },imageUri:null},
     {title:'ベッド上の飾り方', description:'ぬいぐるみを並べてかわいくディスプレイ', goods:'ぬいぐるみ',tools:[{name:'クッション',          store:'IKEA' }],dimensions:{width:3,depth:2,  height:1.5},imageUri:null}
    ].forEach(p => DB.saveGalleryPost(p));
  }
  window.navigation = new Navigation();
  renderHomePage();
});