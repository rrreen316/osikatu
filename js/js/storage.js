class Storage {
  constructor() {
    this.GOODS_KEY    = 'oshi_goods';
    this.PROPOSALS_KEY= 'oshi_proposals';
    this.GALLERY_KEY  = 'oshi_gallery';
  }
  _get(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch(e){ return []; } }
  _set(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
  generateId() { return Date.now() + '-' + Math.random().toString(36).slice(2,9); }

  /* --- Goods --- */
  saveGoods(goods) {
    const all = this._get(this.GOODS_KEY);
    const idx = all.findIndex(g => g.id === goods.id);
    if (idx >= 0) { all[idx] = {...all[idx], ...goods, updatedAt: new Date().toISOString()}; }
    else { all.push({...goods, id: goods.id || this.generateId(), createdAt: new Date().toISOString()}); }
    this._set(this.GOODS_KEY, all);
    return all[idx >= 0 ? idx : all.length-1];
  }
  getAllGoods()  { return this._get(this.GOODS_KEY); }
  getGoods(id)  { return this.getAllGoods().find(g => g.id === id) || null; }
  deleteGoods(id){ this._set(this.GOODS_KEY, this.getAllGoods().filter(g => g.id !== id)); }
  getGroups() {
    const map = new Map();
    this.getAllGoods().forEach(g => {
      if (!map.has(g.groupName)) map.set(g.groupName, []);
      map.get(g.groupName).push(g);
    });
    return Array.from(map.entries()).map(([name, items]) => ({
      name, count: items.length, genres: [...new Set(items.map(g => g.genre))]
    }));
  }

  /* --- Gallery --- */
  saveGalleryPost(post) {
    const all = this._get(this.GALLERY_KEY);
    const idx = all.findIndex(p => p.id === post.id);
    if (idx >= 0) { all[idx] = {...all[idx], ...post, updatedAt: new Date().toISOString()}; }
    else { all.push({...post, id: post.id || this.generateId(), createdAt: new Date().toISOString()}); }
    this._set(this.GALLERY_KEY, all);
    return all[idx >= 0 ? idx : all.length-1];
  }
  getAllGalleryPosts() { return this._get(this.GALLERY_KEY); }
  deleteGalleryPost(id){ this._set(this.GALLERY_KEY, this.getAllGalleryPosts().filter(p => p.id !== id)); }

  /* --- Proposals --- */
  saveProposal(proposal) {
    const all = this._get(this.PROPOSALS_KEY);
    const idx = all.findIndex(p => p.id === proposal.id);
    if (idx >= 0) { all[idx] = {...all[idx], ...proposal, updatedAt: new Date().toISOString()}; }
    else { all.push({...proposal, id: proposal.id || this.generateId(), createdAt: new Date().toISOString()}); }
    this._set(this.PROPOSALS_KEY, all);
    return all[idx >= 0 ? idx : all.length-1];
  }
  getAllProposals()  { return this._get(this.PROPOSALS_KEY); }
  getSavedProposals(){ return this.getAllProposals().filter(p => p.isSaved); }
  getProposal(id)   { return this.getAllProposals().find(p => p.id === id) || null; }
  deleteProposal(id){ this._set(this.PROPOSALS_KEY, this.getAllProposals().filter(p => p.id !== id)); }
}
const DB = new Storage();