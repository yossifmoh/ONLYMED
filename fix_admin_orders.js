const fs = require('fs');

let js = fs.readFileSync('e:/Downloads/ONLYMED/js/admin.js', 'utf8');

const newViewOrder = `
let currentOrderId = null;
function viewOrder(id) {
  const o = db.orders.find(x => x.id === id);
  currentOrderId = id;
  
  let itemsHtml = '';
  try {
    const items = JSON.parse(o.products);
    items.forEach(i => { itemsHtml += \`<li>\${i.qty}x \${i.name}</li>\`; });
  } catch(e) { itemsHtml = o.products; }

  const detailsDiv = document.getElementById('orderDetailsContent');
  if (detailsDiv) {
    detailsDiv.innerHTML = \`
      <p><strong>Order ID:</strong> \${o.id}</p>
      <p><strong>Customer:</strong> \${o.name} (\${o.email})</p>
      <p><strong>Address:</strong> \${o.address}</p>
      <p><strong>Payment:</strong> \${o.payment}</p>
      <p><strong>Total:</strong> \${o.total} EGP</p>
      <hr>
      <p><strong>Items:</strong></p>
      <ul>\${itemsHtml}</ul>
    \`;
  }
  
  document.getElementById('oStatusUpdate').value = o.status;
  openOrderModal();
}
`;

js = js.replace(/let currentOrderId = null;[\s\S]*?openOrderModal\(\);\n}/, newViewOrder.trim());

fs.writeFileSync('e:/Downloads/ONLYMED/js/admin.js', js);
console.log("Fixed viewOrder to use orderDetailsContent");
