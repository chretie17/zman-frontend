import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBagIcon, 
  LeafIcon, 
  ArrowRightIcon 
} from 'lucide-react';

const HomePage = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto mb-16">
          <div className="bg-white shadow-xl rounded-xl p-8 md:p-12 transform transition-all hover:scale-[1.02]">
            <div className="flex justify-center mb-6">
              <LeafIcon 
                className="w-16 h-16 text-emerald-800 
                           animate-pulse transform rotate-6"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-900 mb-6 
                           tracking-tight drop-shadow-md">
              Welcome to Ingabo Plant Health
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Discover premium plant health products that nurture growth, 
              support sustainable agriculture, and empower farmers with 
              innovative solutions.
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                to="/products" 
                className="flex items-center space-x-2 
                           bg-emerald-900 text-white 
                           px-6 py-3 rounded-full 
                           hover:bg-emerald-700 
                           transition-all duration-300 
                           shadow-lg hover:shadow-xl 
                           group"
              >
                <ShoppingBagIcon 
                  className="w-5 h-5 group-hover:animate-bounce"
                />
                <span>Start Shopping</span>
                <ArrowRightIcon 
                  className="w-4 h-4 opacity-0 group-hover:opacity-100 
                             transition-opacity duration-300 
                             transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="text-center max-w-4xl mx-auto">
          <div className="bg-white shadow-xl rounded-xl p-8 md:p-12 
                          transform transition-all hover:scale-[1.02]">
            <h2 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-6">
              Explore Our Plant Health Collection
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              We offer a comprehensive range of cutting-edge plant health 
              products designed to boost crop yield, protect against diseases, 
              and promote sustainable agricultural practices.
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                to="/products" 
                className="flex items-center space-x-2 
                           bg-emerald-800 text-white 
                           px-6 py-3 rounded-full 
                           hover:bg-emerald-600 
                           transition-all duration-300 
                           shadow-lg hover:shadow-xl 
                           group"
              >
                <LeafIcon 
                  className="w-5 h-5 group-hover:rotate-45 
                             transition-transform duration-300"
                />
                <span>View Our Products</span>
                <ArrowRightIcon 
                  className="w-4 h-4 opacity-0 group-hover:opacity-100 
                             transition-opacity duration-300 
                             transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;