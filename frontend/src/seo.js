/** Per-page SEO copy � Albanian default, English alternate */

export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://taverna-menata.vercel.app';

export const PAGE_SEO = {
  sq: {
    '/': {
      title: 'Taverna Menata � Tavern� Tradicionale n� Prishtin�',
      description:
        'Taverna Menata � tavern� tradicionale n� Prishtin�. Gatime sht�pie, mish n� skar�, meze dhe atmosfer� familjare. Rr. Faton Shabani.'
    },
    '/menu': {
      title: 'Menyja � Taverna Menata',
      description: 'Shiko menyn� e plot� t� Taverna Menata � ushqime tradicionale dhe pije n� Prishtin�.'
    },
    '/gallery': {
      title: 'Galeria � Taverna Menata',
      description: 'Foto dhe video nga Taverna Menata � ushqim, ambienti dhe atmosfera e restorantit.'
    },
    '/about': {
      title: 'Historia � Taverna Menata',
      description: 'Historia e Taverna Menata � nj� tavern� tradicionale n� zem�r t� Prishtin�s.'
    },
    '/contact': {
      title: 'Kontakti � Taverna Menata',
      description: 'Na kontaktoni � telefon, WhatsApp, adresa dhe orari i Taverna Menata n� Prishtin�.'
    }
  },
  en: {
    '/': {
      title: 'Taverna Menata � Traditional Tavern in Prishtina',
      description:
        'Taverna Menata � a traditional tavern in Prishtina. Home-style cooking, grilled meat, meze and a warm atmosphere. Faton Shabani St.'
    },
    '/menu': {
      title: 'Menu � Taverna Menata',
      description: 'Browse the full Taverna Menata menu � traditional food and drinks in Prishtina.'
    },
    '/gallery': {
      title: 'Gallery � Taverna Menata',
      description: 'Photos and videos from Taverna Menata � food, interior and restaurant atmosphere.'
    },
    '/about': {
      title: 'Our Story � Taverna Menata',
      description: 'The story of Taverna Menata � a traditional tavern in the heart of Prishtina.'
    },
    '/contact': {
      title: 'Contact � Taverna Menata',
      description: 'Get in touch � phone, WhatsApp, address and opening hours for Taverna Menata in Prishtina.'
    }
  }
};

export function pageSeo(lang, pathname) {
  const copy = PAGE_SEO[lang]?.[pathname] || PAGE_SEO.sq[pathname] || PAGE_SEO.sq['/'];
  return copy;
}
