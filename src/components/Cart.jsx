import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Grid } from '@mui/material';
import { Link } from 'react-router-dom';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(items);
  }, []);

  const handleCheckout = () => {
    // Redirect to checkout or handle checkout logic
  };

  if (cartItems.length === 0) {
    return (
      <Container>
        <Typography variant="h5" gutterBottom>
          Your Cart is Empty
        </Typography>
        <Button component={Link} to="/products" variant="contained" color="primary">
          Shop Now
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Your Cart
      </Typography>
      <Grid container spacing={3}>
        {cartItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Typography variant="body1">
              {item.name} - {item.quantity} x {item.price} RWF
            </Typography>
          </Grid>
        ))}
      </Grid>
      <Button onClick={handleCheckout} variant="contained" color="primary" style={{ marginTop: '20px' }}>
        Proceed to Checkout
      </Button>
    </Container>
  );
};

export default Cart;
