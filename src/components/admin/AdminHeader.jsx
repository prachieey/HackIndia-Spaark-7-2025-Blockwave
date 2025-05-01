import React from 'react';
import { Bell, User } from 'lucide-react';

const AdminHeader = () => {
  return (
    <header className="bg-gray-800 text-white h-16 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-gray-700 rounded-full">
          <Bell size={20} />
        </button>
        <button className="p-2 hover:bg-gray-700 rounded-full">
          <User size={20} />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;