// Initial content for the database, transcribed from the printed
// Taverna Menata menu and the provided brand material. Prices in EUR.

const { wineItems } = require('./wine-menu');

const categories = [
  {
    name: 'Oferte Ditore',
    type: 'food',
    note: 'Ofertat e ditës ndryshojnë — pyet stafin.',
    items: []
  },
  {
    name: 'Meny Ditore',
    type: 'food',
    note: 'Sh\u00ebrbehet \u00e7do dit\u00eb deri n\u00eb ora 17:00',
    items: [
      { name: 'M�ngjes Menata', price: 4.5, description: 'Vez� n� furr�, tortilla me spinaq, mocarela, tomatina, qep� e re', image: '/uploads/gallery/dsc00765.jpg' },
      { name: 'M�ngjes Fshati', price: 5, description: 'Vez� n� sy, virshlle pule t� f�rguara, qum�sht, gjalp�, marmelad�, djath i bardh�, qep� e re', image: '/uploads/gallery/dsc00787.jpg' },
      { name: 'Omlet', price: 4, description: 'Vez� t� tundura e t� f�rguara, djath i bardh�, domate, tranguj, qep� e re' },
      { name: 'Omlet mix', price: 5, description: 'Suxhuk / P�rshut� / Spanaq / Perime / Gjiz�' },
      { name: 'Vez� n� sy', price: 4, description: 'Vez� n� sy, djath i bardh�, domate, tranguj, ullinj, qep� e re' },
      { name: 'Buk� e f�rguar me vez�', price: 4, description: 'Ajvar / djath / Nutella' },
      { name: 'Leqenik', price: 2.5, description: 'Dy copa leqenik me spinaq, djath i bardh�, qum�sht, qep� e re' },
      { name: 'Pallaqinka', price: 3.5, description: 'Ajvar / djath / marmelad� / Nutella' },
      { name: 'Pogaqe me suxhuk', price: 5.5, description: 'Maz� me speca n� tav�, pogaqe e sht�pis� me suxhuk, djath i bardh�, perime sezonale, qep� e re' },
      { name: 'Pogaqe me maz�', price: 5, description: 'Maz� me speca n� tav�, pogaqe e sht�pis�, djath i bardh�, perime sezonale, qep� e re' },
      { name: 'Sup� me perime', price: 2, image: '/uploads/gallery/_dsc6317.jpg' },
      { name: 'Sup� me pul�', price: 2 },
      { name: 'Sendviq vegjetarian', price: 4.5, description: 'Sendviq n� pet� me perime, patate t� f�rguara dhe sos i bardh�' },
      { name: 'Sendviq me p�rshut�', price: 5, description: 'Sendviq n� pet� me p�rshut�, patate t� f�rguara dhe sos i bardh�' },
      { name: 'Sendviq me pul�', price: 5, description: 'Sendviq n� pet� me mish pule, patate t� f�rguara dhe sos i bardh�' },
      { name: 'Tav� me makarona', price: 5, description: 'Makarona, mish pule me sos t� bardh� dhe ka�kavall, djath i bardh�, spec turshi, k�purdha' },
      { name: 'Tav� boloneze', price: 5.5, description: 'Makarona me mish t� bluar, salc� domatesh dhe ka�kavall, djath i bardh� dhe spec turshi' }
    ]
  },
  {
    name: 'Sallata',
    type: 'food',
    items: [
      { name: 'Sallat� shope', price: 5, description: 'Domate, tranguj dhe djath i bardh�' },
      { name: 'Sallat� greke', price: 5, description: 'Domate, tranguj, qep�, spec, ullinj dhe djath i bardh�' },
      { name: 'Sallat� e shpis�', price: 6, description: 'Lak�r, sallat� e gjelb�r, domate, tranguj, vez� t� zier, ullinj, spec turshi, karrot�', image: '/uploads/gallery/dsc04443.jpg' },
      { name: 'Sallat� tuna', price: 5.5, image: '/uploads/gallery/dsc08098.jpg' },
      { name: 'Sallat� caesar', price: 5.5 },
      { name: 'Kombinim turshi', price: 3, description: 'Pjat� sezonale' },
      { name: 'Turshi Menata', price: 5, description: 'Pjat� sezonale' },
      { name: 'Lak�r turshi', price: 3, description: 'Pjat� sezonale' },
      { name: 'Speca turshi', price: 3 }
    ]
  },
  {
    name: 'Pjata Kryesore',
    type: 'food',
    items: [
      { name: 'Pleskavic�', price: 5, description: 'Pleskavic�, k�purdha dhe perime t� f�rguara, sallat� me patate, sos shpije' },
      { name: 'Ushtipka', price: 5.5, description: 'Ushtipka, k�purdha dhe perime t� f�rguara, sallat� me patate, sos shpije' },
      { name: 'Kofsh� pule', price: 5.5, description: 'Kofsh� pule, k�purdha dhe perime t� f�rguara, sallat� me patate' },
      { name: 'Gjoks pule', price: 9, description: 'Gjoks pule me mocarela, k�purdha dhe perime t� f�rguara, sallat� me patate, sos shpije' },
      { name: 'Tul vi�i', price: 10, description: 'Tul vi�i, k�purdha dhe perime t� f�rguara, sallat� me patate, sos shpije' },
      { name: 'Muskuj', price: 10, description: 'Muskuj, k�purdha dhe perime t� f�rguara, sallat� me patate, sos shpije' },
      { name: 'Kotlet', price: 13, description: 'Kotlet, k�purdha dhe perime t� f�rguara, sallat� me patate, sos shpije' },
      { name: 'Brinj� kingji', price: 13, description: 'Brinj� kingji, k�purdha dhe perime t� f�rguara, sallat� me patate, sos shpije' },
      { name: 'Biftek', price: 19, description: 'Biftek, k�purdha dhe perime t� f�rguara, sallat� me patate, sos shpije', image: '/uploads/gallery/dsc07243.jpg' },
      { name: 'Kombinim 1', price: 30, description: 'Suxhuk, pleskavic�, ushtipka, kofsh� pule, muskuj, perime n� skar�, k�purdha, sallat� me patate, sos shpije', image: '/uploads/gallery/dsc03575.jpg' },
      { name: 'Kombinim 2', price: 40, description: 'Tul vi�i, muskuj, kotlet, brinj� kingji, kofsh� pule, k�purdha, perime n� skar�, sallat� me patate, sos shpije', image: '/uploads/gallery/dsc09322.jpg' },
      { name: 'Kombinim 3', price: 48, description: 'Kombinim i mishrave n� tav�' },
      { name: 'Meze e nxeht� (e madhe)', price: 18, description: 'Patate t� f�rguara, virshlle vi�i, krah� pule, djath me susam, k�purdha, onion rings, 2 sosa', image: '/uploads/gallery/_dsc3487.jpg' },
      { name: 'Meze e nxeht� (e vog�l)', price: 10, description: 'Patate t� f�rguara, virshlle vi�i, krah� pule, djath me susam, k�purdha, onion rings, 2 sosa' },
      { name: 'Meze e ftoht� (e madhe)', price: 17, description: 'Tranguj turshi, karrota, djath sharri, ka�kavall, suxhuk, p�rshut�, ullinj, arra, cranberry, sos i bardh�', image: '/uploads/gallery/_dsc3319.jpg' },
      { name: 'Meze e ftoht� (e vog�l)', price: 9, description: 'Tranguj turshi, karrota, djath sharri, ka�kavall, suxhuk, p�rshut�, ullinj, arra, cranberry, sos i bardh�' },
      { name: 'Biftek 1 kg', price: 65 },
      { name: 'Specialitet Menata', price: 13, description: 'Mish n� tel i mb�shtjell� me ajvar dhe ka�kavall' }
    ]
  },
  {
    name: 'Pjata Shtes\u00eb',
    type: 'food',
    items: [
      { name: 'Buk� bageti e rreshkur', price: 1.5 },
      { name: 'Kos', price: 1.5 },
      { name: 'Ajvar', price: 1.5 },
      { name: 'Tarator', price: 2 },
      { name: 'Pjat� me salsa', price: 3 },
      { name: 'Sallat� me patate', price: 2.5 },
      { name: 'Speca me hud�r', price: 2.5 },
      { name: 'Speca t� djeg�s', price: 3 },
      { name: 'K�purdha t� f�rguara', price: 4 },
      { name: 'K�purdha n� tav�', price: 4.5, description: 'T� p�rgatitura n� tav� me spinaq' },
      { name: 'K�purdh� e mbushur', price: 6, description: 'Me spinaq dhe gorgonzola' },
      { name: 'Brusketa', price: 3.5 },
      { name: 'Perime t� f�rguara', price: 4, image: '/uploads/gallery/_dsc3358.jpg' },
      { name: 'Djath me susam', price: 4, description: 'Sh�rbehet me mjalt�' },
      { name: 'Djath i f�rguar', price: 4.5 },
      { name: 'Pjat� me djath�ra', price: 5, description: 'Djath dele, dhie, lope, sharri, ullinj dhe vaj ulliri' }
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
  { file: 'dsc00765.jpg', category: 'food', alt: 'M�ngjes i pasur me vez�, tortilla dhe l�ng portokalli' },
  { file: 'dsc00787.jpg', category: 'food', alt: 'M�ngjes fshati me vez� n� sy, virshlle, djath dhe domate' },
  { file: 'dsc01666.jpg', category: 'food', alt: 'Tortilla n� skar� me patate dhe sos sht�pie' },
  { file: 'dsc01710.jpg', category: 'food', alt: 'D�rras� me meze n� tavolin� druri' },
  { file: 'dsc01719.jpg', category: 'food', alt: 'Gatim i ngroht� me sos sht�pie' },
  { file: 'dsc03575.jpg', category: 'food', alt: 'Pjat� e madhe me mish n� skar�, onion rings dhe sosa' },
  { file: 'dsc03617.jpg', category: 'food', alt: 'Tavolin� e shtruar me sallata dhe pjata n� skar�' },
  { file: 'dsc04443.jpg', category: 'food', alt: 'Sallat� e fresk�t e shpis� me mis�r dhe karrota' },
  { file: 'dsc07129.jpg', category: 'food', alt: 'Kokteli i ve�ant� i Menat�s' },
  { file: 'dsc07173.jpg', category: 'food', alt: 'Koktel i kuq n� banak' },
  { file: 'dsc07243.jpg', category: 'food', alt: 'Biftek me perime n� skar� dhe sallat� me patate' },
  { file: 'dsc07252.jpg', category: 'food', alt: 'Pjat� me mish n� skar�, k�purdha dhe sos shpije' },
  { file: 'dsc07294.jpg', category: 'food', alt: 'Drek� me sallat�, mish n� skar� dhe pije' },
  { file: 'dsc07305.jpg', category: 'food', alt: 'Pjat� kryesore me nj� got� ver� t� kuqe' },
  { file: 'dsc07425.jpg', category: 'food', alt: 'Mish n� skar� me birr� t� ftoht�' },
  { file: 'dsc07972.jpg', category: 'food', alt: 'Kapu�ino dhe l�ng portokalli i fresk�t' },
  { file: 'dsc07994.jpg', category: 'food', alt: 'Kafe dhe l�ng n� oborr' },
  { file: 'dsc08025.jpg', category: 'food', alt: 'Koktela freskuese n� diell' },
  { file: 'dsc08051.jpg', category: 'food', alt: 'Drek� e leht� n� terrac�' },
  { file: 'dsc08098.jpg', category: 'food', alt: 'Sallat� tuna me limon dhe vaj ulliri' },
  { file: 'dsc08143.jpg', category: 'food', alt: 'Pjata t� shtruara gati p�r sh�rbim' },
  { file: 'dsc09322.jpg', category: 'food', alt: 'Pjat� e p�rzier skare me speca t� pjekur dhe domate' },
  { file: '_dsc0858.jpg', category: 'food', alt: 'Gatime tradicionale n� en� balte' },
  { file: '_dsc0892.jpg', category: 'food', alt: 'Tav� tradicionale n� en� balte' },
  { file: '_dsc0896.jpg', category: 'food', alt: 'Sof�r tradicionale me sup� dhe buk� sht�pie' },
  { file: '_dsc0943.jpg', category: 'food', alt: 'Pjata sht�pie mbi mbules� tradicionale' },
  { file: '_dsc0980.jpg', category: 'food', alt: 'Sarma n� en� balte tradicionale' },
  { file: '_dsc3302.jpg', category: 'food', alt: 'D�rras� me meze t� ftoht�, djath�ra dhe suxhuk' },
  { file: '_dsc3319.jpg', category: 'food', alt: 'Meze e ftoht� me djath sharri dhe p�rshut�' },
  { file: '_dsc3358.jpg', category: 'food', alt: 'Perime dhe k�purdha t� pjekura n� d�rras� druri' },
  { file: '_dsc3362.jpg', category: 'food', alt: 'D�rras� me perime t� pjekura dhe speca' },
  { file: '_dsc3487.jpg', category: 'food', alt: 'Meze e nxeht� me suxhuk dhe onion rings' },
  { file: '_dsc3941.jpg', category: 'food', alt: 'Shots shum�ngjyr�she n� banak' },
  { file: '_dsc6308.jpg', category: 'food', alt: 'Sup�, pasul dhe buk� sht�pie' },
  { file: '_dsc6317.jpg', category: 'food', alt: 'Sup� me perime e shoq�ruar me leqenik' },
  { file: 'dsc02300.jpg', category: 'interior', alt: 'Salla kryesore me pem�n dhe dritat e ngrohta' },
  { file: 'dsc02320.jpg', category: 'interior', alt: 'Drita e ngroht� n�p�r dritaret e tavern�s' },
  { file: 'dsc02323.jpg', category: 'interior', alt: 'Muri me fotografi pran� banakut' },
  { file: 'dsc09455.jpg', category: 'interior', alt: 'Salla e ngroht� me tavolina druri' },
  { file: 'dsc09459.jpg', category: 'interior', alt: 'Ambient tradicional me qilima dhe piktura' },
  { file: 'dsc09461.jpg', category: 'interior', alt: 'K�nd i ngroht� me piktura dhe bim�' },
  { file: 'dsc09629.jpg', category: 'interior', alt: 'Tavolina t� larta rreth pem�s brenda tavern�s' },
  { file: 'dsc09411.jpg', category: 'exterior', alt: 'Ul�set e oborrit n�n pergol�' },
  { file: 'dsc09427.jpg', category: 'exterior', alt: 'Hyrja prej druri e tavern�s' },
  { file: 'dsc09433.jpg', category: 'exterior', alt: 'K�ndi i oborrit me karrige shum�ngjyr�she' },
  { file: 'dsc09465.jpg', category: 'exterior', alt: 'Oborri me pem�n e ullirit' },
  { file: '_dsc4000.jpg', category: 'exterior', alt: 'Pamje e terrac�s mes gjelb�rimit' },
  { file: '_dsc9727.jpg', category: 'exterior', alt: 'Korridori i jasht�m me stola' },
  { file: 'dsc07530.jpg', category: 'atmosphere', alt: 'Terraca n� mbr�mje' },
  { file: 'dsc08124.jpg', category: 'atmosphere', alt: 'Drek� n�n hijen e pem�s n� oborr' },
  { file: 'dsc09312.jpg', category: 'atmosphere', alt: 'Mish i fresk�t duke u pjekur n� skar�' },
  { file: 'dsc09338.jpg', category: 'atmosphere', alt: 'Shoq�ria duke i shijuar pijet n� oborr' },
  { file: 'dsc09350.jpg', category: 'atmosphere', alt: 'Mbr�mje me drita n� oborr' },
  { file: '_dsc3472.jpg', category: 'atmosphere', alt: 'Meze dhe ver� n� mbr�mje' },
  { file: '_dsc9857.jpg', category: 'atmosphere', alt: 'Birr� e fresk�t nga banaku' }
];

const categoryTranslations = {
  'Oferte Ditore': { name_en: 'Daily Offers', note_en: 'Daily offers change — ask the staff.' },
  'Meny Ditore': { name_en: 'Daily Menu' },
  Sallata: { name_en: 'Salads' },
  'Pjata Kryesore': { name_en: 'Main Dishes' },
  'Pjata Shtes\u00eb': { name_en: 'Side Dishes' },
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
  'Shampanj\u00eb': { name_en: 'Champagne & Sparkling' }
};

// No videos were included in the provided project files.
// The owner can upload real videos through the admin panel.
const videos = [];

const settings = {
  site_name: 'Taverna Menata',
  hero_image: '/uploads/gallery/dsc09455.jpg',
  tagline_sq: 'Trimat i p�rcjell fati, maraklit� qefi.',
  home_intro_sq:
    'Tavern� tradicionale n� zem�r t� Prishtin�s � prej m�ngjesit her�t deri te mezet e nat�s. ' +
    'Nj� vend ku vjen p�r me ngr�n� mir�, por rri m� gjat� p�r atmosfer�n.',
  about_text_sq:
    'Taverna Menata �sht� prej atyre vendeve ku dita mund t� nis� her�t e t� p�rfundoj� von�, ' +
    'gjithmon� me shije, shoqni dhe atmosfer� t� mir�.\n\n' +
    'N� m�ngjes, Menata t� pret me ushqime t� fresk�ta e t� thjeshta, si n� shpi. N� drek�, tavolina ' +
    'mbushet me pjata t� ngrohta, gatime tradicionale, kuzhin� t� pasur dhe shije q� t� kujtojn� sofr�n ' +
    'familjare. Nd�rsa n� mbr�mje, vendi merr tjet�r rit�m � birra t� ftohta, mish, muzik�, neja dhe ' +
    'shoqni q� e b�jn� atmosfer�n edhe m� t� gjall�.\n\n' +
    'Pik�risht kjo lidhje mes ushqimit t� mir�, mikpritjes dhe qejfit me njer�z t� zemr�s e ka b�r� ' +
    'Menat�n nj� nga vendet m� t� frekuentuara n� Prishtin�. Nj� tavern� ku vjen p�r me ngr�n� mir�, ' +
    'por rri m� gjat� p�r atmosfer�n.',
  hours_sq: '�do dit� � 07:00 � 03:00',
  drinks_note_sq: '�mimet pas mesnat�s jan� +20%',
  phone: '+383 48 533 555',
  whatsapp: '38348533555',
  instagram: 'https://www.instagram.com/tavernamenata',
  facebook: 'https://www.facebook.com/tavernamenata',
  address: 'Rr. Faton Shabani, 10000 Prishtin�, Kosov�',
  maps_url: 'https://www.google.com/maps/search/?api=1&query=Taverna+Menata+Prishtina'
};

const settingsEn = {
  site_name_en: 'Tavern Menata',
  address_en: 'Faton Shabani St., 10000 Prishtina, Kosovo',
  tagline_en: 'Fortune follows the brave; good company brings cheer.',
  home_intro_en:
    'A traditional tavern in the heart of Prishtina � from early breakfasts to late-night meze. ' +
    'A place you come for the food, and stay for the atmosphere.',
  about_text_en:
    'Taverna Menata is one of those places where the day can start early and end late � ' +
    'always with good food, good company and a warm atmosphere.\n\n' +
    'In the morning, Menata welcomes you with fresh, simple dishes, just like at home. At lunch, ' +
    'the tables fill with warm plates, traditional cooking and flavours that bring back the family table. ' +
    'In the evening, the place takes on a different rhythm � cold beer, grilled meat, music and friends ' +
    'that make the atmosphere come alive.\n\n' +
    'It is this mix of good food, hospitality and time spent with people you care about that has made ' +
    'Menata one of the most loved spots in Prishtina. A tavern you visit for the food � and stay longer for the atmosphere.',
  hours_en: 'Every day � 07:00 � 03:00',
  drinks_note_en: 'Prices after midnight are +20%'
};

module.exports = { categories, gallery, videos, categoryTranslations, settings, settingsEn };

