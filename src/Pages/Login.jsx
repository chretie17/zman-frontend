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
import { Link } from 'react-router-dom';

import background from '../assets/ingabo.jpg';

const Login = () => {
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError('');
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
    <div className="h-screen w-screen overflow-hidden relative flex">
      {/* Left Panel - Login Form */}
      <div className="w-full md:w-2/5 h-full relative z-10 flex items-center justify-center 
                    bg-emerald-950/95 backdrop-blur-md">
        <div className="w-full max-w-md px-8 py-12 relative">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-12">
            <div className="relative mb-4">
              <div className="absolute -inset-2 rounded-full bg-emerald-400/30 blur-xl animate-pulse"></div>
              <LeafIcon className="relative w-20 h-20 text-emerald-400 transform rotate-6" />
            </div>
            <h1 className="text-4xl font-bold text-emerald-50 mb-4 text-center">
              INGABO PLANT HEALTH
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full mb-4"></div>
            <p className="text-emerald-200 text-center text-lg">
              Welcome back! Please sign in to continue
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-500/20 border border-red-400 
                           rounded-xl text-red-100 text-center animate-shake">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <UserIcon className="w-5 h-5 text-emerald-300" />
              </div>
              <input 
                type="text"
                name="identifier"
                placeholder="Username or Email"
                value={credentials.identifier}
                onChange={handleInputChange}
                required
                className="w-full pl-12 pr-4 py-4 bg-emerald-900/50
                         border-2 border-emerald-800 rounded-xl 
                         text-emerald-100 placeholder-emerald-400
                         focus:ring-2 focus:ring-emerald-400/50 
                         focus:border-emerald-700
                         transition duration-300
                         hover:border-emerald-700"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LockIcon className="w-5 h-5 text-emerald-300" />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={credentials.password}
                onChange={handleInputChange}
                required
                className="w-full pl-12 pr-12 py-4 bg-emerald-900/50
                         border-2 border-emerald-800 rounded-xl 
                         text-emerald-100 placeholder-emerald-400
                         focus:ring-2 focus:ring-emerald-400/50 
                         focus:border-emerald-700
                         transition duration-300
                         hover:border-emerald-700"
              />
              <button
                type="button"
                onClick={handleClickShowPassword}
                className="absolute inset-y-0 right-0 pr-4 flex items-center 
                         text-emerald-300 hover:text-emerald-200 
                         transition duration-300"
              >
                {showPassword ? (
                  <EyeOffIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>

       {/* Sign In Button */}
<button
  type="submit"
  disabled={isLoading}
  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400
    text-white py-4 rounded-xl
    hover:from-emerald-400 hover:to-emerald-300
    transition duration-300
    transform hover:scale-[1.02] active:scale-[0.98]
    disabled:opacity-50
    flex items-center justify-center space-x-2
    shadow-lg shadow-emerald-900/50
    hover:shadow-xl hover:shadow-emerald-900/50
    font-semibold text-lg
    mb-4" // Added margin-bottom for spacing
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

{/* Go Home Button - with spacing */}
<Link to="/" className="block mt-4"> {/* Added margin-top for spacing */}
  <button
    type="button"
    className="w-full bg-white border-2 border-emerald-500 
      text-emerald-600 py-4 rounded-xl
      hover:bg-emerald-50
      transition duration-300
      transform hover:scale-[1.02] active:scale-[0.98]
      disabled:opacity-50
      flex items-center justify-center space-x-2
      shadow-md shadow-emerald-900/20
      hover:shadow-lg hover:shadow-emerald-900/30
      font-semibold text-lg"
  >
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className="h-5 w-5 mr-2" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
      />
    </svg>
    <span>Return Home</span>
  </button>
</Link>
          </form>
        </div>
      </div>

      {/* Right Panel - Background Image */}
      <div className="hidden md:block md:w-3/5 h-full relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${background})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 to-transparent"></div>
        </div>
      </div>

      {/* Mobile Background */}
      <div 
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat md:hidden"
        style={{ 
          backgroundImage: `url(${background})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/95 to-emerald-900/95"></div>
      </div>
    </div>
  );
};

export default Login;