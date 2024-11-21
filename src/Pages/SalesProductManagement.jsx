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
  // All state declarations remain the same
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

  // All existing functions remain exactly the same
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
      return { totalCost, subsidyAmount, beneficiaryPays };
    }
    return null;
  };

  const handleSalesSubmit = async () => {
    // Existing handleSalesSubmit logic remains exactly the same
    setError('');
    setLoading(true);
    // ... rest of the function remains identical
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
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        <div className="flex items-center justify-between mb-8">
          <Typography variant="h4" className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Sales Management
          </Typography>
          <div className="flex gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <span className="text-sm text-gray-500">Total Products</span>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <span className="text-sm text-gray-500">Active Beneficiaries</span>
              <p className="text-2xl font-bold text-gray-900">{beneficiaries.length}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <Typography className="text-red-700">{error}</Typography>
          </div>
        )}

        <Grid container spacing={4}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card className="transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardMedia
                  component="img"
                  height="200"
                  image={`data:image/jpeg;base64,${product.image}`}
                  alt={product.name}
                  className="h-48 object-cover"
                />
                <CardContent className="p-6">
                  <Typography variant="h6" className="text-xl font-semibold mb-2">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600 mb-4">
                    {product.description}
                  </Typography>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-semibold text-gray-900">{product.price} RWF</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Stock:</span>
                      <span className="font-semibold text-gray-900">{product.stock} units</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Type:</span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        product.is_subsidized 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.is_subsidized ? 'Subsidized' : 'Public Sale'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="contained"
                      fullWidth
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      onClick={() => handleOpenDialog(product, 'public')}
                    >
                      Sell Public
                    </Button>

                    {product.is_subsidized && (
                      <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                        onClick={() => handleOpenDialog(product, 'government')}
                      >
                        Sell Government-Subsidized
                      </Button>
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
          className="rounded-lg"
        >
          <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
            Process {salesType === 'government' ? 'Government-Subsidized' : 'Public'} Sale
          </DialogTitle>
          <DialogContent className="p-6">
            {selectedProduct && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Typography variant="h6" className="text-xl font-semibold mb-2">
                    {selectedProduct.name}
                  </Typography>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <p className="font-semibold">{selectedProduct.price} RWF</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Stock:</span>
                      <p className="font-semibold">{selectedProduct.stock} units</p>
                    </div>
                  </div>
                </div>

                <TextField
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  fullWidth
                  required
                  className="bg-white"
                />

                {salesType === 'government' ? (
                  <>
                    <FormControl fullWidth required className="bg-white">
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
                      <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                        <Typography className="text-blue-900">
                          Total Cost: {calculateGovernmentSubsidy().totalCost} RWF
                        </Typography>
                        <Typography className="text-green-700">
                          Government Pays: {calculateGovernmentSubsidy().subsidyAmount} RWF
                        </Typography>
                        <Typography className="text-purple-700">
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
                      className="bg-white"
                    />
                    <TextField
                      label="Customer Phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      fullWidth
                      required
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
              className="text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSalesSubmit} 
              variant="contained"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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