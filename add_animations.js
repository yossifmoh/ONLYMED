const fs = require('fs');

// 1. ADD CSS ANIMATIONS TO STYLE.CSS
let css = fs.readFileSync('e:/Downloads/ONLYMED/css/style.css', 'utf8');
const animationCSS = `
/* --- SCROLL ANIMATIONS --- */
.animate-on-scroll {
  opacity: 0;
  transition: opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: opacity, transform;
}
.slide-up { transform: translateY(40px); }
.slide-in-left { transform: translateX(-40px); }
.slide-in-right { transform: translateX(40px); }
.zoom-in { transform: scale(0.95); }

/* When element comes into view */
.animate-on-scroll.is-visible {
  opacity: 1;
  transform: translate(0) scale(1);
}

/* Staggering delays for lists/grids */
.delay-100 { transition-delay: 100ms; }
.delay-200 { transition-delay: 200ms; }
.delay-300 { transition-delay: 300ms; }
.delay-400 { transition-delay: 400ms; }
.delay-500 { transition-delay: 500ms; }

/* Enhanced Hover States */
.prod-card { transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease; }
.prod-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 15px 35px rgba(232,84,122,0.15); }
.btn-primary, .btn-outline, .btn-buy, .btn-auth { transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
.btn-primary:active, .btn-buy:active, .btn-auth:active { transform: scale(0.96); }
`;
if (!css.includes('.animate-on-scroll')) {
  fs.writeFileSync('e:/Downloads/ONLYMED/css/style.css', css + '\n' + animationCSS);
}

// 2. ADD INTERSECTION OBSERVER TO MAIN.JS
let mainJs = fs.readFileSync('e:/Downloads/ONLYMED/js/main.js', 'utf8');
const observerJs = `
// --- ANIMATION OBSERVER ---
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target); // Only animate once
    }
  });
}, observerOptions);

function initScrollAnimations() {
  document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    observer.observe(el);
  });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initScrollAnimations, 100);
});
`;

if (!mainJs.includes('IntersectionObserver')) {
  // Inject at the end of file
  mainJs += '\n' + observerJs;
  
  // Also hook into render functions to observe dynamic content
  mainJs = mainJs.replace(/function renderProducts\(data\) \{/, 'function renderProducts(data) {\n');
  mainJs = mainJs.replace(/productsContainer\.innerHTML = html;/, 'productsContainer.innerHTML = html;\n  setTimeout(initScrollAnimations, 50);');
  
  // Add animation classes to the generated product HTML
  mainJs = mainJs.replace(/<div class="prod-card"/g, '<div class="prod-card animate-on-scroll slide-up"');
  
  fs.writeFileSync('e:/Downloads/ONLYMED/js/main.js', mainJs);
}

// 3. UPDATE INDEX.HTML WITH ANIMATION CLASSES
let indexHtml = fs.readFileSync('e:/Downloads/ONLYMED/index.html', 'utf8');

// Hero elements
indexHtml = indexHtml.replace(/class="hero-badge"/g, 'class="hero-badge animate-on-scroll slide-up"');
indexHtml = indexHtml.replace(/class="hero-title"/g, 'class="hero-title animate-on-scroll slide-up delay-100"');
indexHtml = indexHtml.replace(/class="hero-sub"/g, 'class="hero-sub animate-on-scroll slide-up delay-200"');
indexHtml = indexHtml.replace(/class="hero-cta"/g, 'class="hero-cta animate-on-scroll slide-up delay-300"');

// Hero Visual Cards (already have float, let's wrap them or add slide-in)
indexHtml = indexHtml.replace(/class="hero-visual"/g, 'class="hero-visual animate-on-scroll slide-in-right delay-200"');

// Stats
indexHtml = indexHtml.replace(/class="stat-item"/g, 'class="stat-item animate-on-scroll zoom-in"');

// Sections
indexHtml = indexHtml.replace(/class="sec-header"/g, 'class="sec-header animate-on-scroll slide-up"');

// Categories
indexHtml = indexHtml.replace(/class="cat-card"/g, 'class="cat-card animate-on-scroll zoom-in"');

// Static info sections (like About)
indexHtml = indexHtml.replace(/class="info-img"/g, 'class="info-img animate-on-scroll slide-in-left"');
indexHtml = indexHtml.replace(/class="info-text"/g, 'class="info-text animate-on-scroll slide-in-right"');

// Footer
indexHtml = indexHtml.replace(/class="footer-grid"/g, 'class="footer-grid animate-on-scroll slide-up"');

fs.writeFileSync('e:/Downloads/ONLYMED/index.html', indexHtml);

// 4. UPDATE LOGIN.HTML
let loginHtml = fs.readFileSync('e:/Downloads/ONLYMED/login.html', 'utf8');
if (!loginHtml.includes('animate-on-scroll')) {
  // Inject the CSS directly into login since it doesn't load style.css for animations maybe
  // Actually style.css is loaded!
  loginHtml = loginHtml.replace(/<div class="auth-box">/, '<div class="auth-box animate-on-scroll slide-up is-visible">');
  // Add a quick script to trigger it
  const loginScript = `
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelector('.auth-box').classList.add('is-visible');
    });
  </script>
</body>`;
  loginHtml = loginHtml.replace(/<\/body>/, loginScript);
  fs.writeFileSync('e:/Downloads/ONLYMED/login.html', loginHtml);
}

// 5. UPDATE ADMIN.HTML
let adminHtml = fs.readFileSync('e:/Downloads/ONLYMED/admin.html', 'utf8');
if (!adminHtml.includes('animate-on-scroll')) {
  // Add CSS inside admin.html style block
  const adminCSS = `
    .animate-on-scroll { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
    .animate-on-scroll.is-visible { opacity: 1; transform: translateY(0); }
    .delay-100 { transition-delay: 100ms; }
    .delay-200 { transition-delay: 200ms; }
    .delay-300 { transition-delay: 300ms; }
    .card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
    .card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
    .nav-item { transition: all 0.3s ease; }
    .panel { opacity: 0; animation: fadeInPanel 0.8s ease forwards; }
    @keyframes fadeInPanel { to { opacity: 1; } }
  `;
  adminHtml = adminHtml.replace(/<\/style>/, adminCSS + '\n  </style>');
  
  // Add classes to cards
  adminHtml = adminHtml.replace(/<div class="card">/g, '<div class="card animate-on-scroll is-visible">');
  
  // Add quick trigger
  const adminScript = `
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        document.querySelectorAll('.animate-on-scroll').forEach(el => el.classList.add('is-visible'));
      }, 100);
    });
  `;
  adminHtml = adminHtml.replace(/<script>/, '<script>\n' + adminScript);
  fs.writeFileSync('e:/Downloads/ONLYMED/admin.html', adminHtml);
}

console.log("Animations successfully applied to the entire project.");
