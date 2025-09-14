import React, { useState } from 'react';
import { useWeb3 } from '../../contexts/blockchain/Web3Context';
import { toast } from 'react-toastify';

export default function CreateEventForm({ onSuccess }) {
  const { createEvent, isConnected } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    date: '',
    price: '',
    ticketsAvailable: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      
      // Call the smart contract to create event
      await createEvent(
        formData.name,
        formData.location,
        formData.date,
        formData.price,
        parseInt(formData.ticketsAvailable)
      );
      
      toast.success('Event created successfully on the blockchain!');
      
      // Reset form
      setFormData({
        name: '',
        location: '',
        date: '',
        price: '',
        ticketsAvailable: '',
        description: ''
      });
      
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(`Failed to create event: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">
            Event Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-deep-purple focus:border-transparent"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="location" className="block text-sm font-medium text-gray-300">
            Location *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-deep-purple focus:border-transparent"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="date" className="block text-sm font-medium text-gray-300">
            Date & Time *
          </label>
          <input
            type="datetime-local"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-deep-purple focus:border-transparent"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="price" className="block text-sm font-medium text-gray-300">
            Price (ETH) *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">Ξ</span>
            </div>
            <input
              type="number"
              id="price"
              name="price"
              step="0.0001"
              min="0"
              value={formData.price}
              onChange={handleChange}
              className="w-full pl-8 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-deep-purple focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="ticketsAvailable" className="block text-sm font-medium text-gray-300">
            Tickets Available *
          </label>
          <input
            type="number"
            id="ticketsAvailable"
            name="ticketsAvailable"
            min="1"
            value={formData.ticketsAvailable}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-deep-purple focus:border-transparent"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-300">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows="4"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-deep-purple focus:border-transparent"
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className={`w-full px-6 py-3 rounded-lg font-medium text-white transition-colors ${
            loading
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-deep-purple hover:bg-purple-700'
          }`}
        >
          {loading ? 'Creating Event...' : 'Create Event on Blockchain'}
        </button>
      </div>

      {!isConnected && (
        <div className="text-center text-yellow-400 text-sm">
          Please connect your wallet to create an event on the blockchain.
        </div>
      )}
    </form>
  );
}
