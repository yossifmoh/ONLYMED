const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwv1vuPsTUNXz6BMvtxUwxSqnf9Tq1CX21KLMq0nL3aYFebslLVEe5V0i-VIHyJLhlr/exec";
let db = { products: [], orders: [], users: [], content: [] };

function formatDriveImageUrl(url) {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/file\/d\/([^\/?&#]+)/) || url.match(/[?&]id=([^&]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }
  return url;
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  } else {
    console.log("Toast message:", msg);
  }
}

function switchTab(tabId, element) {
  document.querySelectorAll('.nav-menu .nav-item').forEach(el => el.classList.remove('active'));
  if (element) {
    element.classList.add('active');
  }
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  const target = document.getElementById('tab-' + tabId);
  if (target) target.classList.add('active');
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
      const loader = document.getElementById('loader');
      if (loader) loader.classList.add('hidden');
      const appContent = document.getElementById('app-content');
      if (appContent) appContent.classList.remove('hidden');
    } else {
      showToast('Error loading data: ' + (result.message || 'Unknown error'));
    }
  } catch(e) {
    showToast('Network error loading data');
    console.error(e);
  }
}

function renderAll() {
  // Stats
  const statOrders = document.getElementById('statOrders');
  if (statOrders) statOrders.innerText = db.orders.length;
  
  const statProducts = document.getElementById('statProducts');
  if (statProducts) statProducts.innerText = db.products.length;
  
  const statUsers = document.getElementById('statUsers');
  if (statUsers) statUsers.innerText = db.users.length;
  
  // Calculate Revenue
  let rev = 0;
  db.orders.forEach(o => {
    if((o.status === 'Completed' || o.status === 'Delivered') && o.total) {
      rev += parseFloat(o.total) || 0;
    }
  });
  const statRev = document.getElementById('statRevenue');
  if(statRev) statRev.innerText = 'EGP ' + rev.toFixed(2);
  
  // Dynamic Trends
  const now = new Date();
  
  // 1. Orders Trend
  const thisMonthOrders = db.orders.filter(o => {
    const d = new Date(o.date);
    return !isNaN(d) && (now - d) <= 30 * 24 * 60 * 60 * 1000;
  }).length;
  const lastMonthOrders = db.orders.filter(o => {
    const d = new Date(o.date);
    const diff = now - d;
    return !isNaN(d) && diff > 30 * 24 * 60 * 60 * 1000 && diff <= 60 * 24 * 60 * 60 * 1000;
  }).length;
  
  const trendOrdersEl = document.getElementById('trendOrders');
  if (trendOrdersEl) {
    if (lastMonthOrders === 0) {
      trendOrdersEl.innerHTML = `<i class="fa fa-arrow-up"></i> +${thisMonthOrders} new this month`;
      trendOrdersEl.className = "card-trend trend-up";
    } else {
      const pct = ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100;
      if (pct >= 0) {
        trendOrdersEl.innerHTML = `<i class="fa fa-arrow-up"></i> ${pct.toFixed(1)}% this month`;
        trendOrdersEl.className = "card-trend trend-up";
      } else {
        trendOrdersEl.innerHTML = `<i class="fa fa-arrow-down"></i> ${Math.abs(pct).toFixed(1)}% this month`;
        trendOrdersEl.className = "card-trend trend-down";
      }
    }
  }

  // 2. Revenue Trend
  const getRevenueForRange = (filterFn) => {
    return db.orders.filter(filterFn).reduce((sum, o) => {
      if ((o.status === 'Completed' || o.status === 'Delivered') && o.total) {
        return sum + (parseFloat(o.total) || 0);
      }
      return sum;
    }, 0);
  };
  const thisMonthRev = getRevenueForRange(o => {
    const d = new Date(o.date);
    return !isNaN(d) && (now - d) <= 30 * 24 * 60 * 60 * 1000;
  });
  const lastMonthRev = getRevenueForRange(o => {
    const d = new Date(o.date);
    const diff = now - d;
    return !isNaN(d) && diff > 30 * 24 * 60 * 60 * 1000 && diff <= 60 * 24 * 60 * 60 * 1000;
  });
  
  const trendRevenueEl = document.getElementById('trendRevenue');
  if (trendRevenueEl) {
    if (lastMonthRev === 0) {
      trendRevenueEl.innerHTML = `<i class="fa fa-arrow-up"></i> +${thisMonthRev.toFixed(0)} EGP this month`;
      trendRevenueEl.className = "card-trend trend-up";
    } else {
      const pct = ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100;
      if (pct >= 0) {
        trendRevenueEl.innerHTML = `<i class="fa fa-arrow-up"></i> ${pct.toFixed(1)}% this month`;
        trendRevenueEl.className = "card-trend trend-up";
      } else {
        trendRevenueEl.innerHTML = `<i class="fa fa-arrow-down"></i> ${Math.abs(pct).toFixed(1)}% this month`;
        trendRevenueEl.className = "card-trend trend-down";
      }
    }
  }

  // 3. Customers Trend (new this week)
  const thisWeekUsers = db.users.filter(u => {
    const d = new Date(u.created);
    return !isNaN(d) && (now - d) <= 7 * 24 * 60 * 60 * 1000;
  }).length;
  const trendUsersEl = document.getElementById('trendUsers');
  if (trendUsersEl) {
    trendUsersEl.innerHTML = `<i class="fa fa-arrow-up"></i> +${thisWeekUsers} new this week`;
    trendUsersEl.className = "card-trend trend-up";
  }

  // 4. Products Trend (low stock)
  const lowStockCount = db.products.filter(p => parseInt(p.stock || 0) <= 5).length;
  const trendProductsEl = document.getElementById('trendProducts');
  if (trendProductsEl) {
    if (lowStockCount > 0) {
      trendProductsEl.innerHTML = `<i class="fa fa-arrow-down"></i> ${lowStockCount} low stock items`;
      trendProductsEl.className = "card-trend trend-down";
    } else {
      trendProductsEl.innerHTML = `<i class="fa fa-arrow-up"></i> All items in stock`;
      trendProductsEl.className = "card-trend trend-up";
    }
  }

  // Products
  const pBody = document.getElementById('productsTbody');
  if (pBody) {
    pBody.innerHTML = db.products.map(p => `
      <tr>
        <td><img src="${formatDriveImageUrl(p.image)}" width="40" style="border-radius:6px"></td>
        <td>${p.name_en}</td>
        <td>${p.category}</td>
        <td>${p.price} EGP</td>
        <td>${p.stock}</td>
        <td><span class="status-badge ${p.status==='Active'?'status-delivered':'status-pending'}">${p.status}</span></td>
        <td>
          <button class="action-btn" onclick="editProduct('${p.id}')"><i class="fa fa-edit"></i></button>
          <button class="action-btn" onclick="deleteProduct('${p.id}')" style="color:var(--primary)"><i class="fa fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
  }

  // Orders
  const oBody = document.getElementById('ordersTbody');
  if (oBody) {
    oBody.innerHTML = db.orders.map(o => `
      <tr>
        <td>${o.id}</td>
        <td>${(o.date && !isNaN(new Date(o.date))) ? new Date(o.date).toLocaleDateString() : 'N/A'}</td>
        <td>${o.name} <br><small>${o.email}</small></td>
        <td>${o.total} EGP</td>
        <td><span class="status-badge status-${(o.status || 'Pending').toLowerCase()}">${o.status}</span></td>
        <td><button class="btn-view" onclick="viewOrder('${o.id}')"><i class="fa fa-eye"></i> View</button></td>
      </tr>
    `).join('');
  }

  // Users
  const uBody = document.getElementById('usersTbody');
  if (uBody) {
    uBody.innerHTML = db.users.map(u => `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.phone}</td>
        <td>${(u.created && !isNaN(new Date(u.created))) ? new Date(u.created).toLocaleDateString() : 'N/A'}</td>
        <td><button class="action-btn" onclick="deleteUser('${u.email}')" style="color:var(--primary)"><i class="fa fa-trash"></i></button></td>
      </tr>
    `).join('');
  }

  // Content
  const cBody = document.getElementById('contentTbody');
  if (cBody) {
    cBody.innerHTML = db.content.map((c, i) => `
      <tr>
        <td><code style="background:#eee;padding:3px 6px;border-radius:4px">${c.key}</code></td>
        <td><input type="text" class="input-sm" id="c-en-${i}" value="${c.en}"></td>
        <td><input type="text" class="input-sm" id="c-ar-${i}" value="${c.ar}" dir="rtl"></td>
        <td><select class="input-sm" id="c-st-${i}"><option ${c.status==='Active'?'selected':''}>Active</option><option ${c.status!=='Active'?'selected':''}>Inactive</option></select></td>
      </tr>
    `).join('');
  }

  // Populate Dashboard Tables
  const recentTbody = document.getElementById('recentOrdersTbody');
  if (recentTbody && db.orders) {
    recentTbody.innerHTML = db.orders.slice(0, 5).map(o => {
      const orderDate = (o.date && !isNaN(new Date(o.date))) ? new Date(o.date).toLocaleDateString() : '';
      return `<tr>
        <td>#${String(o.id)}</td>
        <td>${o.name || ''}</td>
        <td>${orderDate}</td>
        <td><span class="status-badge status-${(o.status || 'Pending').toLowerCase()}">${o.status}</span></td>
      </tr>`;
    }).join('');
  }
  
  const topTbody = document.getElementById('topProductsTbody');
  if (topTbody && db.products) {
    topTbody.innerHTML = db.products.slice(0, 5).map(p => `
      <tr>
        <td>${p.name_en || ''}</td>
        <td>${p.price} EGP</td>
      </tr>
    `).join('');
  }
  
  // Re-initialize analytics if tab is currently open
  const isAnalyticsActive = document.getElementById('tab-analytics')?.classList.contains('active');
  if (isAnalyticsActive && typeof window.initAnalytics === 'function') {
    window.initAnalytics();
  }
}

// ---- PRODUCT ACTIONS ----
function openProductModal() {
  const pId = document.getElementById('pId');
  if (pId) pId.value = '';
  const pImage = document.getElementById('pImage');
  if (pImage) pImage.value = '';
  const pNameEn = document.getElementById('pNameEn');
  if (pNameEn) pNameEn.value = '';
  const pNameAr = document.getElementById('pNameAr');
  if (pNameAr) pNameAr.value = '';
  const pDescEn = document.getElementById('pDescEn');
  if (pDescEn) pDescEn.value = '';
  const pDescAr = document.getElementById('pDescAr');
  if (pDescAr) pDescAr.value = '';
  const pCat = document.getElementById('pCat');
  if (pCat) pCat.value = '';
  const pPrice = document.getElementById('pPrice');
  if (pPrice) pPrice.value = '';
  const pOldPrice = document.getElementById('pOldPrice');
  if (pOldPrice) pOldPrice.value = '';
  const pBadge = document.getElementById('pBadge');
  if (pBadge) pBadge.value = '';
  const pStock = document.getElementById('pStock');
  if (pStock) pStock.value = '10';
  const pStatus = document.getElementById('pStatus');
  if (pStatus) pStatus.value = 'Active';
  
  const pmTitle = document.getElementById('pmTitle');
  if (pmTitle) pmTitle.innerText = 'Add New Product';
  
  const modal = document.getElementById('productModal');
  if (modal) modal.classList.add('active');
}

function editProduct(id) {
  const p = db.products.find(x => x.id === id);
  if(!p) return;
  
  const pId = document.getElementById('pId');
  if (pId) pId.value = p.id;
  const pImage = document.getElementById('pImage');
  if (pImage) pImage.value = p.image;
  const pNameEn = document.getElementById('pNameEn');
  if (pNameEn) pNameEn.value = p.name_en;
  const pNameAr = document.getElementById('pNameAr');
  if (pNameAr) pNameAr.value = p.name_ar;
  const pDescEn = document.getElementById('pDescEn');
  if (pDescEn) pDescEn.value = p.desc_en;
  const pDescAr = document.getElementById('pDescAr');
  if (pDescAr) pDescAr.value = p.desc_ar;
  const pCat = document.getElementById('pCat');
  if (pCat) pCat.value = p.category;
  const pPrice = document.getElementById('pPrice');
  if (pPrice) pPrice.value = p.price;
  const pOldPrice = document.getElementById('pOldPrice');
  if (pOldPrice) pOldPrice.value = p.oldPrice;
  const pBadge = document.getElementById('pBadge');
  if (pBadge) pBadge.value = p.badge;
  const pStock = document.getElementById('pStock');
  if (pStock) pStock.value = p.stock;
  const pStatus = document.getElementById('pStatus');
  if (pStatus) pStatus.value = p.status;
  
  const pmTitle = document.getElementById('pmTitle');
  if (pmTitle) pmTitle.innerText = 'Edit Product';
  
  const modal = document.getElementById('productModal');
  if (modal) modal.classList.add('active');
}

async function saveProduct() {
  const btn = document.querySelector('#productModal button.btn-primary');
  if (btn) {
    if (btn.disabled) return; // Prevent duplicate submissions
    btn.disabled = true;
    btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Saving...';
  }
  
  showToast('Saving product...');
  const data = {
    action: 'adminSaveProduct',
    id: document.getElementById('pId').value,
    image: document.getElementById('pImage').value,
    name_en: document.getElementById('pNameEn').value,
    name_ar: document.getElementById('pNameAr').value,
    category: document.getElementById('pCat').value,
    price: document.getElementById('pPrice').value,
    desc_en: document.getElementById('pDescEn').value,
    desc_ar: document.getElementById('pDescAr').value,
    oldPrice: document.getElementById('pOldPrice').value,
    badge: document.getElementById('pBadge').value,
    stock: document.getElementById('pStock').value,
    status: document.getElementById('pStatus').value
  };
  
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify(data) });
    const result = await res.json();
    if(result.status === 'success') {
      if (typeof window.closeModal === 'function') {
        window.closeModal('productModal');
      } else {
        const modal = document.getElementById('productModal');
        if (modal) modal.classList.remove('active');
      }
      showToast('Product saved successfully!');
      loadDashboard(); // Refresh
    } else {
      showToast('Error saving product: ' + (result.message || 'Unknown error'));
    }
  } catch(e) {
    showToast('Network error saving product');
    console.error(e);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = 'Save Product';
    }
  }
}

async function deleteProduct(id) {
  const product = db.products.find(p => p.id === id);
  const productName = product ? (product.name_en || product.name || 'This product') : 'This product';
  showCustomConfirm({
    title: 'Delete Product?',
    subtitle: productName,
    message: 'This action is permanent and cannot be undone.',
    confirmText: 'Delete',
    danger: true,
    onConfirm: async () => {
      showToast('Deleting product...');
      const res = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({action:'adminDeleteProduct', id}) });
      const result = await res.json();
      if(result.status === 'success') {
        showToast('Product deleted!');
        loadDashboard();
      } else {
        showToast('Error deleting product: ' + (result.message || 'Unknown error'));
      }
    }
  });
}

// ---- ORDER ACTIONS ----
let currentOrderId = null;
function viewOrder(id) {
  const o = db.orders.find(x => x.id === id);
  if (!o) return;
  currentOrderId = id;
  
  const oId = document.getElementById('o-id');
  if (oId) oId.innerText = o.id;
  const oName = document.getElementById('o-name');
  if (oName) oName.innerText = o.name;
  const oEmail = document.getElementById('o-email');
  if (oEmail) oEmail.innerText = o.email;
  const oAddress = document.getElementById('o-address');
  if (oAddress) oAddress.innerText = o.address;
  const oPayment = document.getElementById('o-payment');
  if (oPayment) oPayment.innerText = o.payment;
  const oTotal = document.getElementById('o-total');
  if (oTotal) oTotal.innerText = o.total;
  const oStatusUpdate = document.getElementById('oStatusUpdate');
  if (oStatusUpdate) oStatusUpdate.value = o.status;
  
  let itemsHtml = '';
  try {
    const items = JSON.parse(o.products);
    items.forEach(i => { itemsHtml += `<div>${i.qty}x ${i.name}</div>`; });
  } catch(e) { itemsHtml = o.products; }
  
  const oItems = document.getElementById('o-items');
  if (oItems) oItems.innerHTML = itemsHtml;
  
  const modal = document.getElementById('orderModal');
  if (modal) modal.classList.add('active');
}

async function updateOrderStatus() {
  const btn = document.querySelector('#orderModal button.btn-primary');
  let originalHtml = '';
  if (btn) {
    if (btn.disabled) return;
    btn.disabled = true;
    originalHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Updating...';
  }

  const st = document.getElementById('oStatusUpdate').value;
  showToast('Updating order...');
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({action:'adminUpdateOrderStatus', orderId: currentOrderId, status: st}) });
    const result = await res.json();
    if(result.status === 'success') {
      if (typeof window.closeModal === 'function') {
        window.closeModal('orderModal');
      } else {
        const modal = document.getElementById('orderModal');
        if (modal) modal.classList.remove('active');
      }
      showToast('Order status updated!');
      loadDashboard();
    } else {
      showToast('Error updating status: ' + (result.message || 'Unknown error'));
    }
  } catch(e) {
    showToast('Network error updating order status');
    console.error(e);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }
}
const saveOrderStatus = updateOrderStatus;

// ---- CONTENT ACTIONS ----
async function saveAllContent() {
  const btn = document.querySelector('#tab-content button.btn-primary');
  let originalHtml = '';
  if (btn) {
    if (btn.disabled) return;
    btn.disabled = true;
    originalHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Saving...';
  }

  showToast('Saving all content...');
  const newContent = [];
  db.content.forEach((c, i) => {
    const enEl = document.getElementById('c-en-'+i);
    const arEl = document.getElementById('c-ar-'+i);
    const stEl = document.getElementById('c-st-'+i);
    if (enEl && arEl && stEl) {
      newContent.push({
        key: c.key,
        en: enEl.value,
        ar: arEl.value,
        status: stEl.value
      });
    }
  });
  
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({action:'adminUpdateContent', content: newContent}) });
    const result = await res.json();
    if(result.status === 'success') {
      showToast('Content updated successfully!');
      loadDashboard();
    } else {
      showToast('Error updating content: ' + (result.message || 'Unknown error'));
    }
  } catch(e) {
    showToast('Network error updating content');
    console.error(e);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }
}

// ---- USER ACTIONS ----
async function deleteUser(email) {
  const user = db.users.find(u => u.email === email);
  const userName = user ? (user.name || email) : email;
  showCustomConfirm({
    title: 'Delete User?',
    subtitle: userName,
    message: 'This will permanently remove the user and all their data.',
    confirmText: 'Delete',
    danger: true,
    onConfirm: async () => {
      showToast('Deleting user...');
      const res = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({action:'adminDeleteUser', email}) });
      const result = await res.json();
      if(result.status === 'success') {
        showToast('User deleted!');
        loadDashboard();
      } else {
        showToast('Error deleting user: ' + (result.message || 'Unknown error'));
      }
    }
  });
}

// Init
window.onload = loadDashboard;

// ---- ANALYTICS CHARTS ----
let revenueChartInstance = null;
let categoryChartInstance = null;

function initAnalytics() {
  if (typeof Chart === 'undefined') {
    console.warn("Chart.js is not loaded.");
    return;
  }
  
  // Destroy old instances to prevent redraw glitch on hover
  if (revenueChartInstance) revenueChartInstance.destroy();
  if (categoryChartInstance) categoryChartInstance.destroy();

  // 1. Group completed orders by date for Revenue Trend
  const salesByDate = {};
  const completedOrders = (db.orders || []).filter(o => o.status === 'Completed' || o.status === 'Delivered');
  
  // Sort by date ascending
  const sortedOrders = [...completedOrders].sort((a,b) => new Date(a.date) - new Date(b.date));
  
  sortedOrders.forEach(o => {
    if (!o.date) return;
    const d = new Date(o.date);
    if (isNaN(d)) return;
    const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    salesByDate[dateStr] = (salesByDate[dateStr] || 0) + (parseFloat(o.total) || 0);
  });

  const dates = Object.keys(salesByDate);
  const revenues = Object.values(salesByDate);

  const displayDates = dates.length ? dates : ['No Data'];
  const displayRevenues = revenues.length ? revenues : [0];

  const ctxRev = document.getElementById('revenueChart');
  if (ctxRev) {
    revenueChartInstance = new Chart(ctxRev, {
      type: 'line',
      data: {
        labels: displayDates,
        datasets: [{
          label: 'Revenue (EGP)',
          data: displayRevenues,
          borderColor: '#d0112b',
          backgroundColor: 'rgba(208, 17, 43, 0.1)',
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#d0112b'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  // 2. Category Sales Breakdown
  const catSales = {};
  const categoriesList = ['Vitamins', 'Supplements', 'First Aid', 'Equipment', 'Skincare'];
  categoriesList.forEach(c => catSales[c] = 0);

  completedOrders.forEach(o => {
    if (!o.products) return;
    let items = [];
    try {
      items = JSON.parse(o.products);
    } catch(e) {
      // If products field is not JSON array (e.g. plain text string), skip or parse
    }
    
    if (Array.isArray(items)) {
      items.forEach(item => {
        const p = db.products.find(x => x.name_en === item.name || x.id === item.id);
        const cat = p ? p.category : 'Vitamins';
        catSales[cat] = (catSales[cat] || 0) + (parseFloat(item.price || 0) * (parseInt(item.qty || 1)));
      });
    }
  });

  const catLabels = Object.keys(catSales);
  const catValues = Object.values(catSales);

  const ctxCat = document.getElementById('categoryChart');
  if (ctxCat) {
    categoryChartInstance = new Chart(ctxCat, {
      type: 'doughnut',
      data: {
        labels: catLabels,
        datasets: [{
          data: catValues,
          backgroundColor: ['#e8547a', '#f07fa0', '#14b8a6', '#f59e0b', '#8b5cf6'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }
}

// Make initAnalytics available globally
window.initAnalytics = initAnalytics;

// ================== GLOBAL CONFIRM MODAL ==================
function showCustomConfirm(options) {
  return new Promise((resolve) => {
    // Inject styles once
    if (!document.getElementById('customConfirmStyles')) {
      const style = document.createElement('style');
      style.id = 'customConfirmStyles';
      style.innerHTML = `
        @keyframes ccm-overlay-in  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ccm-box-in      { from { opacity: 0; transform: scale(0.88) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes ccm-box-out     { from { opacity: 1; transform: scale(1) translateY(0); } to { opacity: 0; transform: scale(0.88) translateY(10px); } }

        .ccm-overlay {
          position: fixed; inset: 0;
          background: rgba(10, 10, 10, 0.55);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 99999;
          padding: 16px;
          animation: ccm-overlay-in 0.22s ease forwards;
        }
        .ccm-overlay.closing { animation: none; opacity: 0; transition: opacity 0.2s ease; }

        .ccm-box {
          background: #fff;
          border-radius: 16px;
          width: 100%; max-width: 380px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.07);
          overflow: hidden;
          animation: ccm-box-in 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.15) forwards;
          font-family: 'Inter', sans-serif;
        }
        .ccm-box.closing { animation: ccm-box-out 0.2s ease forwards; }

        .ccm-header {
          display: flex; align-items: center; justify-content: flex-end;
          padding: 12px 16px 0;
        }
        .ccm-close {
          background: none; border: none; cursor: pointer;
          color: #aaa; font-size: 18px; line-height: 1;
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%;
          transition: background 0.2s, color 0.2s;
        }
        .ccm-close:hover { background: #f0f0f0; color: #444; }

        .ccm-body {
          padding: 4px 28px 28px;
          text-align: center;
        }
        .ccm-icon-wrap {
          width: 56px; height: 56px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
          font-size: 22px;
        }
        .ccm-icon-wrap.danger  { background: #fff0f1; color: #d0112b; }
        .ccm-icon-wrap.info    { background: #e0f7fa; color: #00b4d8; }
        .ccm-icon-wrap.warning { background: #fff8e1; color: #f59e0b; }

        .ccm-title {
          margin: 0 0 6px;
          font-size: 18px; font-weight: 700;
          color: #111;
          font-family: 'Playfair Display', serif;
        }
        .ccm-subtitle {
          margin: 0 0 6px;
          font-size: 13px; font-weight: 600;
          color: #555;
          background: #f5f5f5;
          display: inline-block;
          padding: 3px 10px;
          border-radius: 20px;
        }
        .ccm-message {
          margin: 8px 0 24px;
          font-size: 14px; line-height: 1.6;
          color: #777;
        }
        .ccm-actions {
          display: flex; gap: 10px;
        }
        .ccm-btn {
          flex: 1; padding: 11px 16px;
          border-radius: 8px;
          font-size: 14px; font-weight: 600;
          cursor: pointer; border: none;
          transition: all 0.2s ease;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        }
        .ccm-btn-cancel {
          background: #f4f4f4; color: #555;
        }
        .ccm-btn-cancel:hover { background: #e8e8e8; color: #222; }
        .ccm-btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }

        .ccm-btn-action {
          color: #fff;
        }
        .ccm-btn-action.danger  { background: #d0112b; }
        .ccm-btn-action.danger:hover  { background: #b00d23; box-shadow: 0 4px 12px rgba(208,17,43,0.3); }
        .ccm-btn-action.info    { background: #00b4d8; }
        .ccm-btn-action.info:hover    { background: #0097b8; box-shadow: 0 4px 12px rgba(0,180,216,0.3); }
        .ccm-btn-action.warning { background: #f59e0b; }
        .ccm-btn-action.warning:hover { background: #d97706; }
        .ccm-btn-action:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }

        @media (max-width: 480px) {
          .ccm-box { border-radius: 14px; }
          .ccm-body { padding: 4px 20px 22px; }
          .ccm-actions { flex-direction: column-reverse; }
        }
      `;
      document.head.appendChild(style);
    }

    // Remove previous modal if any
    const old = document.getElementById('globalConfirmModal');
    if (old) old.remove();

    const variant = options.variant || (options.danger === false ? 'info' : 'danger');
    const defaultIcons = { danger: 'fa fa-trash-alt', info: 'fa fa-info-circle', warning: 'fa fa-exclamation-triangle' };
    const icon = options.icon || defaultIcons[variant] || 'fa fa-exclamation-triangle';

    const modal = document.createElement('div');
    modal.id = 'globalConfirmModal';
    modal.className = 'ccm-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'ccmTitle');

    const subtitleHtml = options.subtitle
      ? `<div class="ccm-subtitle"><i class="fa fa-tag" style="margin-right:5px; opacity:0.6;"></i>${options.subtitle}</div>`
      : '';

    modal.innerHTML = `
      <div class="ccm-box" role="document">
        <div class="ccm-header">
          <button class="ccm-close" id="ccmCloseBtn" aria-label="Close">&#x2715;</button>
        </div>
        <div class="ccm-body">
          <div class="ccm-icon-wrap ${variant}">
            <i class="${icon}"></i>
          </div>
          <h3 class="ccm-title" id="ccmTitle">${options.title || 'Are you sure?'}</h3>
          ${subtitleHtml}
          <p class="ccm-message">${options.message || 'This action cannot be undone.'}</p>
          <div class="ccm-actions">
            <button class="ccm-btn ccm-btn-cancel" id="ccmCancelBtn">${options.cancelText || 'Cancel'}</button>
            <button class="ccm-btn ccm-btn-action ${variant}" id="ccmActionBtn">${options.confirmText || 'Confirm'}</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const actionBtn  = modal.querySelector('#ccmActionBtn');
    const cancelBtn  = modal.querySelector('#ccmCancelBtn');
    const closeBtn   = modal.querySelector('#ccmCloseBtn');
    const box        = modal.querySelector('.ccm-box');
    let   isClosed   = false;

    const closeModal = (result) => {
      if (isClosed) return;
      isClosed = true;
      box.classList.add('closing');
      modal.classList.add('closing');
      document.removeEventListener('keydown', handleKey);
      setTimeout(() => { modal.remove(); resolve(result); }, 200);
    };

    const handleKey = (e) => {
      if (e.key === 'Escape') closeModal(false);
      if (e.key === 'Tab') {
        const focusable = [cancelBtn, actionBtn, closeBtn].filter(b => !b.disabled);
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
        else            { if (document.activeElement === last)  { e.preventDefault(); first.focus(); } }
      }
    };

    actionBtn.addEventListener('click', async () => {
      const originalHtml = actionBtn.innerHTML;
      actionBtn.disabled = true;
      cancelBtn.disabled = true;
      closeBtn.disabled  = true;
      actionBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Processing...';
      try {
        if (options.onConfirm) await options.onConfirm();
        closeModal(true);
      } catch(e) {
        console.error(e);
        actionBtn.disabled = false;
        cancelBtn.disabled = false;
        closeBtn.disabled  = false;
        actionBtn.innerHTML = originalHtml;
      }
    });

    cancelBtn.addEventListener('click', () => closeModal(false));
    closeBtn.addEventListener('click',  () => closeModal(false));

    modal.addEventListener('mousedown', (e) => {
      if (e.target === modal) closeModal(false);
    });

    document.addEventListener('keydown', handleKey);
    setTimeout(() => cancelBtn.focus(), 60);
  });
}

