const URL = "https://script.google.com/macros/s/AKfycbwv1vuPsTUNXz6BMvtxUwxSqnf9Tq1CX21KLMq0nL3aYFebslLVEe5V0i-VIHyJLhlr/exec";

async function testScript() {
  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: {'Content-Type': 'text/plain'},
      body: JSON.stringify({ action: 'adminGetDashboardData' })
    });
    
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response Text:", text);
    try {
      const json = JSON.parse(text);
      console.log("Valid JSON:", Object.keys(json));
    } catch(e) {
      console.log("Response is not JSON");
    }
  } catch(e) {
    console.error("Fetch Error:", e);
  }
}

testScript();
