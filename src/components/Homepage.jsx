import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button } from '@mui/material';

const HomePage = () => {
  return (
    <Container maxWidth="lg" style={{ marginTop: '20px' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '50px 0' }}>
        <Typography variant="h2" gutterBottom>
          Welcome to Our E-Commerce Store
        </Typography>
        <Typography variant="h5" color="textSecondary" paragraph>
          Discover the best products at unbeatable prices.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={Link}
          to="/products"
          style={{ marginTop: '20px' }}
        >
          Start Shopping
        </Button>
      </section>

      {/* Call to Action Section */}
      <section style={{ marginTop: '50px', textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Explore Our Collection
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Browse through our wide variety of products and choose the ones you love.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          component={Link}
          to="/products"
          style={{ marginTop: '20px' }}
        >
          Go to Products
        </Button>
      </section>
    </Container>
  );
};

export default HomePage;
