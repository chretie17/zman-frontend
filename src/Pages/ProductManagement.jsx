import React, { useState, useEffect } from 'react';
import { TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, Container, Typography, Checkbox, IconButton } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import API from '../api'; // Import API instance

const AdminProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    is_subsidized: false,
    subsidy_percentage: 0 // New field for subsidy percentage
  });
  const [imageFile, setImageFile] = useState(null); // For handling image upload
  const [editProductId, setEditProductId] = useState(null);
  const [error, setError] = useState('');

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setProductData({ ...productData, [name]: checked });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]); // Set the image file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('description', productData.description);
      formData.append('price', productData.price);
      formData.append('stock', productData.stock);
      formData.append('is_subsidized', productData.is_subsidized);
      formData.append('subsidy_percentage', productData.subsidy_percentage); // Add subsidy percentage

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const apiInstance = API.getApiInstance();

      if (editProductId) {
        await apiInstance.put(`/products/update/${editProductId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await apiInstance.post('/products/add', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      setProductData({ name: '', description: '', price: '', stock: '', is_subsidized: false, subsidy_percentage: 0 });
      setImageFile(null);
      setEditProductId(null);
      fetchProducts();
    } catch (error) {
      setError('Error saving product. Please try again.');
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product) => {
    setProductData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      is_subsidized: product.is_subsidized,
      subsidy_percentage: product.subsidy_percentage, // Load subsidy percentage into the form
    });
    setEditProductId(product.id);
  };

  const handleDelete = async (id) => {
    try {
      const apiInstance = API.getApiInstance();
      await apiInstance.delete(`/products/delete/${id}`);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Admin: Manage Products
      </Typography>

      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}

      {/* Form for adding or updating products */}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <TextField
          label="Name"
          name="name"
          value={productData.name}
          onChange={handleInputChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Description"
          name="description"
          value={productData.description}
          onChange={handleInputChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Price"
          name="price"
          type="number"
          value={productData.price}
          onChange={handleInputChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Stock"
          name="stock"
          type="number"
          value={productData.stock}
          onChange={handleInputChange}
          fullWidth
          required
          margin="normal"
        />

        {/* Checkbox for is_subsidized */}
        <div style={{ margin: '10px 0' }}>
          <Checkbox
            checked={productData.is_subsidized}
            onChange={handleCheckboxChange}
            name="is_subsidized"
            color="primary"
          />
          <Typography component="label">Is Subsidized</Typography>
        </div>

        {/* Subsidy Percentage */}
        {productData.is_subsidized && (
          <TextField
            label="Subsidy Percentage"
            name="subsidy_percentage"
            type="number"
            value={productData.subsidy_percentage}
            onChange={handleInputChange}
            fullWidth
            required
            margin="normal"
          />
        )}

        {/* Image Upload */}
        <input
          type="file"
          name="image"
          onChange={handleImageChange}
          accept="image/*"
          style={{ margin: '10px 0' }}
        />

        <Button type="submit" variant="contained" color="primary">
          {editProductId ? 'Update Product' : 'Add Product'}
        </Button>
      </form>

      {/* Table for listing products */}
      <Table style={{ marginTop: '20px' }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Stock</TableCell>
            <TableCell>Subsidized</TableCell>
            <TableCell>Subsidy Percentage</TableCell>
            <TableCell>Image</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.description}</TableCell>
              <TableCell>${product.price}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>{product.is_subsidized ? 'Yes' : 'No'}</TableCell>
              <TableCell>{product.subsidy_percentage ? `${product.subsidy_percentage}%` : 'N/A'}</TableCell>
              <TableCell>
                {product.image && (
                  <img
                    src={`data:image/jpeg;base64,${product.image}`}
                    alt={product.name}
                    width="100"
                  />
                )}
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleEdit(product)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(product.id)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default AdminProductManagement;
