import React, { useState, useEffect } from 'react';
import './App.css';

// --- IMPORTANT: REPLACE THIS URL ---
// Paste the URL for your live backend server from Render.com here.
// It should look something like: 'https://your-app-name.onrender.com'
const API_URL = 'https://clothing-marketplace-api-3m8m.onrender.com'; 
// ------------------------------------


function App() {
  // State to store the list of products fetched from the backend
  const [products, setProducts] = useState([]);
  // State to handle loading status
  const [isLoading, setIsLoading] = useState(true);
  // State to store any potential errors
  const [error, setError] = useState(null);

  // useEffect hook to fetch data when the component loads
  useEffect(() => {
    // Fetch data from your backend's /api/products endpoint
    fetch(`${API_URL}/api/products`)
      .then(response => {
        // If the response is not 'ok' (e.g., status 404 or 500), throw an error
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON data from the response
      })
      .then(data => {
        setProducts(data); // Update the products state with the fetched data
        setIsLoading(false); // Set loading to false as we have the data
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setError(error); // Store the error state
        setIsLoading(false); // Set loading to false even if there's an error
      });
  }, []); // The empty array [] means this effect runs only once, like componentDidMount

  // Conditional rendering based on the state
  const renderContent = () => {
    if (isLoading) {
      return <p>Loading products...</p>;
    }
    if (error) {
      return <p>Error loading products. Please check the API URL and make sure the backend is running.</p>;
    }
    if (products.length === 0) {
      return <p>No products found.</p>;
    }
    return products.map(product => (
      <div key={product.id} className="product-card">
        <img src={product.imageUrl} alt={product.name} className="product-image" />
        <h2 className="product-name">{product.name}</h2>
        <p className="product-price">${product.price.toFixed(2)}</p>
      </div>
    ));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Clothing Marketplace</h1>
      </header>
      <main className="product-grid">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;