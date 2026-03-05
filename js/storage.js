/* =========================================================
   STORAGE - Supabase対応版
   ========================================================= */

const SUPABASE_URL = 'https://krspbbcitiasrpprpslj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtyc3BiYmNpdGlhc3JwcHJwc2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODczMzYsImV4cCI6MjA4ODI2MzMzNn0.giyo6ZoaghkEbPjQjG8iwmkdS5dJi8uV8ugY-VVJFbo';

// 端末固有ID（初回起動時に生成してlocalStorageに保存）
function getDeviceId() {
  let id = localStorage.getItem('oshi_device_id');
  if (!id) {
    id = 'dev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem('oshi_device_id', id);
  }
  return id;
}

// Supabase APIを呼ぶ共通関数
async function sbFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      'apikey':        SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type':  'application/json',
      'Prefer':        options.prefer || '',
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase error: ${err}`);
  }
  // 204 No Content の場合は null を返す
  if (res.status === 204) return null;
  return res.json();
}

function generateId() {
  return Date.now() + '-' + Math.random().toString(36).slice(2, 9);
}

// JS側のキャメルケース ↔ DB側のスネークケース変換
function toDb(obj) {
  const d = { ...obj };
  if ('groupName'   in d) { d.group_name  = d.groupName;   delete d.groupName; }
  if ('imageUri'    in d) { d.image_uri   = d.imageUri;    delete d.imageUri; }
  if ('isSaved'     in d) { d.is_saved    = d.isSaved;     delete d.isSaved; }
  if ('isAdopted'   in d) { d.is_adopted  = d.isAdopted;   delete d.isAdopted; }
  if ('createdAt'   in d) { d.created_at  = d.createdAt;   delete d.createdAt; }
  if ('updatedAt'   in d) { d.updated_at  = d.updatedAt;   delete d.updatedAt; }
  if ('deviceId'    in d) { d.device_id   = d.deviceId;    delete d.deviceId; }
  return d;
}

function fromDb(obj) {
  if (!obj) return obj;
  const d = { ...obj };
  if ('group_name'  in d) { d.groupName  = d.group_name;  delete d.group_name; }
  if ('image_uri'   in d) { d.imageUri   = d.image_uri;   delete d.image_uri; }
  if ('is_saved'    in d) { d.isSaved    = d.is_saved;    delete d.is_saved; }
  if ('is_adopted'  in d) { d.isAdopted  = d.is_adopted;  delete d.is_adopted; }
  if ('created_at'  in d) { d.createdAt  = d.created_at;  delete d.created_at; }
  if ('updated_at'  in d) { d.updatedAt  = d.updated_at;  delete d.updated_at; }
  if ('device_id'   in d) { d.deviceId   = d.device_id;   delete d.device_id; }
  return d;
}

class Storage {

  /* ---- Goods（自分の端末のみ） ---- */

  async saveGoods(goods) {
    const deviceId = getDeviceId();
    const record = toDb({
      ...goods,
      id:        goods.id || generateId(),
      deviceId,
      updatedAt: new Date().toISOString(),
      createdAt: goods.createdAt || new Date().toISOString(),
    });
    await sbFetch('goods?on_conflict=id', {
      method:  'POST',
      prefer:  'resolution=merge-duplicates,return=representation',
      body:    JSON.stringify(record),
    });
    return fromDb(record);
  }

  async getAllGoods() {
    const deviceId = getDeviceId();
    const rows = await sbFetch(`goods?device_id=eq.${encodeURIComponent(deviceId)}&order=created_at.asc`);
    return (rows || []).map(fromDb);
  }

  async deleteGoods(id) {
    await sbFetch(`goods?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  getGroups_fromList(list) {
    const map = new Map();
    list.forEach(g => {
      if (!map.has(g.groupName)) map.set(g.groupName, []);
      map.get(g.groupName).push(g);
    });
    return Array.from(map.entries()).map(([name, items]) => ({
      name,
      count:  items.length,
      genres: [...new Set(items.map(g => g.genre))],
      items,
    }));
  }

  /* ---- Gallery（全ユーザー共有） ---- */

  async saveGalleryPost(post) {
    const record = toDb({
      ...post,
      id:        post.id || generateId(),
      updatedAt: new Date().toISOString(),
      createdAt: post.createdAt || new Date().toISOString(),
    });
    await sbFetch('gallery_posts?on_conflict=id', {
      method:  'POST',
      prefer:  'resolution=merge-duplicates,return=representation',
      body:    JSON.stringify(record),
    });
    return fromDb(record);
  }

  async getAllGalleryPosts() {
    const rows = await sbFetch('gallery_posts?order=created_at.desc');
    return (rows || []).map(fromDb);
  }

  async deleteGalleryPost(id) {
    await sbFetch(`gallery_posts?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  /* ---- Proposals（自分の端末のみ） ---- */

  async saveProposal(proposal) {
    const deviceId = getDeviceId();
    const record = toDb({
      ...proposal,
      id:        proposal.id || generateId(),
      deviceId,
      isSaved:   proposal.isSaved  ?? true,
      isAdopted: proposal.isAdopted ?? false,
      updatedAt: new Date().toISOString(),
      createdAt: proposal.createdAt || new Date().toISOString(),
    });
    await sbFetch('proposals?on_conflict=id', {
      method:  'POST',
      prefer:  'resolution=merge-duplicates,return=representation',
      body:    JSON.stringify(record),
    });
    return fromDb(record);
  }

  async getAllProposals() {
    const deviceId = getDeviceId();
    const rows = await sbFetch(`proposals?device_id=eq.${encodeURIComponent(deviceId)}&order=created_at.desc`);
    return (rows || []).map(fromDb);
  }

  async getSavedProposals() {
    const deviceId = getDeviceId();
    const rows = await sbFetch(`proposals?device_id=eq.${encodeURIComponent(deviceId)}&is_saved=eq.true&order=created_at.desc`);
    return (rows || []).map(fromDb);
  }

  async deleteProposal(id) {
    await sbFetch(`proposals?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
  }
}

const DB = new Storage();