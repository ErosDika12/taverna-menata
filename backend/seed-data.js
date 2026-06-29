// Initial content for the database, transcribed from the printed
// Taverna Menata menu and the provided brand material. Prices in EUR.

const categories = [
  {
    name: 'Meny Ditore',
    type: 'food',
    note: 'Shùrbehet ùdo ditù deri nù ora 17:00',
    items: [
      { name: 'Mùngjes Menata', price: 4.5, description: 'Vezù nù furrù, tortilla me spinaq, mocarela, tomatina, qepù e re', image: '/uploads/gallery/dsc00765.jpg' },
      { name: 'Mùngjes Fshati', price: 5, description: 'Vezù nù sy, virshlle pule tù fùrguara, qumùsht, gjalpù, marmeladù, djath i bardhù, qepù e re', image: '/uploads/gallery/dsc00787.jpg' },
      { name: 'Omlet', price: 4, description: 'Vezù tù tundura e tù fùrguara, djath i bardhù, domate, tranguj, qepù e re' },
      { name: 'Omlet mix', price: 5, description: 'Suxhuk / Pùrshutù / Spanaq / Perime / Gjizù' },
      { name: 'Vezù nù sy', price: 4, description: 'Vezù nù sy, djath i bardhù, domate, tranguj, ullinj, qepù e re' },
      { name: 'Bukù e fùrguar me vezù', price: 4, description: 'Ajvar / djath / Nutella' },
      { name: 'Leqenik', price: 2.5, description: 'Dy copa leqenik me spinaq, djath i bardhù, qumùsht, qepù e re' },
      { name: 'Pallaqinka', price: 3.5, description: 'Ajvar / djath / marmeladù / Nutella' },
      { name: 'Pogaqe me suxhuk', price: 5.5, description: 'Mazù me speca nù tavù, pogaqe e shtùpisù me suxhuk, djath i bardhù, perime sezonale, qepù e re' },
      { name: 'Pogaqe me mazù', price: 5, description: 'Mazù me speca nù tavù, pogaqe e shtùpisù, djath i bardhù, perime sezonale, qepù e re' },
      { name: 'Supù me perime', price: 2, image: '/uploads/gallery/_dsc6317.jpg' },
      { name: 'Supù me pulù', price: 2 },
      { name: 'Sendviq vegjetarian', price: 4.5, description: 'Sendviq nù petù me perime, patate tù fùrguara dhe sos i bardhù' },
      { name: 'Sendviq me pùrshutù', price: 5, description: 'Sendviq nù petù me pùrshutù, patate tù fùrguara dhe sos i bardhù' },
      { name: 'Sendviq me pulù', price: 5, description: 'Sendviq nù petù me mish pule, patate tù fùrguara dhe sos i bardhù' },
      { name: 'Tavù me makarona', price: 5, description: 'Makarona, mish pule me sos tù bardhù dhe kaùkavall, djath i bardhù, spec turshi, kùpurdha' },
      { name: 'Tavù boloneze', price: 5.5, description: 'Makarona me mish tù bluar, salcù domatesh dhe kaùkavall, djath i bardhù dhe spec turshi' }
    ]
  },
  {
    name: 'Sallata',
    type: 'food',
    items: [
      { name: 'Sallatù shope', price: 5, description: 'Domate, tranguj dhe djath i bardhù' },
      { name: 'Sallatù greke', price: 5, description: 'Domate, tranguj, qepù, spec, ullinj dhe djath i bardhù' },
      { name: 'Sallatù e shpisù', price: 6, description: 'Lakùr, sallatù e gjelbùr, domate, tranguj, vezù tù zier, ullinj, spec turshi, karrotù', image: '/uploads/gallery/dsc04443.jpg' },
      { name: 'Sallatù tuna', price: 5.5, image: '/uploads/gallery/dsc08098.jpg' },
      { name: 'Sallatù caesar', price: 5.5 },
      { name: 'Kombinim turshi', price: 3, description: 'Pjatù sezonale' },
      { name: 'Turshi Menata', price: 5, description: 'Pjatù sezonale' },
      { name: 'Lakùr turshi', price: 3, description: 'Pjatù sezonale' },
      { name: 'Speca turshi', price: 3 }
    ]
  },
  {
    name: 'Pjata Kryesore',
    type: 'food',
    items: [
      { name: 'Pleskavicù', price: 5, description: 'Pleskavicù, kùpurdha dhe perime tù fùrguara, sallatù me patate, sos shpije' },
      { name: 'Ushtipka', price: 5.5, description: 'Ushtipka, kùpurdha dhe perime tù fùrguara, sallatù me patate, sos shpije' },
      { name: 'Kofshù pule', price: 5.5, description: 'Kofshù pule, kùpurdha dhe perime tù fùrguara, sallatù me patate' },
      { name: 'Gjoks pule', price: 9, description: 'Gjoks pule me mocarela, kùpurdha dhe perime tù fùrguara, sallatù me patate, sos shpije' },
      { name: 'Tul viùi', price: 10, description: 'Tul viùi, kùpurdha dhe perime tù fùrguara, sallatù me patate, sos shpije' },
      { name: 'Muskuj', price: 10, description: 'Muskuj, kùpurdha dhe perime tù fùrguara, sallatù me patate, sos shpije' },
      { name: 'Kotlet', price: 13, description: 'Kotlet, kùpurdha dhe perime tù fùrguara, sallatù me patate, sos shpije' },
      { name: 'Brinjù kingji', price: 13, description: 'Brinjù kingji, kùpurdha dhe perime tù fùrguara, sallatù me patate, sos shpije' },
      { name: 'Biftek', price: 19, description: 'Biftek, kùpurdha dhe perime tù fùrguara, sallatù me patate, sos shpije', image: '/uploads/gallery/dsc07243.jpg' },
      { name: 'Kombinim 1', price: 30, description: 'Suxhuk, pleskavicù, ushtipka, kofshù pule, muskuj, perime nù skarù, kùpurdha, sallatù me patate, sos shpije', image: '/uploads/gallery/dsc03575.jpg' },
      { name: 'Kombinim 2', price: 40, description: 'Tul viùi, muskuj, kotlet, brinjù kingji, kofshù pule, kùpurdha, perime nù skarù, sallatù me patate, sos shpije', image: '/uploads/gallery/dsc09322.jpg' },
      { name: 'Kombinim 3', price: 48, description: 'Kombinim i mishrave nù tavù' },
      { name: 'Meze e nxehtù (e madhe)', price: 18, description: 'Patate tù fùrguara, virshlle viùi, krahù pule, djath me susam, kùpurdha, onion rings, 2 sosa', image: '/uploads/gallery/_dsc3487.jpg' },
      { name: 'Meze e nxehtù (e vogùl)', price: 10, description: 'Patate tù fùrguara, virshlle viùi, krahù pule, djath me susam, kùpurdha, onion rings, 2 sosa' },
      { name: 'Meze e ftohtù (e madhe)', price: 17, description: 'Tranguj turshi, karrota, djath sharri, kaùkavall, suxhuk, pùrshutù, ullinj, arra, cranberry, sos i bardhù', image: '/uploads/gallery/_dsc3319.jpg' },
      { name: 'Meze e ftohtù (e vogùl)', price: 9, description: 'Tranguj turshi, karrota, djath sharri, kaùkavall, suxhuk, pùrshutù, ullinj, arra, cranberry, sos i bardhù' },
      { name: 'Biftek 1 kg', price: 65 },
      { name: 'Specialitet Menata', price: 13, description: 'Mish nù tel i mbùshtjellù me ajvar dhe kaùkavall' }
    ]
  },
  {
    name: 'Pjata Shtes\u00eb',
    type: 'food',
    items: [
      { name: 'Bukù bageti e rreshkur', price: 1.5 },
      { name: 'Kos', price: 1.5 },
      { name: 'Ajvar', price: 1.5 },
      { name: 'Tarator', price: 2 },
      { name: 'Pjatù me salsa', price: 3 },
      { name: 'Sallatù me patate', price: 2.5 },
      { name: 'Speca me hudùr', price: 2.5 },
      { name: 'Speca tù djegùs', price: 3 },
      { name: 'Kùpurdha tù fùrguara', price: 4 },
      { name: 'Kùpurdha nù tavù', price: 4.5, description: 'Tù pùrgatitura nù tavù me spinaq' },
      { name: 'Kùpurdhù e mbushur', price: 6, description: 'Me spinaq dhe gorgonzola' },
      { name: 'Brusketa', price: 3.5 },
      { name: 'Perime tù fùrguara', price: 4, image: '/uploads/gallery/_dsc3358.jpg' },
      { name: 'Djath me susam', price: 4, description: 'Shùrbehet me mjaltù' },
      { name: 'Djath i fùrguar', price: 4.5 },
      { name: 'Pjatù me djathùra', price: 5, description: 'Djath dele, dhie, lope, sharri, ullinj dhe vaj ulliri' }
    ]
  },
  {
    name: 'Birrat',
    type: 'drinks',
    items: [
      { name: 'Peja', price: 2.5 },
      { name: 'Peja Premium', price: 2.5 },
      { name: 'Lasko', price: 2.5 },
      { name: 'Bavaria', price: 2.5 },
      { name: 'Peroni', price: 2.5 },
      { name: 'Bavaria 0', price: 2.5 },
      { name: 'Skopsko', price: 2.5 },
      { name: 'Heineken', price: 3 },
      { name: 'Krombacher', price: 3 },
      { name: 'Tuborg', price: 3 },
      { name: 'Somersby Apple', price: 3 },
      { name: 'Somersby Blueberry', price: 3 },
      { name: 'Somersby Pear', price: 3 },
      { name: 'Peja Crudo', price: 3 },
      { name: 'Super Bock', price: 3.5 },
      { name: 'Paulaner', price: 3.5 },
      { name: 'Corona', price: 4 },
      { name: 'Smirnoff Ice', price: 4 },
      { name: 'Budweiser', price: 4.5 }
    ]
  },
  {
    name: 'Koktella',
    type: 'drinks',
    items: [
      { name: 'Mojito', price: 5 },
      { name: 'Hugo', price: 5 },
      { name: 'Cosmopolitan', price: 5 },
      { name: 'Negroni', price: 5 },
      { name: 'Margarita', price: 5 },
      { name: 'Strawberry Daiquiri', price: 5 },
      { name: 'Aperol Spritz', price: 5.5 },
      { name: 'Vodka Sour', price: 5.5 },
      { name: 'Amaretto Sour', price: 5.5 },
      { name: 'Menata', price: 5.5 },
      { name: 'Sex on the Beach', price: 6 },
      { name: 'Pornstar Martini', price: 6 },
      { name: 'Adios MotherF', price: 6 },
      { name: 'Whiskey Sour', price: 6 },
      { name: 'Tequila Sunrise', price: 6 },
      { name: 'Long Island', price: 7 }
    ]
  },
  {
    name: 'Shots',
    type: 'drinks',
    items: [
      { name: 'Sambuca', price: 3.5 },
      { name: 'Disaranno', price: 3.5 },
      { name: 'Hourse Sperm', price: 3.5 },
      { name: 'Kamikaz', price: 3.5 },
      { name: 'B52', price: 3.5 },
      { name: 'Jager Maister', price: 3.5 },
      { name: 'Menata', price: 3.5 }
    ]
  },
  {
    name: 'Raki',
    type: 'drinks',
    items: [
      { name: 'Rrushi', price: 2 },
      { name: 'Dardhe', price: 2.5 },
      { name: 'Kumbulle', price: 2.5 },
      { name: 'Zolta', price: 2.5 },
      { name: 'Arre', price: 3 },
      { name: 'Molle', price: 3 },
      { name: 'Dardhe Williams', price: 3 },
      { name: 'Ftoni', price: 3 },
      { name: 'Mjalte', price: 3 },
      { name: 'Vishnje', price: 3 }
    ]
  },
  {
    name: 'Whiskey',
    type: 'drinks',
    items: [
      { name: 'Four Roses', price: 3.5 },
      { name: 'Jameson', price: 4 },
      { name: 'Red Label', price: 4 },
      { name: 'Jack Daniels', price: 4.5 },
      { name: 'Black Label', price: 5 },
      { name: 'Jack Honey', price: 5 },
      { name: 'Jack Gentleman', price: 5.5 },
      { name: 'Tottori Blended', price: 5.5 },
      { name: 'Tottori Bourbon', price: 6 },
      { name: 'Chivas Regal', price: 6 },
      { name: 'Green Label', price: 10 },
      { name: 'Blue Label', price: 40 }
    ]
  },
  {
    name: 'Vodka',
    type: 'drinks',
    items: [
      { name: 'Absolut', price: 4 },
      { name: 'Grey Goose', price: 5.5 },
      { name: 'Belvedere', price: 7 }
    ]
  },
  {
    name: 'Gin',
    type: 'drinks',
    items: [
      { name: 'Beefeater', price: 3.5 },
      { name: 'Bombay Saphire', price: 5 },
      { name: 'Japan Orange', price: 5.5 },
      { name: 'Japan Pacifik', price: 5.5 },
      { name: 'Hendrix', price: 6 },
      { name: 'Monkey47', price: 8 },
      { name: 'Ki-no bi', price: 8 }
    ]
  },
  {
    name: 'Rum',
    type: 'drinks',
    items: [
      { name: 'Malibu', price: 4 },
      { name: 'Bacardi', price: 4 },
      { name: 'Captain Morgan', price: 4 }
    ]
  },
  {
    name: 'Tequila',
    type: 'drinks',
    items: [
      { name: 'Olmeca', price: 3 },
      { name: 'Patron Reposado', price: 8 },
      { name: 'Don Julio Blanko', price: 9 },
      { name: 'Don Julio Repsado', price: 9.5 },
      { name: 'Don Julio Anejo', price: 10 }
    ]
  },
  {
    name: 'Likere',
    type: 'drinks',
    items: [
      { name: 'Jager Maister', price: 4 },
      { name: 'Baileys', price: 4 },
      { name: 'Monte Negro', price: 4 },
      { name: 'Campari', price: 4 },
      { name: 'Aperol', price: 4 },
      { name: 'Disaranno', price: 4 }
    ]
  },
  {
    name: 'Cognac',
    type: 'drinks',
    items: [
      { name: 'Hennesy', price: 6 },
      { name: 'Courvolster', price: 5 }
    ]
  },
  {
    name: 'Shampanj\u00eb',
    type: 'drinks',
    items: [
      { name: 'Martini Bianco', price: 4 },
      { name: 'JP Chenet', price: 4.5 },
      { name: 'Zonin Pressecco', price: 4.5 },
      { name: 'Moet Brut', price: 140 },
      { name: 'Moet White', price: 160 }
    ]
  }
];

