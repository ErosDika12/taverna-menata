/** Per-page SEO copy — Albanian default, English alternate */

export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://taverna-menata.vercel.app';

export const PAGE_SEO = {
  sq: {
    '/': {
      title: 'Taverna Menata · Tavernë Tradicionale në Prishtinë',
      description:
        'Taverna Menata — tavernë tradicionale në Prishtinë. Gatime shtëpie, mish në skarë, meze dhe atmosferë familjare. Rr. Faton Shabani.'
    },
    '/menu': {
      title: 'Menyja · Taverna Menata',
      description: 'Shiko menynë e plotë të Taverna Menata — ushqime tradicionale dhe pije në Prishtinë.'
    },
    '/gallery': {
      title: 'Galeria · Taverna Menata',
      description: 'Foto dhe video nga Taverna Menata — ushqim, ambienti dhe atmosfera e restorantit.'
    },
    '/about': {
      title: 'Historia · Taverna Menata',
      description: 'Historia e Taverna Menata — një tavernë tradicionale në zemër të Prishtinës.'
    },
    '/contact': {
      title: 'Kontakti · Taverna Menata',
      description: 'Na kontaktoni — telefon, adresa dhe orari i Taverna Menata në Prishtinë.'
    }
  },
  en: {
    '/': {
      title: 'Taverna Menata · Traditional Tavern in Prishtina',
      description:
        'Taverna Menata — a traditional tavern in Prishtina. Home-style cooking, grilled meat, meze and a warm atmosphere. Faton Shabani St.'
    },
    '/menu': {
      title: 'Menu · Taverna Menata',
      description: 'Browse the full Taverna Menata menu — traditional food and drinks in Prishtina.'
    },
    '/gallery': {
      title: 'Gallery · Taverna Menata',
      description: 'Photos and videos from Taverna Menata — food, interior and restaurant atmosphere.'
    },
    '/about': {
      title: 'Our Story · Taverna Menata',
      description: 'The story of Taverna Menata — a traditional tavern in the heart of Prishtina.'
    },
    '/contact': {
      title: 'Contact · Taverna Menata',
      description: 'Get in touch — phone, address and opening hours for Taverna Menata in Prishtina.'
    }
  }
};

export function pageSeo(lang, pathname) {
  const copy = PAGE_SEO[lang]?.[pathname] || PAGE_SEO.sq[pathname] || PAGE_SEO.sq['/'];
  return copy;
}
