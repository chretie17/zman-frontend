import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PublicProducts from './components/PublicProducts';
import ManageUsers from './pages/ManageUsers';
import ProductManagement from './pages/ProductManagement';
import SalesProductManagement from './pages/SalesProductManagement';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import SalesTransactionHistory from './pages/SalesTransactionsHistory';
import AdminTransactionManagement from './pages/AdminTransactionHistory';


// Layout component to show Sidebar for admin and sales, and Navbar for public users
const Layout = ({ children }) => {
  const userRole = localStorage.getItem('userRole'); // Get the user role from local storage

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Conditionally show the Sidebar or Navbar based on user role */}
      {userRole === 'admin' || userRole === 'sales' ? (
        <Sidebar /> // Show Sidebar for admin and sales
      ) : (
        <Navbar /> // Show Navbar for public users
      )}
      {/* Content area where pages will render */}
      <div style={{ margin: '0 auto', padding: '20px', width: '100%', maxWidth: '1200px' }}>
        {children}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/products"
          element={
            <Layout>
              <PublicProducts />
            </Layout>
          }
        />
        
       
        <Route
          path="/admin/users"
          element={
            <Layout>
              <ManageUsers />
            </Layout>
          }
        />
        <Route
          path="/sales/products"
          element={
            <Layout>
              <SalesProductManagement />
            </Layout>
          }
        />
        <Route
          path="/sales/history"
          element={
            <Layout>
              <SalesTransactionHistory />
            </Layout>
          }
        />
        <Route
          path="/admin/transactions"
          element={
            <Layout>
              <AdminTransactionManagement />
            </Layout>
          }
        />
        <Route
          path="/admin/products"
          element={
            <Layout>
              <ProductManagement />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
