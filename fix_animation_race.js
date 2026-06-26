const fs = require('fs');

// 1. FIX MAIN.JS
let mainJs = fs.readFileSync('e:/Downloads/ONLYMED/js/main.js', 'utf8');
mainJs = mainJs.replace(/document\.addEventListener\('DOMContentLoaded', \(\) => \{\s*setTimeout\(initScrollAnimations, 100\);\s*\}\);/g, `
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { setTimeout(initScrollAnimations, 100); });
} else {
  setTimeout(initScrollAnimations, 100);
}
`);
fs.writeFileSync('e:/Downloads/ONLYMED/js/main.js', mainJs);


// 2. FIX LOGIN.HTML
let loginHtml = fs.readFileSync('e:/Downloads/ONLYMED/login.html', 'utf8');
loginHtml = loginHtml.replace(/document\.addEventListener\('DOMContentLoaded', \(\) => \{\s*document\.querySelector\('\.auth-box'\)\.classList\.add\('is-visible'\);\s*\}\);/g, `
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { document.querySelector('.auth-box').classList.add('is-visible'); });
} else {
  document.querySelector('.auth-box').classList.add('is-visible');
}
`);
fs.writeFileSync('e:/Downloads/ONLYMED/login.html', loginHtml);


// 3. FIX ADMIN.HTML
let adminHtml = fs.readFileSync('e:/Downloads/ONLYMED/admin.html', 'utf8');
adminHtml = adminHtml.replace(/document\.addEventListener\('DOMContentLoaded', \(\) => \{\s*setTimeout\(\(\) => \{\s*document\.querySelectorAll\('\.animate-on-scroll'\)\.forEach\(el => el\.classList\.add\('is-visible'\)\);\s*\}, 100\);\s*\}\);/g, `
function showAdminAnimations() {
  setTimeout(() => {
    document.querySelectorAll('.animate-on-scroll').forEach(el => el.classList.add('is-visible'));
  }, 100);
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', showAdminAnimations);
} else {
  showAdminAnimations();
}
`);
fs.writeFileSync('e:/Downloads/ONLYMED/admin.html', adminHtml);

console.log("Fixed DOMContentLoaded race conditions");
