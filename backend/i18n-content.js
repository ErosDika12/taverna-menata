/** English translations for menu items and gallery. Keys: "Category::Item name" */

const CATEGORY_EN = {
  'Meny Ditore': { name_en: 'Daily Menu', note_en: 'Served daily until 17:00' },
  Sallata: { name_en: 'Salads' },
  'Pjata Kryesore': { name_en: 'Main Dishes' },
  'Pjata Shtes\u00eb': { name_en: 'Side Dishes' },
  Birrat: { name_en: 'Beers' },
  Koktella: { name_en: 'Cocktails' },
  Shots: { name_en: 'Shots' },
  Raki: { name_en: 'Raki' },
  Whiskey: { name_en: 'Whiskey' },
  Vodka: { name_en: 'Vodka' },
  Gin: { name_en: 'Gin' },
  Rum: { name_en: 'Rum' },
  Tequila: { name_en: 'Tequila' },
  Likere: { name_en: 'Liqueurs' },
  Cognac: { name_en: 'Cognac' },
  'Shampanj\u00eb': { name_en: 'Champagne & Sparkling' }
};

const DRINK_CATEGORIES = new Set([
  'Birrat', 'Koktella', 'Shots', 'Raki', 'Whiskey', 'Vodka', 'Gin', 'Rum', 'Tequila', 'Likere', 'Cognac', 'Shampanjë'
]);

