import React, { useState } from 'react';
import { Search, Filter, Check, X, AlertCircle } from 'lucide-react';
import { useEvents } from '../../contexts/EventsContext';
import { format } from 'date-fns';

const AdminTicketsPage = () => {
  const { pendingTickets, approveTicket, rejectTicket } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleApprove = async (ticketId) => {
    const result = await approveTicket(ticketId);
    if (result.success) {
      // Show success message
    }
  };

  const handleReject = async (ticketId) => {
    const result = await rejectTicket(ticketId);
    if (result.success) {
      // Show success message
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Tickets Management</h1>
        <div className="flex items-center space-x-4">
          <span className="text-yellow-500 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {pendingTickets.length} Pending Approvals
          </span>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3">Ticket ID</th>
                <th className="pb-3">Event</th>
                <th className="pb-3">User</th>
                <th className="pb-3">Submission Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingTickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-gray-700">
                  <td className="py-4">{ticket.id}</td>
                  <td className="py-4">{ticket.eventTitle}</td>
                  <td className="py-4">{ticket.userId}</td>
                  <td className="py-4">{format(new Date(ticket.submissionDate), 'MMM dd, yyyy')}</td>
                  <td className="py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-500">
                      Pending
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(ticket.id)}
                        className="p-1 text-green-500 hover:bg-green-500/20 rounded"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleReject(ticket.id)}
                        className="p-1 text-red-500 hover:bg-red-500/20 rounded"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTicketsPage;