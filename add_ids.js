const fs = require('fs');

let html = fs.readFileSync('e:/Downloads/ONLYMED/index.html', 'utf8');

// List of replacements to add IDs
const replacements = [
  // Nav
  ['>Home</a>', ' id="nav-home">Home</a>'],
  ['>Products</a>', ' id="nav-products">Products</a>'],
  ['>About</a>', ' id="nav-about">About</a>'],
  ['>Contact</a>', ' id="nav-contact">Contact</a>'],
  ['placeholder="Search products..."', 'id="search-placeholder" placeholder="Search products..."'],
  ['>عربي</a>', ' id="nav-lang">عربي</a>'],
  
  // Hero
  ['>TRUSTED HEALTHCARE PRODUCTS</span>', ' id="hero-tag">TRUSTED HEALTHCARE PRODUCTS</span>'],
  ['>Your Health, <span>Our Priority</span></h1>', '><span id="hero-title-1">Your Health, </span><span id="hero-title-2">Our Priority</span></h1>'],
  ['>Premium quality healthcare products for you and your family.<br>Sourced from certified medical suppliers.</p>', ' id="hero-desc">Premium quality healthcare products for you and your family.<br>Sourced from certified medical suppliers.</p>'],
  ['>Shop Now</button>', ' id="hero-btn-shop">Shop Now</button>'],
  ['>Learn More</button>', ' id="hero-btn-learn">Learn More</button>'],
  ['>Happy Customers</div>', ' id="hero-stat-1">Happy Customers</div>'],
  ['>Products</div>', ' id="hero-stat-2">Products</div>'],
  ['>Satisfaction Rate</div>', ' id="hero-stat-3">Satisfaction Rate</div>'],
  ['>Premium Vitamins<', ' id="hero-badge-1-title">Premium Vitamins<'],
  ['>Certified Quality<', ' id="hero-badge-1-desc">Certified Quality<'],
  ['>Medical Grade<', ' id="hero-badge-2-title">Medical Grade<'],
  ['>Trusted Brands<', ' id="hero-badge-2-desc">Trusted Brands<'],
  ['>Natural Formula<', ' id="hero-badge-3-title">Natural Formula<'],

  // Categories
  ['>Shop by Category</h2>', ' id="cat-title">Shop by Category</h2>'],
  ['>Find what you need quickly</p>', ' id="cat-desc">Find what you need quickly</p>'],

  // Featured
  ['>Featured Products</h2>', ' id="feat-title">Featured Products</h2>'],
  ['>Our top picks for your health</p>', ' id="feat-desc">Our top picks for your health</p>'],
  ['>View All &rarr;</a>', ' id="feat-view-all">View All &rarr;</a>'],
  
  // Best Sellers
  ['>Best Sellers</h2>', ' id="best-title">Best Sellers</h2>'],
  ['>Most loved by our customers</p>', ' id="best-desc">Most loved by our customers</p>'],
  ['>View All &rarr;</a>', ' id="best-view-all">View All &rarr;</a>'],

  // Features Banner (Footer Top)
  ['>Free Shipping</h3>', ' id="feat-1-title">Free Shipping</h3>'],
  ['>On orders over $50</p>', ' id="feat-1-desc">On orders over $50</p>'],
  ['>Certified Products</h3>', ' id="feat-2-title">Certified Products</h3>'],
  ['>FDA Approved</p>', ' id="feat-2-desc">FDA Approved</p>'],
  ['>30 Day Returns</h3>', ' id="feat-3-title">30 Day Returns</h3>'],
  ['>Easy returns policy</p>', ' id="feat-3-desc">Easy returns policy</p>'],
  ['>24/7 Support</h3>', ' id="feat-4-title">24/7 Support</h3>'],
  ['>Always here to help</p>', ' id="feat-4-desc">Always here to help</p>'],

  // Footer Main
  ['>Your trusted online destination for premium healthcare products. Quality, certified, delivered.</p>', ' id="footer-desc">Your trusted online destination for premium healthcare products. Quality, certified, delivered.</p>'],
  ['>SHOP</h4>', ' id="footer-col-1">SHOP</h4>'],
  ['>All Products</a>', ' id="footer-link-1">All Products</a>'],
  ['>Vitamins</a>', ' id="footer-link-2">Vitamins</a>'],
  ['>Supplements</a>', ' id="footer-link-3">Supplements</a>'],
  ['>First Aid</a>', ' id="footer-link-4">First Aid</a>'],
  ['>COMPANY</h4>', ' id="footer-col-2">COMPANY</h4>'],
  ['>About Us</a>', ' id="footer-link-5">About Us</a>'],
  ['>Contact</a>', ' id="footer-link-6">Contact</a>'],
  ['>Careers</a>', ' id="footer-link-7">Careers</a>'],
  ['>Blog</a>', ' id="footer-link-8">Blog</a>'],
  ['>SUPPORT</h4>', ' id="footer-col-3">SUPPORT</h4>'],
  ['>FAQ</a>', ' id="footer-link-9">FAQ</a>'],
  ['>Shipping Info</a>', ' id="footer-link-10">Shipping Info</a>'],
  ['>Returns</a>', ' id="footer-link-11">Returns</a>'],
  ['>Track Order</a>', ' id="footer-link-12">Track Order</a>'],
  ['>&copy; 2025 ONLYMED. All rights reserved.</p>', ' id="footer-copy">&copy; 2026 ONLYMED. All rights reserved.</p>']
];

let modifiedHtml = html;
replacements.forEach(([search, replace]) => {
  // Only replace if the ID is not already there
  if (!modifiedHtml.includes(replace)) {
      modifiedHtml = modifiedHtml.replace(search, replace);
  }
});

fs.writeFileSync('e:/Downloads/ONLYMED/index.html', modifiedHtml);
console.log("Added IDs to HTML elements successfully.");
