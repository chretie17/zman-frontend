import React from 'react';
import { Typography, Box } from '@mui/material';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const userRole = localStorage.getItem('userRole'); // Get the user role from local storage

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <Box marginLeft="240px" padding="20px">
        <Typography variant="h4">Dashboard</Typography>
        <Typography variant="body1">Welcome to the {userRole} dashboard!</Typography>
      </Box>
    </div>
  );
};

export default Dashboard;
