const fs = require('fs');

let js = fs.readFileSync('e:/Downloads/ONLYMED/js/main.js', 'utf8');

// 1. Remove hardcoded products and categories
// We will replace everything from `const products = [` to `// ================== STATE ==================`
const stateIndex = js.indexOf('// ================== STATE ==================');
const productsIndex = js.indexOf('const products = [');

if (productsIndex !== -1 && stateIndex !== -1) {
    const dataSection = `// ================== DYNAMIC DATA ==================
let products = [];
let categories = [];
let dynamicContent = {}; // Stores {key: {en, ar}}
`;
    js = js.substring(0, productsIndex) + dataSection + js.substring(stateIndex);
}

// 2. Update toggleLanguage logic
// Find the toggle language button if it exists or add the function
const toggleLangFunc = `
function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'ar' : 'en';
  document.getElementById('nav-lang').innerText = currentLang === 'en' ? 'عربي' : 'English';
  document.body.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  applyDynamicContent();
  renderProducts();
}
`;
// Let's just append it if not already there
if(!js.includes('function toggleLanguage()')) {
    js += toggleLangFunc;
}

// 3. Update fetchWebsiteContent to fetch both content and products
const newFetchLogic = `
async function fetchWebsiteContent() {
  try {
    // Fetch Content
    const cRes = await fetch(GOOGLE_SCRIPT_URL + '?type=content');
    dynamicContent = await cRes.json();
    applyDynamicContent();
    
    // Fetch Products
    const pRes = await fetch(GOOGLE_SCRIPT_URL + '?type=products');
    products = await pRes.json();
    
    // Auto-generate categories based on products
    let catMap = {};
    products.forEach(p => {
      if(!catMap[p.category]) catMap[p.category] = { name: p.category, nameAr: p.category, count: 0, emoji: '📦' };
      catMap[p.category].count++;
    });
    categories = Object.values(catMap);
    
    renderProducts();
  } catch (e) {
    console.error("Error fetching dynamic data:", e);
  }
}

function applyDynamicContent() {
  for (const key in dynamicContent) {
    const el = document.getElementById(key);
    if (el) {
      el.innerHTML = dynamicContent[key][currentLang];
    }
  }
}
`;

// Replace the old fetchWebsiteContent
js = js.replace(/async function fetchWebsiteContent\(\) \{[\s\S]*?\}\n/m, newFetchLogic);

// 4. Update renderProducts to use currentLang
// We need to find `p.name` and replace with `(currentLang === 'ar' && p.name_ar ? p.name_ar : p.name_en)`
// But since the old hardcoded array used `p.name` and `p.desc`, let's just intercept inside renderProducts or map the array.
// Mapping the array is much safer!
const renderProductsFix = `
  // Map dynamic products to the old format expected by the UI
  const displayProducts = products.map(p => ({
    ...p,
    name: currentLang === 'ar' && p.name_ar ? p.name_ar : p.name_en,
    desc: currentLang === 'ar' && p.desc_ar ? p.desc_ar : p.desc_en,
  }));
  const list = displayProducts;
`;

// Replace the `const list = products;` or similar inside renderProducts
js = js.replace('const list = Array.isArray(products) ? products : [];', renderProductsFix);
js = js.replace('const list = products;', renderProductsFix);

// Find the products map in viewProductDetails
const viewProductFix = `
function viewProductDetails(id) {
  currentProduct = products.find(p => p.id == id);
  if(!currentProduct) return;
  // Map to current lang
  currentProduct.name = currentLang === 'ar' && currentProduct.name_ar ? currentProduct.name_ar : currentProduct.name_en;
  currentProduct.desc = currentLang === 'ar' && currentProduct.desc_ar ? currentProduct.desc_ar : currentProduct.desc_en;
`;
js = js.replace(/function viewProductDetails\(id\) \{[\s\S]*?if\(!currentProduct\) return;/m, viewProductFix);

// Link the language button in nav
js = js.replace("document.getElementById('nav-lang').addEventListener('click', (e) => {", 
"document.getElementById('nav-lang').addEventListener('click', (e) => { e.preventDefault(); toggleLanguage();");

fs.writeFileSync('e:/Downloads/ONLYMED/js/main.js', js);
console.log("Updated main.js for dynamic products and bilingual support");
