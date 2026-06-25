const fs = require('fs');

let html = fs.readFileSync('e:/Downloads/ONLYMED/index.html', 'utf8');

// Replace Text
html = html.replace(/CareShop/g, 'ONLYMED');
html = html.replace(/careshop/g, 'onlymed');

// Replace Colors
html = html.replace(/--pk:#e8547a;--pk2:#f07fa0;--pk3:#fce8ee;--pk4:#fff0f4;--pk5:#fdf6f8;/g, '--pk:#E51D2A;--pk2:#ff4d4d;--pk3:#ffebee;--pk4:#fff5f5;--pk5:#fffafa;');
html = html.replace(/--dark:#1a0a10;--dark2:#3d1a26;/g, '--dark:#111111;--dark2:#333333;');

// Replace Logo in Navbar
const oldLogo = `<div class="logo-icon"><i class="fa fa-heart-pulse"></i></div>
      <div>
        <div class="logo-text">ONLYMED</div>
        <span class="logo-sub" id="nav-tagline">Healthcare & Wellness</span>
      </div>`;
const newLogo = `<img src="ONLYMED Logo RGB AI.png" alt="ONLYMED Logo" style="height: 48px; object-fit: contain;">`;
html = html.replace(oldLogo, newLogo);

// Replace Footer Logo
const oldFooterLogo = `<div class="logo-icon"><i class="fa fa-heart-pulse"></i></div>
          <div>
            <div class="logo-text">ONLYMED</div>
          </div>`;
const newFooterLogo = `<img src="ONLYMED Logo RGB AI.png" alt="ONLYMED Logo" style="height: 48px; object-fit: contain; filter: brightness(0) invert(1);">`;
html = html.replace(oldFooterLogo, newFooterLogo);

// Extract CSS
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
    fs.writeFileSync('e:/Downloads/ONLYMED/style.css', styleMatch[1].trim());
    html = html.replace(styleMatch[0], '<link rel="stylesheet" href="style.css">');
}

// Extract JS
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
    fs.writeFileSync('e:/Downloads/ONLYMED/script.js', scriptMatch[1].trim());
    html = html.replace(scriptMatch[0], '<script src="script.js"></script>');
}

fs.writeFileSync('e:/Downloads/ONLYMED/index.html', html);
console.log("Refactoring complete with Node.");
