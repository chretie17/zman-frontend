import React from 'react';
import { List, ListItem, ListItemText, Drawer, Typography, Box, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const userRole = localStorage.getItem('userRole'); // Get the user role from local storage
  const navigate = useNavigate();

  // Menu items for admin and sales
  const adminMenuItems = [
    { text: 'Dashboard', path: '/dashboard' },
    { text: 'Users', path: '/admin/users' },
    { text: 'Manage Products', path: '/admin/products' },
    { text: 'Manage Transactions', path: '/admin/transactions' },
  ];

  const salesMenuItems = [
    { text: 'Dashboard', path: '/dashboard' },
    { text: 'sales', path: '/sales/products' },
    { text: 'sales history', path: '/sales/history' },

  ];

  // Logout function to clear user data and navigate to login
  const handleLogout = () => {
    localStorage.clear(); // Clear all user-related data from localStorage
    navigate('/');   // Redirect to login page
  };

  return (
    <Drawer variant="permanent">
      <Box p={2} width="240px" textAlign="center">
        <Typography variant="h6" gutterBottom>
          {userRole === 'admin' ? 'Admin Menu' : 'Sales Menu'}
        </Typography>
        <List>
          {userRole === 'admin'
            ? adminMenuItems.map((item) => (
                <ListItem button={true} component={Link} to={item.path} key={item.text}>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))
            : salesMenuItems.map((item) => (
                <ListItem button={true} component={Link} to={item.path} key={item.text}>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
        </List>
        {/* Logout Button */}
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={handleLogout} 
          style={{ marginTop: '20px' }}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
