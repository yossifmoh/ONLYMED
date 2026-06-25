const fs = require('fs');

let js = fs.readFileSync('e:/Downloads/ONLYMED/js/main.js', 'utf8');

// Fix template literals
js = js.replace(/\{p\.price/g, '${p.price');
js = js.replace(/\{p\.oldPrice/g, '${p.oldPrice');
js = js.replace(/\{item\.price/g, '${item.price');
js = js.replace(/\{\(item\.price/g, '${(item.price');
js = js.replace(/\{cart\.reduce/g, '${cart.reduce');

fs.writeFileSync('e:/Downloads/ONLYMED/js/main.js', js);
console.log('Template literals fixed.');
