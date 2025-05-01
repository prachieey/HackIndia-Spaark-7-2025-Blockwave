import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Ticket, UserCircle, PlusCircle } from 'lucide-react';

const UserSidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/user', icon: Home, label: 'Dashboard' },
    { path: '/user/tickets', icon: Ticket, label: 'My Tickets' },
    { path: '/user/profile', icon: UserCircle, label: 'Profile' },
    { path: '/user/create-event', icon: PlusCircle, label: 'Create Event' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white">
      <div className="p-6">
        <h2 className="text-2xl font-bold">Event Hub</h2>
      </div>
      <nav className="mt-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 transition-colors ${
                isActive ? 'bg-gray-800 text-white' : ''
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default UserSidebar;