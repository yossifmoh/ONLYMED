const fs = require('fs');

// 1. FIX LOGIN BUTTON COLOR
let login = fs.readFileSync('e:/Downloads/ONLYMED/login.html', 'utf8');
login = login.replace('background: var(--primary);', 'background: #d0112b;');
fs.writeFileSync('e:/Downloads/ONLYMED/login.html', login);


// 2. FIX ADMIN.JS IDs
let js = fs.readFileSync('e:/Downloads/ONLYMED/js/admin.js', 'utf8');

const idReplacements = {
  "'stat-orders'": "'statOrders'",
  "'stat-products'": "'statProducts'",
  "'stat-users'": "'statUsers'",
  "'products-tbody'": "'productsTbody'",
  "'orders-tbody'": "'ordersTbody'",
  "'users-tbody'": "'usersTbody'",
  "'content-tbody'": "'contentTbody'",
  "'p-image'": "'pImage'",
  "'p-cat'": "'pCat'",
  "'p-name-en'": "'pNameEn'",
  "'p-name-ar'": "'pNameAr'",
  "'p-price'": "'pPrice'",
  "'p-old-price'": "'pOldPrice'",
  "'p-stock'": "'pStock'",
  "'p-badge'": "'pBadge'",
  "'p-status'": "'pStatus'",
  "'p-desc-en'": "'pDescEn'",
  "'p-desc-ar'": "'pDescAr'",
  "'order-details-content'": "'orderDetailsContent'",
  "'o-status'": "'oStatusUpdate'"
};

for (const [oldId, newId] of Object.entries(idReplacements)) {
  js = js.split(oldId).join(newId);
}

// Ensure loadDashboard triggers properly without crashing on revenue
// In admin.html we have statRevenue but admin.js didn't calculate it. Let's add a safe calculation.
const revenueFix = `
  document.getElementById('statOrders').innerText = db.orders.length;
  document.getElementById('statProducts').innerText = db.products.length;
  document.getElementById('statUsers').innerText = db.users.length;
  
  // Calculate Revenue
  let rev = 0;
  db.orders.forEach(o => {
    if(o.status === 'Completed' && o.total) {
      rev += parseFloat(o.total) || 0;
    }
  });
  const statRev = document.getElementById('statRevenue');
  if(statRev) statRev.innerText = '$' + rev.toFixed(2);
`;

js = js.replace(/document\.getElementById\('statOrders'\)\.innerText = db\.orders\.length;[\s\S]*?document\.getElementById\('statUsers'\)\.innerText = db\.users\.length;/, revenueFix);

// Populate Recent Orders and Top Products if they exist in DOM
const dashboardTablesFix = `
  renderContent(db.content);
  
  // Populate Dashboard Tables
  const recentTbody = document.getElementById('recentOrdersTbody');
  if(recentTbody && db.orders) {
    recentTbody.innerHTML = '';
    db.orders.slice(0, 5).forEach(o => {
      recentTbody.innerHTML += \`<tr><td>#\${o.id.substring(0,6)}</td><td>\${o.customer}</td><td>\${o.date}</td><td><span class="badge \${o.status==='Completed'?'active':'pending'}">\${o.status}</span></td></tr>\`;
    });
  }
  
  const topTbody = document.getElementById('topProductsTbody');
  if(topTbody && db.products) {
    topTbody.innerHTML = '';
    db.products.slice(0, 5).forEach(p => {
      topTbody.innerHTML += \`<tr><td>\${p.name_en}</td><td>$\${p.price}</td></tr>\`;
    });
  }
`;

js = js.replace('renderContent(db.content);', dashboardTablesFix);

fs.writeFileSync('e:/Downloads/ONLYMED/js/admin.js', js);
console.log("Fixed login CSS and admin.js DOM IDs");
