const fs = require('fs');

let js = fs.readFileSync('e:/Downloads/ONLYMED/js/main.js', 'utf8');

const contentLogic = `
// ================== WEBSITE CONTENT MANAGEMENT ==================
async function fetchWebsiteContent() {
  try {
    if(GOOGLE_SCRIPT_URL === "YOUR_GOOGLE_SCRIPT_URL_HERE") return;
    
    // Fetch JSON from Google Apps Script (GET request)
    const res = await fetch(GOOGLE_SCRIPT_URL);
    const content = await res.json();
    
    // Replace text in HTML based on Keys from Google Sheet
    // Expected keys in sheet: heroTitle, heroSub, aboutUs, etc.
    if(content.heroTitle) {
      const heroTitleEl = document.querySelector('.hero-content h1');
      if(heroTitleEl) heroTitleEl.innerHTML = content.heroTitle;
    }
    if(content.heroSub) {
      const heroSubEl = document.querySelector('.hero-content p');
      if(heroSubEl) heroSubEl.innerHTML = content.heroSub;
    }
    
    // For other generic elements, if they have an ID matching the key
    for (const [key, value] of Object.entries(content)) {
      const el = document.getElementById(key);
      if (el && value) {
        el.innerHTML = value;
      }
    }
    console.log("Website content loaded from Google Sheets");
  } catch(e) {
    console.error("Error fetching content from Google Sheets:", e);
  }
}
`;

if (!js.includes('fetchWebsiteContent')) {
    js = js + '\n' + contentLogic;
    
    // Call it on load
    js = js.replace(
        'window.addEventListener("DOMContentLoaded", () => {',
        'window.addEventListener("DOMContentLoaded", () => {\n  fetchWebsiteContent();'
    );
}

fs.writeFileSync('e:/Downloads/ONLYMED/js/main.js', js);
console.log('Website content management script added.');