const ITEM_EN = {
  'Meny Ditore::Mëngjes Menata': {
    name_en: 'Menata Breakfast',
    description_en: 'Baked egg, spinach tortilla, mozzarella, cherry tomatoes, spring onion'
  },
  'Meny Ditore::Mëngjes Fshati': {
    name_en: 'Country Breakfast',
    description_en: 'Fried eggs, grilled chicken sausage, milk, butter, jam, white cheese, spring onion'
  },
  'Meny Ditore::Omlet': {
    name_en: 'Omelette',
    description_en: 'Scrambled and fried eggs, white cheese, tomato, cucumber, spring onion'
  },
  'Meny Ditore::Omlet mix': {
    name_en: 'Omelette mix',
    description_en: 'Sujuk / ham / spinach / vegetables / cottage cheese'
  },
  'Meny Ditore::Vezë në sy': {
    name_en: 'Fried eggs',
    description_en: 'Fried eggs, white cheese, tomato, cucumber, olives, spring onion'
  },
  'Meny Ditore::Bukë e fërguar me vezë': {
    name_en: 'French toast with egg',
    description_en: 'Ajvar / cheese / Nutella'
  },
  'Meny Ditore::Leqenik': {
    name_en: 'Leqenik',
    description_en: 'Two pieces of leqenik with spinach, white cheese, milk, spring onion'
  },
  'Meny Ditore::Pallaqinka': {
    name_en: 'Pancakes',
    description_en: 'Ajvar / cheese / jam / Nutella'
  },
  'Meny Ditore::Pogaqe me suxhuk': {
    name_en: 'Homemade bun with sujuk',
    description_en: 'Veal stew with peppers, house bun with sujuk, white cheese, seasonal vegetables, spring onion'
  },
  'Meny Ditore::Pogaqe me mazë': {
    name_en: 'Homemade bun with veal stew',
    description_en: 'Veal stew with peppers, house bun, white cheese, seasonal vegetables, spring onion'
  },
  'Meny Ditore::Supë me perime': { name_en: 'Vegetable soup' },
  'Meny Ditore::Supë me pulë': { name_en: 'Chicken soup' },
  'Meny Ditore::Sendviq vegjetarian': {
    name_en: 'Vegetarian sandwich',
    description_en: 'Flatbread sandwich with vegetables, fries and white sauce'
  },
  'Meny Ditore::Sendviq me përshutë': {
    name_en: 'Ham sandwich',
    description_en: 'Flatbread sandwich with ham, fries and white sauce'
  },
  'Meny Ditore::Sendviq me pulë': {
    name_en: 'Chicken sandwich',
    description_en: 'Flatbread sandwich with chicken, fries and white sauce'
  },
  'Meny Ditore::Tavë me makarona': {
    name_en: 'Baked pasta',
    description_en: 'Pasta, chicken in white sauce and kashkaval, white cheese, pickled peppers, mushrooms'
  },
  'Meny Ditore::Tavë boloneze': {
    name_en: 'Bolognese bake',
    description_en: 'Pasta with minced meat, tomato sauce and kashkaval, white cheese and pickled peppers'
  },

  'Sallata::Sallatë shope': {
    name_en: 'Shop salad',
    description_en: 'Tomato, cucumber and white cheese'
  },
  'Sallata::Sallatë greke': {
    name_en: 'Greek salad',
    description_en: 'Tomato, cucumber, onion, pepper, olives and white cheese'
  },
  'Sallata::Sallatë e shpisë': {
    name_en: 'House salad',
    description_en: 'Cabbage, green salad, tomato, cucumber, boiled egg, olives, pickled peppers, carrot'
  },
  'Sallata::Sallatë tuna': { name_en: 'Tuna salad' },
  'Sallata::Sallatë caesar': { name_en: 'Caesar salad' },
  'Sallata::Kombinim turshi': { name_en: 'Pickle platter', description_en: 'Seasonal platter' },
  'Sallata::Turshi Menata': { name_en: 'Menata pickle platter', description_en: 'Seasonal platter' },
  'Sallata::Lakër turshi': { name_en: 'Pickled cabbage', description_en: 'Seasonal platter' },
  'Sallata::Speca turshi': { name_en: 'Pickled peppers' },

  'Pjata Kryesore::Pleskavicë': {
    name_en: 'Pljeskavica',
    description_en: 'Pljeskavica, fried mushrooms and vegetables, potato salad, house sauce'
  },
  'Pjata Kryesore::Ushtipka': {
    name_en: 'Uštipci',
    description_en: 'Uštipci, fried mushrooms and vegetables, potato salad, house sauce'
  },
  'Pjata Kryesore::Kofshë pule': {
    name_en: 'Chicken thigh',
    description_en: 'Chicken thigh, fried mushrooms and vegetables, potato salad'
  },
  'Pjata Kryesore::Gjoks pule': {
    name_en: 'Chicken breast',
    description_en: 'Chicken breast with mozzarella, fried mushrooms and vegetables, potato salad, house sauce'
  },
  'Pjata Kryesore::Tul viçi': {
    name_en: 'Beef tenderloin',
    description_en: 'Beef tenderloin, fried mushrooms and vegetables, potato salad, house sauce'
  },
  'Pjata Kryesore::Muskuj': {
    name_en: 'Beef medallions',
    description_en: 'Beef medallions, fried mushrooms and vegetables, potato salad, house sauce'
  },
  'Pjata Kryesore::Kotlet': {
    name_en: 'Pork chop',
    description_en: 'Pork chop, fried mushrooms and vegetables, potato salad, house sauce'
  },
  'Pjata Kryesore::Brinjë kingji': {
    name_en: 'Pork ribs',
    description_en: 'Pork ribs, fried mushrooms and vegetables, potato salad, house sauce'
  },
  'Pjata Kryesore::Biftek': {
    name_en: 'Beef steak',
    description_en: 'Beef steak, fried mushrooms and vegetables, potato salad, house sauce'
  },
  'Pjata Kryesore::Kombinim 1': {
    name_en: 'Grill platter 1',
    description_en: 'Sujuk, pljeskavica, uštipci, chicken thigh, beef medallions, grilled vegetables, mushrooms, potato salad, house sauce'
  },
  'Pjata Kryesore::Kombinim 2': {
    name_en: 'Grill platter 2',
    description_en: 'Beef tenderloin, medallions, pork chop, ribs, chicken thigh, mushrooms, grilled vegetables, potato salad, house sauce'
  },
  'Pjata Kryesore::Kombinim 3': {
    name_en: 'Grill platter 3',
    description_en: 'Mixed meat platter from the oven'
  },
  'Pjata Kryesore::Meze e nxehtë (e madhe)': {
    name_en: 'Hot meze (large)',
    description_en: 'Fries, beef sausage, chicken wings, sesame cheese, mushrooms, onion rings, 2 sauces'
  },
  'Pjata Kryesore::Meze e nxehtë (e vogël)': {
    name_en: 'Hot meze (small)',
    description_en: 'Fries, beef sausage, chicken wings, sesame cheese, mushrooms, onion rings, 2 sauces'
  },
  'Pjata Kryesore::Meze e ftohtë (e madhe)': {
    name_en: 'Cold meze (large)',
    description_en: 'Pickled cucumbers, carrots, sharri cheese, kashkaval, sujuk, ham, olives, walnuts, cranberry, white sauce'
  },
  'Pjata Kryesore::Meze e ftohtë (e vogël)': {
    name_en: 'Cold meze (small)',
    description_en: 'Pickled cucumbers, carrots, sharri cheese, kashkaval, sujuk, ham, olives, walnuts, cranberry, white sauce'
  },
  'Pjata Kryesore::Biftek 1 kg': { name_en: 'Beef steak 1 kg' },
  'Pjata Kryesore::Specialitet Menata': {
    name_en: 'Menata speciality',
    description_en: 'Wire-grilled meat wrapped with ajvar and kashkaval'
  },

  'Pjata Shtesë::Bukë bageti e rreshkur': { name_en: 'Crispy baguette' },
  'Pjata Shtesë::Kos': { name_en: 'Yogurt' },
  'Pjata Shtesë::Ajvar': { name_en: 'Ajvar' },
  'Pjata Shtesë::Tarator': { name_en: 'Tarator' },
  'Pjata Shtesë::Pjatë me salsa': { name_en: 'Salsa platter' },
  'Pjata Shtesë::Sallatë me patate': { name_en: 'Potato salad' },
  'Pjata Shtesë::Speca me hudër': { name_en: 'Peppers with garlic' },
  'Pjata Shtesë::Speca të djegës': { name_en: 'Hot peppers' },
  'Pjata Shtesë::Këpurdha të fërguara': { name_en: 'Fried mushrooms' },
  'Pjata Shtesë::Këpurdha në tavë': {
    name_en: 'Mushrooms in pan',
    description_en: 'Pan-fried with spinach'
  },
  'Pjata Shtesë::Këpurdhë e mbushur': {
    name_en: 'Stuffed mushroom',
    description_en: 'With spinach and gorgonzola'
  },
  'Pjata Shtesë::Brusketa': { name_en: 'Bruschetta' },
  'Pjata Shtesë::Perime të fërguara': { name_en: 'Fried vegetables' },
  'Pjata Shtesë::Djath me susam': {
    name_en: 'Sesame cheese',
    description_en: 'Served with honey'
  },
  'Pjata Shtesë::Djath i fërguar': { name_en: 'Fried cheese' },
  'Pjata Shtesë::Pjatë me djathëra': {
    name_en: 'Cheese platter',
    description_en: 'Sheep, goat, cow and sharri cheese, olives and olive oil'
  },

  'Raki::Rrushi': { name_en: 'Grape raki' },
  'Raki::Dardhe': { name_en: 'Pear raki' },
  'Raki::Kumbulle': { name_en: 'Plum raki' },
  'Raki::Zolta': { name_en: 'Quince raki' },
  'Raki::Arre': { name_en: 'Walnut raki' },
  'Raki::Molle': { name_en: 'Apple raki' },
  'Raki::Dardhe Williams': { name_en: 'Williams pear raki' },
  'Raki::Ftoni': { name_en: 'Lavender raki' },
  'Raki::Mjalte': { name_en: 'Honey raki' },
  'Raki::Vishnje': { name_en: 'Sour cherry raki' }
};

