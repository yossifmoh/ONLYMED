
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwv1vuPsTUNXz6BMvtxUwxSqnf9Tq1CX21KLMq0nL3aYFebslLVEe5V0i-VIHyJLhlr/exec";
let db = { products: [], orders: [], users: [], content: [] };

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function switchTab(tabId) {
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => el.classList.remove('active'));
  event.currentTarget.classList.add('active');
  document.querySelectorAll('.main-content section').forEach(el => el.classList.add('hidden'));
  document.getElementById('tab-' + tabId).classList.remove('hidden');
}

async function loadDashboard() {
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {'Content-Type': 'text/plain'},
      body: JSON.stringify({ action: 'adminGetDashboardData' })
    });
    const result = await res.json();
    if(result.status === 'success') {
      db = result.data;
      renderAll();
      document.getElementById('loader').classList.add('hidden');
      document.getElementById('app-content').classList.remove('hidden');
    } else {
      showToast('Error loading data');
    }
  } catch(e) {
    showToast('Network error loading data');
  }
}

function renderAll() {
  // Stats
  
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
  if(statRev) statRev.innerText = '
  
  // Products
  const pBody = document.getElementById('productsTbody');
  pBody.innerHTML = db.products.map(p => `
    <tr>
      <td><img src="${p.image}" width="40" style="border-radius:6px"></td>
      <td>${p.name_en}</td>
      <td>${p.price} EGP</td>
      <td>${p.category}</td>
      <td>${p.stock}</td>
      <td><span class="status-badge ${p.status==='Active'?'status-delivered':'status-pending'}">${p.status}</span></td>
      <td>
        <button class="action-btn" onclick="editProduct('${p.id}')"><i class="fa fa-edit"></i></button>
        <button class="action-btn" onclick="deleteProduct('${p.id}')" style="color:var(--primary)"><i class="fa fa-trash"></i></button>
      </td>
    </tr>
  `).join('');

  // Orders
  const oBody = document.getElementById('ordersTbody');
  oBody.innerHTML = db.orders.map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${new Date(o.date).toLocaleDateString()}</td>
      <td>${o.name} <br><small>${o.email}</small></td>
      <td>${o.total} EGP</td>
      <td><span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span></td>
      <td><button class="btn-outline" style="padding:5px 10px; font-size:11px" onclick="viewOrder('${o.id}')">View</button></td>
    </tr>
  `).join('');

  // Users
  const uBody = document.getElementById('usersTbody');
  uBody.innerHTML = db.users.map(u => `
    <tr>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.phone}</td>
      <td>${new Date(u.created).toLocaleDateString()}</td>
      <td><button class="action-btn" onclick="deleteUser('${u.email}')" style="color:var(--primary)"><i class="fa fa-trash"></i></button></td>
    </tr>
  `).join('');

  // Content
  const cBody = document.getElementById('contentTbody');
  cBody.innerHTML = db.content.map((c, i) => `
    <tr>
      <td><code style="background:#eee;padding:3px 6px;border-radius:4px">${c.key}</code></td>
      <td><input type="text" class="input-sm" id="c-en-${i}" value="${c.en}"></td>
      <td><input type="text" class="input-sm" id="c-ar-${i}" value="${c.ar}" dir="rtl"></td>
      <td><select class="input-sm" id="c-st-${i}"><option ${c.status==='Active'?'selected':''}>Active</option><option ${c.status!=='Active'?'selected':''}>Inactive</option></select></td>
    </tr>
  `).join('');
}

// ---- PRODUCT ACTIONS ----
function openProductModal() {
  document.getElementById('pId').value = '';
  document.getElementById('pImage').value = '';
  document.getElementById('pNameEn').value = '';
  document.getElementById('pNameAr').value = '';
  document.getElementById('pDescEn').value = '';
  document.getElementById('pDescAr').value = '';
  document.getElementById('pCat').value = '';
  document.getElementById('pPrice').value = '';
  document.getElementById('pOldPrice').value = '';
  document.getElementById('pBadge').value = '';
  document.getElementById('pStock').value = '10';
  document.getElementById('pStatus').value = 'Active';
  document.getElementById('pmTitle').innerText = 'Add New Product';
  document.getElementById('productModal').style.display = 'flex';
}

function editProduct(id) {
  const p = db.products.find(x => x.id === id);
  if(!p) return;
  document.getElementById('pId').value = p.id;
  document.getElementById('pImage').value = p.image;
  document.getElementById('pNameEn').value = p.name_en;
  document.getElementById('pNameAr').value = p.name_ar;
  document.getElementById('pDescEn').value = p.desc_en;
  document.getElementById('pDescAr').value = p.desc_ar;
  document.getElementById('pCat').value = p.category;
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pOldPrice').value = p.oldPrice;
  document.getElementById('pBadge').value = p.badge;
  document.getElementById('pStock').value = p.stock;
  document.getElementById('pStatus').value = p.status;
  document.getElementById('pmTitle').innerText = 'Edit Product';
  document.getElementById('productModal').style.display = 'flex';
}

async function saveProduct() {
  showToast('Saving product...');
  const data = {
    action: 'adminSaveProduct',
    id: document.getElementById('pId').value,
    image: document.getElementById('pImage').value,
    name_en: document.getElementById('pNameEn').value,
    name_ar: document.getElementById('pNameAr').value,
    desc_en: document.getElementById('pDescEn').value,
    desc_ar: document.getElementById('pDescAr').value,
    category: document.getElementById('pCat').value,
    price: document.getElementById('pPrice').value,
    oldPrice: document.getElementById('pOldPrice').value,
    badge: document.getElementById('pBadge').value,
    stock: document.getElementById('pStock').value,
    status: document.getElementById('pStatus').value
  };
  
  const res = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify(data) });
  const result = await res.json();
  if(result.status === 'success') {
    closeModal('productModal');
    showToast('Product saved!');
    loadDashboard(); // Refresh
  }
}

async function deleteProduct(id) {
  if(!confirm('Delete this product?')) return;
  const res = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({action:'adminDeleteProduct', id}) });
  loadDashboard();
}

// ---- ORDER ACTIONS ----
let currentOrderId = null;
function viewOrder(id) {
  const o = db.orders.find(x => x.id === id);
  currentOrderId = id;
  document.getElementById('o-id').innerText = o.id;
  document.getElementById('o-name').innerText = o.name;
  document.getElementById('o-email').innerText = o.email;
  document.getElementById('o-address').innerText = o.address;
  document.getElementById('o-payment').innerText = o.payment;
  document.getElementById('o-total').innerText = o.total;
  document.getElementById('oStatusUpdate').value = o.status;
  
  let itemsHtml = '';
  try {
    const items = JSON.parse(o.products);
    items.forEach(i => { itemsHtml += `<div>${i.qty}x ${i.name}</div>`; });
  } catch(e) { itemsHtml = o.products; }
  document.getElementById('o-items').innerHTML = itemsHtml;
  
  document.getElementById('orderModal').style.display = 'flex';
}

async function saveOrderStatus() {
  const st = document.getElementById('oStatusUpdate').value;
  showToast('Updating order...');
  await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({action:'adminUpdateOrderStatus', orderId: currentOrderId, status: st}) });
  closeModal('orderModal');
  loadDashboard();
}

// ---- CONTENT ACTIONS ----
async function saveAllContent() {
  showToast('Saving all content...');
  const newContent = [];
  db.content.forEach((c, i) => {
    newContent.push({
      key: c.key,
      en: document.getElementById('c-en-'+i).value,
      ar: document.getElementById('c-ar-'+i).value,
      status: document.getElementById('c-st-'+i).value
    });
  });
  
  await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({action:'adminUpdateContent', content: newContent}) });
  showToast('Content updated successfully!');
}

// ---- USER ACTIONS ----
async function deleteUser(email) {
  if(!confirm('Delete this user?')) return;
  await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({action:'adminDeleteUser', email}) });
  loadDashboard();
}

// Init
window.onload = loadDashboard;
 + rev.toFixed(2);

  
  // Products
  const pBody = document.getElementById('productsTbody');
  pBody.innerHTML = db.products.map(p => `
    <tr>
      <td><img src="${p.image}" width="40" style="border-radius:6px"></td>
      <td>${p.name_en}</td>
      <td>${p.price} EGP</td>
      <td>${p.category}</td>
      <td>${p.stock}</td>
      <td><span class="status-badge ${p.status==='Active'?'status-delivered':'status-pending'}">${p.status}</span></td>
      <td>
        <button class="action-btn" onclick="editProduct('${p.id}')"><i class="fa fa-edit"></i></button>
        <button class="action-btn" onclick="deleteProduct('${p.id}')" style="color:var(--primary)"><i class="fa fa-trash"></i></button>
      </td>
    </tr>
  `).join('');

  // Orders
  const oBody = document.getElementById('ordersTbody');
  oBody.innerHTML = db.orders.map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${new Date(o.date).toLocaleDateString()}</td>
      <td>${o.name} <br><small>${o.email}</small></td>
      <td>${o.total} EGP</td>
      <td><span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span></td>
      <td><button class="btn-outline" style="padding:5px 10px; font-size:11px" onclick="viewOrder('${o.id}')">View</button></td>
    </tr>
  `).join('');

  // Users
  const uBody = document.getElementById('usersTbody');
  uBody.innerHTML = db.users.map(u => `
    <tr>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.phone}</td>
      <td>${new Date(u.created).toLocaleDateString()}</td>
      <td><button class="action-btn" onclick="deleteUser('${u.email}')" style="color:var(--primary)"><i class="fa fa-trash"></i></button></td>
    </tr>
  `).join('');

  // Content
  const cBody = document.getElementById('contentTbody');
  cBody.innerHTML = db.content.map((c, i) => `
    <tr>
      <td><code style="background:#eee;padding:3px 6px;border-radius:4px">${c.key}</code></td>
      <td><input type="text" class="input-sm" id="c-en-${i}" value="${c.en}"></td>
      <td><input type="text" class="input-sm" id="c-ar-${i}" value="${c.ar}" dir="rtl"></td>
      <td><select class="input-sm" id="c-st-${i}"><option ${c.status==='Active'?'selected':''}>Active</option><option ${c.status!=='Active'?'selected':''}>Inactive</option></select></td>
    </tr>
  `).join('');
}

