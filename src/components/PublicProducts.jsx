import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
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
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <Typography 
        variant="h4" 
        className="text-3xl font-light text-[#1F4B38] mb-8 text-center tracking-wide"
      >
        Our Products
      </Typography>

      <Grid 
        container 
        spacing={3} 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {products.map((product) => (
          <Grid item key={product.id}>
            <Card 
              className="h-full flex flex-col border-none shadow-md rounded-lg overflow-hidden 
                         transition-all duration-300 hover:shadow-xl group"
            >
              <CardMedia
                component="img"
                className="h-48 w-full object-cover group-hover:scale-105 transition-transform"
                image={`data:image/jpeg;base64,${product.image}`}
                alt={product.name}
              />
              <CardContent className="flex-grow flex flex-col p-4">
                <Typography 
                  variant="h6" 
                  className="text-lg font-semibold text-[#1F4B38] mb-2 truncate"
                >
                  {product.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  className="text-gray-600 mb-3 flex-grow text-sm line-clamp-2"
                >
                  {product.description}
                </Typography>
                <div className="flex justify-between items-center mt-auto">
                  <Typography 
                    variant="body2"
                    className="text-[#1F4B38] font-bold"
                  >
                    {product.price} RWF
                  </Typography>
                  <Button
                    variant="contained"
                    className="bg-[#1F4B38] hover:bg-[#2C6E54] text-white text-xs px-3 py-2 rounded-full"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {cart.length > 0 && (
        <Button
          variant="contained"
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 
                     bg-[#1F4B38] hover:bg-[#2C6E54] text-white py-3 px-8 rounded-full shadow-lg"
          onClick={handleOpenCheckout}
        >
          Proceed to Checkout
        </Button>
      )}

      <Dialog 
        open={isCheckoutOpen} 
        onClose={handleCloseCheckout}
        PaperProps={{
          className: "rounded-lg max-w-md"
        }}
      >
        <DialogTitle className="text-xl font-semibold text-[#1F4B38] text-center">
          Checkout
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" className="text-gray-700 mb-4">
            Cart Items
          </Typography>
          {cart.map((item) => (
            <div 
              key={item.id} 
              className="flex justify-between text-sm text-gray-600 mb-2"
            >
              {item.name} - {item.quantity} x {item.price} RWF
            </div>
          ))}

          <TextField
            label="Email"
            fullWidth
            variant="outlined"
            value={checkoutDetails.email}
            onChange={(e) => setCheckoutDetails({ ...checkoutDetails, email: e.target.value })}
            margin="normal"
            required
            className="mb-2"
          />
          <TextField
            label="Phone"
            fullWidth
            variant="outlined"
            value={checkoutDetails.phone}
            onChange={(e) => setCheckoutDetails({ ...checkoutDetails, phone: e.target.value })}
            margin="normal"
            required
            className="mb-2"
          />
          <TextField
            label="Address"
            fullWidth
            variant="outlined"
            value={checkoutDetails.address}
            onChange={(e) => setCheckoutDetails({ ...checkoutDetails, address: e.target.value })}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button 
            onClick={handleCloseCheckout} 
            className="text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCheckoutSubmit} 
            variant="contained"
            disabled={loading}
            className="bg-[#1F4B38] hover:bg-[#2C6E54] text-white"
          >
            {loading ? 'Processing...' : 'Place Order'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          className="rounded-lg"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PublicProducts;