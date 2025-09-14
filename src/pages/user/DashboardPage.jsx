import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Ticket, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import { useEvents } from '../../contexts/EventsContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const UserDashboardPage = () => {
  const { userTickets, pendingTickets } = useEvents();

  const stats = [
    {
      title: 'Active Tickets',
      value: userTickets.filter(t => !t.isUsed).length,
      icon: Ticket,
      color: 'text-green-500',
    },
    {
      title: 'Used Tickets',
      value: userTickets.filter(t => t.isUsed).length,
      icon: Clock,
      color: 'text-blue-500',
    },
    {
      title: 'Pending Approvals',
      value: pendingTickets.length,
      icon: AlertCircle,
      color: 'text-yellow-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Welcome Back!</h1>
        <Link 
          to="/" 
          className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Tickets</h2>
          <div className="space-y-4">
            {userTickets.slice(0, 5).map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between py-2 border-b border-gray-700">
                <div>
                  <p className="text-white">{ticket.eventTitle}</p>
                  <p className="text-sm text-gray-400">
                    {format(new Date(ticket.purchaseDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    ticket.isUsed
                      ? 'bg-gray-500/20 text-gray-400'
                      : 'bg-green-500/20 text-green-500'
                  }`}
                >
                  {ticket.isUsed ? 'Used' : 'Active'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Pending Approvals</h2>
          <div className="space-y-4">
            {pendingTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between py-2 border-b border-gray-700">
                <div>
                  <p className="text-white">{ticket.eventTitle}</p>
                  <p className="text-sm text-gray-400">
                    Submitted: {format(new Date(ticket.submissionDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-500">
                  Pending
                </span>
              </div>
            ))}
            {pendingTickets.length === 0 && (
              <p className="text-gray-400">No pending approvals</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserDashboardPage;