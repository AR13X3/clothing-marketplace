require('dotenv').config(); // Loads environment variables from .env
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Import Google AI SDK [cite: 33]

// --- INITIALIZATION ---
const app = express();
const port = 5000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Initialize with API Key
const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'products.json')));

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json()); // Middleware to parse incoming JSON requests

// --- API ENDPOINTS ---

// Endpoint to get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// New AI Search Endpoint [cite: 34, 36]
app.post('/api/ai-search', async (req, res) => {
  const { query } = req.body; // Get search query from the request [cite: 34]

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // This prompt instructs Gemini on how to behave and what to return [cite: 35]
    const prompt = `
      Analyze the following user query for a clothing store: "${query}".
      Extract the most likely product category and any specific attributes.
      The available categories are: "Tops", "Bottoms", "Jackets".
      Return ONLY a single, minified JSON object with "category" (a string) and "attributes" (an array of strings).
      If a category isn't clear, use an empty string. If no attributes are found, use an empty array.
      Example for "a warm stylish jacket": {"category":"Jackets","attributes":["warm","stylish"]}.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the structured JSON response from Gemini [cite: 29]
    const searchCriteria = JSON.parse(text);

    // Filter products based on the AI's response [cite: 36]
    let filteredProducts = products;

    if (searchCriteria.category) {
      filteredProducts = filteredProducts.filter(
        (p) => p.category.toLowerCase() === searchCriteria.category.toLowerCase()
      );
    }

    if (searchCriteria.attributes && searchCriteria.attributes.length > 0) {
      filteredProducts = filteredProducts.filter((p) =>
        searchCriteria.attributes.some((attr) =>
          p.name.toLowerCase().includes(attr.toLowerCase())
        )
      );
    }

    res.json(filteredProducts);
  } catch (error) {
    console.error('AI search error:', error);
    res.status(500).json({ error: 'Failed to perform AI search' });
  }
});

// --- START SERVER ---
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});