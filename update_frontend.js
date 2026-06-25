const fs = require('fs');

let html = fs.readFileSync('e:/Downloads/ONLYMED/index.html', 'utf8');

// Add Login Button to Nav
if (!html.includes('id="navLoginBtn"')) {
    html = html.replace(
        '<button class="btn-outline" style="padding: 7px 14px; font-size: 13px; margin-right: 5px; display:none;" id="navProfileBtn"',
        '<button class="btn-outline" style="padding: 7px 14px; font-size: 13px; margin-right: 5px;" id="navLoginBtn" onclick="openLoginModal()"><i class="fa fa-sign-in-alt"></i> Login</button>\n      <button class="btn-outline" style="padding: 7px 14px; font-size: 13px; margin-right: 5px; display:none;" id="navProfileBtn"'
    );
}

// Add Logout to Profile Modal
if (!html.includes('onclick="logoutUser()"')) {
    html = html.replace(
        '<button class="btn-primary" onclick="toggleEditProfile()" style="margin-top:20px;width:100%">Edit Profile</button>',
        '<button class="btn-primary" onclick="toggleEditProfile()" style="margin-top:20px;width:100%;margin-bottom:10px;">Edit Profile</button>\n          <button class="btn-outline" onclick="logoutUser()" style="width:100%">Logout</button>'
    );
}

// Add Modals at bottom of body
const modals = `
<!-- LOGIN MODAL -->
<div class="modal" id="loginModal">
  <div class="modal-content" style="max-width:400px;">
    <span class="modal-close" onclick="closeLoginModal()">&times;</span>
    <h3 style="margin-bottom:20px;">Login</h3>
    <div class="form-group">
      <label>Email Address</label>
      <input type="email" id="loginEmail" placeholder="user@example.com">
    </div>
    <div class="form-group">
      <label>Password</label>
      <input type="password" id="loginPassword" placeholder="••••••••">
    </div>
    <button class="btn-primary" style="width:100%; margin-bottom:15px;" onclick="loginUser()">Login</button>
    <div style="text-align:center; font-size:14px;">
      <a href="#" style="color:var(--primary);" onclick="openForgotModal()">Forgot Password?</a>
    </div>
  </div>
</div>

<!-- FORGOT PASSWORD MODAL -->
<div class="modal" id="forgotModal">
  <div class="modal-content" style="max-width:400px;">
    <span class="modal-close" onclick="closeForgotModal()">&times;</span>
    <h3 style="margin-bottom:20px;">Reset Password</h3>
    <p style="font-size:13px; color:var(--gray); margin-bottom:15px;">Enter your email and phone number to verify your identity, then choose a new password.</p>
    <div class="form-group">
      <label>Email Address</label>
      <input type="email" id="forgotEmail" placeholder="user@example.com">
    </div>
    <div class="form-group">
      <label>Phone Number</label>
      <input type="text" id="forgotPhone" placeholder="01xxxxxxxxx">
    </div>
    <div class="form-group">
      <label>New Password</label>
      <input type="password" id="forgotPassword" placeholder="••••••••">
    </div>
    <button class="btn-primary" style="width:100%;" onclick="resetPassword()">Reset Password</button>
  </div>
</div>
`;

if (!html.includes('id="loginModal"')) {
    html = html.replace('</body>', modals + '\n</body>');
}

// Modify Checkout HTML to hide password if logged in
html = html.replace(
    '<div class="form-group" style="grid-column: 1 / -1;">\n              <label>Create Password <span class="required">*</span></label>\n              <input type="password" id="co-pass" required>\n              <small style="color: var(--gray); font-size: 11px;">You need a password to access your account later.</small>\n            </div>',
    '<div class="form-group" style="grid-column: 1 / -1;" id="co-pass-group">\n              <label>Create Password <span class="required">*</span></label>\n              <input type="password" id="co-pass">\n              <small style="color: var(--gray); font-size: 11px;">You need a password to access your account later.</small>\n            </div>'
);

fs.writeFileSync('e:/Downloads/ONLYMED/index.html', html);


// 2. UPDATE MAIN.JS
let js = fs.readFileSync('e:/Downloads/ONLYMED/js/main.js', 'utf8');

