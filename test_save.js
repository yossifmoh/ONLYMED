const URL = "https://script.google.com/macros/s/AKfycbwv1vuPsTUNXz6BMvtxUwxSqnf9Tq1CX21KLMq0nL3aYFebslLVEe5V0i-VIHyJLhlr/exec";

async function testSave() {
  const data = {
    action: 'adminSaveProduct',
    id: '',
    image: 'test',
    name_en: 'test',
    name_ar: 'test',
    desc_en: 'test',
    desc_ar: 'test',
    category: 'test',
    price: '100',
    oldPrice: '',
    badge: '',
    stock: '10',
    status: 'Active'
  };

  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: {'Content-Type': 'text/plain'},
      body: JSON.stringify(data)
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Text:", text);
  } catch(e) {
    console.error("Error:", e);
  }
}

testSave();
