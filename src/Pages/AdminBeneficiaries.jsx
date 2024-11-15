import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Container,
  Typography,
  IconButton,
} from '@mui/material';
import { Delete, Edit, ToggleOn, ToggleOff } from '@mui/icons-material';
import API from '../api';

const AdminBeneficiaryManagement = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [beneficiaryData, setBeneficiaryData] = useState({
    name: '',
    national_id: '',
    phone_number: '',
  });
  const [editBeneficiaryId, setEditBeneficiaryId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      const apiInstance = API.getApiInstance();
      const response = await apiInstance.get('/beneficiaries');
      setBeneficiaries(response.data);
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBeneficiaryData({ ...beneficiaryData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (beneficiaryData.national_id.length > 16) {
      setError('National ID must be 16 characters or fewer.');
      return;
    }

    try {
      const apiInstance = API.getApiInstance();

      if (editBeneficiaryId) {
        await apiInstance.put(`/beneficiaries/update/${editBeneficiaryId}`, beneficiaryData);
      } else {
        await apiInstance.post('/beneficiaries/add', beneficiaryData);
      }

      setBeneficiaryData({ name: '', national_id: '', phone_number: '' });
      setEditBeneficiaryId(null);
      fetchBeneficiaries();
    } catch (error) {
      setError('Error saving beneficiary. Please try again.');
      console.error('Error saving beneficiary:', error);
    }
  };

  const handleEdit = (beneficiary) => {
    setBeneficiaryData({
      name: beneficiary.name,
      national_id: beneficiary.national_id,
      phone_number: beneficiary.phone_number,
    });
    setEditBeneficiaryId(beneficiary.id);
  };

  const handleDelete = async (id) => {
    try {
      const apiInstance = API.getApiInstance();
      await apiInstance.delete(`/beneficiaries/delete/${id}`);
      fetchBeneficiaries();
    } catch (error) {
      console.error('Error deleting beneficiary:', error);
    }
  };

  const handleActivate = async (id) => {
    try {
      const apiInstance = API.getApiInstance();
      await apiInstance.put(`/beneficiaries/activate/${id}`);
      fetchBeneficiaries();
    } catch (error) {
      console.error('Error activating beneficiary:', error);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      const apiInstance = API.getApiInstance();
      await apiInstance.put(`/beneficiaries/deactivate/${id}`);
      fetchBeneficiaries();
    } catch (error) {
      console.error('Error deactivating beneficiary:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Admin: Manage Beneficiaries
      </Typography>

      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}

      {/* Form for Adding/Updating Beneficiaries */}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          name="name"
          value={beneficiaryData.name}
          onChange={handleInputChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="National ID"
          name="national_id"
          value={beneficiaryData.national_id}
          onChange={handleInputChange}
          fullWidth
          required
          margin="normal"
          inputProps={{ maxLength: 16 }} // Enforce 16-character limit
        />
        <TextField
          label="Phone Number"
          name="phone_number"
          value={beneficiaryData.phone_number}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary">
          {editBeneficiaryId ? 'Update Beneficiary' : 'Add Beneficiary'}
        </Button>
      </form>

      {/* Table for Listing Beneficiaries */}
      <Table style={{ marginTop: '20px' }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>National ID</TableCell>
            <TableCell>Phone Number</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {beneficiaries.map((beneficiary) => (
            <TableRow key={beneficiary.id}>
              <TableCell>{beneficiary.name}</TableCell>
              <TableCell>{beneficiary.national_id}</TableCell>
              <TableCell>{beneficiary.phone_number}</TableCell>
              <TableCell>
                {beneficiary.is_active ? (
                  <Typography color="primary">Active</Typography>
                ) : (
                  <Typography color="error">Inactive</Typography>
                )}
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleEdit(beneficiary)} color="primary">
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(beneficiary.id)} color="error">
                  <Delete />
                </IconButton>
                {beneficiary.is_active ? (
                  <IconButton onClick={() => handleDeactivate(beneficiary.id)} color="warning">
                    <ToggleOff />
                  </IconButton>
                ) : (
                  <IconButton onClick={() => handleActivate(beneficiary.id)} color="success">
                    <ToggleOn />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default AdminBeneficiaryManagement;
