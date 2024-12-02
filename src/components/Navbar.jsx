import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HomeIcon, 
  ShoppingCartIcon, 
  LogInIcon 
} from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-emerald-900 to-emerald-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-white text-2xl font-bold tracking-wider 
                       transition-all duration-300 hover:text-emerald-200 
                       flex items-center space-x-2"
          >
            <span className="drop-shadow-md">INGABO PLANT HEALTH</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {/* Home Button */}
            <Link 
              to="/" 
              className="text-white hover:bg-emerald-800 
                         rounded-full p-2 transition-all duration-300 
                         flex items-center space-x-1 group"
              aria-label="Home"
            >
              <HomeIcon 
                className="w-5 h-5 group-hover:scale-110 transition-transform" 
              />
              <span className="hidden sm:block">Home</span>
            </Link>

            {/* Products Button */}
            <Link 
              to="/products" 
              className="text-white hover:bg-emerald-800 
                         rounded-full p-2 transition-all duration-300 
                         flex items-center space-x-1 group"
            >
              <ShoppingCartIcon 
                className="w-5 h-5 group-hover:scale-110 transition-transform" 
              />
              <span className="hidden sm:block">Products</span>
            </Link>

            {/* Login Button */}
            <Link 
              to="/login" 
              className="text-white hover:bg-emerald-800 
                         rounded-full p-2 transition-all duration-300 
                         flex items-center space-x-1 group"
            >
              <LogInIcon 
                className="w-5 h-5 group-hover:scale-110 transition-transform" 
              />
              <span className="hidden sm:block">Login</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;