const GALLERY_ALT_EN = {
  'dsc00765.jpg': 'Rich breakfast with egg, tortilla and orange juice',
  'dsc00787.jpg': 'Country breakfast with fried eggs, sausage, cheese and tomato',
  'dsc01666.jpg': 'Grilled tortilla with fries and house sauce',
  'dsc01710.jpg': 'Meze board on a wooden table',
  'dsc01719.jpg': 'Warm dish with house sauce',
  'dsc03575.jpg': 'Large grill platter with onion rings and sauces',
  'dsc03617.jpg': 'Set table with salads and grilled dishes',
  'dsc04443.jpg': 'Fresh house salad with corn and carrot',
  'dsc07129.jpg': 'Menata signature cocktail',
  'dsc07173.jpg': 'Red cocktail at the bar',
  'dsc07243.jpg': 'Beef steak with grilled vegetables and potato salad',
  'dsc07252.jpg': 'Grilled meat with mushrooms and house sauce',
  'dsc07294.jpg': 'Lunch with salad, grilled meat and drinks',
  'dsc07305.jpg': 'Main course with a glass of red wine',
  'dsc07425.jpg': 'Grilled meat with cold beer',
  'dsc07972.jpg': 'Cappuccino and fresh orange juice',
  'dsc07994.jpg': 'Coffee and juice in the garden',
  'dsc08025.jpg': 'Refreshing cocktails in the sun',
  'dsc08051.jpg': 'Light lunch on the terrace',
  'dsc08098.jpg': 'Tuna salad with lemon and olive oil',
  'dsc08143.jpg': 'Set tables ready to serve',
  'dsc09322.jpg': 'Mixed grill platter with roasted peppers and tomato',
  '_dsc0858.jpg': 'Traditional cooking in a clay pot',
  '_dsc0892.jpg': 'Traditional dish in a clay pot',
  '_dsc0896.jpg': 'Traditional table with soup and house bread',
  '_dsc0943.jpg': 'Home-style dish on a traditional cover',
  '_dsc0980.jpg': 'Sarma in a traditional clay pot',
  '_dsc3302.jpg': 'Board with cold meze, cheeses and sujuk',
  '_dsc3319.jpg': 'Cold meze with sharri cheese and ham',
  '_dsc3358.jpg': 'Grilled vegetables and mushrooms on a wooden board',
  '_dsc3362.jpg': 'Board with grilled vegetables and peppers',
  '_dsc3487.jpg': 'Hot meze with sujuk and onion rings',
  '_dsc3941.jpg': 'Colourful shots at the bar',
  '_dsc6308.jpg': 'Soup, beans and house bread',
  '_dsc6317.jpg': 'Vegetable soup served with leqenik',
  'dsc02300.jpg': 'Main hall with the tree and warm lights',
  'dsc02320.jpg': 'Warm light through the tavern windows',
  'dsc02323.jpg': 'Photo wall beside the bar',
  'dsc09455.jpg': 'Warm dining room with wooden tables',
  'dsc09459.jpg': 'Traditional interior with rugs and paintings',
  'dsc09461.jpg': 'Cosy corner with paintings and plants',
  'dsc09629.jpg': 'High tables around the tree inside the tavern',
  'dsc09411.jpg': 'Garden seating under the pergola',
  'dsc09427.jpg': 'Wooden entrance to the tavern',
  'dsc09433.jpg': 'Garden corner with colourful chairs',
  'dsc09465.jpg': 'Garden with the olive tree',
  '_dsc4000.jpg': 'Terrace view among the greenery',
  '_dsc9727.jpg': 'Outdoor corridor with stools',
  'dsc07530.jpg': 'Terrace in the evening',
  'dsc08124.jpg': 'Lunch in the shade of the garden tree',
  'dsc09312.jpg': 'Fresh meat grilling on the barbecue',
  'dsc09338.jpg': 'Friends enjoying drinks in the garden',
  'dsc09350.jpg': 'Evening lights in the garden',
  '_dsc3472.jpg': 'Meze and wine in the evening',
  '_dsc9857.jpg': 'Cold beer from the bar'
};

function itemEn(category, name, description) {
  const key = `${category}::${name}`;
  const tr = ITEM_EN[key];

  if (tr) {
    return {
      name_en: tr.name_en,
      description_en: tr.description_en !== undefined ? tr.description_en : null
    };
  }

  if (DRINK_CATEGORIES.has(category)) {
    return {
      name_en: name,
      description_en: description || null
    };
  }

  return {
    name_en: name,
    description_en: description || null
  };
}

module.exports = { CATEGORY_EN, itemEn, galleryAltEn: GALLERY_ALT_EN };
