require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- INITIALIZATION ---
const app = express();
const port = 5000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'products.json')));

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- API ENDPOINTS ---

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/ai-search', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    // --- FINAL, ROBUST JSON CLEANING ---
    // This regular expression finds the first valid JSON object in the response text.
    const jsonMatch = text.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON object found in AI response.");
    }
    const jsonString = jsonMatch[0];
    // --- End of final fix ---
    
    const searchCriteria = JSON.parse(jsonString);

    let filteredProducts = products;
    if (searchCriteria.category) {
      filteredProducts = filteredProducts.filter(
        (p) => p.category.toLowerCase() === searchCriteria.category.toLowerCase()
      );
    }
    if (Array.isArray(searchCriteria.attributes) && searchCriteria.attributes.length > 0) {
      filteredProducts = filteredProducts.filter((p) =>
        searchCriteria.attributes.some((attr) =>
          p.name.toLowerCase().includes(attr.toLowerCase())
        )
      );
    }

    res.json(filteredProducts);
  } catch (error) {
    console.error('AI search error:', error);
    res.status(500).json({ error: 'Failed to perform AI search', details: error.message });
  }
});

// --- START SERVER ---
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});