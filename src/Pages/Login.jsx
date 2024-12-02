import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  LockIcon, 
  EyeIcon, 
  EyeOffIcon, 
  LeafIcon 
} from 'lucide-react';
import API from '../api';

const Login = () => {
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError(''); // Clear error when user starts typing
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const apiInstance = API.getApiInstance();
      const response = await apiInstance.post('/auth/login', credentials);

      if (response.data.token && response.data.userId && response.data.role) {
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('userRole', response.data.role);
        localStorage.setItem('token', response.data.token);

        // Animate before navigation
        await new Promise(resolve => setTimeout(resolve, 500));

        if (response.data.role === 'admin' || response.data.role === 'sales') {
          navigate('/dashboard');
        } else {
          navigate('/products');
        }
      } else {
        setError('Login failed. Invalid response from server.');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-emerald-700 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div 
          className="bg-white shadow-2xl rounded-2xl overflow-hidden 
                     transform transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="p-8">
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-8">
              <LeafIcon 
                className="w-16 h-16 text-emerald-800 mb-4 
                           animate-pulse transform rotate-6"
              />
              <h1 className="text-3xl font-bold text-emerald-900 mb-2">
                INGABO PLANT HEALTH
              </h1>
              <p className="text-gray-600 text-center">
                Welcome back! Please sign in to continue
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div 
                className="bg-red-50 border border-red-200 text-red-700 
                           px-4 py-3 rounded-lg mb-6 text-center 
                           animate-shake"
              >
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <input 
                  type="text"
                  name="identifier"
                  placeholder="Username or Email"
                  value={credentials.identifier}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border 
                             border-emerald-300 rounded-lg 
                             focus:ring-2 focus:ring-emerald-500 
                             focus:border-transparent 
                             transition duration-300"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border 
                             border-emerald-300 rounded-lg 
                             focus:ring-2 focus:ring-emerald-500 
                             focus:border-transparent 
                             transition duration-300"
                />
                <button
                  type="button"
                  onClick={handleClickShowPassword}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center 
                             text-emerald-600 hover:text-emerald-800 
                             transition duration-300"
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-900 text-white py-3 rounded-lg 
                           hover:bg-emerald-800 transition duration-300 
                           transform active:scale-[0.98] 
                           disabled:opacity-50 flex items-center 
                           justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <svg 
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      ></circle>
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;