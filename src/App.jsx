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
import AdminBeneficiaryManagement from './Pages/AdminBeneficiaries';

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!userRole);

  const handleLogout = () => {
    localStorage.clear();
    setUserRole(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    setIsAuthenticated(!!role);
  }, [location]);

  const isAdminOrSales = userRole === 'admin' || userRole === 'sales';
  const isLoginPage = location.pathname === '/login';

  // Create a style object based on the current page and user role
  const mainContentStyle = {
    flexGrow: 1,
    marginLeft: isAdminOrSales ? '240px' : '0',
    padding: isLoginPage ? '0' : '20px', // Remove padding for login page
    transition: 'margin-left 0.3s ease-in-out',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh',
      margin: 0,
      padding: 0,
    }}>
      {isAdminOrSales && (
        <div style={{ 
          width: '240px', 
          position: 'fixed', 
          top: 0, 
          bottom: 0,
          left: 0,
          zIndex: 1000
        }}>
          <Sidebar handleLogout={handleLogout} />
        </div>
      )}

      <div style={mainContentStyle}>
        {!isAdminOrSales && !isLoginPage && <Navbar />}
        <div style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          // Remove padding for login page
          padding: isLoginPage ? 0 : undefined
        }}>
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
            <Route path="/admin/beneficiaries" element={<AdminBeneficiaryManagement />} />
          </Routes>
        </div>
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