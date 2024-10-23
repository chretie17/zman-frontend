import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import { Home as HomeIcon, ShoppingCart as ProductsIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="static" style={{ backgroundColor: '#2c3e50' }}>
      <Toolbar>
        {/* Logo */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          style={{
            color: 'white',
            textDecoration: 'none',
            flexGrow: 1,
            fontWeight: 'bold',
            letterSpacing: '2px',
          }}
        >
          AgriStore
        </Typography>

        {/* Home Button */}
        <IconButton
          edge="start"
          component={Link}
          to="/"
          color="inherit"
          aria-label="home"
          style={{ marginRight: '20px' }}
        >
          <HomeIcon />
        </IconButton>

        {/* Products Button */}
        <Button
          component={Link}
          to="/products"
          color="inherit"
          startIcon={<ProductsIcon />}
          style={{ marginRight: '20px' }}
        >
          Products
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
