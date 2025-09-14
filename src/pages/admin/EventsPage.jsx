import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Loader2 } from 'lucide-react';
import CreateEventModal from '../../components/admin/CreateEventModal';
import { ethers } from 'ethers';
import { useWeb3 } from '../../contexts/blockchain/Web3Context';
import { toast } from 'react-toastify';

const AdminEventsPage = () => {
  const { fetchEvents, isConnected } = useWeb3();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const events = await fetchEvents();
      setEvents(events);
    } catch (error) {
      console.error('Failed to load events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadEvents();
    }
  }, [isConnected]);

  const handleEventCreated = () => {
    loadEvents();
    toast.success('Event created successfully!');
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Events Management</h1>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Event
        </button>
      </div>
      
      <CreateEventModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={handleEventCreated}
      />

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3">Event Name</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Tickets Sold</th>
                <th className="pb-3">Revenue</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400">
                    Loading events...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400">
                    No events found. Create your first event!
                  </td>
                </tr>
              ) : (
                events
                  .filter(event => 
                    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    event.location.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((event) => (
                    <tr key={event.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-700 rounded-md flex items-center justify-center">
                            <span className="text-gray-400">🎟️</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{event.name}</div>
                            <div className="text-sm text-gray-400">{event.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-gray-300">
                        {new Date(event.date * 1000).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-300">
                          Active
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-300">
                        {event.ticketsSold} / {event.ticketsAvailable}
                      </td>
                      <td className="py-4 text-sm text-gray-300">
                        {ethers.utils.formatEther(event.price * event.ticketsSold)} ETH
                      </td>
                      <td className="py-4 text-sm font-medium text-right">
                        <button className="text-blue-500 hover:text-blue-400 mr-4">Edit</button>
                        <button className="text-red-500 hover:text-red-400">Delete</button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminEventsPage;