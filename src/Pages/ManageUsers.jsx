import React, { useState, useEffect } from 'react';
import API from '../api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'public',
  });
  const [editUserId, setEditUserId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const apiInstance = API.getApiInstance();
      const response = await apiInstance.get('/users');
      setUsers(response.data);
    } catch (error) {
      setError('Error fetching users');
    }
  };

  const handleInputChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const apiInstance = API.getApiInstance();

      if (editUserId) {
        await apiInstance.put(`/users/update/${editUserId}`, newUser);
      } else {
        await apiInstance.post('/users/create', newUser);
      }

      setNewUser({ username: '', email: '', password: '', role: 'public' });
      setEditUserId(null);
      fetchUsers();
    } catch (error) {
      setError('Error saving user');
    }
  };

  const handleDelete = async (id) => {
    try {
      const apiInstance = API.getApiInstance();
      await apiInstance.delete(`/users/delete/${id}`);
      fetchUsers();
    } catch (error) {
      setError('Error deleting user');
    }
  };

  const handleEdit = (user) => {
    setNewUser({ username: user.username, email: user.email, password: '', role: user.role });
    setEditUserId(user.id);
  };

  return (
    <div className="bg-gradient-to-br from-#1F4B38 to-[#2a6b52] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-[#1F4B38] text-white p-6">
          <h2 className="text-2xl font-bold text-center">User Management</h2>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="username"
                value={newUser.username}
                onChange={handleInputChange}
                placeholder="Username"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4B38]"
                required
              />
              <input
                name="email"
                type="email"
                value={newUser.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4B38]"
                required
              />
            </div>
            <input
              name="password"
              type="password"
              value={newUser.password}
              onChange={handleInputChange}
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4B38]"
              required={editUserId === null}
            />
            <select
              name="role"
              value={newUser.role}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4B38]"
              required
            >
              <option value="public">Public</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
            </select>
            
            <button
              type="submit"
              className="w-full bg-[#1F4B38] text-white py-2 rounded-lg hover:bg-opacity-90 transition duration-300"
            >
              {editUserId ? 'Update User' : 'Create User'}
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Username</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{user.username}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                        ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                          user.role === 'moderator' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;