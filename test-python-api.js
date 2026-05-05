const axios = require('axios');

async function testPythonApi() {
  console.log("Starting test...");
  try {
    const res = await axios.post('http://localhost:8000/api/process/complaint', {
      text: "test complaint",
      language: "en"
    });
    console.log("Response:", res.data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testPythonApi();
