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
  Container,
} from '@mui/material';
import API from '../api'; // Import API instance

const SalesProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [govId, setGovId] = useState('');
  const [salesType, setSalesType] = useState(''); // 'public' or 'government'
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // For loading states

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

  const handleSalesSubmit = async () => {
    setError('');
    setLoading(true); // Enable loading state
  
    if (!selectedProduct || quantity <= 0 || !customerName || !customerPhone || (salesType === 'government' && !govId)) {
      setError('Please fill out all fields');
      setLoading(false);
      return;
    }
  
    try {
      const apiInstance = API.getApiInstance();
      const transactionData = {
        productId: selectedProduct.id,
        quantity,
        buyerName: customerName,
        phoneNumber: customerPhone,
        govId: salesType === 'government' ? govId : null, // For government sales only
        saleType: salesType,
      };
  
      if (salesType === 'government') {
        await apiInstance.post('/transactions/govSale', transactionData);
      } else {
        await apiInstance.post('/transactions/publicSale', transactionData);
      }
  
      setSelectedProduct(null);
      setQuantity(0);
      setCustomerName('');
      setCustomerPhone('');
      setGovId('');
      setSalesType(''); // Reset sales type
      setOpenDialog(false);
      fetchProducts();
    } catch (error) {
      setError('Error processing sale. Please try again.');
      console.error('Error processing sale:', error);
    } finally {
      setLoading(false); // Disable loading state
    }
  };
  
  const handleOpenDialog = (product, type) => {
    setSelectedProduct(product);
    setSalesType(type); // Set the sales type
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
    setQuantity(0);
    setCustomerName('');
    setCustomerPhone('');
    setGovId('');
    setSalesType('');
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Sales Management
      </Typography>

      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}

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
                <Typography variant="body2">
                  <strong>Stock:</strong> {product.stock} units
                </Typography>
                <Typography variant="body2" color={product.is_subsidized ? 'primary' : 'textSecondary'}>
                  {product.is_subsidized ? 'Subsidized (Government)' : 'Public Sale'}
                </Typography>

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  style={{ marginTop: '10px' }}
                  onClick={() => handleOpenDialog(product, 'public')}
                >
                  Sell Public
                </Button>

                {product.is_subsidized && (
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    style={{ marginTop: '10px' }}
                    onClick={() => handleOpenDialog(product, 'government')}
                  >
                    Sell Government-Subsidized
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Sales Transaction Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Process {salesType === 'government' ? 'Government-Subsidized' : 'Public'} Sale</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <>
              <Typography variant="h6">{selectedProduct.name}</Typography>
              <Typography variant="body2" gutterBottom>
                Price: {selectedProduct.price} RWF
              </Typography>
              <Typography variant="body2" gutterBottom>
                Stock: {selectedProduct.stock} units available
              </Typography>

              <TextField
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                fullWidth
                required
                margin="normal"
              />
              <TextField
                label="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                fullWidth
                required
                margin="normal"
              />
              <TextField
                label="Customer Phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                fullWidth
                required
                margin="normal"
              />
              {salesType === 'government' && (
                <TextField
                  label="Government ID"
                  value={govId}
                  onChange={(e) => setGovId(e.target.value)}
                  fullWidth
                  required
                  margin="normal"
                />
              )}

              {/* Show the government discount if it's a subsidized sale */}
              {salesType === 'government' && (
                <Typography variant="body2" gutterBottom>
                  Government Pays: {(selectedProduct.price * selectedProduct.subsidy_percentage) / 100} RWF
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSalesSubmit} variant="contained" color="primary" disabled={loading}>
            {loading ? 'Processing...' : 'Process Sale'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SalesProductManagement;