// ---- PRODUCT ACTIONS ----
function openProductModal() {
  document.getElementById('pId').value = '';
  document.getElementById('pImage').value = '';
  document.getElementById('pNameEn').value = '';
  document.getElementById('pNameAr').value = '';
  document.getElementById('pDescEn').value = '';
  document.getElementById('pDescAr').value = '';
  document.getElementById('pCat').value = '';
  document.getElementById('pPrice').value = '';
  document.getElementById('pOldPrice').value = '';
  document.getElementById('pBadge').value = '';
  document.getElementById('pStock').value = '10';
  document.getElementById('pStatus').value = 'Active';
  document.getElementById('pmTitle').innerText = 'Add New Product';
  document.getElementById('productModal').style.display = 'flex';
}

function editProduct(id) {
  const p = db.products.find(x => x.id === id);
  if(!p) return;
  document.getElementById('pId').value = p.id;
  document.getElementById('pImage').value = p.image;
  document.getElementById('pNameEn').value = p.name_en;
  document.getElementById('pNameAr').value = p.name_ar;
  document.getElementById('pDescEn').value = p.desc_en;
  document.getElementById('pDescAr').value = p.desc_ar;
  document.getElementById('pCat').value = p.category;
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pOldPrice').value = p.oldPrice;
  document.getElementById('pBadge').value = p.badge;
  document.getElementById('pStock').value = p.stock;
  document.getElementById('pStatus').value = p.status;
  document.getElementById('pmTitle').innerText = 'Edit Product';
  document.getElementById('productModal').style.display = 'flex';
}

