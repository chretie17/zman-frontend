import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, IconButton } from '@mui/material';
import API from '../api'; // Import the API instance
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'public', // Default role is 'public'
  });
  const [editUserId, setEditUserId] = useState(null);
  const [error, setError] = useState('');

  // Fetch users from the backend
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const apiInstance = API.getApiInstance(); // Get the API instance
      const response = await apiInstance.get('/users');
      setUsers(response.data);
    } catch (error) {
      setError('Error fetching users');
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  // Create or update user
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const apiInstance = API.getApiInstance();

      if (editUserId) {
        // Update user
        await apiInstance.put(`/users/update/${editUserId}`, newUser);
      } else {
        // Create new user
        await apiInstance.post('/users/create', newUser);
      }

      // Clear form and fetch users again
      setNewUser({ username: '', email: '', password: '', role: 'public' });
      setEditUserId(null);
      fetchUsers();
    } catch (error) {
      setError('Error saving user');
    }
  };

  // Handle user deletion
  const handleDelete = async (id) => {
    try {
      const apiInstance = API.getApiInstance();
      await apiInstance.delete(`/users/delete/${id}`);
      fetchUsers(); // Fetch users after deletion
    } catch (error) {
      setError('Error deleting user');
    }
  };

  // Handle user editing
  const handleEdit = (user) => {
    setNewUser({ username: user.username, email: user.email, password: '', role: user.role });
    setEditUserId(user.id);
  };

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" gutterBottom>
          Manage Users
        </Typography>
        {error && <Typography color="error">{error}</Typography>}

        {/* User form for creating or editing */}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            name="username"
            value={newUser.username}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Email"
            name="email"
            value={newUser.email}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            name="password"
            value={newUser.password}
            onChange={handleInputChange}
            type="password"
            fullWidth
            margin="normal"
            required={editUserId === null} // Only required for creating new users
          />
          <TextField
            label="Role"
            name="role"
            value={newUser.role}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
          />
          <Button variant="contained" color="primary" type="submit">
            {editUserId ? 'Update User' : 'Create User'}
          </Button>
        </form>

        {/* Users table */}
        <Box my={4}>
          <Typography variant="h5" gutterBottom>
            Users List
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(user)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(user.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Container>
  );
};

export default ManageUsers;