// category: food | interior | exterior | atmosphere
const gallery = [
  { file: 'dsc00765.jpg', category: 'food', alt: 'Mùngjes i pasur me vezù, tortilla dhe lùng portokalli' },
  { file: 'dsc00787.jpg', category: 'food', alt: 'Mùngjes fshati me vezù nù sy, virshlle, djath dhe domate' },
  { file: 'dsc01666.jpg', category: 'food', alt: 'Tortilla nù skarù me patate dhe sos shtùpie' },
  { file: 'dsc01710.jpg', category: 'food', alt: 'Dùrrasù me meze nù tavolinù druri' },
  { file: 'dsc01719.jpg', category: 'food', alt: 'Gatim i ngrohtù me sos shtùpie' },
  { file: 'dsc03575.jpg', category: 'food', alt: 'Pjatù e madhe me mish nù skarù, onion rings dhe sosa' },
  { file: 'dsc03617.jpg', category: 'food', alt: 'Tavolinù e shtruar me sallata dhe pjata nù skarù' },
  { file: 'dsc04443.jpg', category: 'food', alt: 'Sallatù e freskùt e shpisù me misùr dhe karrota' },
  { file: 'dsc07129.jpg', category: 'food', alt: 'Kokteli i veùantù i Menatùs' },
  { file: 'dsc07173.jpg', category: 'food', alt: 'Koktel i kuq nù banak' },
  { file: 'dsc07243.jpg', category: 'food', alt: 'Biftek me perime nù skarù dhe sallatù me patate' },
  { file: 'dsc07252.jpg', category: 'food', alt: 'Pjatù me mish nù skarù, kùpurdha dhe sos shpije' },
  { file: 'dsc07294.jpg', category: 'food', alt: 'Drekù me sallatù, mish nù skarù dhe pije' },
  { file: 'dsc07305.jpg', category: 'food', alt: 'Pjatù kryesore me njù gotù verù tù kuqe' },
  { file: 'dsc07425.jpg', category: 'food', alt: 'Mish nù skarù me birrù tù ftohtù' },
  { file: 'dsc07972.jpg', category: 'food', alt: 'Kapuùino dhe lùng portokalli i freskùt' },
  { file: 'dsc07994.jpg', category: 'food', alt: 'Kafe dhe lùng nù oborr' },
  { file: 'dsc08025.jpg', category: 'food', alt: 'Koktela freskuese nù diell' },
  { file: 'dsc08051.jpg', category: 'food', alt: 'Drekù e lehtù nù terracù' },
  { file: 'dsc08098.jpg', category: 'food', alt: 'Sallatù tuna me limon dhe vaj ulliri' },
  { file: 'dsc08143.jpg', category: 'food', alt: 'Pjata tù shtruara gati pùr shùrbim' },
  { file: 'dsc09322.jpg', category: 'food', alt: 'Pjatù e pùrzier skare me speca tù pjekur dhe domate' },
  { file: '_dsc0858.jpg', category: 'food', alt: 'Gatime tradicionale nù enù balte' },
  { file: '_dsc0892.jpg', category: 'food', alt: 'Tavù tradicionale nù enù balte' },
  { file: '_dsc0896.jpg', category: 'food', alt: 'Sofùr tradicionale me supù dhe bukù shtùpie' },
  { file: '_dsc0943.jpg', category: 'food', alt: 'Pjata shtùpie mbi mbulesù tradicionale' },
  { file: '_dsc0980.jpg', category: 'food', alt: 'Sarma nù enù balte tradicionale' },
  { file: '_dsc3302.jpg', category: 'food', alt: 'Dùrrasù me meze tù ftohtù, djathùra dhe suxhuk' },
  { file: '_dsc3319.jpg', category: 'food', alt: 'Meze e ftohtù me djath sharri dhe pùrshutù' },
  { file: '_dsc3358.jpg', category: 'food', alt: 'Perime dhe kùpurdha tù pjekura nù dùrrasù druri' },
  { file: '_dsc3362.jpg', category: 'food', alt: 'Dùrrasù me perime tù pjekura dhe speca' },
  { file: '_dsc3487.jpg', category: 'food', alt: 'Meze e nxehtù me suxhuk dhe onion rings' },
  { file: '_dsc3941.jpg', category: 'food', alt: 'Shots shumùngjyrùshe nù banak' },
  { file: '_dsc6308.jpg', category: 'food', alt: 'Supù, pasul dhe bukù shtùpie' },
  { file: '_dsc6317.jpg', category: 'food', alt: 'Supù me perime e shoqùruar me leqenik' },
  { file: 'dsc02300.jpg', category: 'interior', alt: 'Salla kryesore me pemùn dhe dritat e ngrohta' },
  { file: 'dsc02320.jpg', category: 'interior', alt: 'Drita e ngrohtù nùpùr dritaret e tavernùs' },
  { file: 'dsc02323.jpg', category: 'interior', alt: 'Muri me fotografi pranù banakut' },
  { file: 'dsc09455.jpg', category: 'interior', alt: 'Salla e ngrohtù me tavolina druri' },
  { file: 'dsc09459.jpg', category: 'interior', alt: 'Ambient tradicional me qilima dhe piktura' },
  { file: 'dsc09461.jpg', category: 'interior', alt: 'Kùnd i ngrohtù me piktura dhe bimù' },
  { file: 'dsc09629.jpg', category: 'interior', alt: 'Tavolina tù larta rreth pemùs brenda tavernùs' },
  { file: 'dsc09411.jpg', category: 'exterior', alt: 'Ulùset e oborrit nùn pergolù' },
  { file: 'dsc09427.jpg', category: 'exterior', alt: 'Hyrja prej druri e tavernùs' },
  { file: 'dsc09433.jpg', category: 'exterior', alt: 'Kùndi i oborrit me karrige shumùngjyrùshe' },
  { file: 'dsc09465.jpg', category: 'exterior', alt: 'Oborri me pemùn e ullirit' },
  { file: '_dsc4000.jpg', category: 'exterior', alt: 'Pamje e terracùs mes gjelbùrimit' },
  { file: '_dsc9727.jpg', category: 'exterior', alt: 'Korridori i jashtùm me stola' },
  { file: 'dsc07530.jpg', category: 'atmosphere', alt: 'Terraca nù mbrùmje' },
  { file: 'dsc08124.jpg', category: 'atmosphere', alt: 'Drekù nùn hijen e pemùs nù oborr' },
  { file: 'dsc09312.jpg', category: 'atmosphere', alt: 'Mish i freskùt duke u pjekur nù skarù' },
  { file: 'dsc09338.jpg', category: 'atmosphere', alt: 'Shoqùria duke i shijuar pijet nù oborr' },
  { file: 'dsc09350.jpg', category: 'atmosphere', alt: 'Mbrùmje me drita nù oborr' },
  { file: '_dsc3472.jpg', category: 'atmosphere', alt: 'Meze dhe verù nù mbrùmje' },
  { file: '_dsc9857.jpg', category: 'atmosphere', alt: 'Birrù e freskùt nga banaku' }
];

