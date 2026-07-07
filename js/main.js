// ================== DATA ==================
// ================== DYNAMIC DATA ==================
let products = [];
let categories = [];
let dynamicContent = {}; // Stores {key: {en, ar}}

function formatDriveImageUrl(url) {
  if (!url || url.trim() === '') return '';
  const raw = url.trim();

  const idMatch =
    raw.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    raw.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
    raw.match(/\/d\/([a-zA-Z0-9_-]+)/);

  if (raw.includes('drive.google.com') && idMatch && idMatch[1]) {
    const fileId = idMatch[1];
    const finalUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w800-h800`;
    console.log('[Image] Raw URL from API:', raw);
    console.log('[Image] Extracted Drive ID:', fileId);
    console.log('[Image] Final <img> src:', finalUrl);
    return finalUrl;
  }

  console.log('[Image] Non-Drive URL, used as-is:', raw);
  return raw;
}

async function hashStr(str) {
  const msgUint8 = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
// ================== STATE ==================
let cart=[];
let currentUser = JSON.parse(localStorage.getItem('onlymed_user')) || null;
// load cart from localstorage
let savedCart = localStorage.getItem('onlymed_cart');
if(savedCart) { try { cart = JSON.parse(savedCart); } catch(e){} }

let currentLang='en';
let currentProduct=null;
let detailQty=1;
let prevPage='home';
let currentAdmin='overview';
let chartsInitialized=false;
const sampleOrders=[
  {id:'CS-001',customer:'Sarah Johnson',products:'Vitamin C 1000mg × 2',total:49.98,date:'2025-05-28',status:'Completed',payment:'Paid'},
  {id:'CS-002',customer:'Ahmed Al-Rashid',products:'Omega-3 Fish Oil × 1',total:29.99,date:'2025-05-27',status:'Processing',payment:'Paid'},
  {id:'CS-003',customer:'Emily Chen',products:'Blood Pressure Monitor × 1',total:79.99,date:'2025-05-26',status:'Completed',payment:'Paid'},
  {id:'CS-004',customer:'Mohamed Hassan',products:'First Aid Kit Pro × 1',total:49.99,date:'2025-05-25',status:'Pending',payment:'COD'},
  {id:'CS-005',customer:'Lisa Martinez',products:'Vitamin D3+K2 × 2, Collagen × 1',total:79.97,date:'2025-05-24',status:'Completed',payment:'Paid'},
  {id:'CS-006',customer:'James Wilson',products:'Thermometer Pro × 1',total:34.99,date:'2025-05-23',status:'Processing',payment:'Paid'},
  {id:'CS-007',customer:'Fatima Al-Said',products:'Probiotic 50B × 2',total:89.98,date:'2025-05-22',status:'Cancelled',payment:'Refunded'},
  {id:'CS-008',customer:'David Park',products:'Pulse Oximeter × 1',total:39.99,date:'2025-05-21',status:'Completed',payment:'Paid'},
];
let orderCount=sampleOrders.length;

// ================== TRANSLATIONS ==================
const t={
  en:{
    home:'Home',products:'Products',about:'About',contact:'Contact',
    searchPh:'Search products...',cartTitle:'Shopping Cart',
    addCart:'Added to cart!',viewDetails:'View Details',addToCart:'Add to Cart',buyNow:'Buy Now',
    backLbl:'Back',keyBenefits:'Key Benefits',quantity:'Quantity:',
    checkout:'Proceed to Checkout',placeOrder:'Place Order',
    customerInfo:'Customer Information',shippingAddr:'Shipping Address',
    payMethod:'Payment Method',orderSummary:'Order Summary',
    fname:'First Name',lname:'Last Name',phone:'Phone Number',email:'Email Address',
    address:'Street Address',city:'City',zip:'ZIP Code',
    payCard:'Credit / Debit Card',payCOD:'Cash on Delivery',payWallet:'Digital Wallet',
    subtotal:'Subtotal',shipping:'Shipping',discount:'Discount',total:'Total',
    orderSuccess:'Order Placed Successfully!',
    orderThank:'Thank you for your purchase. Your order has been confirmed and will be delivered soon.',
    continueShopping:'Continue Shopping',emptyCart:'Your cart is empty',
    emptyCartSub:'Browse our products to get started',shopNow:'Shop Now',
    free:'FREE',hcSub:'Healthcare & Wellness',heroTitle:'Your Health, Our Priority',
    heroSub:'Premium quality healthcare products for you and your family.',
    heroBadge:'Trusted Healthcare Products',stat1:'Happy Customers',stat2:'Products',stat3:'Satisfaction Rate',
    catTitle:'Shop by Category',catSub:'Find what you need quickly',
    featTitle:'Featured Products',featSub:'Our top picks for your health',viewAll:'View All →',
    bestTitle:'Best Sellers',bestSub:'Most loved by our customers',
    atcBtn:'Add to Cart',buyBtn:'Buy Now',prodPageTitle:'All Products',prodPageSub:'Browse our complete healthcare collection',
    checkoutTitle:'Checkout',orderNum:'Order #',
    langBtn:'عربي',trust1:'Free Shipping',trust1s:'On orders over $50',trust2:'Certified Products',trust2s:'FDA Approved',
    trust3:'30 Day Returns',trust3s:'Easy returns policy',trust4:'24/7 Support',trust4s:'Always here to help',
    footDesc:"Premium women's nutritional supplements. Sourced from top-grade US ingredients at fair prices.",
    footShop:'Shop',footCompany:'About',footSupport:'Support',footCopy:'© 2025 ONLYMED. All rights reserved.',
    payCardSub:'Visa, Mastercard, Amex',payCODSub:'Pay when you receive',payWalletSub:'PayPal, Apple Pay, Google Pay',
    orderSumTitle:'Order Summary',aboutHeroTitle:'About ONLYMED',
    aboutHeroSub:'We\'re dedicated to making quality healthcare accessible to everyone, everywhere.',
    sendMsg:'Message sent! We\'ll reply within 24 hours.',
    loginBtn:'Login',profileBtn:'My Account',logoutBtn:'Logout',
    catVitamins:'Vitamins',catSupplements:'Supplements',aboutUs:'About Us',supportLink:'Support',contactUs:'Contact Us',faq:'FAQ',
    supportModalTitle:'Contact Support',supportModalSub:'Choose your preferred channel to chat with us:',
    profileTitlePage:'My Account',profileInfoSec:'Profile Information',orderHistorySec:'Order History',
    editProfileBtn:'Edit Profile',saveChangesBtn:'Save Changes',cancelBtn:'Cancel',
  },
  ar:{
    home:'الرئيسية',products:'المنتجات',about:'عن الشركة',contact:'تواصل معنا',
    searchPh:'ابحث عن منتج...',cartTitle:'سلة التسوق',
    addCart:'تمت الإضافة إلى السلة!',viewDetails:'عرض التفاصيل',addToCart:'أضف للسلة',buyNow:'اشتر الآن',
    backLbl:'رجوع',keyBenefits:'الفوائد الرئيسية',quantity:'الكمية:',
    checkout:'المتابعة للدفع',placeOrder:'تأكيد الطلب',
    customerInfo:'بيانات العميل',shippingAddr:'عنوان التوصيل',
    payMethod:'طريقة الدفع',orderSummary:'ملخص الطلب',
    fname:'الاسم الأول',lname:'اسم العائلة',phone:'رقم الهاتف',email:'البريد الإلكتروني',
    address:'عنوان الشارع',city:'المدينة',zip:'الرمز البريدي',
    payCard:'بطاقة ائتمان / خصم',payCOD:'الدفع عند الاستلام',payWallet:'محفظة رقمية',
    subtotal:'المجموع الفرعي',shipping:'التوصيل',discount:'الخصم',total:'الإجمالي',
    orderSuccess:'تم تقديم الطلب بنجاح!',
    orderThank:'شكراً لشرائكم. تم تأكيد طلبكم وسيتم توصيله قريباً.',
    continueShopping:'متابعة التسوق',emptyCart:'السلة فارغة',
    emptyCartSub:'تصفح منتجاتنا للبدء',shopNow:'تسوق الآن',
    free:'مجاني',hcSub:'الرعاية الصحية والعافية',heroTitle:'صحتك، أولويتنا',
    heroSub:'منتجات صحية عالية الجودة لك ولعائلتك.',
    heroBadge:'منتجات صحية موثوقة',stat1:'عميل سعيد',stat2:'منتج',stat3:'نسبة الرضا',
    catTitle:'تسوق حسب الفئة',catSub:'ابحث عن ما تحتاجه بسرعة',
    featTitle:'منتجات مميزة',featSub:'أفضل اختياراتنا لصحتك',viewAll:'عرض الكل →',
    bestTitle:'الأكثر مبيعاً',bestSub:'الأكثر حباً من عملائنا',
    atcBtn:'أضف للسلة',buyBtn:'اشتر الآن',prodPageTitle:'جميع المنتجات',prodPageSub:'تصفح مجموعتنا الكاملة',
    checkoutTitle:'إتمام الشراء',orderNum:'الطلب #',
    langBtn:'English',trust1:'شحن مجاني',trust1s:'للطلبات أعلى من $50',trust2:'منتجات معتمدة',trust2s:'معتمدة FDA',
    trust3:'إرجاع لمدة 30 يوم',trust3s:'سياسة إرجاع سهلة',trust4:'دعم 24/7',trust4s:'دائماً هنا للمساعدة',
    footDesc:'مكملات غذائية عالية الجودة للسيدات والنساء بتركيبات أمريكية وأسعار عادلة.',
    footShop:'التسوق',footCompany:'من نحن',footSupport:'الدعم',footCopy:'© 2025 ONLYMED. جميع الحقوق محفوظة.',
    payCardSub:'فيزا، ماستركارد، أمريكان إكسبريس',payCODSub:'ادفع عند الاستلام',payWalletSub:'PayPal، Apple Pay، Google Pay',
    orderSumTitle:'ملخص الطلب',aboutHeroTitle:'عن ONLYMED',
    aboutHeroSub:'نحن ملتزمون بجعل الرعاية الصحية المتميزة في متناول الجميع.',
    sendMsg:'تم إرسال الرسالة! سنرد خلال 24 ساعة.',
    loginBtn:'تسجيل الدخول',profileBtn:'حسابي',logoutBtn:'تسجيل الخروج',
    catVitamins:'الفيتامينات',catSupplements:'المكملات',aboutUs:'من نحن',supportLink:'الدعم',contactUs:'تواصل معنا',faq:'الأسئلة الشائعة',
    supportModalTitle:'تواصل مع الدعم',supportModalSub:'اختر قناتك المفضلة للتحدث معنا:',
    profileTitlePage:'حسابي',profileInfoSec:'بيانات الحساب',orderHistorySec:'سجل المشتريات',
    editProfileBtn:'تعديل البيانات',saveChangesBtn:'حفظ التغييرات',cancelBtn:'إلغاء',
  }
};
const tr=k=>t[currentLang][k]||t.en[k]||k;

// ================== PAGES ==================
function showPage(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  document.querySelectorAll('#navLinks a').forEach(a=>{
    a.classList.toggle('active',a.getAttribute('data-key')===page);
  });
  const navLinks = document.getElementById('navLinks');
  if (navLinks) navLinks.classList.remove('open');
  if(page!=='admin'){document.getElementById('mainFooter').style.display='';document.getElementById('mainNav').style.display='';}
  else{document.getElementById('mainFooter').style.display='none';}
  if(page==='products')renderAllProducts();
  if(page==='profile')renderProfile();
  if(page==='admin'){showAdmin(currentAdmin);document.getElementById('admin-date').textContent=new Date().toLocaleDateString();}
  if(page==='home'){renderCategories();renderFeatured();renderBest();}
  if(page==='checkout')renderCheckout();
  window.scrollTo({top:0,behavior:'smooth'});
}

// ================== RENDER ==================
function productCard(p){
  const name=currentLang==='ar'?p.nameAr:p.name;
  const desc=currentLang==='ar'?p.descAr:p.desc;
  const catName=currentLang==='ar'?p.catAr:p.cat;
  const formattedImg = formatDriveImageUrl(p.image);
  const imgContent = formattedImg
    ? `<img src="${formattedImg}" class="prod-img-element" style="width:100%;height:100%;object-fit:cover;" onerror="console.warn('[Image] Failed to load:', this.src); this.onerror=null; this.src=''; this.style.display='none'; this.closest('.prod-img').textContent='${p.emoji || '📦'}'">`
    : (p.emoji || '📦');
  return `<div class="prod-card animate-on-scroll slide-up">
    ${p.badge?`<div class="prod-badge">${currentLang==='ar'&&p.badge==='Best Seller'?'الأكثر مبيعاً':currentLang==='ar'&&p.badge==='New'?'جديد':currentLang==='ar'&&p.badge==='Sale'?'خصم':currentLang==='ar'&&p.badge==='Popular'?'شائع':p.badge}</div>`:''}
    <div class="prod-img">${imgContent}</div>
    <div class="prod-body">
      <div class="prod-cat">${catName}</div>
      <div class="prod-name">${name}</div>
      <div class="prod-desc">${desc}</div>
      <div class="prod-stars">${'<i class="fa fa-star"></i>'.repeat(Math.floor(p.rating))}<span>${p.rating} (${p.reviews})</span></div>
      <div class="prod-footer">
        <div><span class="prod-price">${p.price.toFixed(2)} EGP</span>${p.oldPrice && parseFloat(p.oldPrice) > parseFloat(p.price) ?`<span class="prod-old">${p.oldPrice.toFixed(2)} EGP</span>`:''}</div>
      </div>
      <div class="prod-actions">
        <button class="btn-sm btn-view" onclick="viewProduct('${p.id}')">${tr('viewDetails')}</button>
        <button class="btn-sm btn-cart-sm" onclick="addToCart('${p.id}')"><i class="fa fa-bag-shopping"></i> ${tr('addToCart')}</button>
        <button class="btn-sm btn-buy" onclick="viewProduct('${p.id}');setTimeout(buyNow,200)">${tr('buyNow')}</button>
      </div>
    </div>
  </div>`;
}

function renderCategories(){
  document.getElementById('catsGrid').innerHTML=categories.map(c=>`
    <div class="cat-card" onclick="filterByCat('${c.name}')">
      <div class="cat-icon">${c.emoji}</div>
      <div class="cat-name">${currentLang==='ar'?c.nameAr:c.name}</div>
      <div class="cat-count">${c.count} products</div>
    </div>`).join('');
}

function renderFeatured(){
  document.getElementById('featuredGrid').innerHTML=products.filter(p=>p.featured).map(productCard).join('');
}

function renderBest(){
  document.getElementById('bestGrid').innerHTML=products.filter(p=>p.bestSeller).map(productCard).join('');
}

function renderAllProducts(list){
  const g=document.getElementById('allProductsGrid');
  const data=list||products;
  g.innerHTML=data.length?data.map(productCard).join(''):`<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--gray)">No products found.</div>`;
  // populate cat filter
  const cf=document.getElementById('catFilter');
  if(cf.options.length<=1){
    categories.forEach(c=>{const o=document.createElement('option');o.value=c.name;o.textContent=currentLang==='ar'?c.nameAr:c.name;cf.appendChild(o);});
  }
  setTimeout(initScrollAnimations, 100);
}

