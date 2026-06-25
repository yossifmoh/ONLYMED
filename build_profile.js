const fs = require('fs');

let html = fs.readFileSync('e:/Downloads/ONLYMED/index.html', 'utf8');

// 1. Add Profile to Navbar
const adminBtn = `<button class="btn-admin" onclick="showPage('admin')">Admin</button>`;
const profileBtn = `<button class="btn-outline" style="padding: 7px 14px; font-size: 13px; margin-right: 5px; display:none;" id="navProfileBtn" onclick="showPage('profile')"><i class="fa fa-user"></i> My Account</button>
      <button class="btn-admin" onclick="showPage('admin')">Admin</button>`;
if (!html.includes('navProfileBtn')) {
    html = html.replace(adminBtn, profileBtn);
}

// 2. Add Profile Page HTML before the Admin page
const profilePageHtml = `
<!-- ===================== PROFILE PAGE ===================== -->
<div class="page" id="page-profile">
  <div class="checkout-wrap">
    <h2 style="font-family:'Playfair Display',serif;font-size:28px;margin-bottom:28px;color:var(--dark)">My Account</h2>
    <div class="form-section" style="max-width: 600px; margin: 0 auto;">
      <h3>Profile Information</h3>
      <div id="profile-view">
        <p style="margin-bottom:10px"><strong>Name:</strong> <span id="prof-v-name"></span></p>
        <p style="margin-bottom:10px"><strong>Email:</strong> <span id="prof-v-email"></span></p>
        <p style="margin-bottom:10px"><strong>Phone:</strong> <span id="prof-v-phone"></span></p>
        <p style="margin-bottom:10px"><strong>Address:</strong> <span id="prof-v-addr"></span></p>
        <button class="btn-primary" style="margin-top: 20px;" onclick="toggleEditProfile()">Edit Profile</button>
      </div>

      <div id="profile-edit" style="display:none; margin-top:20px;">
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" id="prof-e-email">
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input type="text" id="prof-e-phone">
        </div>
        <div class="form-group">
          <label>Address</label>
          <input type="text" id="prof-e-addr">
        </div>
        <div style="display:flex; gap:10px; margin-top:20px;">
          <button class="btn-primary" onclick="saveProfile()" id="prof-save-btn">Save Changes</button>
          <button class="btn-outline" onclick="toggleEditProfile()">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</div>
`;

if (!html.includes('id="page-profile"')) {
    html = html.replace('<!-- ===================== ABOUT PAGE ===================== -->', profilePageHtml + '\n<!-- ===================== ABOUT PAGE ===================== -->');
}
fs.writeFileSync('e:/Downloads/ONLYMED/index.html', html);


let js = fs.readFileSync('e:/Downloads/ONLYMED/js/main.js', 'utf8');

// Add user state and cart persistence
const stateInjection = `let currentUser = JSON.parse(localStorage.getItem('onlymed_user')) || null;
// load cart from localstorage
let savedCart = localStorage.getItem('onlymed_cart');
if(savedCart) { try { cart = JSON.parse(savedCart); } catch(e){} }
`;

if(!js.includes('onlymed_user')) {
    js = js.replace('let cart=[];', 'let cart=[];\n' + stateInjection);
}

// Add function to save cart
if(!js.includes('function saveCartLocally')) {
    js = js.replace('function renderCartBadge(){', `function saveCartLocally() { localStorage.setItem('onlymed_cart', JSON.stringify(cart)); }\nfunction renderCartBadge(){`);
    // inject saveCartLocally to addToCart, changeQty, removeCartItem, placeOrder
    js = js.replace(/renderCartBadge\(\);/g, 'renderCartBadge();saveCartLocally();');
}

// Add Profile Logic
const profileLogic = `
// ================== PROFILE ==================
function renderProfile() {
  if(!currentUser) { showPage('home'); return; }
  document.getElementById('navProfileBtn').style.display = 'inline-block';
  document.getElementById('prof-v-name').textContent = currentUser.name;
  document.getElementById('prof-v-email').textContent = currentUser.email;
  document.getElementById('prof-v-phone').textContent = currentUser.phone;
  document.getElementById('prof-v-addr').textContent = currentUser.address;
  
  document.getElementById('prof-e-email').value = currentUser.email;
  document.getElementById('prof-e-phone').value = currentUser.phone;
  document.getElementById('prof-e-addr').value = currentUser.address;
}

function toggleEditProfile() {
  const view = document.getElementById('profile-view');
  const edit = document.getElementById('profile-edit');
  if(view.style.display === 'none') {
    view.style.display = 'block';
    edit.style.display = 'none';
  } else {
    view.style.display = 'none';
    edit.style.display = 'block';
  }
}

async function saveProfile() {
  const newEmail = document.getElementById('prof-e-email').value.trim();
  const newPhone = document.getElementById('prof-e-phone').value.trim();
  const newAddr = document.getElementById('prof-e-addr').value.trim();
  
  if(!newEmail || !newPhone || !newAddr) { showToast('Please fill all fields'); return; }
  
  const saveBtn = document.getElementById('prof-save-btn');
  saveBtn.textContent = 'Saving...';
  saveBtn.disabled = true;
  
  try {
    if(GOOGLE_SCRIPT_URL !== "YOUR_GOOGLE_SCRIPT_URL_HERE") {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              action: 'updateProfile',
              oldEmail: currentUser.email,
              newEmail: newEmail,
              newPhone: newPhone,
              newAddress: newAddr
            })
        });
    }
    // Update local user
    currentUser.email = newEmail;
    currentUser.phone = newPhone;
    currentUser.address = newAddr;
    localStorage.setItem('onlymed_user', JSON.stringify(currentUser));
    
    showToast('Profile updated successfully!');
    renderProfile();
    toggleEditProfile();
  } catch(e) {
    console.error("Error updating profile", e);
    showToast('Error updating profile');
  }
  
  saveBtn.textContent = 'Save Changes';
  saveBtn.disabled = false;
}
`;

if(!js.includes('function saveProfile')) {
    js = js + '\n' + profileLogic;
}

// Ensure Profile rendering runs on showPage
if(!js.includes("if(page==='profile')renderProfile();")) {
    js = js.replace("if(page==='admin')", "if(page==='profile')renderProfile();\n  if(page==='admin')");
}

// Update placeOrder to use action='order' and save currentUser
const newPlaceOrderCode = `
  const orderData = {
    action: 'order',
    name: fn + ' ' + ln,
    phone: phone,
    email: email,
    password: password,
    address: addr + ', ' + city,
    payment: paymentMethod,
    products: productsStr,
    total: totalAmount
  };
`;
js = js.replace(/const orderData = {[\s\S]*?total: totalAmount\n\s*};/, newPlaceOrderCode);

const saveUserCode = `
  currentUser = {
    name: fn + ' ' + ln,
    email: email,
    phone: phone,
    address: addr + ', ' + city
  };
  localStorage.setItem('onlymed_user', JSON.stringify(currentUser));
  document.getElementById('navProfileBtn').style.display = 'inline-block';
`;
js = js.replace(`orderCount++;`, saveUserCode + `\n  orderCount++;`);

// On page load initialization
if(!js.includes('window.addEventListener("DOMContentLoaded"')) {
  js = js + `\nwindow.addEventListener("DOMContentLoaded", () => {
  renderCartBadge();
  if(currentUser) {
    document.getElementById('navProfileBtn').style.display = 'inline-block';
  }
});\n`;
}

fs.writeFileSync('e:/Downloads/ONLYMED/js/main.js', js);
console.log('Profile features and LocalStorage added.');
