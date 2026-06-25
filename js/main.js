// ================== DATA ==================
// ================== DYNAMIC DATA ==================
let products = [];
let categories = [];
let dynamicContent = {}; // Stores {key: {en, ar}}
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
    footDesc:'Your trusted online destination for premium healthcare products.',
    footShop:'Shop',footCompany:'Company',footSupport:'Support',footCopy:'© 2025 ONLYMED. All rights reserved.',
    payCardSub:'Visa, Mastercard, Amex',payCODSub:'Pay when you receive',payWalletSub:'PayPal, Apple Pay, Google Pay',
    orderSumTitle:'Order Summary',aboutHeroTitle:'About ONLYMED',
    aboutHeroSub:'We\'re dedicated to making quality healthcare accessible to everyone, everywhere.',
    sendMsg:'Message sent! We\'ll reply within 24 hours.',
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
    footDesc:'وجهتك الموثوقة للمنتجات الصحية المتميزة.',
    footShop:'التسوق',footCompany:'الشركة',footSupport:'الدعم',footCopy:'© 2025 ONLYMED. جميع الحقوق محفوظة.',
    payCardSub:'فيزا، ماستركارد، أمريكان إكسبريس',payCODSub:'ادفع عند الاستلام',payWalletSub:'PayPal، Apple Pay، Google Pay',
    orderSumTitle:'ملخص الطلب',aboutHeroTitle:'عن ONLYMED',
    aboutHeroSub:'نحن ملتزمون بجعل الرعاية الصحية المتميزة في متناول الجميع.',
    sendMsg:'تم إرسال الرسالة! سنرد خلال 24 ساعة.',
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
  return `<div class="prod-card">
    ${p.badge?`<div class="prod-badge">${currentLang==='ar'&&p.badge==='Best Seller'?'الأكثر مبيعاً':currentLang==='ar'&&p.badge==='New'?'جديد':currentLang==='ar'&&p.badge==='Sale'?'خصم':currentLang==='ar'&&p.badge==='Popular'?'شائع':p.badge}</div>`:''}
    <div class="prod-img">${p.emoji}</div>
    <div class="prod-body">
      <div class="prod-cat">${catName}</div>
      <div class="prod-name">${name}</div>
      <div class="prod-desc">${desc}</div>
      <div class="prod-stars">${'<i class="fa fa-star"></i>'.repeat(Math.floor(p.rating))}<span>${p.rating} (${p.reviews})</span></div>
      <div class="prod-footer">
        <div><span class="prod-price">${p.price.toFixed(2)} EGP</span>${p.oldPrice?`<span class="prod-old">${p.oldPrice.toFixed(2)} EGP</span>`:''}</div>
      </div>
      <div class="prod-actions" style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn-sm btn-view" onclick="viewProduct(${p.id})">${tr('viewDetails')}</button>
        <button class="btn-sm btn-cart-sm" onclick="addToCart(${p.id})"><i class="fa fa-bag-shopping"></i> ${tr('addToCart')}</button>
        <button class="btn-sm btn-buy" onclick="viewProduct(${p.id});setTimeout(buyNow,200)">${tr('buyNow')}</button>
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
  document.getElementById('detailImg').textContent=p.emoji;
  document.getElementById('detailCat').textContent=catName;
  document.getElementById('detailName').textContent=name;
  document.getElementById('detailRating').innerHTML='<i class="fa fa-star" style="color:#f59e0b"></i>'.repeat(Math.floor(p.rating))+`<span>${p.rating} (${p.reviews} reviews)</span>`;
  document.getElementById('detailPrice').innerHTML=`<span class="price">${p.price.toFixed(2)} EGP</span>${p.oldPrice?`<span class="old">${p.oldPrice.toFixed(2)} EGP</span>`:''}`;
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
      <div class="ci-img">${item.emoji}</div>
      <div class="ci-info">
        <div class="ci-name">${name}</div>
        <div class="ci-price">${(item.price*item.qty).toFixed(2)} EGP</div>
        <div class="ci-qty">
          <button class="qty-btn" onclick="changeQty(${item.id},-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id},1)">+</button>
        </div>
      </div>
      <button class="ci-remove" onclick="removeCartItem(${item.id})"><i class="fa fa-trash"></i></button>
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

  document.getElementById('oscItems').innerHTML=cart.map(i=>`<div class="osc-item"><span class="osc-item-name">${currentLang==='ar'?i.nameAr:i.name} × ${i.qty}</span><span class="osc-item-price">{(i.price*i.qty).toFixed(2)} EGP</span></div>`).join('');
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
  
  if(!fn||!phone||!addr||!password){showToast('Please fill in Name, Phone, Address, and Password.');return;}
  
  const paymentMethod = document.querySelector('input[name="pay"]:checked').value;
  const productsStr = cart.map(i=>`${i.name} x${i.qty}`).join(', ');
  const totalAmount = cart.reduce((s,i)=>s+i.price*i.qty,0) + (cart.reduce((s,i)=>s+i.price*i.qty,0)>=50?0:5.99);

  // Send to Google Sheets
  
  const orderData = {
    action: 'order',
    name: fn + ' ' + ln,
    phone: phone,
    email: email,
    password: password,
    address: addr + ', ' + city,
    payment: paymentMethod,
    products: productsStr,
    total: totalAmount
  };


  const placeBtn = document.getElementById('place-btn');
  placeBtn.textContent = "Processing...";
  placeBtn.disabled = true;

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
  }

  
  currentUser = {
    name: fn + ' ' + ln,
    email: email,
    phone: phone,
    address: addr + ', ' + city
  };
  localStorage.setItem('onlymed_user', JSON.stringify(currentUser));
  document.getElementById('navProfileBtn').style.display = 'inline-block';

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
    <td><strong>${p.price.toFixed(2)} EGP</strong>${p.oldPrice?` <span style="color:var(--gray2);font-size:12px;text-decoration:line-through">${p.oldPrice.toFixed(2)} EGP</span>`:''}</td>
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
    'about-hero-title':'aboutHeroTitle','about-hero-sub':'aboutHeroSub',
  };
  Object.entries(tbl).forEach(([id,key])=>{const el=document.getElementById(id);if(el&&t[currentLang][key])el.textContent=tr(key);});
  document.getElementById('searchInput').placeholder=tr('searchPh');
  const pi=document.getElementById('prodSearch');if(pi)pi.placeholder=tr('searchPh');
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

// ================== PROFILE ==================
function renderProfile() {
  if(!currentUser) { showPage('home'); return; }
  document.getElementById('navProfileBtn').style.display = 'inline-block';
  document.getElementById('prof-v-name').textContent = currentUser.name;
  document.getElementById('prof-v-email').textContent = currentUser.email;
  document.getElementById('prof-v-phone').textContent = currentUser.phone;
  document.getElementById('prof-v-addr').textContent = currentUser.address;
  
  document.getElementById('prof-e-email').value = currentUser.email;
  document.getElementById('prof-e-phone').value = currentUser.phone;
  document.getElementById('prof-e-addr').value = currentUser.address;
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
  saveBtn.textContent = 'Saving...';
  saveBtn.disabled = true;
  
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
  }
  
  saveBtn.textContent = 'Save Changes';
  saveBtn.disabled = false;
}

window.addEventListener("DOMContentLoaded", () => {
  fetchWebsiteContent();
  renderCartBadge();
  if(currentUser) {
    document.getElementById('navProfileBtn').style.display = 'inline-block';
  }
});


// ================== WEBSITE CONTENT MANAGEMENT ==================

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


function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'ar' : 'en';
  document.getElementById('nav-lang').innerText = currentLang === 'en' ? 'عربي' : 'English';
  document.body.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  applyDynamicContent();
  renderProducts();
}
