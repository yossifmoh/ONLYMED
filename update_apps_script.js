const fs = require('fs');

// 1. UPDATE GOOGLE APPS SCRIPT MD
let gs = fs.readFileSync('C:\\Users\\yossi\\.gemini\\antigravity\\brain\\dea92c11-e6ad-4311-ad9a-2cfeae212e3c\\google_apps_script.md', 'utf8');

// The new doPost script
const newDoPost = `
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
  
  // -- تسجيل الدخول --
  if (action === "login") {
    if(userSheet) {
      var lastRow = userSheet.getLastRow();
      if(lastRow > 1) {
        var userRows = userSheet.getRange(2, 1, lastRow - 1, 5).getValues(); 
        for(var i = 0; i < userRows.length; i++) {
          // email is col 1, password is col 2 in 0-indexed array
          if(userRows[i][1] === data.email) {
            if(userRows[i][2] === data.passwordHash) {
              return ContentService.createTextOutput(JSON.stringify({
                "status": "success",
                "user": {
                  "name": userRows[i][0],
                  "email": userRows[i][1],
                  "phone": userRows[i][3],
                  "address": userRows[i][4]
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
  
  // -- استرجاع كلمة المرور --
  else if (action === "resetPassword") {
    if(userSheet) {
      var lastRow = userSheet.getLastRow();
      if(lastRow > 1) {
        var userRows = userSheet.getRange(2, 1, lastRow - 1, 4).getValues(); 
        for(var i = 0; i < userRows.length; i++) {
          // email = 1, phone = 3
          if(userRows[i][1] === data.email) {
            if(userRows[i][3] == data.phone) {
              var rowIndex = i + 2;
              userSheet.getRange(rowIndex, 3).setValue(data.newPasswordHash);
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
  
  // -- إنشاء طلب --
  else if (action === "order") {
    var orderId = "ORD-" + Math.floor(Math.random() * 1000000);
    
    if(ordersSheet) {
      ordersSheet.appendRow([orderId, timestamp, data.name, data.address, data.payment, data.products, data.total]);
    }
    
    // Create account only if password is provided (not logged in)
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
        userSheet.appendRow([data.name, data.email, data.passwordHash, data.phone, data.address, timestamp]);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success", "orderId": orderId})).setMimeType(ContentService.MimeType.JSON);
  }
  
  // -- تعديل البروفايل --
  else if (action === "updateProfile") {
    if(userSheet) {
      var lastRow = userSheet.getLastRow();
      if(lastRow > 1) {
        var emails = userSheet.getRange(2, 2, lastRow - 1, 1).getValues();
        for(var i = 0; i < emails.length; i++) {
          if(emails[i][0] === data.oldEmail) {
            var rowIndex = i + 2; 
            userSheet.getRange(rowIndex, 2).setValue(data.newEmail);
            userSheet.getRange(rowIndex, 4).setValue(data.newPhone);
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

gs = gs.replace(/\/\/ ==========================================\n\/\/ 2\. استقبال الطلبات واليوزرز\n\/\/ ==========================================.*/s, newDoPost + "\n```\n\nبعد ما تنسخه وتحطه:");

fs.writeFileSync('C:\\Users\\yossi\\.gemini\\antigravity\\brain\\dea92c11-e6ad-4311-ad9a-2cfeae212e3c\\google_apps_script.md', gs);
console.log("Updated google apps script md");
