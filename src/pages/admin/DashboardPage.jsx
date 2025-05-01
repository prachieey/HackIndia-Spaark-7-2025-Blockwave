import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Users, Ticket, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboardPage = () => {
  // Mock data for charts
  const salesData = [
    { name: format(new Date().setDate(new Date().getDate() - 6), 'MMM dd'), sales: 4000 },
    { name: format(new Date().setDate(new Date().getDate() - 5), 'MMM dd'), sales: 3000 },
    { name: format(new Date().setDate(new Date().getDate() - 4), 'MMM dd'), sales: 2000 },
    { name: format(new Date().setDate(new Date().getDate() - 3), 'MMM dd'), sales: 2780 },
    { name: format(new Date().setDate(new Date().getDate() - 2), 'MMM dd'), sales: 1890 },
    { name: format(new Date().setDate(new Date().getDate() - 1), 'MMM dd'), sales: 2390 },
    { name: format(new Date(), 'MMM dd'), sales: 3490 },
  ];

  const stats = [
    { title: 'Total Events', value: '156', icon: Calendar, change: '+12%', color: 'text-blue-500' },
    { title: 'Active Users', value: '2,345', icon: Users, change: '+8%', color: 'text-green-500' },
    { title: 'Ticket Sales', value: '12,456', icon: Ticket, change: '+15%', color: 'text-purple-500' },
    { title: 'Revenue', value: '₹45,678', icon: DollarSign, change: '+10%', color: 'text-yellow-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <div className="text-sm text-gray-400">
          Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <p className="mt-4 text-green-500">{stat.change} from last month</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Ticket Sales Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
              />
              <Legend />
              <Bar dataKey="sales" name="Ticket Sales" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((_, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700">
                <div>
                  <p className="text-white">New ticket purchase</p>
                  <p className="text-sm text-gray-400">User ID: #12345</p>
                </div>
                <span className="text-sm text-gray-400">
                  {format(new Date().setMinutes(new Date().getMinutes() - index * 30), 'HH:mm')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;