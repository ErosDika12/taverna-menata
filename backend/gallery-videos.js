/**
 * Static gallery videos shipped with the site (frontend/public/videos).
 * They are registered in the `videos` table once so they take part in the
 * unified, chronologically ordered media feed and stay manageable from Admin.
 */
const galleryVideos = [
  { src: '/videos/video-05.mp4', thumb: '/videos/posters/video-05.jpg', category: 'food', title: 'Sallatë Caesar', title_en: 'Caesar salad' },
  { src: '/videos/video-06.mp4', thumb: '/videos/posters/video-06.jpg', category: 'food', title: 'Mish në skarë', title_en: 'Grilled meat' },
  { src: '/videos/video-08.mp4', thumb: '/videos/posters/video-08.jpg', category: 'food', title: 'Sallatë', title_en: 'Salad' },
  { src: '/videos/video-09.mp4', thumb: '/videos/posters/video-09.jpg', category: 'food', title: 'Gatim në kuzhinë', title_en: 'Cooking in the kitchen' },
  { src: '/videos/video-01.mp4', thumb: '/videos/posters/video-01.jpg', category: 'food', title: 'Ushqime Menata', title_en: 'Menata dishes' },
  { src: '/videos/video-04.mp4', thumb: '/videos/posters/video-04.jpg', category: 'atmosphere', title: 'Pije', title_en: 'Drinks' },
  { src: '/videos/video-07.mp4', thumb: '/videos/posters/video-07.jpg', category: 'atmosphere', title: 'Smoothie', title_en: 'Smoothie' },
  { src: '/videos/video-03.mp4', thumb: '/videos/posters/video-03.jpg', category: 'atmosphere', title: 'Paradite, pasdite, menatë', title_en: 'Morning, afternoon, Menata' },
  { src: '/videos/video-10.mp4', thumb: '/videos/posters/video-10.jpg', category: 'atmosphere', title: 'Birra Peja', title_en: 'Peja beer' },
  { src: '/videos/video-02.mp4', thumb: '/videos/posters/video-02.jpg', category: 'exterior', title: 'Kokteje në oborr', title_en: 'Cocktails in the garden' }
];

module.exports = { galleryVideos };
