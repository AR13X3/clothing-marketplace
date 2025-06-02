const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // 1. Import the cors package

const app = express();
const port = 5000;

app.use(cors()); // 2. Enable CORS for all routes

app.get('/api/products', (req, res) => {
  const productsFilePath = path.join(__dirname, 'products.json');
  fs.readFile(productsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('An error occurred');
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});