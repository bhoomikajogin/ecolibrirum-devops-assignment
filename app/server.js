const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const MESSAGE = process.env.MESSAGE || "Hello from EKS!";
const VERSION = process.env.VERSION || "v1";

app.get('/', (req, res) => {
  res.json({
    message: MESSAGE,
    version: VERSION,
    hostname: require('os').hostname()
  });
});

app.get('/health', (req, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});