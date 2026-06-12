const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'seed-data.js');
let text = fs.readFileSync(file, 'utf8');
text = text.replace(/Shampanj./g, "Shampanj\\u00eb");
text = text.replace(/'Pjata Shtes.'/g, "'Pjata Shtes\\u00eb'");
text = text.replace(/  Shampanj./g, "  'Shampanj\\u00eb'");
fs.writeFileSync(file, text, 'utf8');
console.log('seed-data.js fixed');