async function saveProduct() {
  showToast('Saving product...');
  const data = {
    action: 'adminSaveProduct',
    id: document.getElementById('pId').value,
    image: document.getElementById('pImage').value,
    name_en: document.getElementById('pNameEn').value,
    name_ar: document.getElementById('pNameAr').value,
    desc_en: document.getElementById('pDescEn').value,
    desc_ar: document.getElementById('pDescAr').value,
    category: document.getElementById('pCat').value,
    price: document.getElementById('pPrice').value,
    oldPrice: document.getElementById('pOldPrice').value,
    badge: document.getElementById('pBadge').value,
    stock: document.getElementById('pStock').value,
    status: document.getElementById('pStatus').value
  };
  
  const res = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify(data) });
  const result = await res.json();
  if(result.status === 'success') {
    closeModal('productModal');
    showToast('Product saved!');
    loadDashboard(); // Refresh
  }
}

async function deleteProduct(id) {
  if(!confirm('Delete this product?')) return;
  const res = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({action:'adminDeleteProduct', id}) });
  loadDashboard();
}

// ---- ORDER ACTIONS ----
let currentOrderId = null;
function viewOrder(id) {
  const o = db.orders.find(x => x.id === id);
  currentOrderId = id;
  document.getElementById('o-id').innerText = o.id;
  document.getElementById('o-name').innerText = o.name;
  document.getElementById('o-email').innerText = o.email;
  document.getElementById('o-address').innerText = o.address;
  document.getElementById('o-payment').innerText = o.payment;
  document.getElementById('o-total').innerText = o.total;
  document.getElementById('oStatusUpdate').value = o.status;
  
  let itemsHtml = '';
  try {
    const items = JSON.parse(o.products);
    items.forEach(i => { itemsHtml += `<div>${i.qty}x ${i.name}</div>`; });
  } catch(e) { itemsHtml = o.products; }
  document.getElementById('o-items').innerHTML = itemsHtml;
  
  document.getElementById('orderModal').style.display = 'flex';
}

async function saveOrderStatus() {
  const st = document.getElementById('oStatusUpdate').value;
  showToast('Updating order...');
  await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({action:'adminUpdateOrderStatus', orderId: currentOrderId, status: st}) });
  closeModal('orderModal');
  loadDashboard();
}

// ---- CONTENT ACTIONS ----
async function saveAllContent() {
  showToast('Saving all content...');
  const newContent = [];
  db.content.forEach((c, i) => {
    newContent.push({
      key: c.key,
      en: document.getElementById('c-en-'+i).value,
      ar: document.getElementById('c-ar-'+i).value,
      status: document.getElementById('c-st-'+i).value
    });
  });
  
  await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({action:'adminUpdateContent', content: newContent}) });
  showToast('Content updated successfully!');
}

// ---- USER ACTIONS ----
async function deleteUser(email) {
  if(!confirm('Delete this user?')) return;
  await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({action:'adminDeleteUser', email}) });
  loadDashboard();
}

// Init
window.onload = loadDashboard;