const categoryTranslations = {
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

// No videos were included in the provided project files.
// The owner can upload real videos through the admin panel.
const videos = [];

const settings = {
  site_name: 'Taverna Menata',
  hero_image: '/uploads/gallery/dsc09455.jpg',
  tagline_sq: 'Trimat i pùrcjell fati, maraklitù qefi.',
  home_intro_sq:
    'Tavernù tradicionale nù zemùr tù Prishtinùs ù prej mùngjesit herùt deri te mezet e natùs. ' +
    'Njù vend ku vjen pùr me ngrùnù mirù, por rri mù gjatù pùr atmosferùn.',
  about_text_sq:
    'Taverna Menata ùshtù prej atyre vendeve ku dita mund tù nisù herùt e tù pùrfundojù vonù, ' +
    'gjithmonù me shije, shoqni dhe atmosferù tù mirù.\n\n' +
    'Nù mùngjes, Menata tù pret me ushqime tù freskùta e tù thjeshta, si nù shpi. Nù drekù, tavolina ' +
    'mbushet me pjata tù ngrohta, gatime tradicionale, kuzhinù tù pasur dhe shije qù tù kujtojnù sofrùn ' +
    'familjare. Ndùrsa nù mbrùmje, vendi merr tjetùr ritùm ù birra tù ftohta, mish, muzikù, neja dhe ' +
    'shoqni qù e bùjnù atmosferùn edhe mù tù gjallù.\n\n' +
    'Pikùrisht kjo lidhje mes ushqimit tù mirù, mikpritjes dhe qejfit me njerùz tù zemrùs e ka bùrù ' +
    'Menatùn njù nga vendet mù tù frekuentuara nù Prishtinù. Njù tavernù ku vjen pùr me ngrùnù mirù, ' +
    'por rri mù gjatù pùr atmosferùn.',
  hours_sq: 'ùdo ditù ù 07:00 ù 03:00',
  drinks_note_sq: 'ùmimet pas mesnatùs janù +20%',
  phone: '+383 48 533 555',
  whatsapp: '38348533555',
  instagram: 'https://www.instagram.com/tavernamenata',
  facebook: 'https://www.facebook.com/tavernamenata',
  address: 'Rr. Faton Shabani, 10000 Prishtinù, Kosovù',
  maps_url: 'https://www.google.com/maps/search/?api=1&query=Taverna+Menata+Prishtina'
};

const settingsEn = {
  site_name_en: 'Tavern Menata',
  address_en: 'Faton Shabani St., 10000 Prishtina, Kosovo',
  tagline_en: 'Fortune follows the brave; good company brings cheer.',
  home_intro_en:
    'A traditional tavern in the heart of Prishtina ù from early breakfasts to late-night meze. ' +
    'A place you come for the food, and stay for the atmosphere.',
  about_text_en:
    'Taverna Menata is one of those places where the day can start early and end late ù ' +
    'always with good food, good company and a warm atmosphere.\n\n' +
    'In the morning, Menata welcomes you with fresh, simple dishes, just like at home. At lunch, ' +
    'the tables fill with warm plates, traditional cooking and flavours that bring back the family table. ' +
    'In the evening, the place takes on a different rhythm ù cold beer, grilled meat, music and friends ' +
    'that make the atmosphere come alive.\n\n' +
    'It is this mix of good food, hospitality and time spent with people you care about that has made ' +
    'Menata one of the most loved spots in Prishtina. A tavern you visit for the food ù and stay longer for the atmosphere.',
  hours_en: 'Every day ù 07:00 ù 03:00',
  drinks_note_en: 'Prices after midnight are +20%'
};

module.exports = { categories, gallery, videos, categoryTranslations, settings, settingsEn };

