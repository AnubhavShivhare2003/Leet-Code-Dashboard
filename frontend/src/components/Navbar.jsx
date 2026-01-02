import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-300 hover:text-white';
  };

  return (
    <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-lg md:text-xl font-bold text-white">
              LeetCode Dashboard
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-4 md:space-x-8">
            <Link
              to="/"
              className={`px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm font-medium transition-colors duration-200 ${isActive('/')}`}
              title="Students"
            >
              {/* Icon for mobile, text for desktop */}
              <span className="md:hidden">👥</span>
              <span className="hidden md:inline">Students</span>
            </Link>
            <Link
              to="/leaderboard"
              className={`px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm font-medium transition-colors duration-200 ${isActive('/leaderboard')}`}
              title="Leaderboard"
            >
              {/* Icon for mobile, text for desktop */}
              <span className="md:hidden">🏆</span>
              <span className="hidden md:inline">Leaderboard</span>
            </Link>
          </div>

          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;