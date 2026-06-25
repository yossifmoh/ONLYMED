const fs = require('fs');

let gs = fs.readFileSync('C:\\Users\\yossi\\.gemini\\antigravity\\brain\\dea92c11-e6ad-4311-ad9a-2cfeae212e3c\\google_apps_script.md', 'utf8');

const newScript = `
// ==========================================
// ONLYMED: FULL CMS HEADLESS BACKEND
// ==========================================

// التعامل مع طلبات GET (لجلب البيانات)
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var type = e.parameter.type;
  
  if (type === "content") {
    var contentSheet = ss.getSheetByName("Website_Content");
    var responseData = {};
    if (contentSheet) {
      var data = contentSheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        var key = data[i][0];
        var valEN = data[i][1];
        var valAR = data[i][2];
        var status = data[i][3];
        if (key && status !== "Inactive" && status !== "inactive") {
          responseData[key] = { en: valEN, ar: valAR };
        }
      }
    }
    return ContentService.createTextOutput(JSON.stringify(responseData)).setMimeType(ContentService.MimeType.JSON);
  }
  
  else if (type === "products") {
    var prodSheet = ss.getSheetByName("Products");
    var products = [];
    if (prodSheet) {
      var data = prodSheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if(data[i][11] !== "Hidden") { // Status
          products.push({
            id: data[i][0],
            image: data[i][1],
            name_en: data[i][2],
            name_ar: data[i][3],
            desc_en: data[i][4],
            desc_ar: data[i][5],
            category: data[i][6],
            price: data[i][7],
            oldPrice: data[i][8],
            badge: data[i][9],
            stock: data[i][10]
          });
        }
      }
    }
    return ContentService.createTextOutput(JSON.stringify(products)).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({error: "Invalid GET type"})).setMimeType(ContentService.MimeType.JSON);
}

// التعامل مع أوامر الإدارة والمستخدمين
function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data = JSON.parse(e.postData.contents);
  var action = data.action; 
  var timestamp = new Date();
  
  var ordersSheet = ss.getSheetByName("Orders");
  var userSheet = ss.getSheetByName("User");
  var prodSheet = ss.getSheetByName("Products");
  var contentSheet = ss.getSheetByName("Website_Content");

  // =====================================
  // 1. ADMIN ACTIONS (لوحة التحكم)
  // =====================================
  
  if (action === "adminGetDashboardData") {
    var response = { products: [], orders: [], users: [], content: [] };
    
    // Products
    if(prodSheet) {
      var pData = prodSheet.getDataRange().getValues();
      for(var i=1; i<pData.length; i++) {
        response.products.push({ id: pData[i][0], image: pData[i][1], name_en: pData[i][2], name_ar: pData[i][3], desc_en: pData[i][4], desc_ar: pData[i][5], category: pData[i][6], price: pData[i][7], oldPrice: pData[i][8], badge: pData[i][9], stock: pData[i][10], status: pData[i][11], created: pData[i][12] });
      }
    }
    
    // Orders
    if(ordersSheet) {
      var oData = ordersSheet.getDataRange().getValues();
      for(var i=1; i<oData.length; i++) {
        response.orders.push({ id: oData[i][0], date: oData[i][1], email: oData[i][2], name: oData[i][3], address: oData[i][4], payment: oData[i][5], products: oData[i][6], total: oData[i][7], status: oData[i][8] });
      }
    }
    
    // Users
    if(userSheet) {
      var uData = userSheet.getDataRange().getValues();
      for(var i=1; i<uData.length; i++) {
        response.users.push({ name: uData[i][0], email: uData[i][1], phone: uData[i][2], address: uData[i][4], created: uData[i][5] });
      }
    }
    
    // Content
    if(contentSheet) {
      var cData = contentSheet.getDataRange().getValues();
      for(var i=1; i<cData.length; i++) {
        response.content.push({ key: cData[i][0], en: cData[i][1], ar: cData[i][2], status: cData[i][3] });
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: "success", data: response})).setMimeType(ContentService.MimeType.JSON);
  }
  
  else if (action === "adminUpdateContent") {
    // يستقبل مصفوفة بكل المحتويات لتحديثها دفعة واحدة
    if(contentSheet) {
      contentSheet.clear();
      contentSheet.appendRow(["Key", "Value_EN", "Value_AR", "Status"]);
      for(var i=0; i<data.content.length; i++) {
        var c = data.content[i];
        contentSheet.appendRow([c.key, c.en, c.ar, c.status]);
      }
      return ContentService.createTextOutput(JSON.stringify({status: "success"})).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  else if (action === "adminSaveProduct") {
    if(prodSheet) {
      if(data.id) {
        // Edit existing product
        var pData = prodSheet.getDataRange().getValues();
        for(var i=1; i<pData.length; i++) {
          if(pData[i][0] == data.id) {
            prodSheet.getRange(i+1, 2, 1, 11).setValues([[data.image, data.name_en, data.name_ar, data.desc_en, data.desc_ar, data.category, data.price, data.oldPrice, data.badge, data.stock, data.status]]);
            return ContentService.createTextOutput(JSON.stringify({status: "success"})).setMimeType(ContentService.MimeType.JSON);
          }
        }
      } else {
        // Add new product
        var newId = "PRD-" + Math.floor(Math.random() * 10000);
        prodSheet.appendRow([newId, data.image, data.name_en, data.name_ar, data.desc_en, data.desc_ar, data.category, data.price, data.oldPrice, data.badge, data.stock, data.status, timestamp]);
        return ContentService.createTextOutput(JSON.stringify({status: "success", id: newId})).setMimeType(ContentService.MimeType.JSON);
      }
    }
  }

  else if (action === "adminDeleteProduct") {
    if(prodSheet) {
      var pData = prodSheet.getDataRange().getValues();
      for(var i=1; i<pData.length; i++) {
        if(pData[i][0] == data.id) {
          prodSheet.deleteRow(i+1);
          return ContentService.createTextOutput(JSON.stringify({status: "success"})).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }
  }
  
  else if (action === "adminUpdateOrderStatus") {
    if(ordersSheet) {
      var oData = ordersSheet.getDataRange().getValues();
      for(var i=1; i<oData.length; i++) {
        if(oData[i][0] == data.orderId) {
          ordersSheet.getRange(i+1, 9).setValue(data.status); // Order Status in Col 9 (I)
          return ContentService.createTextOutput(JSON.stringify({status: "success"})).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }
  }
  
  else if (action === "adminDeleteUser") {
    if(userSheet) {
      var uData = userSheet.getDataRange().getValues();
      for(var i=1; i<uData.length; i++) {
        if(uData[i][1] == data.email) {
          userSheet.deleteRow(i+1);
          return ContentService.createTextOutput(JSON.stringify({status: "success"})).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }
  }

  // =====================================
  // 2. PUBLIC ACTIONS (المستخدمين العاديين)
  // =====================================
  
  else if (action === "login") {
    if(userSheet) {
      var lastRow = userSheet.getLastRow();
      if(lastRow > 1) {
        var userRows = userSheet.getRange(2, 1, lastRow - 1, 5).getValues(); 
        for(var i = 0; i < userRows.length; i++) {
          if(userRows[i][1] === data.email) {
            if(userRows[i][3] === data.passwordHash) {
              return ContentService.createTextOutput(JSON.stringify({
                "status": "success",
                "user": { "name": userRows[i][0], "email": userRows[i][1], "phone": userRows[i][2], "address": userRows[i][4] }
              })).setMimeType(ContentService.MimeType.JSON);
            } else {
              return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "Wrong password"})).setMimeType(ContentService.MimeType.JSON);
            }
          }
        }
      }
    }
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "User not found"})).setMimeType(ContentService.MimeType.JSON);
  }
  
  else if (action === "resetPassword") {
    if(userSheet) {
      var lastRow = userSheet.getLastRow();
      if(lastRow > 1) {
        var userRows = userSheet.getRange(2, 1, lastRow - 1, 4).getValues(); 
        for(var i = 0; i < userRows.length; i++) {
          if(userRows[i][1] === data.email) {
            if(userRows[i][2] == data.phone) {
              userSheet.getRange(i+2, 4).setValue(data.newPasswordHash);
              return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
            } else {
              return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "Phone number does not match"})).setMimeType(ContentService.MimeType.JSON);
            }
          }
        }
      }
    }
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "User not found"})).setMimeType(ContentService.MimeType.JSON);
  }
  
  else if (action === "order") {
    var orderId = "ORD-" + Math.floor(Math.random() * 1000000);
    
    // Columns: Order ID | Date | Email | Name | Address | Payment | Products | Total | Status
    if(ordersSheet) {
      ordersSheet.appendRow([orderId, timestamp, data.email, data.name, data.address, data.payment, data.products, data.total, "Pending"]);
    }
    
    if(userSheet && data.passwordHash) {
      var userExists = false;
      var lastRow = userSheet.getLastRow();
      if(lastRow > 1) {
        var emails = userSheet.getRange(2, 2, lastRow - 1, 1).getValues(); 
        for(var i = 0; i < emails.length; i++) {
          if(emails[i][0] === data.email) { userExists = true; break; }
        }
      }
      if(!userExists) {
        // Name | Email | Phone | Password | Address | Created
        userSheet.appendRow([data.name, data.email, data.phone, data.passwordHash, data.address, timestamp]);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success", "orderId": orderId})).setMimeType(ContentService.MimeType.JSON);
  }
  
  else if (action === "updateProfile") {
    if(userSheet) {
      var lastRow = userSheet.getLastRow();
      if(lastRow > 1) {
        var emails = userSheet.getRange(2, 2, lastRow - 1, 1).getValues();
        for(var i = 0; i < emails.length; i++) {
          if(emails[i][0] === data.oldEmail) {
            var r = i + 2; 
            userSheet.getRange(r, 2).setValue(data.newEmail);
            userSheet.getRange(r, 3).setValue(data.newPhone); 
            userSheet.getRange(r, 5).setValue(data.newAddress); 
            return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
          }
        }
      }
    }
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "User not found"})).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "Invalid action"})).setMimeType(ContentService.MimeType.JSON);
}
`;

gs = gs.replace(/```javascript[\s\S]*?```/, "```javascript\n" + newScript + "\n```");
fs.writeFileSync('C:\\Users\\yossi\\.gemini\\antigravity\\brain\\dea92c11-e6ad-4311-ad9a-2cfeae212e3c\\google_apps_script.md', gs);
console.log("Updated google_apps_script.md for Full CMS architecture");
