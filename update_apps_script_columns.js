const fs = require('fs');

let gs = fs.readFileSync('C:\\Users\\yossi\\.gemini\\antigravity\\brain\\dea92c11-e6ad-4311-ad9a-2cfeae212e3c\\google_apps_script.md', 'utf8');

const updatedScript = `
// ==========================================
// 1. استرجاع البيانات للموقع (Content)
// ==========================================
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  // تعديل اسم الشيت بناءً على الصور اللي بعتها
  var contentSheet = ss.getSheetByName("Website_Content");
  
  var responseData = {};
  
  if (contentSheet) {
    var data = contentSheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      var key = data[i][0];
      var value = data[i][1];
      var status = data[i][2]; 
      
      if (key && status !== "Inactive" && status !== "inactive") {
        responseData[key] = value;
      }
    }
  }
  
  var jsonResponse = JSON.stringify(responseData);
  
  return ContentService.createTextOutput(jsonResponse)
    .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 2. استقبال الطلبات واليوزرز
// ==========================================
function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ordersSheet = ss.getSheetByName("Orders");
  var userSheet = ss.getSheetByName("User");
  
  var data = JSON.parse(e.postData.contents);
  var action = data.action; 
  var timestamp = new Date();
  
  // ==========================================
  // -- تسجيل الدخول --
  // ==========================================
  if (action === "login") {
    if(userSheet) {
      var lastRow = userSheet.getLastRow();
      if(lastRow > 1) {
        // قراءة الأعمدة بناءً على ترتيبك: Name, Email, Phone, Password, Address
        var userRows = userSheet.getRange(2, 1, lastRow - 1, 5).getValues(); 
        for(var i = 0; i < userRows.length; i++) {
          // Email هو العمود التاني (Index 1)
          if(userRows[i][1] === data.email) {
            // Password هو العمود الرابع (Index 3)
            if(userRows[i][3] === data.passwordHash) {
              return ContentService.createTextOutput(JSON.stringify({
                "status": "success",
                "user": {
                  "name": userRows[i][0],
                  "email": userRows[i][1],
                  "phone": userRows[i][2], // Phone هو العمود التالت
                  "address": userRows[i][4] // Address هو العمود الخامس
                }
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
  
  // ==========================================
  // -- استرجاع كلمة المرور --
  // ==========================================
  else if (action === "resetPassword") {
    if(userSheet) {
      var lastRow = userSheet.getLastRow();
      if(lastRow > 1) {
        var userRows = userSheet.getRange(2, 1, lastRow - 1, 4).getValues(); 
        for(var i = 0; i < userRows.length; i++) {
          // Email=1, Phone=2
          if(userRows[i][1] === data.email) {
            if(userRows[i][2] == data.phone) {
              var rowIndex = i + 2;
              // Password هو العمود الرابع (رقم 4 في الشيت)
              userSheet.getRange(rowIndex, 4).setValue(data.newPasswordHash);
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
  
  // ==========================================
  // -- إنشاء طلب جديد (وإنشاء حساب) --
  // ==========================================
  else if (action === "order") {
    var orderId = "ORD-" + Math.floor(Math.random() * 1000000);
    
    // ترتيب الأعمدة في Orders بناءً على صورتك:
    // Order ID | Date | Email | Name | Address | Payment | Products | Total
    if(ordersSheet) {
      ordersSheet.appendRow([orderId, timestamp, data.email, data.name, data.address, data.payment, data.products, data.total]);
    }
    
    // ترتيب الأعمدة في User بناءً على صورتك:
    // Name | Email | Phone | Password | Address | Created
    if(userSheet && data.passwordHash) {
      var userExists = false;
      var lastRow = userSheet.getLastRow();
      if(lastRow > 1) {
        var emails = userSheet.getRange(2, 2, lastRow - 1, 1).getValues(); 
        for(var i = 0; i < emails.length; i++) {
          if(emails[i][0] === data.email) {
            userExists = true; break;
          }
        }
      }
      if(!userExists) {
        userSheet.appendRow([data.name, data.email, data.phone, data.passwordHash, data.address, timestamp]);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success", "orderId": orderId})).setMimeType(ContentService.MimeType.JSON);
  }
  
  // ==========================================
  // -- تعديل البروفايل --
  // ==========================================
  else if (action === "updateProfile") {
    if(userSheet) {
      var lastRow = userSheet.getLastRow();
      if(lastRow > 1) {
        var emails = userSheet.getRange(2, 2, lastRow - 1, 1).getValues();
        for(var i = 0; i < emails.length; i++) {
          if(emails[i][0] === data.oldEmail) {
            var rowIndex = i + 2; 
            // الإيميل=2, التليفون=3, العنوان=5
            userSheet.getRange(rowIndex, 2).setValue(data.newEmail);
            userSheet.getRange(rowIndex, 3).setValue(data.newPhone); 
            userSheet.getRange(rowIndex, 5).setValue(data.newAddress); 
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

// Replace the entire code block in the md
gs = gs.replace(/```javascript[\s\S]*?```/, "```javascript\n" + updatedScript + "```");
fs.writeFileSync('C:\\Users\\yossi\\.gemini\\antigravity\\brain\\dea92c11-e6ad-4311-ad9a-2cfeae212e3c\\google_apps_script.md', gs);
console.log("Updated google apps script with correct column schema");
