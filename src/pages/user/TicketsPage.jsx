import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { useEvents } from '../../contexts/EventsContext';
import QRTicket from '../../components/tickets/QRTicket';

const UserTicketsPage = () => {
  const { userTickets } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredTickets = userTickets.filter(ticket => {
    const matchesSearch = ticket.eventTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'used' && ticket.isUsed) ||
      (filterStatus === 'unused' && !ticket.isUsed) ||
      (filterStatus === 'forSale' && ticket.isForSale);
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold text-holographic-white">My Tickets</h1>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tech-blue w-5 h-5" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input"
        >
          <option value="all">All Tickets</option>
          <option value="unused">Unused</option>
          <option value="used">Used</option>
          <option value="forSale">For Sale</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTickets.map(ticket => (
          <QRTicket
            key={ticket.id}
            ticket={ticket}
            showResellOption={!ticket.isUsed && !ticket.isForSale}
          />
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-bold text-holographic-white mb-2">No tickets found</h3>
          <p className="text-holographic-white/70">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default UserTicketsPage;