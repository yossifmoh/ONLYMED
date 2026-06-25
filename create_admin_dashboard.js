const fs = require('fs');

// 1. UPDATE index.html ADMIN BUTTON
let html = fs.readFileSync('e:/Downloads/ONLYMED/index.html', 'utf8');
if (html.includes('onclick="showPage(\\\'admin\\\')"')) {
    html = html.replace('onclick="showPage(\\\'admin\\\')"', 'onclick="window.location.href=\\\'admin.html\\\'"');
} else {
    // If it was already using href="#"
    html = html.replace('<a href="#" class="btn-primary" style="margin-left: 10px;">Admin</a>', '<a href="admin.html" class="btn-primary" style="margin-left: 10px;">Admin</a>');
}
fs.writeFileSync('e:/Downloads/ONLYMED/index.html', html);

// 2. CREATE admin.html
const adminHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ONLYMED CMS - Admin Dashboard</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { background-color: var(--light); display: flex; height: 100vh; margin: 0; overflow: hidden; }
    .sidebar { width: 250px; background-color: var(--white); box-shadow: 2px 0 10px rgba(0,0,0,0.05); display: flex; flex-direction: column; }
    .sidebar-header { padding: 20px; border-bottom: 1px solid #eee; text-align: center; }
    .sidebar-nav { flex: 1; padding: 20px 0; overflow-y: auto; }
    .nav-item { padding: 15px 20px; cursor: pointer; color: var(--gray); display: flex; align-items: center; gap: 10px; transition: 0.3s; }
    .nav-item:hover, .nav-item.active { background-color: #fce8eb; color: var(--primary); border-right: 4px solid var(--primary); }
    .main-content { flex: 1; overflow-y: auto; padding: 30px; }
    .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .admin-card { background: var(--white); padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; }
    th { color: var(--gray); font-size: 13px; font-weight: 600; text-transform: uppercase; }
    .action-btn { background: none; border: none; cursor: pointer; color: var(--gray); transition: 0.2s; margin-right: 10px; }
    .action-btn:hover { color: var(--primary); }
    .status-badge { padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status-pending { background: #fff3cd; color: #856404; }
    .status-shipped { background: #cce5ff; color: #004085; }
    .status-delivered { background: #d4edda; color: #155724; }
    .hidden { display: none !important; }
    .input-sm { padding: 8px; font-size: 13px; width: 100%; border: 1px solid #ddd; border-radius: 6px; }
  </style>
</head>
<body>

  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2 style="color:var(--primary); font-family:'Playfair Display'; margin:0;">ONLYMED</h2>
      <small style="color:var(--gray)">Admin CMS</small>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-item active" onclick="switchTab('dashboard')"><i class="fa fa-home"></i> Dashboard</div>
      <div class="nav-item" onclick="switchTab('products')"><i class="fa fa-box"></i> Products</div>
      <div class="nav-item" onclick="switchTab('orders')"><i class="fa fa-shopping-cart"></i> Orders</div>
      <div class="nav-item" onclick="switchTab('users')"><i class="fa fa-users"></i> Users</div>
      <div class="nav-item" onclick="switchTab('content')"><i class="fa fa-language"></i> Content</div>
      <div class="nav-item" onclick="window.location.href='index.html'"><i class="fa fa-arrow-left"></i> Back to Site</div>
    </nav>
  </aside>

  <!-- Main Content -->
  <main class="main-content">
    
    <div id="loader" style="text-align:center; padding: 50px;">
      <i class="fa fa-spinner fa-spin fa-3x" style="color:var(--primary)"></i>
      <p>Loading Data from Google Sheets...</p>
    </div>

    <div id="app-content" class="hidden">
      <!-- Dashboard Tab -->
      <section id="tab-dashboard">
        <div class="admin-header"><h2>Overview</h2></div>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
          <div class="admin-card"><h3>Total Orders</h3><h2 id="stat-orders">0</h2></div>
          <div class="admin-card"><h3>Total Products</h3><h2 id="stat-products">0</h2></div>
          <div class="admin-card"><h3>Total Users</h3><h2 id="stat-users">0</h2></div>
        </div>
      </section>

      <!-- Products Tab -->
      <section id="tab-products" class="hidden">
        <div class="admin-header">
          <h2>Products Management</h2>
          <button class="btn-primary" onclick="openProductModal()"><i class="fa fa-plus"></i> Add Product</button>
        </div>
        <div class="admin-card" style="overflow-x:auto;">
          <table>
            <thead><tr><th>Image</th><th>Name (EN)</th><th>Price</th><th>Category</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody id="products-tbody"></tbody>
          </table>
        </div>
      </section>

      <!-- Orders Tab -->
      <section id="tab-orders" class="hidden">
        <div class="admin-header"><h2>Orders Management</h2></div>
        <div class="admin-card" style="overflow-x:auto;">
          <table>
            <thead><tr><th>Order ID</th><th>Date</th><th>Customer</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody id="orders-tbody"></tbody>
          </table>
        </div>
      </section>

      <!-- Users Tab -->
      <section id="tab-users" class="hidden">
        <div class="admin-header"><h2>Users Management</h2></div>
        <div class="admin-card" style="overflow-x:auto;">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody id="users-tbody"></tbody>
          </table>
        </div>
      </section>

      <!-- Content Tab -->
      <section id="tab-content" class="hidden">
        <div class="admin-header">
          <h2>Website Content & Translations</h2>
          <button class="btn-primary" onclick="saveAllContent()"><i class="fa fa-save"></i> Save All Changes</button>
        </div>
        <div class="admin-card" style="overflow-x:auto;">
          <p style="font-size:13px; color:var(--gray); margin-bottom:15px;">Edit the English and Arabic texts for your website. Status must be "Active" to show.</p>
          <table>
            <thead><tr><th>Key Element</th><th>English Text (EN)</th><th>Arabic Text (AR)</th><th>Status</th></tr></thead>
            <tbody id="content-tbody"></tbody>
          </table>
        </div>
      </section>
    </div>
  </main>

  <!-- Modals -->
  <!-- Product Modal -->
  <div class="modal" id="productModal">
    <div class="modal-content" style="max-width:600px;">
      <span class="modal-close" onclick="document.getElementById('productModal').style.display='none'">&times;</span>
      <h3 id="productModalTitle" style="margin-bottom:20px;">Add/Edit Product</h3>
      <input type="hidden" id="p-id">
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
        <div class="form-group"><label>Image URL</label><input type="text" id="p-image"></div>
        <div class="form-group"><label>Category</label><input type="text" id="p-category"></div>
        <div class="form-group"><label>Name (EN)</label><input type="text" id="p-name-en"></div>
        <div class="form-group"><label>Name (AR)</label><input type="text" id="p-name-ar"></div>
        <div class="form-group"><label>Price (EGP)</label><input type="number" id="p-price"></div>
        <div class="form-group"><label>Old Price (EGP)</label><input type="number" id="p-old-price"></div>
        <div class="form-group"><label>Stock Quantity</label><input type="number" id="p-stock"></div>
        <div class="form-group"><label>Badge (e.g. Sale, New)</label><input type="text" id="p-badge"></div>
        <div class="form-group"><label>Status</label>
          <select id="p-status" class="input-sm"><option value="Active">Active</option><option value="Hidden">Hidden</option></select>
        </div>
      </div>
      <div class="form-group"><label>Description (EN)</label><textarea id="p-desc-en" rows="3"></textarea></div>
      <div class="form-group"><label>Description (AR)</label><textarea id="p-desc-ar" rows="3"></textarea></div>
      <button class="btn-primary" style="width:100%" onclick="saveProduct()">Save Product</button>
    </div>
  </div>

  <!-- Order Modal -->
  <div class="modal" id="orderModal">
    <div class="modal-content" style="max-width:600px;">
      <span class="modal-close" onclick="document.getElementById('orderModal').style.display='none'">&times;</span>
      <h3 style="margin-bottom:20px;">Order Details: <span id="o-id"></span></h3>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:20px; font-size:14px;">
        <div><strong>Customer:</strong> <span id="o-name"></span></div>
        <div><strong>Email:</strong> <span id="o-email"></span></div>
        <div style="grid-column: 1/-1;"><strong>Address:</strong> <span id="o-address"></span></div>
        <div><strong>Payment:</strong> <span id="o-payment"></span></div>
        <div><strong>Total:</strong> <span id="o-total"></span> EGP</div>
      </div>
      <h4>Items</h4>
      <div id="o-items" style="background:#f9f9f9; padding:10px; border-radius:8px; margin-bottom:20px; font-size:13px;"></div>
      <div class="form-group">
        <label>Update Status</label>
        <select id="o-status" class="input-sm" style="margin-bottom:15px;">
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      <button class="btn-primary" style="width:100%" onclick="saveOrderStatus()">Update Order</button>
    </div>
  </div>

  <div id="toast" class="toast"></div>
  <script src="js/admin.js"></script>
</body>
</html>`;
fs.writeFileSync('e:/Downloads/ONLYMED/admin.html', adminHtml);


// 3. CREATE js/admin.js
const adminJs = `
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
  pBody.innerHTML = db.products.map(p => \`
    <tr>
      <td><img src="\${p.image}" width="40" style="border-radius:6px"></td>
      <td>\${p.name_en}</td>
      <td>\${p.price} EGP</td>
      <td>\${p.category}</td>
      <td>\${p.stock}</td>
      <td><span class="status-badge \${p.status==='Active'?'status-delivered':'status-pending'}">\${p.status}</span></td>
      <td>
        <button class="action-btn" onclick="editProduct('\${p.id}')"><i class="fa fa-edit"></i></button>
        <button class="action-btn" onclick="deleteProduct('\${p.id}')" style="color:var(--primary)"><i class="fa fa-trash"></i></button>
      </td>
    </tr>
  \`).join('');

  // Orders
  const oBody = document.getElementById('orders-tbody');
  oBody.innerHTML = db.orders.map(o => \`
    <tr>
      <td>\${o.id}</td>
      <td>\${new Date(o.date).toLocaleDateString()}</td>
      <td>\${o.name} <br><small>\${o.email}</small></td>
      <td>\${o.total} EGP</td>
      <td><span class="status-badge status-\${o.status.toLowerCase()}">\${o.status}</span></td>
      <td><button class="btn-outline" style="padding:5px 10px; font-size:11px" onclick="viewOrder('\${o.id}')">View</button></td>
    </tr>
  \`).join('');

  // Users
  const uBody = document.getElementById('users-tbody');
  uBody.innerHTML = db.users.map(u => \`
    <tr>
      <td>\${u.name}</td>
      <td>\${u.email}</td>
      <td>\${u.phone}</td>
      <td>\${new Date(u.created).toLocaleDateString()}</td>
      <td><button class="action-btn" onclick="deleteUser('\${u.email}')" style="color:var(--primary)"><i class="fa fa-trash"></i></button></td>
    </tr>
  \`).join('');

  // Content
  const cBody = document.getElementById('content-tbody');
  cBody.innerHTML = db.content.map((c, i) => \`
    <tr>
      <td><code style="background:#eee;padding:3px 6px;border-radius:4px">\${c.key}</code></td>
      <td><input type="text" class="input-sm" id="c-en-\${i}" value="\${c.en}"></td>
      <td><input type="text" class="input-sm" id="c-ar-\${i}" value="\${c.ar}" dir="rtl"></td>
      <td><select class="input-sm" id="c-st-\${i}"><option \${c.status==='Active'?'selected':''}>Active</option><option \${c.status!=='Active'?'selected':''}>Inactive</option></select></td>
    </tr>
  \`).join('');
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
  
  const res = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: JSON.stringify(data) });
  const result = await res.json();
  if(result.status === 'success') {
    document.getElementById('productModal').style.display = 'none';
    showToast('Product saved!');
    loadDashboard(); // Refresh
  }
}

async function deleteProduct(id) {
  if(!confirm('Delete this product?')) return;
  const res = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: JSON.stringify({action:'adminDeleteProduct', id}) });
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
    items.forEach(i => { itemsHtml += \`<div>\${i.qty}x \${i.name}</div>\`; });
  } catch(e) { itemsHtml = o.products; }
  document.getElementById('o-items').innerHTML = itemsHtml;
  
  document.getElementById('orderModal').style.display = 'flex';
}

async function saveOrderStatus() {
  const st = document.getElementById('o-status').value;
  showToast('Updating order...');
  await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: JSON.stringify({action:'adminUpdateOrderStatus', orderId: currentOrderId, status: st}) });
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
  
  await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: JSON.stringify({action:'adminUpdateContent', content: newContent}) });
  showToast('Content updated successfully!');
}

// ---- USER ACTIONS ----
async function deleteUser(email) {
  if(!confirm('Delete this user?')) return;
  await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: JSON.stringify({action:'adminDeleteUser', email}) });
  loadDashboard();
}

// Init
window.onload = loadDashboard;
`;
fs.writeFileSync('e:/Downloads/ONLYMED/js/admin.js', adminJs);
console.log("Admin Dashboard created successfully");