function filterProducts(){
  const q=(document.getElementById('prodSearch')?.value||'').toLowerCase();
  const cat=document.getElementById('catFilter')?.value||'';
  const sort=document.getElementById('sortFilter')?.value||'';
  let list=[...products];
  if(q)list=list.filter(p=>p.name.toLowerCase().includes(q)||p.desc.toLowerCase().includes(q)||p.nameAr.includes(q));
  if(cat)list=list.filter(p=>p.cat===cat);
  if(sort==='price-asc')list.sort((a,b)=>a.price-b.price);
  else if(sort==='price-desc')list.sort((a,b)=>b.price-a.price);
  else if(sort==='rating')list.sort((a,b)=>b.rating-a.rating);
  renderAllProducts(list);
}

function filterByCat(cat){
  showPage('products');
  setTimeout(()=>{document.getElementById('catFilter').value=cat;filterProducts();},100);
}

function handleSearch(q){
  if(!q)return;
  showPage('products');
  setTimeout(()=>{const el=document.getElementById('prodSearch');if(el){el.value=q;filterProducts();}},100);
}

// ================== PRODUCT DETAIL ==================
function viewProduct(id){
  currentProduct=products.find(p=>p.id===id);
  detailQty=1;
  const p=currentProduct;
  const name=currentLang==='ar'?p.nameAr:p.name;
  const desc=currentLang==='ar'?p.descAr:p.desc;
  const catName=currentLang==='ar'?p.catAr:p.cat;
  const bens=currentLang==='ar'?p.benefitsAr:p.benefits;
  if (p.image) {
    const imgSrc = formatDriveImageUrl(p.image);
    console.log('[Detail] Rendering product image src:', imgSrc);
    document.getElementById('detailImg').innerHTML = `<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--r2);" onerror="console.warn('[Image] Detail page failed to load:', this.src); this.onerror=null; this.parentElement.textContent='${p.emoji || '📦'}'">` ;
  } else {
    document.getElementById('detailImg').innerHTML = '';
    document.getElementById('detailImg').textContent = p.emoji;
  }
  document.getElementById('detailCat').textContent=catName;
  document.getElementById('detailName').textContent=name;
  document.getElementById('detailRating').innerHTML='<i class="fa fa-star" style="color:#f59e0b"></i>'.repeat(Math.floor(p.rating))+`<span>${p.rating} (${p.reviews} reviews)</span>`;
  document.getElementById('detailPrice').innerHTML=`<span class="price">${p.price.toFixed(2)} EGP</span>${p.oldPrice && parseFloat(p.oldPrice) > parseFloat(p.price) ?`<span class="old">${p.oldPrice.toFixed(2)} EGP</span>`:''}`;
  document.getElementById('detailDesc').textContent=desc;
  document.getElementById('detailBenefits').innerHTML=bens.map(b=>`<li><i class="fa fa-check-circle"></i>${b}</li>`).join('');
  document.getElementById('detailQty').textContent=detailQty;
  document.getElementById('back-lbl').textContent=tr('backLbl');
  document.getElementById('ben-title').textContent=tr('keyBenefits');
  document.getElementById('qty-lbl').textContent=tr('quantity');
  document.getElementById('atc-btn').innerHTML=`<i class="fa fa-shopping-bag"></i> ${tr('atcBtn')}`;
  document.getElementById('buy-btn').textContent=tr('buyBtn');
  document.getElementById('detailBreadcrumb').innerHTML=`<a onclick="showPage('home')">Home</a><span>›</span><a onclick="showPage('products')">Products</a><span>›</span><span>${name}</span>`;
  showPage('detail');
}

