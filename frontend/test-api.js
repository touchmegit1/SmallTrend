const axios = require('axios');

async function test() {
  try {
    const res = await axios.put('http://localhost:8081/api/crm/tickets/1', {
      title: "Test bug",
      description: "Test description",
      priority: "NORMAL",
      status: "RESOLVED",
      resolution: "Tested resolution"
    });
    console.log("SUCCESS:", res.data);
  } catch (e) {
    console.error("ERROR:", e.response ? e.response.data : e.message);
  }
}

test();
