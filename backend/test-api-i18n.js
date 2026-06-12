const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:4000${path}`, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

(async () => {
  const sq = await get('/api/settings?lang=sq');
  const en = await get('/api/settings?lang=en');
  const menuEn = await get('/api/menu?lang=en');
  console.log('SQ tagline:', sq.tagline);
  console.log('EN tagline:', en.tagline);
  console.log('EN site_name:', en.site_name);
  console.log('EN home_intro:', en.home_intro.slice(0, 70) + '...');
  console.log('EN address:', en.address);
  console.log('EN menu cat[0]:', menuEn[0]?.name, '-', menuEn[0]?.items[0]?.name);
})();
