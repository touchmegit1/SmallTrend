const axios = require('axios');
axios.post('http://localhost:8081/api/ai/chat', {
  query: "Hello",
  sessionId: null,
  contextDate: "2025-02-20"
}).then(() => {})
  .catch(err => console.error(err.message));
