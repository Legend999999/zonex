const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(__dirname)); // serve html/css/js

const productsFile = path.join(__dirname, 'products.json');

// Helper to read/write JSON
function readProducts() {
  return JSON.parse(fs.readFileSync(productsFile, 'utf-8'));
}

function writeProducts(data) {
  fs.writeFileSync(productsFile, JSON.stringify(data, null, 2));
}

// Get all products
app.get('/products', (req, res) => {
  res.json(readProducts());
});

// Add product
app.post('/add', (req, res) => {
  const { category, name, price, description } = req.body;
  const data = readProducts();
  if (!data[category]) data[category] = [];
  data[category].push({ name, price, description: description || '' });
  writeProducts(data);
  res.json({ success: true });
});

// Edit product
app.post('/edit', (req, res) => {
  const { category, oldName, newName, newPrice, newDesc } = req.body;
  const data = readProducts();
  if (!data[category]) return res.json({ success: false });

  data[category] = data[category].map(p => {
    if (p.name === oldName) {
      return {
        name: newName || p.name,
        price: newPrice || p.price,
        description: newDesc || p.description || ''
      };
    }
    return p;
  });

  writeProducts(data);
  res.json({ success: true });
});

// Remove product
app.post('/remove', (req, res) => {
  const { category, name } = req.body;
  const data = readProducts();
  if (!data[category]) return res.json({ success: false });
  data[category] = data[category].filter(p => p.name !== name);
  writeProducts(data);
  res.json({ success: true });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