function changeDetailQty(d){
  detailQty=Math.max(1,detailQty+d);
  document.getElementById('detailQty').textContent=detailQty;
}

function addDetailToCart(){
  if(!currentProduct)return;
  for(let i=0;i<detailQty;i++)addToCart(currentProduct.id,false);
  renderCartBadge();saveCartLocally();
  showToast(tr('addCart'));
}

function goBack(){showPage('products');}

// ================== CART ==================
function addToCart(id,notify=true){
  const p=products.find(x=>x.id===id);
  const existing=cart.find(c=>c.id===id);
  if(existing)existing.qty++;
  else cart.push({...p,qty:1});
  renderCartBadge();saveCartLocally();
  if(notify)showToast(tr('addCart'));
}

function saveCartLocally() { localStorage.setItem('onlymed_cart', JSON.stringify(cart)); }
function renderCartBadge(){
  const total=cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById('cartCount').textContent=total;
}

function toggleCart(){
  const overlay=document.getElementById('cartOverlay');
  const panel=document.getElementById('cartPanel');
  const isOpen=panel.classList.contains('open');
  if(isOpen){overlay.classList.remove('open');panel.classList.remove('open');}
  else{overlay.classList.add('open');panel.classList.add('open');renderCartPanel();}
}

function renderCartPanel(){
  document.getElementById('cart-title').textContent=tr('cartTitle');
  document.getElementById('checkoutBtn').textContent=tr('checkout');
  const items=document.getElementById('cartItems');
  const foot=document.getElementById('cartFoot');
  if(!cart.length){
    items.innerHTML=`<div class="empty-cart"><i class="fa fa-shopping-bag"></i><p>${tr('emptyCart')}</p><p style="margin-top:8px;font-size:12px;color:var(--gray2)">${tr('emptyCartSub')}</p><button class="btn-primary" style="margin-top:16px" onclick="toggleCart();showPage('products')">${tr('shopNow')}</button></div>`;
    foot.style.display='none';return;
  }
  foot.style.display='block';
  items.innerHTML=cart.map(item=>{
    const name=currentLang==='ar'?item.nameAr:item.name;
    return `<div class="cart-item">
      <img src="${item.image}" alt="${name}" class="ci-img" style="object-fit: cover; border: 1px solid var(--border); background: #fdf6f8;">
      <div class="ci-info">
        <div class="ci-name">${name}</div>
        <div class="ci-price">${(item.price*item.qty).toFixed(2)} EGP</div>
        <div class="ci-qty">
          <button class="qty-btn" onclick="changeQty('${item.id}',-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}',1)">+</button>
        </div>
      </div>
      <button class="ci-remove" onclick="removeCartItem('${item.id}')"><i class="fa fa-trash"></i></button>
    </div>`;
  }).join('');
  const subtotal=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const shipping=subtotal>=50?0:5.99;
  document.getElementById('cartSummary').innerHTML=`
    <div class="cs-row"><span>${tr('subtotal')}</span><span>${subtotal.toFixed(2)} EGP</span></div>
    <div class="cs-row"><span>${tr('shipping')}</span><span>${shipping===0?tr('free'):shipping.toFixed(2)} EGP</span></div>
    <div class="cs-row total"><span>${tr('total')}</span><span>${(subtotal+shipping).toFixed(2)} EGP</span></div>`;
}

function changeQty(id,d){
  const item=cart.find(c=>c.id===id);
  if(!item)return;
  item.qty+=d;
  if(item.qty<=0)cart=cart.filter(c=>c.id!==id);
  renderCartBadge();saveCartLocally();
  renderCartPanel();
}

function removeCartItem(id){cart=cart.filter(c=>c.id!==id);renderCartBadge();saveCartLocally();renderCartPanel();}

function buyNow(){
  if(currentProduct){addToCart(currentProduct.id,false);renderCartBadge();saveCartLocally();}
  toggleCart();
  setTimeout(()=>goCheckout(),300);
}

