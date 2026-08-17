/** Wine menu transcribed from the physical Taverna Menata wine list (photo). */

const wineItems = [
  // Verërat në gotë / Wine by glass
  {
    name: 'Verë e bardhë - Daka',
    name_en: 'White wine - Daka',
    price: 2.5,
    description: 'Verërat në gotë / Wine by glass',
    description_en: 'Wine by glass'
  },
  {
    name: 'Verë e kuqe - Daka',
    name_en: 'Red wine - Daka',
    price: 2.5,
    description: 'Verërat në gotë / Wine by glass',
    description_en: 'Wine by glass'
  },

  // Verërat në shishe 0.187 cl / Wine by bottle 0.187 cl
  {
    name: 'Dalvina',
    name_en: 'Dalvina',
    price: 4,
    description: 'Verërat në shishe 0.187 cl · Verë e bardhë · Chardonnay',
    description_en: 'Bottle 0.187 cl · White wine · Chardonnay'
  },
  {
    name: 'Dalvina',
    name_en: 'Dalvina',
    price: 4,
    description: 'Verërat në shishe 0.187 cl · Verë e kuqe · Cabernet Sauvignon',
    description_en: 'Bottle 0.187 cl · Red wine · Cabernet Sauvignon'
  },
  {
    name: 'Alexandria',
    name_en: 'Alexandria',
    price: 4,
    description: 'Verërat në shishe 0.187 cl · Verë e bardhë · Riesling',
    description_en: 'Bottle 0.187 cl · White wine · Riesling'
  },
  {
    name: 'Alexandria',
    name_en: 'Alexandria',
    price: 4,
    description: 'Verërat në shishe 0.187 cl · Verë e kuqe · Cabernet Sauvignon',
    description_en: 'Bottle 0.187 cl · Red wine · Cabernet Sauvignon'
  },
  {
    name: 'Tarani',
    name_en: 'Tarani',
    price: 3.8,
    description: 'Verërat në shishe 0.187 cl · Verë e bardhë · Sauvignon',
    description_en: 'Bottle 0.187 cl · White wine · Sauvignon'
  },
  {
    name: 'Tarani',
    name_en: 'Tarani',
    price: 3.8,
    description: 'Verërat në shishe 0.187 cl · Verë e kuqe · Malbec',
    description_en: 'Bottle 0.187 cl · Red wine · Malbec'
  },

  // Verërat e bardha / White Wines
  {
    name: '001 | Stone Castle - Reserve',
    name_en: '001 | Stone Castle - Reserve',
    price: 35,
    description:
      'Verërat e bardha · E thatë · Chardonnay · Alc 13.00% · 0.75 l · Rahovec - Kosovë',
    description_en: 'White wines · Dry · Chardonnay · Alc 13.00% · 0.75 l · Rahovec - Kosovo'
  },
  {
    name: '004 | SHE - White',
    name_en: '004 | SHE - White',
    price: 38,
    description:
      'Verërat e bardha · E thatë · Chardonnay - Pinot Blanc · Alc 13.00% · 0.75 l · Suharekë - Kosovë',
    description_en:
      'White wines · Dry · Chardonnay - Pinot Blanc · Alc 13.00% · 0.75 l · Suharekë - Kosovo'
  },
  {
    name: '005 | Alexandria',
    name_en: '005 | Alexandria',
    price: 18,
    description:
      'Verërat e bardha · Gjysmë e thatë · Riesling · Alc 13.00% · 0.75 l · Tikvesh - North Macedonia',
    description_en:
      'White wines · Semi dry · Riesling · Alc 13.00% · 0.75 l · Tikvesh - North Macedonia'
  },
  {
    name: '305 | Tarani',
    name_en: '305 | Tarani',
    price: 18,
    description:
      'Verërat e bardha · E frutshme · Sauvignon · Alc 11.50% · 0.75 l · Toulouse - France',
    description_en: 'White wines · Fruity · Sauvignon · Alc 11.50% · 0.75 l · Toulouse - France'
  },
  {
    name: '231 | Fantinel',
    name_en: '231 | Fantinel',
    price: 25,
    description:
      'Verërat e bardha · Gjysmë e thatë · Pinot Grigio · Alc 13.00% · 0.75 l · Friuli - Italy',
    description_en: 'White wines · Semi dry · Pinot Grigio · Alc 13.00% · 0.75 l · Friuli - Italy'
  },
  {
    name: '270 | Sensuale',
    name_en: '270 | Sensuale',
    price: 32,
    description:
      'Verërat e bardha · Gjysmë e thatë · Cabernet Sauvignon - Merlot - Nerello Mascalese · Alc 12.00% · 0.75 l · Sicily - Italy',
    description_en:
      'White wines · Semi dry · Cabernet Sauvignon - Merlot - Nerello Mascalese · Alc 12.00% · 0.75 l · Sicily - Italy'
  },
  {
    name: '210 | La Ciboise',
    name_en: '210 | La Ciboise',
    price: 30,
    description:
      'Verërat e bardha · Gjysmë e thatë · Grenache blanc - Vermentino - Ugni blanc · Alc 13.00% · 0.75 l · Luberon / Cotes du Rhone - France',
    description_en:
      'White wines · Semi dry · Grenache blanc - Vermentino - Ugni blanc · Alc 13.00% · 0.75 l · Luberon / Cotes du Rhone - France'
  },
  {
    name: '250 | Vesevo',
    name_en: '250 | Vesevo',
    price: 35,
    description:
      'Verërat e bardha · E thatë · Greco di Tufo · Alc 12.50% · 0.75 l · Campania - Italy',
    description_en: 'White wines · Dry · Greco di Tufo · Alc 12.50% · 0.75 l · Campania - Italy'
  },
  {
    name: '222 | Lieu Dit Berg',
    name_en: '222 | Lieu Dit Berg',
    price: 60,
    description:
      'Verërat e bardha · E thatë · Riesling · Alc 13.00% · 0.75 l · Alsace - France',
    description_en: 'White wines · Dry · Riesling · Alc 13.00% · 0.75 l · Alsace - France'
  },

  // Verërat e kuqe / Red Wines
  {
    name: '006 | Stone Castle - Reserve',
    name_en: '006 | Stone Castle - Reserve',
    price: 35,
    description:
      'Verërat e kuqe · E thatë · Cabernet Sauvignon · Alc 13.50% · 0.75 l · Rahovec - Kosovë',
    description_en: 'Red wines · Dry · Cabernet Sauvignon · Alc 13.50% · 0.75 l · Rahovec - Kosovo'
  },
  {
    name: '007 | Theranda - Kallmet',
    name_en: '007 | Theranda - Kallmet',
    price: 18,
    description:
      'Verërat e kuqe · E thatë · Kallmet · Alc 13.50% · 0.75 l · Suharekë - Kosovë',
    description_en: 'Red wines · Dry · Kallmet · Alc 13.50% · 0.75 l · Suharekë - Kosovo'
  },
  {
    name: '008 | Theranda - Merlot',
    name_en: '008 | Theranda - Merlot',
    price: 20,
    description:
      'Verërat e kuqe · E thatë · Merlot · Alc 13.50% · 0.75 l · Suharekë - Kosovë',
    description_en: 'Red wines · Dry · Merlot · Alc 13.50% · 0.75 l · Suharekë - Kosovo'
  },
  {
    name: '009 | SHE - Red',
    name_en: '009 | SHE - Red',
    price: 45,
    description:
      'Verërat e kuqe · E thatë · Cabernet Sauvignon · Alc 14.00% · 0.75 l · Suharekë - Kosovë',
    description_en: 'Red wines · Dry · Cabernet Sauvignon · Alc 14.00% · 0.75 l · Suharekë - Kosovo'
  },
  {
    name: '010 | Alexandria',
    name_en: '010 | Alexandria',
    price: 18,
    description:
      'Verërat e kuqe · E thatë · Cabernet Sauvignon · Alc 13.00% · 0.75 l · Tikvesh - North Macedonia',
    description_en:
      'Red wines · Dry · Cabernet Sauvignon · Alc 13.00% · 0.75 l · Tikvesh - North Macedonia'
  },
  {
    name: '307 | Tarani',
    name_en: '307 | Tarani',
    price: 18,
    description:
      'Verërat e kuqe · E frutshme · Malbec · Alc 12.50% · 0.75 l · Toulouse - France',
    description_en: 'Red wines · Fruity · Malbec · Alc 12.50% · 0.75 l · Toulouse - France'
  },
  {
    name: '230 | Fantinel',
    name_en: '230 | Fantinel',
    price: 25,
    description:
      'Verërat e kuqe · Gjysmë e thatë · Merlot · Alc 13.00% · 0.75 l · Friuli - Italy',
    description_en: 'Red wines · Semi dry · Merlot · Alc 13.00% · 0.75 l · Friuli - Italy'
  },
  {
    name: '384 | Valpolicella Ripasso - Bertani',
    name_en: '384 | Valpolicella Ripasso - Bertani',
    price: 38,
    description:
      'Verërat e kuqe · Gjysmë e thatë · Corvina - Rondinella - Corvinon · Alc 13.50% · 0.75 l · Veneto - Italy',
    description_en:
      'Red wines · Semi dry · Corvina - Rondinella - Corvinon · Alc 13.50% · 0.75 l · Veneto - Italy'
  },
  {
    name: '310 | Astrolabe',
    name_en: '310 | Astrolabe',
    price: 40,
    description:
      'Verërat e kuqe · E thatë · Malbec · Alc 12.50% · 0.75 l · Cahors - France',
    description_en: 'Red wines · Dry · Malbec · Alc 12.50% · 0.75 l · Cahors - France'
  },
  {
    name: '303 | Le Different Grand Cru',
    name_en: '303 | Le Different Grand Cru',
    price: 50,
    description:
      'Verërat e kuqe · E thatë · Merlot - Cabernet Sauvignon - Cabernet franc · Alc 14.00% · 0.75 l · Saint Emilion / Bordeaux - France',
    description_en:
      'Red wines · Dry · Merlot - Cabernet Sauvignon - Cabernet franc · Alc 14.00% · 0.75 l · Saint Emilion / Bordeaux - France'
  },
  {
    name: '257 | Vigne Vecchie - Primitivo di Manduria',
    name_en: '257 | Vigne Vecchie - Primitivo di Manduria',
    price: 60,
    description:
      'Verërat e kuqe · E thatë · Primitivo · Alc 14.50% · 0.75 l · Puglia - Italy',
    description_en: 'Red wines · Dry · Primitivo · Alc 14.50% · 0.75 l · Puglia - Italy'
  },
  {
    name: '243 | Amarone Valpantena',
    name_en: '243 | Amarone Valpantena',
    price: 110,
    description:
      'Verërat e kuqe · E thatë · Rondinella - Corvina · Alc 15.50% · 0.75 l · Valpolicella - Italy',
    description_en: 'Red wines · Dry · Rondinella - Corvina · Alc 15.50% · 0.75 l · Valpolicella - Italy'
  }
];

module.exports = { wineItems };
