// Initial content for the database, transcribed from the printed
// Taverna Menata menu and the provided brand material. Prices in EUR.

const { wineItems } = require('./wine-menu');
const { dailyOfferItems } = require('./daily-offers');

const categories = [
  {
    name: 'Oferte Ditore',
    type: 'food',
    note: null,
    items: dailyOfferItems
  },
  {
    name: 'Meny Ditore',
    type: 'food',
    note: 'Shërbehet çdo ditë deri në ora 17:00',
    items: [
      { name: 'Mëngjes Menata', price: 4.5, description: 'Vezë në furrë, tortilla me spinaq, mocarela, tomatina, qepë e re', image: '/uploads/gallery/dsc00765.jpg' },
      { name: 'Mëngjes Fshati', price: 5, description: 'Vezë në sy, virshlle pule të fërguara, qumësht, gjalpë, marmeladë, djath i bardhë, qepë e re', image: '/uploads/gallery/dsc00787.jpg' },
      { name: 'Omlet', price: 4, description: 'Vezë të tundura e të fërguara, djath i bardhë, domate, tranguj, qepë e re' },
      { name: 'Omlet mix', price: 5, description: 'Suxhuk / Përshutë / Spanaq / Perime / Gjizë' },
      { name: 'Vezë në sy', price: 4, description: 'Vezë në sy, djath i bardhë, domate, tranguj, ullinj, qepë e re' },
      { name: 'Bukë e fërguar me vezë', price: 4, description: 'Ajvar / djath / Nutella' },
      { name: 'Leqenik', price: 2.5, description: 'Dy copa leqenik me spinaq, djath i bardhë, qumësht, qepë e re' },
      { name: 'Pallaqinka', price: 3.5, description: 'Ajvar / djath / marmeladë / Nutella' },
      { name: 'Pogaqe me suxhuk', price: 5.5, description: 'Mazë me speca në tavë, pogaqe e shtëpisë me suxhuk, djath i bardhë, perime sezonale, qepë e re' },
      { name: 'Pogaqe me mazë', price: 5, description: 'Mazë me speca në tavë, pogaqe e shtëpisë, djath i bardhë, perime sezonale, qepë e re' },
      { name: 'Supë me perime', price: 2, image: '/uploads/gallery/_dsc6317.jpg' },
      { name: 'Supë me pulë', price: 2 },
      { name: 'Sendviq vegjetarian', price: 4.5, description: 'Sendviq në petë me perime, patate të fërguara dhe sos i bardhë' },
      { name: 'Sendviq me përshutë', price: 5, description: 'Sendviq në petë me përshutë, patate të fërguara dhe sos i bardhë' },
      { name: 'Sendviq me pulë', price: 5, description: 'Sendviq në petë me mish pule, patate të fërguara dhe sos i bardhë' },
      { name: 'Tavë me makarona', price: 5, description: 'Makarona, mish pule me sos të bardhë dhe kaçkavall, djath i bardhë, spec turshi, këpurdha' },
      { name: 'Tavë boloneze', price: 5.5, description: 'Makarona me mish të bluar, salcë domatesh dhe kaçkavall, djath i bardhë dhe spec turshi' }
    ]
  },
  {
    name: 'Sallata',
    type: 'food',
    items: [
      { name: 'Sallatë shope', price: 5, description: 'Domate, tranguj dhe djath i bardhë' },
      { name: 'Sallatë greke', price: 5, description: 'Domate, tranguj, qepë, spec, ullinj dhe djath i bardhë' },
      { name: 'Sallatë e shpisë', price: 6, description: 'Lakër, sallatë e gjelbër, domate, tranguj, vezë të zier, ullinj, spec turshi, karrotë', image: '/uploads/gallery/dsc04443.jpg' },
      { name: 'Sallatë tuna', price: 5.5, image: '/uploads/gallery/dsc08098.jpg' },
      { name: 'Sallatë caesar', price: 5.5 },
      { name: 'Kombinim turshi', price: 3, description: 'Pjatë sezonale' },
      { name: 'Turshi Menata', price: 5, description: 'Pjatë sezonale' },
      { name: 'Lakër turshi', price: 3, description: 'Pjatë sezonale' },
      { name: 'Speca turshi', price: 3 }
    ]
  },
  {
    name: 'Pjata Kryesore',
    type: 'food',
    items: [
      { name: 'Pleskavicë', price: 5, description: 'Pleskavicë, këpurdha dhe perime të fërguara, sallatë me patate, sos shpije' },
      { name: 'Ushtipka', price: 5.5, description: 'Ushtipka, këpurdha dhe perime të fërguara, sallatë me patate, sos shpije' },
      { name: 'Kofshë pule', price: 5.5, description: 'Kofshë pule, këpurdha dhe perime të fërguara, sallatë me patate' },
      { name: 'Gjoks pule', price: 9, description: 'Gjoks pule me mocarela, këpurdha dhe perime të fërguara, sallatë me patate, sos shpije' },
      { name: 'Tul viçi', price: 10, description: 'Tul viçi, këpurdha dhe perime të fërguara, sallatë me patate, sos shpije' },
      { name: 'Muskuj', price: 10, description: 'Muskuj, këpurdha dhe perime të fërguara, sallatë me patate, sos shpije' },
      { name: 'Kotlet', price: 13, description: 'Kotlet, këpurdha dhe perime të fërguara, sallatë me patate, sos shpije' },
      { name: 'Brinjë kingji', price: 13, description: 'Brinjë kingji, këpurdha dhe perime të fërguara, sallatë me patate, sos shpije' },
      { name: 'Biftek', price: 19, description: 'Biftek, këpurdha dhe perime të fërguara, sallatë me patate, sos shpije', image: '/uploads/gallery/dsc07243.jpg' },
      { name: 'Kombinim 1', price: 30, description: 'Suxhuk, pleskavicë, ushtipka, kofshë pule, muskuj, perime në skarë, këpurdha, sallatë me patate, sos shpije', image: '/uploads/gallery/dsc03575.jpg' },
      { name: 'Kombinim 2', price: 40, description: 'Tul viçi, muskuj, kotlet, brinjë kingji, kofshë pule, këpurdha, perime në skarë, sallatë me patate, sos shpije', image: '/uploads/gallery/dsc09322.jpg' },
      { name: 'Kombinim 3', price: 48, description: 'Kombinim i mishrave në tavë' },
      { name: 'Meze e nxehtë (e madhe)', price: 18, description: 'Patate të fërguara, virshlle viçi, krahë pule, djath me susam, këpurdha, onion rings, 2 sosa', image: '/uploads/gallery/_dsc3487.jpg' },
      { name: 'Meze e nxehtë (e vogël)', price: 10, description: 'Patate të fërguara, virshlle viçi, krahë pule, djath me susam, këpurdha, onion rings, 2 sosa', image: '/uploads/gallery/dsc01710.jpg' },
      { name: 'Meze e ftohtë (e madhe)', price: 17, description: 'Tranguj turshi, karrota, djath sharri, kaçkavall, suxhuk, përshutë, ullinj, arra, cranberry, sos i bardhë', image: '/uploads/gallery/_dsc3319.jpg' },
      { name: 'Meze e ftohtë (e vogël)', price: 9, description: 'Tranguj turshi, karrota, djath sharri, kaçkavall, suxhuk, përshutë, ullinj, arra, cranberry, sos i bardhë', image: '/uploads/gallery/_dsc3302.jpg' },
      { name: 'Biftek 1 kg', price: 65 },
      { name: 'Specialitet Menata', price: 13, description: 'Mish në tel i mbështjellë me ajvar dhe kaçkavall' }
    ]
  },
  {
    name: 'Pjata Shtesë',
    type: 'food',
    items: [
      { name: 'Bukë bageti e rreshkur', price: 1.5 },
      { name: 'Kos', price: 1.5 },
      { name: 'Ajvar', price: 1.5 },
      { name: 'Tarator', price: 2 },
      { name: 'Pjatë me salsa', price: 3 },
      { name: 'Sallatë me patate', price: 2.5 },
      { name: 'Speca me hudër', price: 2.5 },
      { name: 'Speca të djegës', price: 3 },
      { name: 'Këpurdha të fërguara', price: 4 },
      { name: 'Këpurdha në tavë', price: 4.5, description: 'Të përgatitura në tavë me spinaq' },
      { name: 'Këpurdhë e mbushur', price: 6, description: 'Me spinaq dhe gorgonzola' },
      { name: 'Brusketa', price: 3.5 },
      { name: 'Perime të fërguara', price: 4, image: '/uploads/gallery/_dsc3358.jpg' },
      { name: 'Djath me susam', price: 4, description: 'Shërbehet me mjaltë' },
      { name: 'Djath i fërguar', price: 4.5 },
      { name: 'Pjatë me djathëra', price: 5, description: 'Djath dele, dhie, lope, sharri, ullinj dhe vaj ulliri' }
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
    name: 'Verëra',
    type: 'drinks',
    items: wineItems
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
    name: 'Shampanjë',
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
  { file: 'dsc00765.jpg', category: 'food', alt: 'Mëngjes i pasur me vezë, tortilla dhe lëng portokalli' },
  { file: 'dsc00787.jpg', category: 'food', alt: 'Mëngjes fshati me vezë në sy, virshlle, djath dhe domate' },
  { file: 'dsc01666.jpg', category: 'food', alt: 'Tortilla në skarë me patate dhe sos shtëpie' },
  { file: 'dsc01710.jpg', category: 'food', alt: 'Dërrasë me meze në tavolinë druri' },
  { file: 'dsc01719.jpg', category: 'food', alt: 'Gatim i ngrohtë me sos shtëpie' },
  { file: 'dsc03575.jpg', category: 'food', alt: 'Pjatë e madhe me mish në skarë, onion rings dhe sosa' },
  { file: 'dsc03617.jpg', category: 'food', alt: 'Tavolinë e shtruar me sallata dhe pjata në skarë' },
  { file: 'dsc04443.jpg', category: 'food', alt: 'Sallatë e freskët e shpisë me misër dhe karrota' },
  { file: 'dsc07129.jpg', category: 'food', alt: 'Kokteli i veçantë i Menatës' },
  { file: 'dsc07173.jpg', category: 'food', alt: 'Koktel i kuq në banak' },
  { file: 'dsc07243.jpg', category: 'food', alt: 'Biftek me perime në skarë dhe sallatë me patate' },
  { file: 'dsc07252.jpg', category: 'food', alt: 'Pjatë me mish në skarë, këpurdha dhe sos shpije' },
  { file: 'dsc07294.jpg', category: 'food', alt: 'Drekë me sallatë, mish në skarë dhe pije' },
  { file: 'dsc07305.jpg', category: 'food', alt: 'Pjatë kryesore me një gotë verë të kuqe' },
  { file: 'dsc07425.jpg', category: 'food', alt: 'Mish në skarë me birrë të ftohtë' },
  { file: 'dsc07972.jpg', category: 'food', alt: 'Kapuçino dhe lëng portokalli i freskët' },
  { file: 'dsc07994.jpg', category: 'food', alt: 'Kafe dhe lëng në oborr' },
  { file: 'dsc08025.jpg', category: 'food', alt: 'Koktela freskuese në diell' },
  { file: 'dsc08051.jpg', category: 'food', alt: 'Drekë e lehtë në terracë' },
  { file: 'dsc08098.jpg', category: 'food', alt: 'Sallatë tuna me limon dhe vaj ulliri' },
  { file: 'dsc08143.jpg', category: 'food', alt: 'Pjata të shtruara gati për shërbim' },
  { file: 'dsc09322.jpg', category: 'food', alt: 'Pjatë e përzier skare me speca të pjekur dhe domate' },
  { file: '_dsc0858.jpg', category: 'food', alt: 'Gatime tradicionale në enë balte' },
  { file: '_dsc0892.jpg', category: 'food', alt: 'Tavë tradicionale në enë balte' },
  { file: '_dsc0896.jpg', category: 'food', alt: 'Sofër tradicionale me supë dhe bukë shtëpie' },
  { file: '_dsc0943.jpg', category: 'food', alt: 'Pjata shtëpie mbi mbulesë tradicionale' },
  { file: '_dsc0980.jpg', category: 'food', alt: 'Sarma në enë balte tradicionale' },
  { file: '_dsc3302.jpg', category: 'food', alt: 'Dërrasë me meze të ftohtë, djathëra dhe suxhuk' },
  { file: '_dsc3319.jpg', category: 'food', alt: 'Meze e ftohtë me djath sharri dhe përshutë' },
  { file: '_dsc3358.jpg', category: 'food', alt: 'Perime dhe këpurdha të pjekura në dërrasë druri' },
  { file: '_dsc3362.jpg', category: 'food', alt: 'Dërrasë me perime të pjekura dhe speca' },
  { file: '_dsc3487.jpg', category: 'food', alt: 'Meze e nxehtë me suxhuk dhe onion rings' },
  { file: '_dsc3941.jpg', category: 'food', alt: 'Shots shumëngjyrëshe në banak' },
  { file: '_dsc6308.jpg', category: 'food', alt: 'Supë, pasul dhe bukë shtëpie' },
  { file: '_dsc6317.jpg', category: 'food', alt: 'Supë me perime e shoqëruar me leqenik' },
  { file: 'dsc02300.jpg', category: 'interior', alt: 'Salla kryesore me pemën dhe dritat e ngrohta' },
  { file: 'dsc02320.jpg', category: 'interior', alt: 'Drita e ngrohtë nëpër dritaret e tavernës' },
  { file: 'dsc02323.jpg', category: 'interior', alt: 'Muri me fotografi pranë banakut' },
  { file: 'dsc09455.jpg', category: 'interior', alt: 'Salla e ngrohtë me tavolina druri' },
  { file: 'dsc09459.jpg', category: 'interior', alt: 'Ambient tradicional me qilima dhe piktura' },
  { file: 'dsc09461.jpg', category: 'interior', alt: 'Kënd i ngrohtë me piktura dhe bimë' },
  { file: 'dsc09629.jpg', category: 'interior', alt: 'Tavolina të larta rreth pemës brenda tavernës' },
  { file: 'dsc09411.jpg', category: 'exterior', alt: 'Ulëset e oborrit nën pergolë' },
  { file: 'dsc09427.jpg', category: 'exterior', alt: 'Hyrja prej druri e tavernës' },
  { file: 'dsc09433.jpg', category: 'exterior', alt: 'Këndi i oborrit me karrige shumëngjyrëshe' },
  { file: 'dsc09465.jpg', category: 'exterior', alt: 'Oborri me pemën e ullirit' },
  { file: '_dsc4000.jpg', category: 'exterior', alt: 'Pamje e terracës mes gjelbërimit' },
  { file: '_dsc9727.jpg', category: 'exterior', alt: 'Korridori i jashtëm me stola' },
  { file: 'dsc07530.jpg', category: 'atmosphere', alt: 'Terraca në mbrëmje' },
  { file: 'dsc09338.jpg', category: 'atmosphere', alt: 'Shoqëria duke i shijuar pijet në oborr' },
  { file: 'dsc09350.jpg', category: 'atmosphere', alt: 'Mbrëmje me drita në oborr' },
  { file: 'dsc08124.jpg', category: 'atmosphere', alt: 'Drekë nën hijen e pemës në oborr' },
  { file: 'dsc09312.jpg', category: 'food', alt: 'Mish i freskët duke u pjekur në skarë' },
  { file: '_dsc3472.jpg', category: 'food', alt: 'Meze dhe verë në mbrëmje' },
  { file: '_dsc9857.jpg', category: 'atmosphere', alt: 'Birrë e freskët nga banaku' }
];

const categoryTranslations = {
  'Oferte Ditore': { name_en: 'Daily Offers' },
  'Meny Ditore': { name_en: 'Daily Menu' },
  Sallata: { name_en: 'Salads' },
  'Pjata Kryesore': { name_en: 'Main Dishes' },
  'Pjata Shtesë': { name_en: 'Side Dishes' },
  Birrat: { name_en: 'Beers' },
  'Verëra': { name_en: 'Wines' },
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
  'Shampanjë': { name_en: 'Champagne & Sparkling' }
};

// No videos were included in the provided project files.
// The owner can upload real videos through the admin panel.
const videos = [];

const settings = {
  site_name: 'Taverna Menata',
  hero_image: '/uploads/gallery/dsc09455.jpg',
  tagline_sq: 'Trimat i përcjell fati, maraklitë qefi.',
  home_intro_sq:
    'Tavernë tradicionale në zemër të Prishtinës — prej mëngjesit herët deri te mezet e natës. ' +
    'Një vend ku vjen për me ngrënë mirë, por rri më gjatë për atmosferën.',
  about_text_sq:
    'Taverna Menata është prej atyre vendeve ku dita mund të nisë herët e të përfundojë vonë, ' +
    'gjithmonë me shije, shoqni dhe atmosferë të mirë.\n\n' +
    'Në mëngjes, Menata të pret me ushqime të freskëta e të thjeshta, si në shpi. Në drekë, tavolina ' +
    'mbushet me pjata të ngrohta, gatime tradicionale, kuzhinë të pasur dhe shije që të kujtojnë sofrën ' +
    'familjare. Ndërsa në mbrëmje, vendi merr tjetër ritëm — birra të ftohta, mish, muzikë, neja dhe ' +
    'shoqni që e bëjnë atmosferën edhe më të gjallë.\n\n' +
    'Pikërisht kjo lidhje mes ushqimit të mirë, mikpritjes dhe qejfit me njerëz të zemrës e ka bërë ' +
    'Menatën një nga vendet më të frekuentuara në Prishtinë. Një tavernë ku vjen për me ngrënë mirë, ' +
    'por rri më gjatë për atmosferën.',
  hours_sq: 'Çdo ditë · 07:00 – 03:00',
  drinks_note_sq: 'Çmimet pas mesnatës janë +20%',
  phone: '+383 48 533 555',
  whatsapp: '38348533555',
  instagram: 'https://www.instagram.com/tavernamenata',
  facebook: 'https://www.facebook.com/tavernamenata',
  address: 'Rr. Faton Shabani, 10000 Prishtinë, Kosovë',
  maps_url: 'https://www.google.com/maps/search/?api=1&query=Taverna+Menata+Prishtina'
};

const settingsEn = {
  site_name_en: 'Tavern Menata',
  address_en: 'Faton Shabani St., 10000 Prishtina, Kosovo',
  tagline_en: 'Fortune follows the brave; good company brings cheer.',
  home_intro_en:
    'A traditional tavern in the heart of Prishtina - from early breakfasts to late-night meze. ' +
    'A place you come for the food, and stay for the atmosphere.',
  about_text_en:
    'Taverna Menata is one of those places where the day can start early and end late - ' +
    'always with good food, good company and a warm atmosphere.\n\n' +
    'In the morning, Menata welcomes you with fresh, simple dishes, just like at home. At lunch, ' +
    'the tables fill with warm plates, traditional cooking and flavours that bring back the family table. ' +
    'In the evening, the place takes on a different rhythm - cold beer, grilled meat, music and friends ' +
    'that make the atmosphere come alive.\n\n' +
    'It is this mix of good food, hospitality and time spent with people you care about that has made ' +
    'Menata one of the most loved spots in Prishtina. A tavern you visit for the food - and stay longer for the atmosphere.',
  hours_en: 'Every day - 07:00 - 03:00',
  drinks_note_en: 'Prices after midnight are +20%'
};

module.exports = { categories, gallery, videos, categoryTranslations, settings, settingsEn };
