const { wineItems } = require('./wine-menu');

const MENU_STRUCTURE_VERSION = '2026-08-menu-verera-v1';

const FOOD_ORDER = [
  'Oferte Ditore',
  'Meny Ditore',
  'Sallata',
  'Pjata Kryesore',
  'Pjata Shtesë'
];

const DRINK_ORDER = [
  'Birrat',
  'Verëra',
  'Koktella',
  'Shots',
  'Raki',
  'Whiskey',
  'Vodka',
  'Gin',
  'Rum',
  'Tequila',
  'Likere',
  'Cognac',
  'Shampanjë'
];

function categoryKey(name = '') {
  return String(name)
    .normalize('NFC')
    .replace(/ë/g, 'e')
    .replace(/Ë/g, 'E')
    .toLowerCase()
    .trim();
}

function findCategory(rows, wanted) {
  const key = categoryKey(wanted);
  return rows.find((c) => categoryKey(c.name) === key) || null;
}

function ensureMenuStructure(db) {
  const getSetting = db.prepare('SELECT value FROM settings WHERE key = ?');
  const upsertSetting = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  );

  if (getSetting.get('menu_structure_version')?.value === MENU_STRUCTURE_VERSION) {
    // Still refresh sort order in case admin reordered names we know.
    applySortOrder(db);
    return;
  }

  db.transaction(() => {
    const insertCategory = db.prepare(
      'INSERT INTO categories (name, name_en, type, note, note_en, sort) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const insertItem = db.prepare(
      `INSERT INTO items (category_id, name, name_en, description, description_en, price, image, available, sort)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`
    );
    const deleteItems = db.prepare('DELETE FROM items WHERE category_id = ?');

    let categories = db.prepare('SELECT * FROM categories').all();

    if (!findCategory(categories, 'Oferte Ditore')) {
      insertCategory.run(
        'Oferte Ditore',
        'Daily Offers',
        'food',
        'Ofertat e ditës ndryshojnë — pyet stafin.',
        'Daily offers change — ask the staff.',
        0
      );
      categories = db.prepare('SELECT * FROM categories').all();
    }

    let verera = findCategory(categories, 'Verëra');
    if (!verera) {
      const { lastInsertRowid } = insertCategory.run(
        'Verëra',
        'Wines',
        'drinks',
        null,
        null,
        5
      );
      verera = { id: lastInsertRowid, name: 'Verëra' };
    }

    deleteItems.run(verera.id);
    wineItems.forEach((item, i) => {
      insertItem.run(
        verera.id,
        item.name,
        item.name_en || null,
        item.description || null,
        item.description_en || null,
        item.price,
        null,
        i
      );
    });

    applySortOrder(db);
    upsertSetting.run('menu_structure_version', MENU_STRUCTURE_VERSION);
  })();
}

function applySortOrder(db) {
  const categories = db.prepare('SELECT id, name, type FROM categories').all();
  const update = db.prepare('UPDATE categories SET sort = ? WHERE id = ?');

  const food = categories.filter((c) => c.type === 'food');
  const drinks = categories.filter((c) => c.type === 'drinks');

  const orderedFood = [];
  for (const name of FOOD_ORDER) {
    const hit = findCategory(food, name);
    if (hit && !orderedFood.includes(hit)) orderedFood.push(hit);
  }
  for (const c of food) {
    if (!orderedFood.includes(c)) orderedFood.push(c);
  }

  const orderedDrinks = [];
  for (const name of DRINK_ORDER) {
    const hit = findCategory(drinks, name);
    if (hit && !orderedDrinks.includes(hit)) orderedDrinks.push(hit);
  }
  for (const c of drinks) {
    if (!orderedDrinks.includes(c)) orderedDrinks.push(c);
  }

  let sort = 0;
  for (const c of [...orderedFood, ...orderedDrinks]) {
    update.run(sort++, c.id);
  }
}

module.exports = {
  ensureMenuStructure,
  FOOD_ORDER,
  DRINK_ORDER,
  MENU_STRUCTURE_VERSION
};