const jsAuthLogic = `
// ================== AUTHENTICATION & SECURITY ==================
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

function openLoginModal() {
  document.getElementById('loginModal').style.display = 'flex';
}
function closeLoginModal() {
  document.getElementById('loginModal').style.display = 'none';
}
function openForgotModal() {
  closeLoginModal();
  document.getElementById('forgotModal').style.display = 'flex';
}
function closeForgotModal() {
  document.getElementById('forgotModal').style.display = 'none';
}

async function loginUser() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPassword').value.trim();
  
  if(!email || !pass) return showToast('Please enter email and password');
  
  showToast('Logging in...');
  const passwordHash = await hashPassword(pass);
  
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {'Content-Type': 'text/plain'},
        body: JSON.stringify({ action: 'login', email, passwordHash })
    });
    // With no-cors we can't read JSON response if deployed incorrectly, but we assume it's Anyone so it should work if deployed right.
    // Actually, Apps Script doPost returns a 302 redirect. Fetch follows it and returns a 200 opaque response if CORS fails, or 200 OK with JSON if CORS succeeds.
    // To read response we need CORS enabled. ContentService does enable CORS.
    const data = await res.json();
    if(data.status === 'success') {
      localStorage.setItem('user', JSON.stringify(data.user));
      closeLoginModal();
      showToast('Logged in successfully!');
      updateNav();
      
      // If on checkout, auto-fill
      if(document.getElementById('co-name')) {
        document.getElementById('co-name').value = data.user.name;
        document.getElementById('co-phone').value = data.user.phone;
        document.getElementById('co-email').value = data.user.email;
        document.getElementById('co-address').value = data.user.address;
      }
    } else {
      showToast(data.message || 'Login failed');
    }
  } catch(e) {
    showToast('Login failed. Please check credentials.');
  }
}

function logoutUser() {
  localStorage.removeItem('user');
  showToast('Logged out');
  hidePage('profile');
  updateNav();
}

async function resetPassword() {
  const email = document.getElementById('forgotEmail').value.trim();
  const phone = document.getElementById('forgotPhone').value.trim();
  const pass = document.getElementById('forgotPassword').value.trim();
  
  if(!email || !phone || !pass) return showToast('Please fill all fields');
  
  showToast('Verifying...');
  const newPasswordHash = await hashPassword(pass);
  
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {'Content-Type': 'text/plain'},
        body: JSON.stringify({ action: 'resetPassword', email, phone, newPasswordHash })
    });
    const data = await res.json();
    if(data.status === 'success') {
      closeForgotModal();
      showToast('Password reset successful! Please login.');
      openLoginModal();
    } else {
      showToast(data.message || 'Verification failed');
    }
  } catch(e) {
    showToast('Reset failed. Please try again.');
  }
}
`;

if (!js.includes('function openLoginModal')) {
    js = js.replace('function updateNav() {', jsAuthLogic + '\nfunction updateNav() {');
}

// Update updateNav to toggle login button
js = js.replace(
    "document.getElementById('navProfileBtn').style.display='inline-block';",
    "document.getElementById('navProfileBtn').style.display='inline-block';\n      if(document.getElementById('navLoginBtn')) document.getElementById('navLoginBtn').style.display='none';"
);
js = js.replace(
    "document.getElementById('navProfileBtn').style.display='none';",
    "document.getElementById('navProfileBtn').style.display='none';\n      if(document.getElementById('navLoginBtn')) document.getElementById('navLoginBtn').style.display='inline-block';"
);

// Update placeOrder flow
// It should check if user is logged in, hide password, and send hashed password
// Currently placeOrder is inline in HTML script tag or main.js? It's in main.js
if (!js.includes('await hashPassword(pass)')) {
    js = js.replace(
        "const pass=document.getElementById('co-pass').value.trim();",
        "let pass='';\n  const u=JSON.parse(localStorage.getItem('user'));\n  if(!u) {\n    pass=document.getElementById('co-pass').value.trim();\n    if(!pass) return alert(tr('fill_fields'));\n  }"
    );
    
    js = js.replace(
        "if(!name||!phone||!email||!address||!pass)",
        "if(!name||!phone||!email||!address)"
    );
    
    js = js.replace(
        "password:pass,",
        "passwordHash: u ? null : await hashPassword(pass),"
    );
}

// Hide password group in checkout if logged in
const checkoutInit = `
  const u=JSON.parse(localStorage.getItem('user'));
  if(u) {
    document.getElementById('co-name').value=u.name||'';
    document.getElementById('co-phone').value=u.phone||'';
    document.getElementById('co-email').value=u.email||'';
    document.getElementById('co-address').value=u.address||'';
    if(document.getElementById('co-pass-group')) {
        document.getElementById('co-pass-group').style.display='none';
    }
  }
`;

if (!js.includes("document.getElementById('co-pass-group').style.display='none';")) {
    js = js.replace(
        "document.getElementById('oscItems').innerHTML",
        checkoutInit + "\n  document.getElementById('oscItems').innerHTML"
    );
}

fs.writeFileSync('e:/Downloads/ONLYMED/js/main.js', js);
console.log("Frontend logic updated");
