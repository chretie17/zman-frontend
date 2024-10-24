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
import API from '../api'; // Import API instance

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
    <div>
      <Typography variant="h4" gutterBottom>
        Products
      </Typography>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={`data:image/jpeg;base64,${product.image}`}
                alt={product.name}
              />
              <CardContent>
                <Typography variant="h6">{product.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {product.description}
                </Typography>
                <Typography variant="body2">
                  <strong>Price:</strong> {product.price} RWF
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  style={{ marginTop: '10px' }}
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Button
        variant="contained"
        color="secondary"
        fullWidth
        style={{ marginTop: '20px' }}
        onClick={handleOpenCheckout}
        disabled={cart.length === 0}
      >
        Checkout
      </Button>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onClose={handleCloseCheckout}>
        <DialogTitle>Checkout</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Cart Items</Typography>
          {cart.map((item) => (
            <Typography key={item.id} variant="body2">
              {item.name} - {item.quantity} x {item.price} RWF
            </Typography>
          ))}

          <TextField
            label="Email"
            fullWidth
            value={checkoutDetails.email}
            onChange={(e) => setCheckoutDetails({ ...checkoutDetails, email: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            label="Phone"
            fullWidth
            value={checkoutDetails.phone}
            onChange={(e) => setCheckoutDetails({ ...checkoutDetails, phone: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            label="Address"
            fullWidth
            value={checkoutDetails.address}
            onChange={(e) => setCheckoutDetails({ ...checkoutDetails, address: e.target.value })}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCheckout} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleCheckoutSubmit} variant="contained" color="primary" disabled={loading}>
            {loading ? 'Processing...' : 'Place Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PublicProducts;
