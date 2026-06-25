const fs = require('fs');

// 1. FIX INDEX.HTML
let html = fs.readFileSync('e:/Downloads/ONLYMED/index.html', 'utf8');

// Fix Arabic button
html = html.replace('onclick="toggleLang()"', 'onclick="toggleLanguage()"');

// Fix Login button
html = html.replace('onclick="openLoginModal()"', "onclick=\"window.location.href='login.html'\"");

// Fix Admin button
html = html.replace("onclick=\"showPage('admin')\"", "onclick=\"window.location.href='admin.html'\"");

fs.writeFileSync('e:/Downloads/ONLYMED/index.html', html);


// 2. FIX MAIN.JS
let js = fs.readFileSync('e:/Downloads/ONLYMED/js/main.js', 'utf8');

// Fix the null pointer exception for lang button
if (js.includes("document.getElementById('nav-lang').addEventListener")) {
    js = js.replace("document.getElementById('nav-lang').addEventListener", "document.getElementById('langBtn').addEventListener");
} else {
    // If it wasn't there at all, we don't need to add it because we added onclick in HTML
}

// Ensure the ID in toggleLanguage updates langBtn
js = js.replace("document.getElementById('nav-lang').innerText =", "document.getElementById('langBtn').innerText =");

fs.writeFileSync('e:/Downloads/ONLYMED/js/main.js', js);
console.log("Fixed broken buttons and JS null pointer crash");
