// ================== GOOGLE APPS SCRIPT EXTENSION ==================
// Copy and paste this code into your Google Apps Script editor.
// It adds the 'adminGetAnalytics' server-side endpoint.

function doPost(e) {
  var requestData = JSON.parse(e.postData.contents);
  var action = requestData.action;

  if (action === 'adminGetAnalytics') {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: calculateAnalytics(requestData.dateFilter, requestData.startDate, requestData.endDate)
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // ... (maintain your existing actions like adminGetDashboardData, adminSaveProduct, order, etc.)
}

function calculateAnalytics(filter, customStart, customEnd) {
  var sheets = SpreadsheetApp.getActiveSpreadsheet();
  
  // Fetch raw sheet data
  var products = getSheetData(sheets.getSheetByName("Products"));
  var orders = getSheetData(sheets.getSheetByName("Orders"));
  var users = getSheetData(sheets.getSheetByName("Users"));

  // Date parsing helper
  var now = new Date();
  var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var startLimit = null;
  var endLimit = null;

  if (filter === 'today') {
    startLimit = startOfToday;
  } else if (filter === 'week') {
    startLimit = new Date(startOfToday.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
  } else if (filter === 'month') {
    startLimit = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (filter === 'year') {
    startLimit = new Date(now.getFullYear(), 0, 1);
  } else if (filter === 'custom') {
    if (customStart) {
      startLimit = new Date(customStart);
      startLimit.setHours(0,0,0,0);
    }
    if (customEnd) {
      endLimit = new Date(customEnd);
      endLimit.setHours(23,59,59,999);
    }
  }

  function isInRange(dateStr) {
    if (!dateStr) return false;
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    if (startLimit && d < startLimit) return false;
    if (endLimit && d > endLimit) return false;
    return true;
  }

  // Robust product parser
  function parseProducts(productsStr) {
    var items = [];
    if (!productsStr) return items;
    if (productsStr.indexOf('[') === 0 && productsStr.indexOf(']') === productsStr.length - 1) {
      try {
        return JSON.parse(productsStr);
      } catch (err) {}
    }
    var parts = productsStr.split(',');
    for (var i = 0; i < parts.length; i++) {
      var trimmed = parts[i].trim();
      if (!trimmed) continue;
      var lastX = trimmed.lastIndexOf(' x');
      var name = trimmed;
      var qty = 1;
      if (lastX !== -1) {
        name = trimmed.substring(0, lastX).trim();
        qty = parseInt(trimmed.substring(lastX + 2).trim()) || 1;
      }
      items.push({ name: name, qty: qty });
    }
    return items;
  }

  // Filter orders in range
  var filteredOrders = [];
  var totalRevenue = 0;
  var paymentMethods = {};
  var orderStatuses = {};
  var categorySales = {};
  var productSales = {};

  // For monthly growth comparison (Previous period vs current period)
  var prevPeriodStart = null;
  var prevPeriodEnd = null;
  if (filter === 'month') {
    prevPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    prevPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (filter === 'week') {
    prevPeriodStart = new Date(startLimit.getTime() - 7 * 24 * 60 * 60 * 1000);
    prevPeriodEnd = new Date(startLimit.getTime() - 1);
  }

  var currentRevenue = 0;
  var previousRevenue = 0;

  for (var i = 0; i < orders.length; i++) {
    var o = orders[i];
    var orderDate = new Date(o.date);
    
    // Revenue tracking
    var isCompleted = o.status === 'Completed' || o.status === 'Delivered';
    var orderTotal = parseFloat(o.total) || 0;

    if (isInRange(o.date)) {
      filteredOrders.push(o);
      if (isCompleted) {
        currentRevenue += orderTotal;
        totalRevenue += orderTotal;
      }

      // Payment counts
      var pay = (o.payment || 'COD').toUpperCase();
      paymentMethods[pay] = (paymentMethods[pay] || 0) + 1;

      // Status counts
      var st = o.status || 'Pending';
      orderStatuses[st] = (orderStatuses[st] || 0) + 1;

      // Product and category sales
      if (isCompleted) {
        var items = parseProducts(o.products);
        for (var j = 0; j < items.length; j++) {
          var item = items[j];
          // Find category
          var category = 'Vitamins';
          var prodPrice = 0;
          for (var k = 0; k < products.length; k++) {
            if (products[k].name_en === item.name || products[k].id == item.id) {
              category = products[k].category || 'Vitamins';
              prodPrice = parseFloat(products[k].price) || 0;
              break;
            }
          }
          var itemTotal = (prodPrice || (orderTotal / items.length)) * item.qty;
          categorySales[category] = (categorySales[category] || 0) + itemTotal;
          
          productSales[item.name] = productSales[item.name] || { name: item.name, qty: 0, revenue: 0 };
          productSales[item.name].qty += item.qty;
          productSales[item.name].revenue += itemTotal;
        }
      }
    }

    // Previous period revenue calculation for growth
    if (isCompleted && prevPeriodStart && prevPeriodEnd) {
      if (orderDate >= prevPeriodStart && orderDate <= prevPeriodEnd) {
        previousRevenue += orderTotal;
      }
    }
  }

  // Growth calculation
  var growthPct = 0;
  if (previousRevenue > 0) {
    growthPct = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
  } else if (currentRevenue > 0) {
    growthPct = 100;
  }

  // Format top selling products
  var topSelling = Object.keys(productSales).map(function(k) {
    return productSales[k];
  }).sort(function(a, b) {
    return b.revenue - a.revenue;
  }).slice(0, 5);

  // Revenue Over Time dataset
  var revenueOverTime = {};
  var dateSortedOrders = filteredOrders.filter(function(o) {
    return o.status === 'Completed' || o.status === 'Delivered';
  }).sort(function(a, b) {
    return new Date(a.date) - new Date(b.date);
  });

  for (var i = 0; i < dateSortedOrders.length; i++) {
    var o = dateSortedOrders[i];
    var d = new Date(o.date);
    var dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    revenueOverTime[dateLabel] = (revenueOverTime[dateLabel] || 0) + (parseFloat(o.total) || 0);
  }

  // Inventory stats
  var lowStockCount = 0;
  var outOfStockCount = 0;
  var totalInventoryValue = 0;
  for (var i = 0; i < products.length; i++) {
    var p = products[i];
    var stock = parseInt(p.stock) || 0;
    var price = parseFloat(p.price) || 0;
    if (stock === 0) {
      outOfStockCount++;
    } else if (stock <= 5) {
      lowStockCount++;
    }
    totalInventoryValue += stock * price;
  }

  // Customer Analytics (all-time based on current filters)
  var uniqueCustomers = {};
  var customerOrderCounts = {};
  for (var i = 0; i < orders.length; i++) {
    var o = orders[i];
    var email = o.email || o.name;
    if (isInRange(o.date)) {
      uniqueCustomers[email] = true;
      customerOrderCounts[email] = (customerOrderCounts[email] || 0) + 1;
    }
  }

  var newCustomersCount = 0;
  var returningCustomersCount = 0;
  var uniqueEmails = Object.keys(uniqueCustomers);
  for (var i = 0; i < uniqueEmails.length; i++) {
    var email = uniqueEmails[i];
    if (customerOrderCounts[email] > 1) {
      returningCustomersCount++;
    } else {
      newCustomersCount++;
    }
  }

  var repeatPurchaseRate = 0;
  if (uniqueEmails.length > 0) {
    repeatPurchaseRate = (returningCustomersCount / uniqueEmails.length) * 100;
  }

  // Recent Activity Timeline
  var activity = [];
  // 1. Orders
  for (var i = 0; i < orders.length; i++) {
    var o = orders[i];
    if (isInRange(o.date)) {
      activity.push({
        type: 'order',
        title: 'New Order Received',
        desc: o.name + ' placed order ' + o.id + ' for EGP ' + o.total,
        date: o.date
      });
    }
  }
  // 2. Users
  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    if (isInRange(u.created)) {
      activity.push({
        type: 'user',
        title: 'New User Registered',
        desc: u.name + ' (' + u.email + ') created an account',
        date: u.created
      });
    }
  }
  // 3. Products
  for (var i = 0; i < products.length; i++) {
    var p = products[i];
    if (isInRange(p.created)) {
      activity.push({
        type: 'product',
        title: 'New Product Created',
        desc: p.name_en + ' added to inventory (Stock: ' + p.stock + ')',
        date: p.created
      });
    }
  }

  // Sort activity descending by date
  activity.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });
  activity = activity.slice(0, 15);

  return {
    kpis: {
      totalRevenue: totalRevenue,
      totalOrders: filteredOrders.length,
      totalCustomers: uniqueEmails.length,
      totalProducts: products.length,
      aov: filteredOrders.length > 0 ? (totalRevenue / filteredOrders.filter(function(o){ return o.status === 'Completed' || o.status === 'Delivered'; }).length || 1) : 0,
      growth: growthPct
    },
    charts: {
      revenueOverTime: {
        labels: Object.keys(revenueOverTime),
        data: Object.values(revenueOverTime)
      },
      paymentMethods: {
        labels: Object.keys(paymentMethods),
        data: Object.values(paymentMethods)
      },
      orderStatuses: {
        labels: Object.keys(orderStatuses),
        data: Object.values(orderStatuses)
      },
      categorySales: {
        labels: Object.keys(categorySales),
        data: Object.values(categorySales)
      },
      topSelling: {
        labels: topSelling.map(function(x) { return x.name; }),
        qty: topSelling.map(function(x) { return x.qty; }),
        revenue: topSelling.map(function(x) { return x.revenue; })
      }
    },
    inventory: {
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
      totalValue: totalInventoryValue
    },
    customers: {
      new: newCustomersCount,
      returning: returningCustomersCount,
      repeatRate: repeatPurchaseRate
    },
    activity: activity
  };
}

// Utility to convert Sheet data to JSON Array
function getSheetData(sheet) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    rows.push(obj);
  }
  return rows;
}
