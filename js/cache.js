const _cache = new Map();
function cachePost(p) {
  const key = p.id || ('k'+Date.now()+'_'+Math.random().toString(36).slice(2));
  _cache.set(key, p);
  return key;
}