const fs = require('fs');
let html = fs.readFileSync('e:/Downloads/ONLYMED/index.html', 'utf8');

if (!html.includes('id="m-oldPrice"')) {
    html = html.replace(
        '<div class="form-group"><label>Price (EGP)</label><input type="number" id="m-price" step="0.01"></div>',
        '<div class="form-group"><label>Price (EGP)</label><input type="number" id="m-price" step="0.01"></div>\n          <div class="form-group"><label>Old Price (Discount)</label><input type="number" id="m-oldPrice" step="0.01" placeholder="Leave empty if no discount"></div>'
    );
    html = html.replace(
        '<div class="form-group"><label>Price ($)</label><input type="number" id="m-price" step="0.01"></div>',
        '<div class="form-group"><label>Price (EGP)</label><input type="number" id="m-price" step="0.01"></div>\n          <div class="form-group"><label>Old Price (Discount)</label><input type="number" id="m-oldPrice" step="0.01" placeholder="Leave empty if no discount"></div>'
    );
    // Since currency was changed, it might just say "Price" or "Price (EGP)"
    html = html.replace(
        '<div class="form-group"><label>Price</label><input type="number" id="m-price" step="0.01"></div>',
        '<div class="form-group"><label>Price (EGP)</label><input type="number" id="m-price" step="0.01"></div>\n          <div class="form-group"><label>Old Price (Discount)</label><input type="number" id="m-oldPrice" step="0.01" placeholder="Leave empty if no discount"></div>'
    );
}
fs.writeFileSync('e:/Downloads/ONLYMED/index.html', html);

let js = fs.readFileSync('e:/Downloads/ONLYMED/js/main.js', 'utf8');

// Update openProductModal to populate oldPrice
if (!js.includes("document.getElementById('m-oldPrice').value=")) {
    js = js.replace(
        "document.getElementById('m-price').value=p.price;",
        "document.getElementById('m-price').value=p.price;\n    document.getElementById('m-oldPrice').value=p.oldPrice||'';"
    );
    js = js.replace(
        "document.getElementById('m-price').value='';",
        "document.getElementById('m-price').value='';\n    document.getElementById('m-oldPrice').value='';"
    );
}

// Update saveProduct to read oldPrice
if (!js.includes("const oldPrice=parseFloat(document.getElementById('m-oldPrice').value);")) {
    js = js.replace(
        "const price=parseFloat(document.getElementById('m-price').value);",
        "const price=parseFloat(document.getElementById('m-price').value);\n  const oldPrice=parseFloat(document.getElementById('m-oldPrice').value);"
    );
    
    js = js.replace(
        "products.push({id,name,nameAr,category,price,rating:0,reviews:0,image:'https://via.placeholder.com/300x300?text=Product'});",
        "products.push({id,name,nameAr,category,price,oldPrice:(isNaN(oldPrice)?null:oldPrice),rating:0,reviews:0,image:'https://via.placeholder.com/300x300?text=Product'});"
    );
    
    js = js.replace(
        "products[idx]={...products[idx],name,nameAr,category,price};",
        "products[idx]={...products[idx],name,nameAr,category,price,oldPrice:(isNaN(oldPrice)?null:oldPrice)};"
    );
}

fs.writeFileSync('e:/Downloads/ONLYMED/js/main.js', js);
console.log("Fixed oldPrice in modal");
