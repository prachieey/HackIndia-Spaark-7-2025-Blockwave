import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Ticket, Users, Settings } from 'lucide-react';

const AdminSidebar = () => {
  const navItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/events', icon: <Calendar size={20} />, label: 'Events' },
    { path: '/admin/tickets', icon: <Ticket size={20} />, label: 'Tickets' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Users' },
    { path: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white">
      <div className="p-6">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
        <p className="text-sm text-gray-400">Event Management System</p>
      </div>
      <nav className="mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 transition-colors ${
                isActive ? 'bg-gray-800 border-l-4 border-blue-500' : ''
              }`
            }
          >
            {item.icon}
            <span className="ml-3">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;