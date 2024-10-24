import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PublicProducts from './components/PublicProducts';
import HomePage from './components/HomePage';
import ManageUsers from './pages/ManageUsers';
import ProductManagement from './pages/ProductManagement';
import SalesProductManagement from './pages/SalesProductManagement';
import SalesTransactionHistory from './pages/SalesTransactionsHistory';
import AdminTransactionManagement from './pages/AdminTransactionHistory';
import AdminOrderManagement from './pages/AdminOrders';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Report from './Pages/Reports';
import GovernmentReport from './Pages/GovernmentReport';

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Store the user role in the state
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);
  
  // Track authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(!!userRole);

  // Handle logout action and update state
  const handleLogout = () => {
    localStorage.clear();
    setUserRole(null);
    setIsAuthenticated(false);
    navigate('/login'); // Redirect to login
  };

  // Update user role and authentication on component mount
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    setIsAuthenticated(!!role);
  }, [location]); // Update whenever the location changes (navigation)

  const isAdminOrSales = userRole === 'admin' || userRole === 'sales';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Show Sidebar only for admin or sales */}
      {isAdminOrSales && (
        <div style={{ width: '240px', position: 'fixed', top: 0, bottom: 0 }}>
          <Sidebar handleLogout={handleLogout} />
        </div>
      )}

      {/* Main content area */}
      <div
        style={{
          flexGrow: 1,
          marginLeft: isAdminOrSales ? '240px' : '0',
          padding: '20px',
          transition: 'margin-left 0.3s ease-in-out',
        }}
      >
        {/* Show Navbar only when the user is not an admin or sales and not on the login page */}
        {!isAdminOrSales && location.pathname !== '/login' && <Navbar />}

        {/* Define routes */}
        <Routes>
          {!isAuthenticated && <Route path="*" element={<Login />} />}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<PublicProducts />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/orders" element={<AdminOrderManagement />} />
          <Route path="/sales/products" element={<SalesProductManagement />} />
          <Route path="/sales/history" element={<SalesTransactionHistory />} />
          <Route path="/admin/transactions" element={<AdminTransactionManagement />} />
          <Route path="/admin/products" element={<ProductManagement />} />
          <Route path="/admin/reports" element={<Report />} />
          <Route path="/admin/govreport" element={<GovernmentReport />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
