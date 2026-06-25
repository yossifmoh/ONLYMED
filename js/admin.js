
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
  document.getElementById('stat-orders').innerText = db.orders.length;
  document.getElementById('stat-products').innerText = db.products.length;
  document.getElementById('stat-users').innerText = db.users.length;
  
  // Products
  const pBody = document.getElementById('products-tbody');
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
  const oBody = document.getElementById('orders-tbody');
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
  const uBody = document.getElementById('users-tbody');
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
  const cBody = document.getElementById('content-tbody');
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
  document.getElementById('p-id').value = '';
  document.getElementById('p-image').value = '';
  document.getElementById('p-name-en').value = '';
  document.getElementById('p-name-ar').value = '';
  document.getElementById('p-desc-en').value = '';
  document.getElementById('p-desc-ar').value = '';
  document.getElementById('p-category').value = '';
  document.getElementById('p-price').value = '';
  document.getElementById('p-old-price').value = '';
  document.getElementById('p-badge').value = '';
  document.getElementById('p-stock').value = '10';
  document.getElementById('p-status').value = 'Active';
  document.getElementById('productModalTitle').innerText = 'Add New Product';
  document.getElementById('productModal').style.display = 'flex';
}

function editProduct(id) {
  const p = db.products.find(x => x.id === id);
  if(!p) return;
  document.getElementById('p-id').value = p.id;
  document.getElementById('p-image').value = p.image;
  document.getElementById('p-name-en').value = p.name_en;
  document.getElementById('p-name-ar').value = p.name_ar;
  document.getElementById('p-desc-en').value = p.desc_en;
  document.getElementById('p-desc-ar').value = p.desc_ar;
  document.getElementById('p-category').value = p.category;
  document.getElementById('p-price').value = p.price;
  document.getElementById('p-old-price').value = p.oldPrice;
  document.getElementById('p-badge').value = p.badge;
  document.getElementById('p-stock').value = p.stock;
  document.getElementById('p-status').value = p.status;
  document.getElementById('productModalTitle').innerText = 'Edit Product';
  document.getElementById('productModal').style.display = 'flex';
}

async function saveProduct() {
  showToast('Saving product...');
  const data = {
    action: 'adminSaveProduct',
    id: document.getElementById('p-id').value,
    image: document.getElementById('p-image').value,
    name_en: document.getElementById('p-name-en').value,
    name_ar: document.getElementById('p-name-ar').value,
    desc_en: document.getElementById('p-desc-en').value,
    desc_ar: document.getElementById('p-desc-ar').value,
    category: document.getElementById('p-category').value,
    price: document.getElementById('p-price').value,
    oldPrice: document.getElementById('p-old-price').value,
    badge: document.getElementById('p-badge').value,
    stock: document.getElementById('p-stock').value,
    status: document.getElementById('p-status').value
  };
  
  const res = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify(data) });
  const result = await res.json();
  if(result.status === 'success') {
    document.getElementById('productModal').style.display = 'none';
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
  document.getElementById('o-status').value = o.status;
  
  let itemsHtml = '';
  try {
    const items = JSON.parse(o.products);
    items.forEach(i => { itemsHtml += `<div>${i.qty}x ${i.name}</div>`; });
  } catch(e) { itemsHtml = o.products; }
  document.getElementById('o-items').innerHTML = itemsHtml;
  
  document.getElementById('orderModal').style.display = 'flex';
}

async function saveOrderStatus() {
  const st = document.getElementById('o-status').value;
  showToast('Updating order...');
  await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({action:'adminUpdateOrderStatus', orderId: currentOrderId, status: st}) });
  document.getElementById('orderModal').style.display = 'none';
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
