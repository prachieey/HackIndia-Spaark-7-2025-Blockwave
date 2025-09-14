import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, Menu, X, LogIn, UserPlus, User, Shield, LogOut, UserCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/blockchain/Web3Context';
import WalletConnect from './wallet/WalletConnect';

const Navbar = ({ openAuthModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { isConnected } = useWeb3();

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

  const handleLogout = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      await logout();
      
      // Force a full page reload to ensure all states are reset
      window.location.href = '/';
    } catch (error) {
      console.error('[Navbar] Logout error:', error);
    }
  };
  
  // Connect wallet handler
  const handleConnectWallet = async () => {
    try {
      // Import Web3Context to use its connectWallet function
      const { connectWallet } = await import('../contexts/blockchain/Web3Context');
      if (typeof connectWallet === 'function') {
        await connectWallet();
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
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
          {/* Show wallet connect only when user is logged in */}
          {user && <WalletConnect />}
          
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 focus:outline-none group"
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-lg shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-300">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isAdmin ? 'Admin' : 'Member'}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform duration-200 ${isProfileOpen ? 'transform rotate-180' : ''}`} />
              </button>
              
              {/* Animated Dropdown Menu */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isProfileOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`absolute right-0 mt-3 w-56 origin-top-right bg-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 ${isProfileOpen ? 'block' : 'hidden'}`}
              >
                <div className="p-1">
                  <Link
                    to="/user"
                    className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg transition-colors group"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <div className="p-2 mr-3 rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                      <User className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-medium">My Profile</p>
                      <p className="text-xs text-gray-400">View your account</p>
                    </div>
                  </Link>
                  
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg transition-colors group mt-1"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <div className="p-2 mr-3 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                        <Shield className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="font-medium">Admin Panel</p>
                        <p className="text-xs text-gray-400">Manage platform</p>
                      </div>
                    </Link>
                  )}
                  
                  <div className="border-t border-gray-700/50 my-1"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors group"
                  >
                    <div className="p-2 mr-3 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                      <LogOut className="h-5 w-5 text-red-400" />
                    </div>
                    <span className="font-medium">Sign out</span>
                  </button>
                </div>
                
                <div className="px-4 py-2.5 bg-gray-900/50 text-xs text-gray-400">
                  {user?.email || 'user@example.com'}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="flex space-x-4">
              <button
                onClick={handleConnectWallet}
                className="px-4 py-2 bg-tech-blue hover:bg-tech-blue/90 text-white rounded-lg transition-colors"
              >
                Connect Wallet
              </button>
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 text-white hover:bg-deep-purple/20 rounded-lg transition-colors"
              >
                Login
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
                {!isConnected && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-400 mb-2">Connect your wallet to use blockchain features</p>
                    <WalletConnect />
                  </div>
                )}
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
              <div className="flex flex-col space-y-2 pt-2 border-t border-gray-700">
                <Link
                  to="/login"
                  className="flex items-center space-x-2 text-holographic-white hover:text-tech-blue transition-colors py-2"
                  onClick={closeMenu}
                >
                  <LogIn className="h-5 w-5" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-2 text-holographic-white hover:text-tech-blue transition-colors py-2"
                  onClick={closeMenu}
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Navbar;
