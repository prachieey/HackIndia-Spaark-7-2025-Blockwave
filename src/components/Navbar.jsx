import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, Menu, X, LogIn, UserPlus, User, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = ({ openAuthModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-holographic-white hover:text-tech-blue transition-colors ${
                location.pathname === link.path ? 'font-bold text-tech-blue' : ''
              }`}
              onClick={closeMenu}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              {isAdmin ? (
                <Link 
                  to="/admin" 
                  className="flex items-center space-x-1 text-holographic-white hover:text-tech-blue transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin Panel</span>
                </Link>
              ) : (
                <Link 
                  to="/user" 
                  className="flex items-center space-x-1 text-holographic-white hover:text-tech-blue transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-holographic-white hover:text-tech-blue transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => openAuthModal('signin')}
                className="flex items-center space-x-1 text-holographic-white hover:text-tech-blue transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="btn btn-primary flex items-center space-x-1"
              >
                <UserPlus className="h-4 w-4" />
                <span>Sign Up</span>
              </button>
            </>
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
              <>
                {isAdmin ? (
                  <Link 
                    to="/admin" 
                    className="flex items-center space-x-1 text-holographic-white hover:text-tech-blue transition-colors py-2"
                    onClick={closeMenu}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </Link>
                ) : (
                  <Link 
                    to="/user" 
                    className="flex items-center space-x-1 text-holographic-white hover:text-tech-blue transition-colors py-2"
                    onClick={closeMenu}
                  >
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-holographic-white hover:text-tech-blue transition-colors py-2 w-full text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    openAuthModal('signin');
                    closeMenu();
                  }}
                  className="flex items-center space-x-1 text-holographic-white hover:text-tech-blue transition-colors py-2"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => {
                    openAuthModal('signup');
                    closeMenu();
                  }}
                  className="btn btn-primary flex items-center justify-center space-x-1"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Sign Up</span>
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Navbar;