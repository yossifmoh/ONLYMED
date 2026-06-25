const fs = require('fs');

let js = fs.readFileSync('e:/Downloads/ONLYMED/js/admin.js', 'utf8');

js = js.split("'p-id'").join("'pId'");
js = js.split("'p-category'").join("'pCat'");
js = js.split("'productModalTitle'").join("'pmTitle'");

fs.writeFileSync('e:/Downloads/ONLYMED/js/admin.js', js);
console.log("Fixed p-id and p-category to pId and pCat in admin.js");