function goCheckout(){
  if(!cart.length)return;
  const panelOpen=document.getElementById('cartPanel').classList.contains('open');
  if(panelOpen){document.getElementById('cartOverlay').classList.remove('open');document.getElementById('cartPanel').classList.remove('open');}
  showPage('checkout');
}

// ================== CHECKOUT ==================
function renderCheckout(){
  const subtotal=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const shipping=subtotal>=50?0:5.99;
  const total=subtotal+shipping;
  document.getElementById('checkout-title').textContent=tr('checkoutTitle');
  document.getElementById('customer-info-title').textContent=tr('customerInfo');
  document.getElementById('ship-title').textContent=tr('shippingAddr');
  document.getElementById('pay-title').textContent=tr('payMethod');
  document.getElementById('place-btn').textContent=tr('placeOrder');
  document.getElementById('order-sum-title').textContent=tr('orderSumTitle');
  
  const u=JSON.parse(localStorage.getItem('onlymed_user'));
  if(u) {
    const nameParts = (u.name || '').split(' ');
    const fnInput = document.getElementById('fn');
    if (fnInput) fnInput.value = nameParts[0] || '';
    const lnInput = document.getElementById('ln');
    if (lnInput) lnInput.value = nameParts.slice(1).join(' ') || '';
    
    const phoneInput = document.getElementById('phone');
    if (phoneInput) phoneInput.value = u.phone || '';
    const emailInput = document.getElementById('email');
    if (emailInput) emailInput.value = u.email || '';
    
    const addrInput = document.getElementById('addr');
    if (addrInput) addrInput.value = u.address || '';
    
    const passInput = document.getElementById('password');
    if (passInput) {
      const passGroup = passInput.closest('.form-group');
      if (passGroup) passGroup.style.display = 'none';
    }
  }

  document.getElementById('oscItems').innerHTML=cart.map(i=>`<div class="osc-item"><span class="osc-item-name">${currentLang==='ar'?i.nameAr:i.name} × ${i.qty}</span><span class="osc-item-price">${(i.price*i.qty).toFixed(2)} EGP</span></div>`).join('');
  document.getElementById('oscTotals').innerHTML=`
    <div class="osc-row"><span>${tr('subtotal')}</span><span>${subtotal.toFixed(2)} EGP</span></div>
    <div class="osc-row"><span>${tr('shipping')}</span><span>${shipping===0?tr('free'):shipping.toFixed(2)} EGP</span></div>
    <div class="osc-row final"><span>${tr('total')}</span><span>${total.toFixed(2)} EGP</span></div>`;
  // update labels
  document.getElementById('fn-lbl').textContent=tr('fname');
  document.getElementById('ln-lbl').textContent=tr('lname');
  document.getElementById('phone-lbl').textContent=tr('phone');
  document.getElementById('email-lbl').textContent=tr('email');
  document.getElementById('addr-lbl').textContent=tr('address');
  document.getElementById('city-lbl').textContent=tr('city');
  document.getElementById('zip-lbl').textContent=tr('zip');
  document.getElementById('pay-card-sub').textContent=tr('payCardSub');
  document.getElementById('pay-cod-sub').textContent=tr('payCODSub');
  document.getElementById('pay-wallet-sub').textContent=tr('payWalletSub');
}

function selectPay(el){
  document.querySelectorAll('.pay-opt').forEach(o=>o.classList.remove('selected'));
  el.classList.add('selected');
  el.querySelector('input').checked=true;
}

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwv1vuPsTUNXz6BMvtxUwxSqnf9Tq1CX21KLMq0nL3aYFebslLVEe5V0i-VIHyJLhlr/exec"; // We will update this later

async function placeOrder(){
  const fn=document.getElementById('fn').value.trim();
  const ln=document.getElementById('ln').value.trim();
  const phone=document.getElementById('phone').value.trim();
  const email=document.getElementById('email').value.trim();
  const password=document.getElementById('password').value.trim();
  const addr=document.getElementById('addr').value.trim();
  const city=document.getElementById('city').value.trim();
  
  const userLoggedIn = (localStorage.getItem('onlymed_user') !== null);
  if(!fn||!phone||!addr||(!userLoggedIn && !password)){
    showToast('Please fill in Name, Phone, Address, and Password.');
    return;
  }
  
  const paymentMethod = document.querySelector('input[name="pay"]:checked').value;
  const productsStr = cart.map(i=>`${i.name} x${i.qty}`).join(', ');
  const totalAmount = cart.reduce((s,i)=>s+i.price*i.qty,0) + (cart.reduce((s,i)=>s+i.price*i.qty,0)>=50?0:5.99);

  let pwdHash = "";
  if (!userLoggedIn && password) {
    pwdHash = await hashStr(password);
  }

  // Send to Google Sheets
  const orderData = {
    action: 'order',
    name: fn + ' ' + ln,
    phone: phone,
    email: email,
    passwordHash: pwdHash,
    address: addr + ', ' + city,
    payment: paymentMethod,
    products: productsStr,
    total: totalAmount
  };


  const placeBtn = document.getElementById('place-btn');
  let originalHtml = '';
  if (placeBtn) {
    originalHtml = placeBtn.innerHTML;
    placeBtn.innerHTML = '<i class="fa fa-circle-notch fa-spin"></i> Processing...';
    placeBtn.disabled = true;
  }

  try {
    if(GOOGLE_SCRIPT_URL !== "YOUR_GOOGLE_SCRIPT_URL_HERE") {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(orderData)
        });
    } else {
        console.warn("Google Script URL not set. Simulating success.");
    }
  } catch(e) {
    console.error("Error saving to Google Sheets", e);
  } finally {
    if (placeBtn) {
      placeBtn.disabled = false;
      placeBtn.innerHTML = originalHtml;
    }
  }

  
  currentUser = {
    name: fn + ' ' + ln,
    email: email,
    phone: phone,
    address: addr + ', ' + city
  };
  localStorage.setItem('onlymed_user', JSON.stringify(currentUser));
  updateAuthNav();

  orderCount++;
  const num=`CS-${String(orderCount).padStart(6,'0')}`;
  
  cart=[];
  renderCartBadge();saveCartLocally();
  
  placeBtn.textContent = tr('placeOrder');
  placeBtn.disabled = false;

  document.getElementById('orderNum').textContent=tr('orderNum')+num;
  document.getElementById('succ-title').textContent=tr('orderSuccess');
  document.getElementById('succ-sub').textContent=tr('orderThank');
  document.getElementById('succ-home').textContent=tr('continueShopping');
  showPage('success');
}

// ================== ADMIN ==================
function showAdmin(section){
  currentAdmin=section;
  ['overview','orders','products','analytics'].forEach(s=>{
    const el=document.getElementById('admin-'+s);
    if(el)el.style.display=s===section?'block':'none';
  });
  document.querySelectorAll('.admin-nav a').forEach(a=>{
    a.classList.toggle('active',a.id==='an-'+section);
  });
  if(section==='overview'){renderRecentOrders();renderTopProds();}
  if(section==='orders')renderOrdersTable();
  if(section==='products')renderAdminProducts();
  if(section==='analytics')initCharts();
}

function renderRecentOrders(){
  const el=document.getElementById('recentOrdersTable');
  el.innerHTML=`<table><thead><tr><th>#</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead><tbody>${
    sampleOrders.slice(0,5).map(o=>`<tr><td><strong>${o.id}</strong></td><td>${o.customer}</td><td>${parseFloat(o.total).toFixed(2)} EGP</td><td><span class="status-badge ${statusClass(o.status)}">${o.status}</span></td></tr>`).join('')
  }</tbody></table>`;
}

