const fs = require('fs');
let js = fs.readFileSync('e:/Downloads/ONLYMED/js/main.js', 'utf8');

const oldPlaceOrder = `function placeOrder(){
  const fn=document.getElementById('fn').value.trim();
  const phone=document.getElementById('phone').value.trim();
  const addr=document.getElementById('addr').value.trim();
  if(!fn||!phone||!addr){showToast('Please fill in all required fields.');return;}
  orderCount++;
  const num=\`CS-\${String(orderCount).padStart(6,'0')}\`;
  // add to sample orders
  sampleOrders.unshift({id:num,customer:fn,products:cart.map(i=>\`\${currentLang==='ar'?i.nameAr:i.name} × \${i.qty}\`).join(', '),total:cart.reduce((s,i)=>s+i.price*i.qty,0),date:new Date().toISOString().slice(0,10),status:'Processing',payment:'Pending'});
  cart=[];
  renderCartBadge();
  document.getElementById('orderNum').textContent=tr('orderNum')+num;
  document.getElementById('succ-title').textContent=tr('orderSuccess');
  document.getElementById('succ-sub').textContent=tr('orderThank');
  document.getElementById('succ-home').textContent=tr('continueShopping');
  showPage('success');
}`;

const newPlaceOrder = `const GOOGLE_SCRIPT_URL = "YOUR_GOOGLE_SCRIPT_URL_HERE"; // We will update this later

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
  const productsStr = cart.map(i=>\`\${i.name} x\${i.qty}\`).join(', ');
  const totalAmount = cart.reduce((s,i)=>s+i.price*i.qty,0) + (cart.reduce((s,i)=>s+i.price*i.qty,0)>=50?0:5.99);

  // Send to Google Sheets
  const orderData = {
    name: fn + ' ' + ln,
    phone: phone,
    email: email,
    password: password, // For account creation
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

  orderCount++;
  const num=\`CS-\${String(orderCount).padStart(6,'0')}\`;
  
  cart=[];
  renderCartBadge();
  
  placeBtn.textContent = tr('placeOrder');
  placeBtn.disabled = false;

  document.getElementById('orderNum').textContent=tr('orderNum')+num;
  document.getElementById('succ-title').textContent=tr('orderSuccess');
  document.getElementById('succ-sub').textContent=tr('orderThank');
  document.getElementById('succ-home').textContent=tr('continueShopping');
  showPage('success');
}`;

js = js.replace(oldPlaceOrder, newPlaceOrder);

fs.writeFileSync('e:/Downloads/ONLYMED/js/main.js', js);
console.log('placeOrder function updated.');
