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
        <td><button class="btn-outline" style="padding:5px 10px; font-size:11px" onclick="viewOrder('${o.id}')">View</button></td>
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
  if(!confirm('Delete this product?')) return;
  showToast('Deleting product...');
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({action:'adminDeleteProduct', id}) });
    const result = await res.json();
    if(result.status === 'success') {
      showToast('Product deleted!');
      loadDashboard();
    } else {
      showToast('Error deleting product: ' + (result.message || 'Unknown error'));
    }
  } catch(e) {
    showToast('Network error deleting product');
    console.error(e);
  }
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
  }
}
const saveOrderStatus = updateOrderStatus;

// ---- CONTENT ACTIONS ----
async function saveAllContent() {
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
  }
}

// ---- USER ACTIONS ----
async function deleteUser(email) {
  if(!confirm('Delete this user?')) return;
  showToast('Deleting user...');
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({action:'adminDeleteUser', email}) });
    const result = await res.json();
    if(result.status === 'success') {
      showToast('User deleted!');
      loadDashboard();
    } else {
      showToast('Error deleting user: ' + (result.message || 'Unknown error'));
    }
  } catch(e) {
    showToast('Network error deleting user');
    console.error(e);
  }
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
