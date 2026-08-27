/**
 * Testing-phase requirement: every menu card must show a photo.
 *
 * Real product photography only exists for a handful of dishes, so items
 * without an image get a deterministic stand-in picked from the restaurant's
 * own gallery. Images already set (seed data or Admin uploads) are never
 * touched, and the whole pass can be disabled with the `menu_image_autofill`
 * setting once the final photos land.
 */

const G = (file) => `/uploads/gallery/${file}`;
const M = (file) => `/uploads/menu/${file}`;

const POOLS = {
  breakfast: [G('dsc00765.jpg'), G('dsc00787.jpg')],
  soup: [G('_dsc6317.jpg'), G('_dsc6308.jpg'), G('_dsc0896.jpg')],
  salad: [G('dsc04443.jpg'), G('dsc08098.jpg'), G('dsc03617.jpg')],
  grill: [G('dsc07243.jpg'), G('dsc07252.jpg'), G('dsc03575.jpg'), G('dsc09322.jpg'), G('dsc09312.jpg')],
  meze: [G('_dsc3302.jpg'), G('_dsc3319.jpg'), G('_dsc3487.jpg'), G('dsc01710.jpg')],
  vegetables: [G('_dsc3358.jpg'), G('_dsc3362.jpg')],
  traditional: [G('_dsc0858.jpg'), G('_dsc0892.jpg'), G('_dsc0943.jpg'), G('_dsc0980.jpg')],
  table: [G('dsc08143.jpg'), G('dsc08051.jpg'), G('dsc07294.jpg'), G('dsc01719.jpg')],
  wrap: [G('dsc01666.jpg'), G('dsc08051.jpg')],
  beer: [G('dsc07425.jpg'), G('_dsc9857.jpg')],
  wine: [G('dsc07305.jpg'), G('_dsc3472.jpg')],
  cocktail: [G('dsc07129.jpg'), G('dsc07173.jpg'), G('dsc08025.jpg')],
  shot: [G('_dsc3941.jpg'), G('dsc02323.jpg')],
  soft: [G('dsc07972.jpg'), G('dsc07994.jpg')],
  bar: [G('dsc02323.jpg'), G('dsc09338.jpg'), G('_dsc3941.jpg')]
};

/** Dishes that already have their own photograph in backend/uploads/menu. */
const EXACT = {
  'brinje kingji': M('menu-brinje-kingji.jpg'),
  'pjate me djathera': M('menu-pjate-me-djathera.jpg'),
  pleskavice: M('menu-pleskavice.jpg'),
  'sallate shope': M('menu-sallate-shope.jpg'),
  'veze ne sy': M('menu-veze-ne-sy.jpg')
};

const NAME_RULES = [
  [/pasul/, [G('_dsc6308.jpg')]],
  [/sarma|dollma|fleta rrushi/, [G('_dsc0980.jpg'), G('_dsc0943.jpg')]],
  [/supe/, POOLS.soup],
  [/sallat/, POOLS.salad],
  [/meze/, POOLS.meze],
  [/veze|omlet|mengjes/, POOLS.breakfast],
  [/tave|tav me|oriz/, POOLS.traditional],
  [/kepurdh|perime|speca|lak(e)?r|turshi|ajvar|tarator|salsa|brusketa/, POOLS.vegetables],
  [/djath/, [G('_dsc3319.jpg'), G('_dsc3302.jpg')]],
  [/biftek|tul|muskuj|kotlet|brinje|pule|kofshe|gjoks|pleskavic|ushtipka|kombinim|skare|specialitet|mish/, POOLS.grill],
  [/pogaqe|leqenik|pallaqinka|sendviq|makarona|boloneze|buke|kos|patate/, POOLS.table],
  [/tortilla|wrap/, POOLS.wrap],
  [/koktel|mojito|spritz|margarita|daiquiri|martini|negroni|cosmopolitan/, POOLS.cocktail],
  [/vere|prosecco|pressecco|moet|chenet|zonin|shampanj/, POOLS.wine],
  [/birr|peja|lasko|bavaria|peroni|skopsko|heineken|krombacher|tuborg|corona|budweiser|paulaner|somersby/, POOLS.beer],
  [/raki|sambuca|jager|b52|kamikaz/, POOLS.shot],
  [/kafe|caj|leng|smoothie|coca|fanta|sprite|uje/, POOLS.soft]
];

const CATEGORY_POOLS = [
  [/ofert|daily offer/, POOLS.traditional],
  [/meny ditore|daily menu/, POOLS.breakfast],
  [/sallata|salad/, POOLS.salad],
  [/pjata kryesore|main dish/, POOLS.grill],
  [/pjata shtese|side dish/, POOLS.vegetables],
  [/birrat|beer/, POOLS.beer],
  [/verera|wine/, POOLS.wine],
  [/koktella|cocktail/, POOLS.cocktail],
  [/shots/, POOLS.shot],
  [/raki/, POOLS.shot],
  [/shampanj|champagne/, POOLS.wine]
];

function normalize(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function poolFor(itemName, categoryName, type) {
  const name = normalize(itemName);
  for (const [test, pool] of NAME_RULES) {
    if (test.test(name)) return pool;
  }
  const category = normalize(categoryName);
  for (const [test, pool] of CATEGORY_POOLS) {
    if (test.test(category)) return pool;
  }
  return type === 'drinks' ? POOLS.bar : POOLS.table;
}

/** Same item always resolves to the same photo, and neighbours differ. */
function pickImage(item, categoryName, type, counters) {
  const exact = EXACT[normalize(item.name)];
  if (exact) return exact;
  const pool = poolFor(item.name, categoryName, type);
  const key = pool.join('|');
  const position = counters.get(key) ?? 0;
  counters.set(key, position + 1);
  return pool[position % pool.length];
}

function ensureMenuImages(db) {
  const disabled = db
    .prepare("SELECT value FROM settings WHERE key = 'menu_image_autofill'")
    .get()?.value === 'off';
  if (disabled) return 0;

  const missing = db
    .prepare(
      `SELECT i.id, i.name, i.sort, c.name AS category_name, c.type
       FROM items i
       JOIN categories c ON c.id = i.category_id
       WHERE i.image IS NULL OR TRIM(i.image) = ''
       ORDER BY c.sort, i.sort, i.id`
    )
    .all();
  if (!missing.length) return 0;

  const update = db.prepare('UPDATE items SET image = ? WHERE id = ?');
  const counters = new Map();
  db.transaction(() => {
    for (const row of missing) {
      update.run(pickImage(row, row.category_name, row.type, counters), row.id);
    }
  })();

  return missing.length;
}

module.exports = { ensureMenuImages };
