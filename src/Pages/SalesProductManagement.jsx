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
  
      setSelectedProduct(null);
      setQuantity(0);
      setSelectedBeneficiary('');
      setCustomerName('');
      setCustomerPhone('');
      setSalesType('');
      setOpenDialog(false);
      fetchProducts();
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 p-6">
      <Container maxWidth="lg" className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold text-emerald-900">Sales Management</h1>
          <div className="flex space-x-4">
            <div className="bg-white shadow-md rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-emerald-900">{products.length}</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Active Beneficiaries</p>
              <p className="text-2xl font-bold text-emerald-900">{beneficiaries.length}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <Grid container spacing={4}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <CardMedia
                  component="img"
                  height="200"
                  image={`data:image/jpeg;base64,${product.image}`}
                  alt={product.name}
                  className="h-48 object-cover"
                />
                <CardContent className="space-y-3">
                  <Typography variant="h6" className="text-emerald-900 font-bold">{product.name}</Typography>
                  <Typography variant="body2" className="text-gray-600">{product.description}</Typography>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Price:</span>
                      <span className="font-semibold text-emerald-900">{product.price} RWF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Stock:</span>
                      <span className="font-semibold text-emerald-900">{product.stock} units</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Type:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        product.is_subsidized 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.is_subsidized ? 'Subsidized' : 'Public Sale'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                  <button
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-2 px-4 rounded !bg-emerald-700"
                  onClick={() => handleOpenDialog(product, 'public')}
                >
                  Sell Public
                </button>

                    {product.is_subsidized && (
                      <button
                      className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-medium py-2 px-4 rounded"
                      onClick={() => handleOpenDialog(product, 'government')}
                    >
                      Sell Government-Subsidized
                    </button>
                    
                    )}
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            className: "rounded-xl shadow-2xl"
          }}
        >
          <DialogTitle className="bg-emerald-900 text-white font-bold">
            Process {salesType === 'government' ? 'Government-Subsidized' : 'Public'} Sale
          </DialogTitle>
          <DialogContent className="space-y-4 p-6">
            {selectedProduct && (
              <div className="space-y-4">
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <Typography variant="h6" className="text-emerald-900 font-bold mb-2">
                    {selectedProduct.name}
                  </Typography>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <p className="font-semibold text-emerald-900">{selectedProduct.price} RWF</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Stock:</span>
                      <p className="font-semibold text-emerald-900">{selectedProduct.stock} units</p>
                    </div>
                  </div>
                </div>

                <TextField
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  fullWidth
                  required
                  variant="outlined"
                  className="bg-white"
                />

                {salesType === 'government' ? (
                  <>
                    <FormControl fullWidth required variant="outlined">
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
                      <div className="bg-emerald-100 p-4 rounded-lg border border-emerald-300 space-y-2">
                        <Typography className="text-emerald-900">
                          Total Cost: {calculateGovernmentSubsidy().totalCost} RWF
                        </Typography>
                        <Typography className="text-emerald-700">
                          Government Pays: {calculateGovernmentSubsidy().subsidyAmount} RWF
                        </Typography>
                        <Typography className="text-emerald-900 font-bold">
                          Beneficiary Pays: {calculateGovernmentSubsidy().beneficiaryPays} RWF
                        </Typography>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <TextField
                      label="Customer Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      fullWidth
                      required
                      variant="outlined"
                      className="bg-white"
                    />
                    <TextField
                      label="Customer Phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      fullWidth
                      required
                      variant="outlined"
                      className="bg-white"
                    />
                  </div>
                )}
              </div>
            )}
          </DialogContent>
          <DialogActions className="p-4 bg-gray-50">
            <Button 
              onClick={handleCloseDialog}
              className="text-emerald-900 hover:bg-emerald-100"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSalesSubmit} 
              variant="contained"
              disabled={loading}
              className="bg-emerald-900 hover:bg-emerald-950 text-white"
            >
              {loading ? 'Processing...' : 'Process Sale'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
};

export default SalesProductManagement;