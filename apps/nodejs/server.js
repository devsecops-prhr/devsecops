const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "nodejs", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.json({ message: "DevSecOps Node.js app" });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Node.js app listening on port ${port}`);
  });
}

module.exports = app;
