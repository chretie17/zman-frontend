import React, { useState, useEffect } from 'react';
import { TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, Container, Typography, Checkbox, IconButton, Paper } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { styled } from '@mui/system';
import API from '../api';

const CustomContainer = styled(Container)({
  backgroundColor: '#f9f9f9',
  padding: '2rem',
  borderRadius: '10px',
  boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
  marginTop: '2rem',
});

const CustomButton = styled(Button)({
  backgroundColor: '#1F4B38',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#2C6E54',
  },
  borderRadius: '25px',
  padding: '0.5rem 2rem',
  boxShadow: '0px 4px 12px rgba(31, 75, 56, 0.4)',
  transition: 'all 0.3s ease-in-out',
});

const CustomTextField = styled(TextField)({
  marginBottom: '1rem',
  '& .MuiInputBase-root': {
    borderRadius: '8px',
  },
});

const AdminProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    is_subsidized: false,
    subsidy_percentage: 0,
  });
  const [imageFile, setImageFile] = useState(null);
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
    setImageFile(e.target.files[0]);
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
      formData.append('subsidy_percentage', productData.subsidy_percentage);

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
      subsidy_percentage: product.subsidy_percentage,
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
    <CustomContainer>
      <Typography variant="h4" gutterBottom className="text-[#1F4B38] font-bold text-center mb-8">
        Admin: Manage Products
      </Typography>

      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data" className="mb-8">
        <CustomTextField
          label="Name"
          name="name"
          value={productData.name}
          onChange={handleInputChange}
          fullWidth
          required
        />
        <CustomTextField
          label="Description"
          name="description"
          value={productData.description}
          onChange={handleInputChange}
          fullWidth
          required
        />
        <CustomTextField
          label="Price"
          name="price"
          type="number"
          value={productData.price}
          onChange={handleInputChange}
          fullWidth
          required
        />
        <CustomTextField
          label="Stock"
          name="stock"
          type="number"
          value={productData.stock}
          onChange={handleInputChange}
          fullWidth
          required
        />

        <div className="flex items-center mb-4">
          <Checkbox
            checked={productData.is_subsidized}
            onChange={handleCheckboxChange}
            name="is_subsidized"
            color="primary"
          />
          <Typography component="label" className="text-[#1F4B38] font-medium">
            Is Subsidized
          </Typography>
        </div>

        {productData.is_subsidized && (
          <CustomTextField
            label="Subsidy Percentage"
            name="subsidy_percentage"
            type="number"
            value={productData.subsidy_percentage}
            onChange={handleInputChange}
            fullWidth
            required
          />
        )}

        <input
          type="file"
          name="image"
          onChange={handleImageChange}
          accept="image/*"
          style={{ marginBottom: '1rem' }}
        />

        <CustomButton type="submit">
          {editProductId ? 'Update Product' : 'Add Product'}
        </CustomButton>
      </form>

      <Paper elevation={3} className="p-4">
        <Table>
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
              <TableRow key={product.id} hover>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>{product.price} RWF</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product.is_subsidized ? 'Yes' : 'No'}</TableCell>
                <TableCell>{product.subsidy_percentage ? `${product.subsidy_percentage}%` : 'N/A'}</TableCell>
                <TableCell>
                  {product.image && (
                    <img
                      src={`data:image/jpeg;base64,${product.image}`}
                      alt={product.name}
                      width="100"
                      className="rounded-lg shadow-sm"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(product)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(product.id)} color="secondary">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </CustomContainer>
  );
};

export default AdminProductManagement;
