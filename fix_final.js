const fs = require('fs');

let js = fs.readFileSync('e:/Downloads/ONLYMED/js/main.js', 'utf8');

// Fix missing $ before {
js = js.replace(/\{parseFloat/g, '${parseFloat');
js = js.replace(/\{subtotal/g, '${subtotal');
js = js.replace(/\{\(subtotal/g, '${(subtotal');
js = js.replace(/\{total/g, '${total');

// Fix double $$ which causes EGP$
js = js.replace(/\$\$\{p\.oldPrice/g, '${p.oldPrice');

fs.writeFileSync('e:/Downloads/ONLYMED/js/main.js', js);
console.log('Final template literals fixed.');
