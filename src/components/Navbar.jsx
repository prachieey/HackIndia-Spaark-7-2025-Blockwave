import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  Menu, 
  X, 
  LogIn, 
  UserPlus, 
  User, 
  Shield, 
  LogOut, 
  ChevronDown, 
  Ticket,
  LayoutDashboard,
  Settings,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/blockchain/Web3Context';
import { useTheme } from '../contexts/ThemeContext';
import WalletConnect from './wallet/WalletConnect';
import { cn } from '../lib/utils';

// NavLink component with active state
const NavLink = ({ to, children, className = '', ...props }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={cn(
        'relative px-4 py-2 text-sm font-medium transition-colors duration-200',
        isActive 
          ? 'text-white' 
          : 'text-gray-300 hover:text-white',
        className
      )}
      {...props}
    >
      {children}
      {isActive && (
        <motion.span
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary-400 to-primary-600 w-full"
          layoutId="activeNavLink"
          initial={false}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        />
      )}
    </Link>
  );
};

const Navbar = ({ openAuthModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isAdmin = user?.role === 'admin';
  const { isConnected } = useWeb3();
  const profileRef = useRef(null);
  const menuRef = useRef(null);

  // Toggle scroll effect and close dropdowns when clicking outside
  const handleClickOutside = useCallback((event) => {
    if (profileRef.current && !profileRef.current.contains(event.target) && !event.target.closest('.profile-menu-button')) {
      setIsProfileOpen(false);
    }
    if (menuRef.current && !menuRef.current.contains(event.target) && !event.target.closest('.mobile-menu-button')) {
      setIsMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside, isMenuOpen, isProfileOpen]);

  // Navigation items
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Events', path: '/events' },
    { name: 'Tickets', path: '/tickets' },
  ];

  // User menu items
  const userMenuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/user/dashboard',
    },
    {
      name: 'My Tickets',
      icon: Ticket,
      path: '/user/tickets',
    },
    {
      name: 'Settings',
      icon: Settings,
      path: '/user/settings',
    },
  ];

  const handleLogout = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      console.log('[Navbar] Starting logout process...');
      
      // Close the profile dropdown
      setIsProfileOpen(false);
      setIsMenuOpen(false);
      
      // Call the logout function from AuthContext
      const result = await logout();
      
      if (result && result.success) {
        console.log('[Navbar] Logout successful, redirecting to home...');
        // Use window.location to force a full page reload and clear all states
        window.location.href = '/';
      } else {
        console.error('[Navbar] Logout failed:', result?.error || 'Unknown error');
      }
    } catch (error) {
      console.error('[Navbar] Error during logout:', error);
      // Even if there was an error, we should still try to redirect
      window.location.href = '/';
    }
  };
  
  // Handle navigation to a specific route
  const navigateTo = useCallback((path) => {
    navigate(path);
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [navigate]);
  
  // Toggle mobile menu
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
    if (isProfileOpen) setIsProfileOpen(false);
  }, [isProfileOpen]);
  
  // Close mobile menu
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);
  
  // Connect wallet handler
  const handleConnectWallet = useCallback(async () => {
    try {
      // Import Web3Context to use its connectWallet function
      const { connectWallet } = await import('../contexts/blockchain/Web3Context');
      if (typeof connectWallet === 'function') {
        await connectWallet();
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  }, []);

  return (
    <>
      <motion.header
        className={cn(
          'fixed w-full z-50 transition-all duration-500 backdrop-blur-md',
          scrolled 
            ? 'bg-dark-900/80 shadow-2xl border-b border-dark-700/30 py-2' 
            : 'bg-gradient-to-b from-dark-900/70 to-transparent py-4',
          isMenuOpen ? 'bg-dark-900' : ''
        )}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.6, 
          ease: [0.4, 0, 0.2, 1],
          opacity: { duration: 0.4 }
        }}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link 
                to="/" 
                className="flex items-center space-x-2 group"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <motion.div
                  className="relative"
                  animate={{
                    rotate: isHovering ? [0, 10, -10, 0] : 0,
                  }}
                  transition={{
                    duration: 0.6,
                    ease: 'easeInOut',
                  }}
                >
                  <QrCode className="h-8 w-8 text-primary-500 transition-transform duration-300 group-hover:scale-110" />
                </motion.div>
                <motion.span 
                  className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Scantyx
                </motion.span>
                <motion.span 
                  className="ml-1 text-xs font-medium bg-gradient-to-r from-primary-400 to-primary-600 text-transparent bg-clip-text"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.8, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  PRO
                </motion.span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <NavLink key={item.path} to={item.path}>
                  {item.name}
                </NavLink>
              ))}
            </nav>

            {/* Auth & User Actions */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-400 hover:text-primary-400 hover:bg-dark-700/50 transition-colors duration-200"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {/* Wallet Connect */}
              {user && (
                <div className="hidden md:block">
                  <WalletConnect />
                </div>
              )}

              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => {
                      setIsProfileOpen(!isProfileOpen);
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      'flex items-center space-x-2 focus:outline-none group relative',
                      'p-1 rounded-full bg-gradient-to-br from-primary-900/30 to-primary-900/10',
                      'border border-dark-600/50 hover:border-primary-500/30 transition-all duration-300',
                      'shadow-lg hover:shadow-primary-500/20',
                      isProfileOpen ? 'ring-2 ring-primary-500/50' : ''
                    )}
                    aria-expanded={isProfileOpen}
                    aria-haspopup="true"
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium text-lg shadow-inner border border-white/10">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-dark-900"></div>
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{
                          type: 'spring',
                          damping: 25,
                          stiffness: 300,
                          bounce: 0.2,
                        }}
                        className="absolute right-0 mt-2 w-64 origin-top-right z-50"
                      >
                        <div className="rounded-xl bg-dark-800/95 backdrop-blur-xl shadow-2xl border border-dark-700/50 overflow-hidden">
                          {/* User Info */}
                          <div className="p-4 border-b border-dark-700/50 bg-gradient-to-r from-dark-800 to-dark-900">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xl font-semibold shadow-lg">
                                  {user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-dark-900"></div>
                              </div>
                              <div>
                                <p className="font-medium text-white">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-400">{user?.email || 'user@example.com'}</p>
                              </div>
                            </div>
                          </div>

                          {/* User Menu */}
                          <div className="p-2">
                            {userMenuItems.map((item, index) => (
                              <Link
                                key={index}
                                to={item.path}
                                className="flex items-center px-3 py-2.5 text-sm rounded-lg text-gray-300 hover:bg-dark-700/50 hover:text-white transition-colors group"
                                onClick={() => setIsProfileOpen(false)}
                              >
                                <item.icon className="w-4 h-4 mr-3 text-primary-400 group-hover:text-primary-300 transition-colors" />
                                {item.name}
                                <ChevronDown className="ml-auto w-4 h-4 text-gray-500 transform -rotate-90" />
                              </Link>
                            ))}

                            {isAdmin && (
                              <Link
                                to="/admin/dashboard"
                                className="flex items-center px-3 py-2.5 text-sm rounded-lg text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 transition-colors group mt-1"
                                onClick={() => setIsProfileOpen(false)}
                              >
                                <Shield className="w-4 h-4 mr-3 text-amber-400 group-hover:text-amber-300 transition-colors" />
                                Admin Dashboard
                                <ChevronDown className="ml-auto w-4 h-4 text-amber-500 transform -rotate-90" />
                              </Link>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="p-3 border-t border-dark-700/50 bg-dark-900/30">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                            >
                              <LogOut className="w-4 h-4 mr-2" />
                              Sign out
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="px-4 py-2 text-sm font-medium text-gray-200 hover:text-white transition-colors hidden sm:inline-flex"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Sign up
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <div className="md:hidden ml-2">
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-expanded={isMenuOpen}
                >
                  <span className="sr-only">Open main menu</span>
                  {isMenuOpen ? (
                    <X className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden fixed top-16 md:top-20 left-0 right-0 z-40"
            ref={menuRef}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-dark-800/95 backdrop-blur-lg border-t border-dark-700/50">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === item.path
                      ? 'text-white bg-dark-700/50'
                      : 'text-gray-300 hover:text-white hover:bg-dark-700/30'
                  }`}
                  onClick={() => {
                    closeMenu();
                    navigateTo(item.path);
                  }}
                >
                  {item.name}
                </Link>
              ))}
              
              {!user ? (
                <div className="pt-4 pb-2 border-t border-dark-700/50 mt-2">
                  <button
                    onClick={() => {
                      closeMenu();
                      openAuthModal('login');
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 text-base font-medium text-white bg-dark-700/50 rounded-md hover:bg-dark-600/50 mb-2"
                  >
                    <LogIn className="h-5 w-5 mr-2" />
                    Log in
                  </button>
                  <button
                    onClick={() => {
                      closeMenu();
                      openAuthModal('signup');
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 text-base font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:opacity-90 rounded-md"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Sign up
                  </button>
                </div>
              ) : (
                <div className="pt-4 pb-2 border-t border-dark-700/50 mt-2">
                  {/* User info in mobile menu */}
                  <div className="flex items-center px-3 py-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium text-sm mr-3">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-400">{user?.email || 'user@example.com'}</p>
                    </div>
                  </div>
                  
                  {/* User menu items in mobile */}
                  {userMenuItems.map((item, index) => (
                    <Link
                      key={index}
                      to={item.path}
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-dark-700/30 rounded-md"
                      onClick={closeMenu}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}

                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center px-3 py-2 text-base font-medium text-amber-400 hover:bg-amber-500/10 rounded-md"
                      onClick={closeMenu}
                    >
                      <Shield className="mr-3 h-5 w-5" />
                      Admin Dashboard
                    </Link>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2 text-base font-medium text-rose-400 hover:bg-rose-500/10 rounded-md mt-2"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;