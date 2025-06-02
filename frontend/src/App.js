import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // 'useState' creates a state variable to store our products.
  // It starts as an empty array [].
  const [products, setProducts] = useState([]);

  // 'useEffect' runs code after the component mounts (loads).
  // This is the perfect place to fetch data.
  useEffect(() => {
    // Fetch data from our backend API endpoint
    fetch('http://localhost:5000/api/products')
      .then(response => response.json()) // Parse the JSON response
      .then(data => setProducts(data))   // Update our state with the fetched data
      .catch(error => console.error('Error fetching products:', error));
  }, []); // The empty array [] ensures this effect runs only once.

  return (
    <div className="App">
      <header className="App-header">
        <h1>Clothing Marketplace</h1>
      </header>
      <main className="product-grid">
        {/* Map over the products array and display each one */}
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.imageUrl} alt={product.name} className="product-image" />
            <h2 className="product-name">{product.name}</h2>
            <p className="product-price">${product.price.toFixed(2)}</p>
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;