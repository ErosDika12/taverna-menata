fetch('https://taverna-menata.vercel.app/api/menu?lang=sq')
  .then((r) => r.json())
  .then((menu) => {
    const item = menu[0].items[0];
    console.log('name:', item.name);
    console.log('has_e:', /ë|Ë/.test(item.name));
    console.log('has_cedilla:', /ç|Ç/.test(item.description || ''));
    console.log('replacement_char:', item.name.includes('\uFFFD'));
  });
