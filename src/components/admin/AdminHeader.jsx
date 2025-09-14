import React, { useState, useRef, useEffect } from 'react';
import { Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminHeader = () => {
  const { currentUser, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { success, error } = await logout();
      if (success) {
        // Clear any remaining state
        window.dispatchEvent(new Event('storage'));
        // Redirect to login page after a short delay
        setTimeout(() => navigate('/login', { replace: true }), 100);
      } else if (error) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect even if there's an error
      navigate('/login', { replace: true });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-gray-800 text-white h-16 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button 
          className="p-2 hover:bg-gray-700 rounded-full relative"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-lg transition-colors"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <User size={16} />
            </div>
            <span className="hidden md:inline-block text-sm font-medium">
              {currentUser?.email?.split('@')[0] || 'Admin'}
            </span>
            <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-700">
              <div className="px-4 py-3 text-sm text-gray-300 border-b border-gray-700">
                <div className="font-medium">{currentUser?.email || 'Admin'}</div>
                <div className="text-xs text-gray-400">Administrator</div>
              </div>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  // Redirect based on user role
                  if (currentUser?.role === 'admin') {
                    navigate('/admin');
                  } else {
                    navigate('/user/dashboard');
                  }
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
              >
                <LayoutDashboard size={16} className="mr-2" />
                Dashboard
              </button>
              <div className="border-t border-gray-700 my-1"></div>
              <button
                onClick={async () => {
                  setIsDropdownOpen(false);
                  await handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center"
              >
                <LogOut size={16} className="mr-2" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;