function renderTopProds(){
  const el=document.getElementById('topProdsTable');
  const top=products.sort((a,b)=>b.reviews-a.reviews).slice(0,5);
  el.innerHTML=`<table><thead><tr><th>Product</th><th>Rating</th><th>Reviews</th></tr></thead><tbody>${
    top.map(p=>`<tr><td>${p.emoji} ${p.name}</td><td>⭐ ${p.rating}</td><td>${p.reviews}</td></tr>`).join('')
  }</tbody></table>`;
}

function renderOrdersTable(){
  const q=(document.getElementById('orderSearch')?.value||'').toLowerCase();
  const st=document.getElementById('orderStatusFilter')?.value||'';
  let list=[...sampleOrders];
  if(q)list=list.filter(o=>o.id.toLowerCase().includes(q)||o.customer.toLowerCase().includes(q)||o.products.toLowerCase().includes(q));
  if(st)list=list.filter(o=>o.status===st);
  document.getElementById('ordersBody').innerHTML=list.map(o=>`<tr>
    <td><strong>${o.id}</strong></td>
    <td>${o.customer}</td>
    <td>${o.products.length>30?o.products.slice(0,30)+'...':o.products}</td>
    <td>${parseFloat(o.total).toFixed(2)} EGP</td>
    <td>${o.date}</td>
    <td><span class="status-badge ${statusClass(o.status)}">${o.status}</span></td>
    <td><span class="status-badge ${o.payment==='Paid'?'st-completed':o.payment==='Refunded'?'st-cancelled':'st-pending'}">${o.payment}</span></td>
  </tr>`).join('');
}

function statusClass(s){return s==='Completed'?'st-completed':s==='Processing'?'st-processing':s==='Cancelled'?'st-cancelled':'st-pending';}

function renderAdminProducts(){
  document.getElementById('adminProdsBody').innerHTML=products.map(p=>`<tr>
    <td><span style="font-size:20px">${p.emoji}</span> <strong>${p.name}</strong></td>
    <td><span style="background:var(--pk3);color:var(--pk);padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600">${p.cat}</span></td>
    <td><strong>${p.price.toFixed(2)} EGP</strong>${p.oldPrice && parseFloat(p.oldPrice) > parseFloat(p.price) ?` <span style="color:var(--gray2);font-size:12px;text-decoration:line-through">${p.oldPrice.toFixed(2)} EGP</span>`:''}</td>
    <td>⭐ ${p.rating} (${p.reviews})</td>
    <td><div class="tbl-actions"><button class="tbl-btn tbl-edit" onclick="showToast('Edit product: ${p.name}')"><i class="fa fa-pen"></i> Edit</button><button class="tbl-btn tbl-del" onclick="showToast('Product deleted (demo mode)')"><i class="fa fa-trash"></i></button></div></td>
  </tr>`).join('');
}

function toggleAddForm(){
  const f=document.getElementById('addProdForm');
  f.classList.toggle('open');
}

function saveProduct(){
  const name=document.getElementById('np-name').value.trim();
  if(!name){showToast('Please enter a product name.');return;}
  showToast(`Product "${name}" saved!`);
  document.getElementById('addProdForm').classList.remove('open');
}

// ================== CHARTS ==================
function initCharts(){
  if(chartsInitialized)return;
  chartsInitialized=true;
  const months=['Jan','Feb','Mar','Apr','May','Jun'];
  const pink='#e8547a';const pink2='#f07fa0';
  new Chart(document.getElementById('salesChart'),{
    type:'bar',
    data:{labels:months,datasets:[{label:'Revenue ($)',data:[3200,4100,3800,5200,4800,6200],backgroundColor:months.map((_,i)=>i===5?pink:pink2+'66'),borderColor:months.map((_,i)=>i===5?'#d43d6a':pink2),borderWidth:2,borderRadius:8}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{grid:{color:'#f3d6df'},ticks:{callback:v=>v}}}}
  });
  new Chart(document.getElementById('ordersChart'),{
    type:'line',
    data:{labels:months,datasets:[{label:'Orders',data:[28,35,31,44,38,52],borderColor:pink,backgroundColor:pink+'22',tension:.4,fill:true,pointBackgroundColor:pink,pointRadius:5,pointBorderColor:'#fff',pointBorderWidth:2}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{grid:{color:'#f3d6df'}}}}
  });
  new Chart(document.getElementById('catChart'),{
    type:'doughnut',
    data:{labels:['Vitamins','Supplements','Equipment','First Aid','Skincare'],datasets:[{data:[30,35,22,8,5],backgroundColor:['#e8547a','#f07fa0','#14b8a6','#f59e0b','#8b5cf6'],borderWidth:0}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}
  });
}

// ================== LANGUAGE ==================
function toggleLang(){
  currentLang=currentLang==='en'?'ar':'en';
  const dir=currentLang==='ar'?'rtl':'ltr';
  document.documentElement.setAttribute('dir',dir);
  document.documentElement.setAttribute('lang',currentLang);
  applyTranslations();
  const activePage=document.querySelector('.page.active')?.id?.replace('page-','');
  if(activePage==='home'){renderCategories();renderFeatured();renderBest();}
  if(activePage==='products')renderAllProducts();
}

function applyTranslations(){
  const tbl={
    'nav-tagline':'hcSub','langBtn':'langBtn',
    'hero-badge-text':'heroBadge','hero-title':'heroTitle','hero-sub':'heroSub',
    'hero-btn1':'shopNow','hero-btn2':'about',
    'stat1':'stat1','stat2':'stat2','stat3':'stat3',
    'sec-cats-title':'catTitle','sec-cats-sub':'catSub',
    'sec-feat-title':'featTitle','sec-feat-sub':'featSub','sec-feat-link':'viewAll',
    'sec-best-title':'bestTitle','sec-best-sub':'bestSub','sec-best-link':'viewAll',
    'prod-page-title':'prodPageTitle','prod-page-sub':'prodPageSub',
    'trust1':'trust1','trust1s':'trust1s','trust2':'trust2','trust2s':'trust2s',
    'trust3':'trust3','trust3s':'trust3s','trust4':'trust4','trust4s':'trust4s',
    'foot-desc':'footDesc','foot-shop':'footShop','foot-company':'footCompany','foot-support':'footSupport','foot-copy':'footCopy',
    'nav-home':'home','nav-products':'products','nav-about':'about','nav-contact':'contact',
    'footer-link-1':'prodPageTitle','footer-link-2':'catVitamins','footer-link-3':'catSupplements',
    'footer-link-5':'aboutUs','footer-link-8':'contactUs',
    'support-modal-title':'supportModalTitle','support-modal-sub':'supportModalSub',
    'prof-page-title-lbl':'profileTitlePage',
    'prof-info-sec-title':'profileInfoSec',
    'prof-orders-sec-title':'orderHistorySec',
    'prof-edit-btn':'editProfileBtn',
    'prof-save-btn':'saveChangesBtn',
    'prof-cancel-btn':'cancelBtn',
    'prof-lbl-email':'email',
    'prof-lbl-phone':'phone',
    'prof-lbl-addr':'address',
  };
  Object.entries(tbl).forEach(([id,key])=>{
    const el=document.getElementById(id);
    if(el&&t[currentLang][key]) {
      if (id === 'hero-title') {
        el.innerHTML = tr(key);
      } else {
        el.textContent = tr(key);
      }
    }
  });
  const si=document.getElementById('searchInput');if(si)si.placeholder=tr('searchPh');
  const siMob=document.getElementById('searchInputMob');if(siMob)siMob.placeholder=tr('searchPh');
  const pi=document.getElementById('prodSearch');if(pi)pi.placeholder=tr('searchPh');
  const loginBtn=document.getElementById('navLoginBtn');if(loginBtn)loginBtn.innerHTML=`<i class="fa fa-sign-in-alt"></i> ${tr('loginBtn')}`;
  const loginBtnMob=document.getElementById('navLoginBtnMob');if(loginBtnMob)loginBtnMob.innerHTML=`<i class="fa fa-sign-in-alt"></i> ${tr('loginBtn')}`;
  const profileBtn=document.getElementById('navProfileBtn');if(profileBtn){profileBtn.title=tr('profileBtn');profileBtn.setAttribute('aria-label', tr('profileBtn'));}
  const profileBtnMob=document.getElementById('navProfileBtnMob');if(profileBtnMob)profileBtnMob.innerHTML=`<i class="fa fa-user"></i> ${tr('profileBtn')}`;
  const logoutBtn=document.getElementById('prof-logout-btn');if(logoutBtn)logoutBtn.textContent=tr('logoutBtn');
}

// ================== TOAST ==================
function showToast(msg){
  const t=document.getElementById('toast');
  document.getElementById('toast-msg').textContent=msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3000);
}

