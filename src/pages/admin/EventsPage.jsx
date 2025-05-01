import React from 'react';
import { Search, Filter, Plus } from 'lucide-react';

const AdminEventsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Events Management</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Create Event
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
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
              {/* Add event rows here */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminEventsPage;