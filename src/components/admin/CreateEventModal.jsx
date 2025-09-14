import React, { useState } from 'react';
import { X, Calendar, MapPin, Tag, Ticket, Info } from 'lucide-react';
import { useWeb3 } from '../../contexts/blockchain/Web3Context';
import { toast } from 'react-toastify';

const CreateEventModal = ({ isOpen, onClose, onEventCreated }) => {
  const { createEvent, isConnected } = useWeb3();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    price: '',
    ticketsAvailable: '',
    category: 'Blockchain',
    image: null
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      
      // Convert date and time to Unix timestamp
      const eventDate = new Date(`${formData.date}T${formData.time}`);
      const unixTimestamp = Math.floor(eventDate.getTime() / 1000);
      
      // Convert price to wei
      const priceInWei = ethers.utils.parseEther(formData.price);
      
      // Call the smart contract
      const tx = await createEvent(
        formData.name,
        formData.location,
        unixTimestamp,
        priceInWei,
        parseInt(formData.ticketsAvailable),
        formData.description
      );
      
      const receipt = await tx.wait();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        date: '',
        time: '',
        location: '',
        price: '',
        ticketsAvailable: '',
        category: 'Blockchain',
        image: null
      });
      
      toast.success('Event created successfully!');
      onEventCreated();
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error.reason || error.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Create New Event</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
              disabled={isLoading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Event Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Category *</label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                    required
                  >
                    <option value="Blockchain">Blockchain</option>
                    <option value="Music">Music</option>
                    <option value="Technology">Technology</option>
                    <option value="Business">Business</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Date *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Time *</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Price (ETH) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="0.05"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Tickets Available *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Ticket className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="ticketsAvailable"
                    value={formData.ticketsAvailable}
                    onChange={handleChange}
                    min="1"
                    className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="100"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-300">Location *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g., Virtual Event, New York, USA"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-300">Description *</label>
                <div className="relative">
                  <div className="absolute top-2 left-2">
                    <Info className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full bg-gray-700 text-white rounded-lg pl-10 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Tell us about your event..."
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-300">Event Image</label>
                <div className="mt-1 flex items-center">
                  <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-700">
                    {formData.image ? (
                      <img
                        src={URL.createObjectURL(formData.image)}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-600">
                        <span className="text-gray-400 text-xs">Image</span>
                      </div>
                    )}
                  </span>
                  <label className="ml-5">
                    <div className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors">
                      {formData.image ? 'Change' : 'Upload'}
                    </div>
                    <input
                      type="file"
                      name="image"
                      onChange={handleChange}
                      accept="image/*"
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventModal;
