import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Ticket, Users, Settings } from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { 
      path: '/admin', 
      icon: <LayoutDashboard size={20} />, 
      label: 'Dashboard',
      exact: true
    },
    { 
      path: '/admin/events', 
      icon: <Calendar size={20} />, 
      label: 'Events',
      exact: false
    },
    { 
      path: '/admin/tickets', 
      icon: <Ticket size={20} />, 
      label: 'Tickets',
      exact: false
    },
    { 
      path: '/admin/users', 
      icon: <Users size={20} />, 
      label: 'Users',
      exact: false
    },
    { 
      path: '/admin/settings', 
      icon: <Settings size={20} />, 
      label: 'Settings',
      exact: false
    },
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
            className={({ isActive }) => {
              // Special handling for the dashboard to match exactly
              const isDashboard = item.path === '/admin';
              const isActiveRoute = isDashboard 
                ? location.pathname === '/admin' || location.pathname === '/admin/'
                : isActive;
              
              return `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 transition-colors ${
                isActiveRoute ? 'bg-gray-800 border-l-4 border-blue-500' : ''
              }`;
            }}
            end={item.exact}
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