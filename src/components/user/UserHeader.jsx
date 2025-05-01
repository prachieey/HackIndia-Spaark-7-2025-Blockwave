import React from 'react';
import { Bell, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';

const UserHeader = () => {
  const { user } = useAuth();

  return (
    <header className="bg-gray-800 text-white">
      <div className="px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Welcome, {user?.name || 'User'}</h1>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-700 rounded-full">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-full">
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt="User" className="w-full h-full rounded-full" />
            ) : (
              <span>{user?.name?.[0] || 'U'}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;