const fs = require('fs');

let js = fs.readFileSync('e:/Downloads/ONLYMED/js/admin.js', 'utf8');

// Replace fetch calls without headers to include text/plain headers
js = js.replace(
  "const res = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: JSON.stringify(data) });",
  "const res = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify(data) });"
);

js = js.replace(
  "const res = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: JSON.stringify({action:'adminDeleteProduct', id}) });",
  "const res = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({action:'adminDeleteProduct', id}) });"
);

js = js.replace(
  "await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: JSON.stringify({action:'adminUpdateOrderStatus', orderId: currentOrderId, status: st}) });",
  "await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({action:'adminUpdateOrderStatus', orderId: currentOrderId, status: st}) });"
);

js = js.replace(
  "await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: JSON.stringify({action:'adminUpdateContent', content: newContent}) });",
  "await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({action:'adminUpdateContent', content: newContent}) });"
);

js = js.replace(
  "await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: JSON.stringify({action:'adminDeleteUser', email}) });",
  "await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({action:'adminDeleteUser', email}) });"
);

fs.writeFileSync('e:/Downloads/ONLYMED/js/admin.js', js);
console.log("Fixed fetch headers in admin.js");