// ================== INIT ==================
renderCategories();
renderFeatured();
renderBest();
document.getElementById('admin-date').textContent=new Date().toLocaleDateString();

function updateAuthNav() {
  const loginBtn = document.getElementById('navLoginBtn');
  const profileBtn = document.getElementById('navProfileBtn');
  const loginBtnMob = document.getElementById('navLoginBtnMob');
  const profileBtnMob = document.getElementById('navProfileBtnMob');
  if (currentUser) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (profileBtn) profileBtn.style.display = 'inline-block';
    if (loginBtnMob) loginBtnMob.style.display = 'none';
    if (profileBtnMob) profileBtnMob.style.display = 'block';
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (profileBtn) profileBtn.style.display = 'none';
    if (loginBtnMob) loginBtnMob.style.display = 'block';
    if (profileBtnMob) profileBtnMob.style.display = 'none';
  }
}

function doLogout() {
  showCustomConfirm({
    title: 'Logout?',
    message: 'Are you sure you want to log out of your account?',
    confirmText: 'Logout',
    danger: true,
    icon: 'fa fa-sign-out-alt',
    onConfirm: async () => {
      localStorage.removeItem('onlymed_user');
      currentUser = null;
      updateAuthNav();
      showPage('home');
      showToast('Logged out successfully.');
    }
  });
}

// ================== PROFILE ==================
function renderProfile() {
  if(!currentUser) { showPage('home'); return; }
  updateAuthNav();
  document.getElementById('prof-v-name').textContent = currentUser.name;
  document.getElementById('prof-v-email').textContent = currentUser.email;
  document.getElementById('prof-v-phone').textContent = currentUser.phone;
  document.getElementById('prof-v-addr').textContent = currentUser.address;
  
  document.getElementById('prof-e-email').value = currentUser.email;
  document.getElementById('prof-e-phone').value = currentUser.phone;
  document.getElementById('prof-e-addr').value = currentUser.address;
  
  renderProfileOrders();
}

function parseOrderProducts(productsStr) {
  const items = [];
  if (!productsStr) return items;
  const parts = productsStr.split(', ');
  parts.forEach(part => {
    const match = part.match(/(.+?)\s*[x×]\s*(\d+)/i) || part.match(/(\d+)\s*[x×]\s*(.+)/i);
    if (match) {
      let name = match[1].trim();
      let qty = parseInt(match[2]);
      if (isNaN(qty)) {
        qty = parseInt(match[1]);
        name = match[2].trim();
      }
      items.push({ name, qty });
    } else {
      items.push({ name: part.trim(), qty: 1 });
    }
  });
  return items;
}

function buyAgain(productId) {
  const product = products.find(p => p.id == productId);
  if (!product) return;
  
  addToCart(product.id, true);
  toggleCart();
}

