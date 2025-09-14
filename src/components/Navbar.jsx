import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, Menu, X, LogIn, UserPlus, User, Shield, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import WalletConnect from './wallet/WalletConnect';

const Navbar = ({ openAuthModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.mobile-menu-button')) {
        setIsMenuOpen(false);
      }
      if (isProfileOpen && !event.target.closest('.profile-menu-button')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isProfileOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMenu();
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore Events', path: '/explore' },
    { name: 'Demo', path: '/demo' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <motion.header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-space-black shadow-lg py-2' : 'bg-transparent py-4'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <QrCode className="h-8 w-8 text-deep-purple" />
          <span className="text-2xl font-bold text-holographic-white">Scantyx</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? 'text-deep-purple'
                  : 'text-gray-300 hover:text-white'
              }`}
              onClick={closeMenu}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center space-x-6">
          {/* Wallet Connect Button */}
          <WalletConnect />
          
          {user ? (
            <div className="relative border-l border-gray-700 pl-6">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="relative">
                  <UserCircle className="h-10 w-10 text-gray-300 hover:text-white transition-colors" />
                </div>
              </button>
              
              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50">
                  <Link
                    to="/user"
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span>Dashboard</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3 border-l border-gray-700 pl-6">
              <button
                onClick={() => openAuthModal('signin')}
                className="flex items-center space-x-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                <LogIn className="h-5 w-5" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-4 py-2 rounded-lg bg-deep-purple text-white text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-holographic-white focus:outline-none"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          className="md:hidden bg-space-black shadow-lg"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-holographic-white hover:text-tech-blue transition-colors py-2 ${
                  location.pathname === link.path ? 'font-bold text-tech-blue' : ''
                }`}
                onClick={closeMenu}
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <div className="pt-2 border-t border-gray-700">
                <Link 
                  to="/user" 
                  className="flex items-center space-x-2 text-holographic-white hover:text-tech-blue transition-colors py-2"
                  onClick={closeMenu}
                >
                  <User className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin/dashboard" 
                    className="flex items-center space-x-2 text-holographic-white hover:text-tech-blue transition-colors py-2"
                    onClick={closeMenu}
                  >
                    <Shield className="h-5 w-5" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center space-x-2 text-holographic-white hover:text-red-400 transition-colors py-2"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-gray-700 space-y-3">
                <button
                  onClick={() => {
                    openAuthModal('signin');
                    closeMenu();
                  }}
                  className="w-full flex items-center space-x-2 text-holographic-white hover:text-tech-blue transition-colors py-2"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => {
                    openAuthModal('signup');
                    closeMenu();
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-deep-purple text-white rounded-lg py-2 px-4 hover:bg-purple-700 transition-colors"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Navbar;
