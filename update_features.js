const fs = require('fs');

// 1. Update JS
let js = fs.readFileSync('e:/Downloads/ONLYMED/js/main.js', 'utf8');

// Replace currency
js = js.replace(/\$\$\{/g, '{'); // Removes the literal $ before ${
js = js.replace(/\.toFixed\(2\)\}/g, '.toFixed(2)} EGP'); // Appends EGP after
js = js.replace(/'\$'\+/g, ''); // Fixes '$'+shipping
js = js.replace(/\+shipping\.toFixed\(2\)/g, '+(shipping.toFixed(2))+" EGP"');

// Fix translations that might have free string
// e.g. shipping===0?tr('free'):'$'+shipping.toFixed(2)
// This was handled broadly above, let's just make sure.

// 2. Update HTML (Add Password Field)
let html = fs.readFileSync('e:/Downloads/ONLYMED/index.html', 'utf8');

const emailField = `<div class="form-group"><label id="email-lbl">Email Address</label><input type="email" id="email" placeholder="john@example.com"></div>`;
const passwordField = `${emailField}
          <div class="form-group"><label id="pass-lbl">Create Password</label><input type="password" id="password" placeholder="Create a secure password">
            <small style="color: var(--gray); font-size: 11px;">You need a password to access your account later.</small>
          </div>`;

html = html.replace(emailField, passwordField);

fs.writeFileSync('e:/Downloads/ONLYMED/js/main.js', js);
fs.writeFileSync('e:/Downloads/ONLYMED/index.html', html);

console.log('Currency updated and password field added.');