function renderProfileOrders() {
  const container = document.getElementById('profile-orders-list');
  if (!container) return;
  
  if (!currentUser) {
    container.innerHTML = `<p style="color: var(--text-muted); text-align: center;">Please log in to see your orders.</p>`;
    return;
  }
  
  const userOrders = (window.onlymedOrders || []).filter(o => 
    (o.email && o.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) || 
    (o.phone && o.phone.toLowerCase().trim() === currentUser.phone.toLowerCase().trim())
  );
  
  if (userOrders.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
        <i class="fa fa-shopping-bag" style="font-size: 40px; margin-bottom: 12px; color: var(--border);"></i>
        <p>${currentLang === 'ar' ? 'لم تقم بأي طلبات بعد.' : 'No orders found yet.'}</p>
      </div>
    `;
    return;
  }
  
  userOrders.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (!isNaN(dateA) && !isNaN(dateB)) {
      return dateB - dateA;
    }
    return b.id.localeCompare(a.id);
  });
  
  let html = '';
  userOrders.forEach(o => {
    const items = parseOrderProducts(o.products);
    const dateStr = (o.date && !isNaN(new Date(o.date))) ? new Date(o.date).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
    
    const status = (o.status || 'Pending').trim();
    let statusClass = 'status-pending';
    let statusLabel = status;
    if (status === 'Completed' || status === 'Delivered') {
      statusClass = 'status-completed';
      statusLabel = currentLang === 'ar' ? 'مكتمل' : 'Completed';
    } else if (status === 'Processing') {
      statusClass = 'status-processing';
      statusLabel = currentLang === 'ar' ? 'قيد التنفيذ' : 'Processing';
    } else if (status === 'Cancelled') {
      statusClass = 'status-cancelled';
      statusLabel = currentLang === 'ar' ? 'ملغي' : 'Cancelled';
    } else {
      statusClass = 'status-pending';
      statusLabel = currentLang === 'ar' ? 'معلق' : 'Pending';
    }
    
    html += `
      <div class="order-card" style="border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-bottom: 24px; background: var(--bg-card); box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
        <div class="order-card-header" style="background: var(--bg-stripe); padding: 12px 20px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); gap: 12px; font-size: 13px; color: var(--text-muted);">
          <div style="display: flex; gap: 24px; flex-wrap: wrap;">
            <div>
              <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">${currentLang === 'ar' ? 'تاريخ الطلب' : 'Order Placed'}</span>
              <strong style="color: var(--text-main);">${dateStr}</strong>
            </div>
            <div>
              <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">${currentLang === 'ar' ? 'الإجمالي' : 'Total'}</span>
              <strong style="color: var(--text-main);">${o.total} EGP</strong>
            </div>
          </div>
          <div style="text-align: right;">
            <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">${currentLang === 'ar' ? 'رقم الطلب' : 'Order ID'}</span>
            <strong style="color: var(--text-main); font-family: monospace;">#${o.id}</strong>
          </div>
        </div>
        
        <div class="order-card-body" style="padding: 20px;">
          <div style="margin-bottom: 12px;">
            <span class="status-badge ${statusClass}" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: capitalize;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: currentColor;"></span>
              ${statusLabel}
            </span>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${items.map(item => {
              const product = products.find(p => p.name.toLowerCase() === item.name.toLowerCase() || p.nameAr.toLowerCase() === item.name.toLowerCase());
              const nameToShow = currentLang === 'ar' ? (product ? product.nameAr : item.name) : (product ? product.name : item.name);
              const imgUrl = product ? product.image : 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=100&auto=format&fit=crop&q=60';
              const priceUnit = product ? product.price : (parseFloat(o.total) / item.qty);
              
              return `
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; border-bottom: 1px dashed var(--border); padding-bottom: 16px; flex-wrap: wrap;">
                  <div style="display: flex; align-items: center; gap: 16px;">
                    <img src="${imgUrl}" alt="${nameToShow}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border); background: #fdf6f8;">
                    <div>
                      <h4 style="font-size: 15px; font-weight: 600; margin: 0 0 4px 0; color: var(--text-main);">${nameToShow}</h4>
                      <p style="font-size: 13px; color: var(--text-muted); margin: 0;">
                        ${currentLang === 'ar' ? 'الكمية:' : 'Qty:'} ${item.qty} &bull; ${priceUnit} EGP
                      </p>
                    </div>
                  </div>
                  <div>
                    ${product ? `
                      <button class="btn-primary" onclick="buyAgain('${product.id}')" style="padding: 6px 16px; font-size: 12px; border-radius: var(--r); font-weight: 600;">
                        <i class="fa fa-redo" style="margin-right: 4px;"></i> ${currentLang === 'ar' ? 'شراء مرة أخرى' : 'Buy again'}
                      </button>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
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
  let originalHtml = '';
  if (saveBtn) {
    originalHtml = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fa fa-circle-notch fa-spin"></i> Saving...';
    saveBtn.disabled = true;
  }
  
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
  } finally {
    if (saveBtn) {
      saveBtn.innerHTML = originalHtml;
      saveBtn.disabled = false;
    }
  }
}

function hideGlobalLoader() {
  const loader = document.getElementById('global-loader');
  if (loader) {
    loader.classList.add('hidden');
    const styleEl = document.getElementById('instant-hide-loader');
    if (styleEl) styleEl.remove();
  }
}

function processAndRenderData(data) {
  if (!data) return;
  
  window.onlymedOrders = data.orders || [];
  
  dynamicContent = {};
  if (Array.isArray(data.content)) {
    data.content.forEach(item => {
      if (item && item.key) {
        dynamicContent[item.key] = {
          en: item.en || '',
          ar: item.ar || '',
          status: (item.status && item.status.trim().toLowerCase() === 'inactive') ? 'Inactive' : 'Active'
        };
      }
    });
  }
  applyDynamicContent();

  const rawProducts = data.products || [];
  
  const catTranslations = {
    'Vitamins': 'الفيتامينات',
    'Supplements': 'المكملات',
    'First Aid': 'إسعافات أولية',
    'Equipment': 'أجهزة طبية',
    'Skincare': 'العناية بالبشرة'
  };
  
  function getCatEmoji(cat) {
    const emojis = {
      'Vitamins': '💊',
      'Supplements': '🌿',
      'First Aid': '🩹',
      'Equipment': '🩺',
      'Skincare': '💧'
    };
    return emojis[cat] || '📦';
  }

  function formatDriveImageUrl(url) {
    if (!url || url.trim() === '') return '';
    const raw = url.trim();
    const idMatch =
      raw.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
      raw.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
      raw.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (raw.includes('drive.google.com') && idMatch && idMatch[1]) {
      const fileId = idMatch[1];
      const finalUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w800-h800`;
      console.log('[Image][Content] Drive ID:', fileId, '=> URL:', finalUrl);
      return finalUrl;
    }
    return raw;
  }

  products = rawProducts.map(p => ({
    id: p.id || Math.floor(Math.random() * 10000),
    name: p.name_en || p.name,
    nameAr: p.name_ar || p.nameAr || p.name_en || p.name,
    desc: p.desc_en || p.desc,
    descAr: p.desc_ar || p.descAr || p.desc_en || p.desc,
    cat: p.category || p.cat,
    catAr: catTranslations[p.category || p.cat] || p.category || p.cat,
    emoji: p.emoji || getCatEmoji(p.category || p.cat),
    image: formatDriveImageUrl(p.image),
    price: parseFloat(p.price) || 0,
    oldPrice: p.oldPrice ? parseFloat(p.oldPrice) : null,
    rating: parseFloat(p.rating) || 4.5,
    reviews: parseInt(p.reviews) || 120,
    benefits: p.benefits || ['Quality healthcare product', 'Tested & certified'],
    benefitsAr: p.benefitsAr || ['منتج عالي الجودة', 'معتمد ومختبر'],
    badge: p.badge,
    featured: p.featured !== undefined ? p.featured : true,
    bestSeller: p.bestSeller !== undefined ? p.bestSeller : (p.badge === 'Best Seller')
  }));

  let catMap = {};
  products.forEach(p => {
    if(!catMap[p.cat]) catMap[p.cat] = { name: p.cat, nameAr: p.catAr, count: 0, emoji: p.emoji };
    catMap[p.cat].count++;
  });
  categories = Object.values(catMap);

  renderCategories();
  renderFeatured();
  renderBest();
  renderAllProducts();
}

async function fetchWebsiteContent() {
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {'Content-Type': 'text/plain'},
      body: JSON.stringify({ action: 'adminGetDashboardData' })
    });
    const result = await res.json();
    
    if (result.status !== 'success') {
      console.error("Dashboard data load failed:", result.message);
      hideGlobalLoader();
      return;
    }

    const newData = result.data;
    const cachedStr = localStorage.getItem('onlymed_cache');
    
    if (cachedStr && JSON.stringify(JSON.parse(cachedStr)) === JSON.stringify(newData)) {
      console.log('ONLYMED: Fetched content is identical to cached content. No refresh needed.');
      hideGlobalLoader();
      return;
    }

    localStorage.setItem('onlymed_cache', JSON.stringify(newData));
    window.onlymedCachedData = newData;
    processAndRenderData(newData);
    hideGlobalLoader();
  } catch (e) {
    console.error("Error fetching dynamic data:", e);
    hideGlobalLoader();
  }
}

// Immediately load cache synchronously if available (elements exist because main.js is at bottom of body)
if (window.onlymedCachedData) {
  processAndRenderData(window.onlymedCachedData);
}

window.addEventListener("DOMContentLoaded", () => {
  if (window.onlymedCachedData) {
    processAndRenderData(window.onlymedCachedData);
    hideGlobalLoader();
  }
  fetchWebsiteContent();
  renderCartBadge();
  updateAuthNav();
});

function applyDynamicContent() {
  if (!dynamicContent) return;
  for (const key in dynamicContent) {
    const el = document.getElementById(key);
    if (el && dynamicContent[key]) {
      const val = dynamicContent[key][currentLang];
      if (val !== undefined && val !== null) {
        el.innerHTML = val;
      }
      
      const status = dynamicContent[key].status || 'Active';
      if (status === 'Inactive') {
        if (key === 'hero-badge-text') {
          const badgeEl = el.closest('.hero-badge');
          if (badgeEl) badgeEl.style.display = 'none';
        } else if (key === 'sec-cats-title' || key === 'sec-feat-title' || key === 'sec-best-title') {
          const sectionEl = el.closest('.section');
          if (sectionEl) sectionEl.style.display = 'none';
        } else {
          el.style.display = 'none';
        }
      } else {
        if (key === 'hero-badge-text') {
          const badgeEl = el.closest('.hero-badge');
          if (badgeEl) badgeEl.style.display = '';
        } else if (key === 'sec-cats-title' || key === 'sec-feat-title' || key === 'sec-best-title') {
          const sectionEl = el.closest('.section');
          if (sectionEl) sectionEl.style.display = '';
        } else {
          el.style.display = '';
        }
      }
    }
  }
}


function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'ar' : 'en';
  document.querySelectorAll('.btn-lang').forEach(btn => {
    btn.innerText = currentLang === 'en' ? 'عربي' : 'English';
  });
  document.body.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', document.body.dir);
  document.documentElement.setAttribute('lang', currentLang);
  applyTranslations();
  applyDynamicContent();
  renderProducts();
}

function renderProducts() {
  renderCategories();
  renderFeatured();
  renderBest();
  const activePage = document.querySelector('.page.active')?.id?.replace('page-', '');
  if (activePage === 'products') {
    renderAllProducts();
  }
  setTimeout(initScrollAnimations, 100);
}


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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { setTimeout(initScrollAnimations, 100); });
} else {
  setTimeout(initScrollAnimations, 100);
}

function toggleMobileMenu(){
  const navLinks = document.getElementById('navLinks');
  if (navLinks) {
    navLinks.classList.toggle('open');
  }
}

// ================== GLOBAL CONFIRM MODAL ==================
function showCustomConfirm(options) {
  return new Promise((resolve) => {
    if (!document.getElementById('customConfirmStyles')) {
      const style = document.createElement('style');
      style.id = 'customConfirmStyles';
      style.innerHTML = `
        @keyframes ccm-overlay-in  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ccm-box-in      { from { opacity: 0; transform: scale(0.88) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes ccm-box-out     { from { opacity: 1; transform: scale(1) translateY(0); } to { opacity: 0; transform: scale(0.88) translateY(10px); } }

        .ccm-overlay {
          position: fixed; inset: 0;
          background: rgba(10, 10, 10, 0.55);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 99999; padding: 16px;
          animation: ccm-overlay-in 0.22s ease forwards;
        }
        .ccm-overlay.closing { animation: none; opacity: 0; transition: opacity 0.2s ease; }
        .ccm-box {
          background: #fff; border-radius: 16px;
          width: 100%; max-width: 380px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.07);
          overflow: hidden;
          animation: ccm-box-in 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.15) forwards;
          font-family: 'Inter', 'DM Sans', sans-serif;
        }
        .ccm-box.closing { animation: ccm-box-out 0.2s ease forwards; }
        .ccm-header { display: flex; justify-content: flex-end; padding: 12px 16px 0; }
        .ccm-close {
          background: none; border: none; cursor: pointer;
          color: #aaa; font-size: 18px;
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; transition: background 0.2s, color 0.2s;
        }
        .ccm-close:hover { background: #f0f0f0; color: #444; }
        .ccm-body { padding: 4px 28px 28px; text-align: center; }
        .ccm-icon-wrap {
          width: 56px; height: 56px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px; font-size: 22px;
        }
        .ccm-icon-wrap.danger  { background: #fff0f1; color: #d0112b; }
        .ccm-icon-wrap.info    { background: #e0f7fa; color: #00b4d8; }
        .ccm-icon-wrap.warning { background: #fff8e1; color: #f59e0b; }
        .ccm-title { margin: 0 0 6px; font-size: 18px; font-weight: 700; color: #111; font-family: 'Playfair Display', serif; }
        .ccm-subtitle {
          margin: 0 0 6px; font-size: 13px; font-weight: 600; color: #555;
          background: #f5f5f5; display: inline-block;
          padding: 3px 10px; border-radius: 20px;
        }
        .ccm-message { margin: 8px 0 24px; font-size: 14px; line-height: 1.6; color: #777; }
        .ccm-actions { display: flex; gap: 10px; }
        .ccm-btn {
          flex: 1; padding: 11px 16px; border-radius: 8px;
          font-size: 14px; font-weight: 600; cursor: pointer; border: none;
          transition: all 0.2s ease;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        }
        .ccm-btn-cancel { background: #f4f4f4; color: #555; }
        .ccm-btn-cancel:hover { background: #e8e8e8; color: #222; }
        .ccm-btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }
        .ccm-btn-action { color: #fff; }
        .ccm-btn-action.danger  { background: #d0112b; }
        .ccm-btn-action.danger:hover  { background: #b00d23; box-shadow: 0 4px 12px rgba(208,17,43,0.3); }
        .ccm-btn-action.info    { background: #00b4d8; }
        .ccm-btn-action.info:hover    { background: #0097b8; box-shadow: 0 4px 12px rgba(0,180,216,0.3); }
        .ccm-btn-action.warning { background: #f59e0b; }
        .ccm-btn-action.warning:hover { background: #d97706; }
        .ccm-btn-action:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }
        @media (max-width: 480px) {
          .ccm-box { border-radius: 14px; }
          .ccm-body { padding: 4px 20px 22px; }
          .ccm-actions { flex-direction: column-reverse; }
        }
      `;
      document.head.appendChild(style);
    }

    const old = document.getElementById('globalConfirmModal');
    if (old) old.remove();

    const variant = options.variant || (options.danger === false ? 'info' : 'danger');
    const defaultIcons = { danger: 'fa fa-trash-alt', info: 'fa fa-info-circle', warning: 'fa fa-exclamation-triangle' };
    const icon = options.icon || defaultIcons[variant] || 'fa fa-exclamation-triangle';

    const modal = document.createElement('div');
    modal.id = 'globalConfirmModal';
    modal.className = 'ccm-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'ccmTitle');

    const subtitleHtml = options.subtitle
      ? `<div class="ccm-subtitle"><i class="fa fa-tag" style="margin-right:5px;opacity:0.6;"></i>${options.subtitle}</div>`
      : '';

    modal.innerHTML = `
      <div class="ccm-box" role="document">
        <div class="ccm-header">
          <button class="ccm-close" id="ccmCloseBtn" aria-label="Close">&#x2715;</button>
        </div>
        <div class="ccm-body">
          <div class="ccm-icon-wrap ${variant}"><i class="${icon}"></i></div>
          <h3 class="ccm-title" id="ccmTitle">${options.title || 'Are you sure?'}</h3>
          ${subtitleHtml}
          <p class="ccm-message">${options.message || 'This action cannot be undone.'}</p>
          <div class="ccm-actions">
            <button class="ccm-btn ccm-btn-cancel" id="ccmCancelBtn">${options.cancelText || 'Cancel'}</button>
            <button class="ccm-btn ccm-btn-action ${variant}" id="ccmActionBtn">${options.confirmText || 'Confirm'}</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const actionBtn = modal.querySelector('#ccmActionBtn');
    const cancelBtn = modal.querySelector('#ccmCancelBtn');
    const closeBtn  = modal.querySelector('#ccmCloseBtn');
    const box       = modal.querySelector('.ccm-box');
    let   isClosed  = false;

    const closeModal = (result) => {
      if (isClosed) return;
      isClosed = true;
      box.classList.add('closing');
      modal.classList.add('closing');
      document.removeEventListener('keydown', handleKey);
      setTimeout(() => { modal.remove(); resolve(result); }, 200);
    };

    const handleKey = (e) => {
      if (e.key === 'Escape') closeModal(false);
      if (e.key === 'Tab') {
        const focusable = [cancelBtn, actionBtn, closeBtn].filter(b => !b.disabled);
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
        else            { if (document.activeElement === last)  { e.preventDefault(); first.focus(); } }
      }
    };

    actionBtn.addEventListener('click', async () => {
      const originalHtml = actionBtn.innerHTML;
      actionBtn.disabled = true;
      cancelBtn.disabled = true;
      closeBtn.disabled  = true;
      actionBtn.innerHTML = '<i class="fa fa-circle-notch fa-spin"></i> Processing...';
      try {
        if (options.onConfirm) await options.onConfirm();
        closeModal(true);
      } catch(e) {
        console.error(e);
        actionBtn.disabled = false;
        cancelBtn.disabled = false;
        closeBtn.disabled  = false;
        actionBtn.innerHTML = originalHtml;
      }
    });

    cancelBtn.addEventListener('click', () => closeModal(false));
    closeBtn.addEventListener('click',  () => closeModal(false));
    modal.addEventListener('mousedown', (e) => { if (e.target === modal) closeModal(false); });
    document.addEventListener('keydown', handleKey);
    setTimeout(() => cancelBtn.focus(), 60);
  });
}

function openSupportModal() {
  const modal = document.getElementById('supportModal');
  if (modal) modal.classList.add('active');
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}
