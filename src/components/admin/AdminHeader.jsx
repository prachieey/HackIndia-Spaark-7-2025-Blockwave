import React, { useState, useRef, useEffect } from 'react';
import { Bell, User, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminHeader = () => {
  const { user: currentUser, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = (e) => {
    console.log('Logout button clicked - handleLogout called');
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Clearing authentication data...');
    // Clear all local data first
    localStorage.removeItem('scantyx_user');
    localStorage.removeItem('auth_token');
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Clear any remaining state
    window.dispatchEvent(new Event('storage'));
    
    console.log('Redirecting to login page...');
    // Redirect to login page
    window.location.href = '/login';
  };

  // Toggle dropdown when clicking the profile button
  const toggleDropdown = (e) => {
    e.stopPropagation();
    console.log('Toggling dropdown, current state:', isDropdownOpen);
    setIsDropdownOpen(prev => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isDropdownOpen) return;
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        console.log('Click outside, closing dropdown');
        setIsDropdownOpen(false);
      }
    };

    // Use a slight delay to avoid immediate close on open
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="bg-gray-800 text-white h-16 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold">
          {currentUser?.role === 'admin' ? 'Admin Dashboard' : 'Event Platform'}
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        {!currentUser ? (
          <div className="flex space-x-4">
            <button 
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-white hover:bg-gray-100 rounded-md"
            >
              Sign Up
            </button>
          </div>
        ) : (
          <div className="relative" ref={dropdownRef}>
              <button 
                className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-lg transition-colors"
                onClick={toggleDropdown}
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <User size={16} />
                </div>
                <span className="hidden md:inline-block text-sm font-medium">
                  {currentUser?.email?.split('@')[0] || 'User'}
                </span>
                <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>
          
              {isDropdownOpen && (
                <div 
                  className="absolute right-0 mt-1 w-56 bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 text-sm text-gray-300 border-b border-gray-700">
                    <div className="font-medium">{currentUser?.email || 'User'}</div>
                    <div className="text-xs text-gray-400">
                      {currentUser?.role === 'admin' ? 'Administrator' : 'User Account'}
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDropdownOpen(false);
                        // Redirect based on user role
                        if (currentUser?.role === 'admin') {
                          window.location.href = '/admin';
                        } else {
                          window.location.href = '/user/dashboard';
                        }
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                    >
                      <LayoutDashboard size={16} className="mr-2" />
                      Dashboard
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-700 my-1"></div>
                  
                  <div className="py-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogout(e);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;