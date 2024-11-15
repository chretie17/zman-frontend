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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import API from '../api';

const SalesProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [salesType, setSalesType] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchBeneficiaries();
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

  const fetchBeneficiaries = async () => {
    try {
      const apiInstance = API.getApiInstance();
      const response = await apiInstance.get('/beneficiaries/active');
      setBeneficiaries(response.data);
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
    }
  };

  const calculateGovernmentSubsidy = () => {
    if (selectedProduct && salesType === 'government') {
      const totalCost = selectedProduct.price * quantity;
      const subsidyAmount = (totalCost * selectedProduct.subsidy_percentage) / 100;
      const beneficiaryPays = totalCost - subsidyAmount;

      return {
        totalCost,
        subsidyAmount,
        beneficiaryPays,
      };
    }
    return null;
  };

  const handleSalesSubmit = async () => {
    setError('');
    setLoading(true);
  
    if (!selectedProduct || quantity <= 0) {
      setError('Please fill out all required fields');
      setLoading(false);
      return;
    }
  
    if (quantity > selectedProduct.stock) {
      setError('Insufficient stock available');
      setLoading(false);
      return;
    }
  
    try {
      const apiInstance = API.getApiInstance();
      const transactionData = {
        productId: selectedProduct.id,
        quantity,
      };
  
      if (salesType === 'government') {
        if (!selectedBeneficiary) {
          setError('Please select a beneficiary for government sales');
          setLoading(false);
          return;
        }
  
        const beneficiaryDetails = beneficiaries.find((b) => b.id === selectedBeneficiary);
        if (!beneficiaryDetails) {
          setError('Selected beneficiary not found');
          setLoading(false);
          return;
        }
  
        transactionData.beneficiaryDetails = {
          name: beneficiaryDetails.name,
          national_id: beneficiaryDetails.national_id,
          phone: beneficiaryDetails.phone_number,
        };
  
        await apiInstance.post('/transactions/govSale', transactionData);
      } else {
        if (!customerName || !customerPhone) {
          setError('Please provide customer details for public sales');
          setLoading(false);
          return;
        }
  
        transactionData.customerName = customerName;
        transactionData.customerPhone = customerPhone;
  
        await apiInstance.post('/transactions/publicSale', transactionData);
      }
  
      // Reset form and state after submission
      setSelectedProduct(null);
      setQuantity(0);
      setSelectedBeneficiary('');
      setCustomerName('');
      setCustomerPhone('');
      setSalesType('');
      setOpenDialog(false);
      fetchProducts(); // Refresh product stock
    } catch (error) {
      setError('Error processing sale. Please try again.');
      console.error('Error processing sale:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenDialog = (product, type) => {
    setSelectedProduct(product);
    setSalesType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
    setQuantity(0);
    setSelectedBeneficiary('');
    setCustomerName('');
    setCustomerPhone('');
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

              {salesType === 'government' ? (
                <>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Select Beneficiary</InputLabel>
                    <Select
                      value={selectedBeneficiary}
                      onChange={(e) => setSelectedBeneficiary(e.target.value)}
                    >
                      {beneficiaries.map((beneficiary) => (
                        <MenuItem key={beneficiary.id} value={beneficiary.id}>
                          {beneficiary.name} - {beneficiary.national_id}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {quantity > 0 && calculateGovernmentSubsidy() && (
                    <>
                      <Typography variant="body2" gutterBottom>
                        Total Cost: {calculateGovernmentSubsidy().totalCost} RWF
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Government Pays: {calculateGovernmentSubsidy().subsidyAmount} RWF
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Beneficiary Pays: {calculateGovernmentSubsidy().beneficiaryPays} RWF
                      </Typography>
                    </>
                  )}
                </>
              ) : (
                <>
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
                </>
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
