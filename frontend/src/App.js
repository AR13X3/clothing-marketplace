import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = 'https://clothing-marketplace-api-3m8m.onrender.com'; // <-- IMPORTANT: PASTE YOUR RENDER URL HERE

  // Function to fetch all products initially
  const fetchAllProducts = () => {
    setIsLoading(true);
    fetch(`${API_URL}/api/products`)
      .then(response => response.json())
      .then(data => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setIsLoading(false);
      });
  };

  // Fetch all products when the component first loads
  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Function to handle the AI search
  const handleSearch = (e) => {
    e.preventDefault(); // Prevent form from reloading the page
    if (!searchQuery) return; // Don't search if query is empty

    setIsLoading(true);
    fetch(`${API_URL}/api/ai-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: searchQuery }),
    })
      .then(response => response.json())
      .then(data => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error with AI search:', error);
        setIsLoading(false);
      });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Clothing Marketplace</h1>
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Describe what you're looking for..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-button" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </header>
      <main className="product-grid">
        {products.length > 0 ? (
          products.map(product => (
            <div key={product.id} className="product-card">
              <img src={product.imageUrl} alt={product.name} className="product-image" />
              <h2 className="product-name">{product.name}</h2>
              <p className="product-price">${product.price.toFixed(2)}</p>
            </div>
          ))
        ) : (
          <p>{isLoading ? 'Loading products...' : 'No products found matching your search.'}</p>
        )}
      </main>
    </div>
  );
}

export default App;