import React, { useState, useEffect } from 'react';
import { 
  Card as MUICard, 
  CardContent as MUICardContent, 
  CardMedia as MUICardMedia 
} from '@mui/material';
import API from '../api';

const PublicProducts = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState({ email: '', phone: '', address: '' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const apiInstance = API.getApiInstance();
      const response = await apiInstance.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addToCart = (product) => {
    const existingProduct = cart.find((item) => item.id === product.id);
    if (existingProduct) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setSnackbarMessage(`${product.name} added to cart`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleOpenCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
  };

  const handleCheckoutSubmit = async () => {
    setError('');
    setLoading(true);

    if (!checkoutDetails.email || !checkoutDetails.phone || !checkoutDetails.address) {
      setSnackbarMessage('Please fill in all fields');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLoading(false);
      return;
    }

    try {
      const apiInstance = API.getApiInstance();
      const response = await apiInstance.post('/orders', {
        customerEmail: checkoutDetails.email,
        customerPhone: checkoutDetails.phone,
        customerAddress: checkoutDetails.address,
        cartItems: cart,
      });

      setCart([]);
      setCheckoutDetails({ email: '', phone: '', address: '' });
      setIsCheckoutOpen(false);
      setSnackbarMessage('Order placed successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('Error placing order');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-emerald-900 mb-12 tracking-tight drop-shadow-md">
          Discover Our Products
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="transform transition-all duration-300 hover:-translate-y-2 hover:scale-105"
            >
              <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={`data:image/jpeg;base64,${product.image}`} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-emerald-900 mb-2 truncate">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 h-12 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-800 font-bold text-lg">
                      {product.price} RWF
                    </span>
                    <button 
                      onClick={() => addToCart(product)}
                      className="bg-emerald-900 text-white px-4 py-2 rounded-full hover:bg-emerald-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <button 
              onClick={handleOpenCheckout}
              className="bg-emerald-900 text-white px-8 py-3 rounded-full shadow-xl hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500"
            >
              Proceed to Checkout
            </button>
          </div>
        )}

        {isCheckoutOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-6">
              <h2 className="text-2xl font-bold text-center text-emerald-900">Checkout</h2>
              
              <div className="space-y-4">
                {cart.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex justify-between text-sm text-gray-600 border-b pb-2"
                  >
                    {item.name} - {item.quantity} x {item.price} RWF
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={checkoutDetails.email}
                  onChange={(e) => setCheckoutDetails({ ...checkoutDetails, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required 
                />
                <input 
                  type="tel" 
                  placeholder="Phone" 
                  value={checkoutDetails.phone}
                  onChange={(e) => setCheckoutDetails({ ...checkoutDetails, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Address" 
                  value={checkoutDetails.address}
                  onChange={(e) => setCheckoutDetails({ ...checkoutDetails, address: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required 
                />
              </div>

              <div className="flex justify-between space-x-4">
                <button 
                  onClick={handleCloseCheckout}
                  className="w-full text-gray-600 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCheckoutSubmit}
                  disabled={loading}
                  className="w-full bg-emerald-900 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        )}

        {snackbarOpen && (
          <div 
            className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[200] 
              ${snackbarSeverity === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'} 
              px-6 py-3 rounded-full shadow-xl animate-bounce`}
            onAnimationEnd={() => setSnackbarOpen(false)}
          >
            {snackbarMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProducts;