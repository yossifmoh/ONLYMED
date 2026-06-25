const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwv1vuPsTUNXz6BMvtxUwxSqnf9Tq1CX21KLMq0nL3aYFebslLVEe5V0i-VIHyJLhlr/exec";

async function testOrder() {
  const orderData = {
    action: 'order',
    name: 'Test AI',
    phone: '010000000',
    email: 'test@example.com',
    password: '123',
    address: 'Cairo',
    payment: 'COD',
    products: 'Test Product x1',
    total: 100.50
  };

  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {'Content-Type': 'text/plain'}, // Use text/plain for apps script
        body: JSON.stringify(orderData)
    });
    const text = await res.text();
    console.log("Response:", text);
  } catch(e) {
    console.log("Error:", e.message);
  }
}

testOrder();
