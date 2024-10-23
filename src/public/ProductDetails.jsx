import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, TextField, Grid, Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import API from '../API'; // Import API instance
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert'; // To show the alert inside the snackbar

const ProductDetails = () => {
  const { id } = useParams(); // Get product ID from URL
  const [product, setProduct] = useState(null); // State to store product data
  const [quantity, setQuantity] = useState(1); // Default quantity of the product
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar state
  const [snackbarMessage, setSnackbarMessage] = useState(''); // Snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // Snackbar severity: success, error, etc.

  // Fetch product details from API
  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const apiInstance = API.getApiInstance();
      const response = await apiInstance.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      setSnackbarMessage('Failed to load product details.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      console.error('Error fetching product details:', error);
    }
  };

  // Handle adding product to cart
  const handleAddToCart = () => {
    try {
      const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
      const newItem = { ...product, quantity };
      localStorage.setItem('cart', JSON.stringify([...cartItems, newItem]));
      
      setSnackbarMessage('Product added to cart!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true); // Open Snackbar
    } catch (error) {
      setSnackbarMessage('Error adding product to cart.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Handle closing the Snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // If the product is not loaded yet, display a loading message
  if (!product) {
    return (
      <Container>
        <Typography variant="h5" gutterBottom>
          Loading Product Details...
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box>
            <img
              src={`data:image/jpeg;base64,${product.image}`}
              alt={product.name}
              style={{ width: '100%', height: 'auto' }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h4">{product.name}</Typography>
          <Typography variant="body1" gutterBottom>
            {product.description}
          </Typography>
          <Typography variant="h6" gutterBottom>
            Price: {product.price} RWF
          </Typography>
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </Grid>
      </Grid>

      {/* Snackbar for user feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductDetails;
