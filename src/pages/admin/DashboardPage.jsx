import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { 
  Calendar, Users, Ticket, DollarSign, TrendingUp, AlertTriangle, 
  Clock, CheckCircle, XCircle, Activity, Server, CreditCard, Settings, UserCog, Shield, LogOut
} from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
import { format, subDays, subMonths } from 'date-fns';

// Mock data functions
const generateEventData = () => {
  const categories = ['Music', 'Sports', 'Tech', 'Business', 'Education'];
  return categories.map(category => ({
    name: category,
    events: Math.floor(Math.random() * 50) + 10,
    color: `#${Math.floor(Math.random()*16777215).toString(16)}`
  }));
};

const generateUserActivity = (days = 7) => {
  return Array.from({ length: days }, (_, i) => ({
    date: format(subDays(new Date(), days - i - 1), 'MMM dd'),
    users: Math.floor(Math.random() * 100) + 50,
    tickets: Math.floor(Math.random() * 200) + 100,
  }));
};

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [eventData, setEventData] = useState(generateEventData());
  const [salesData, setSalesData] = useState([
    { name: 'Jan', sales: 4000 },
    { name: 'Feb', sales: 3000 },
    { name: 'Mar', sales: 5000 },
    { name: 'Apr', sales: 2780 },
    { name: 'May', sales: 1890 },
    { name: 'Jun', sales: 2390 },
  ]);
  const [userActivity, setUserActivity] = useState(generateUserActivity(7));
  const [stats, setStats] = useState([
    { 
      title: 'Total Events', 
      value: '156', 
      icon: Calendar, 
      change: '+12%', 
      color: 'text-blue-500',
      link: '/admin/events'
    },
    { 
      title: 'Active Users', 
      value: '2,345', 
      icon: Users, 
      change: '+8%', 
      color: 'text-green-500',
      link: '/admin/users'
    },
    { 
      title: 'Ticket Sales', 
      value: '12,456', 
      icon: Ticket, 
      change: '+15%', 
      color: 'text-purple-500',
      link: '/admin/tickets'
    },
    { 
      title: 'Revenue', 
      value: '₹1,45,678', 
      icon: DollarSign, 
      change: '+22%', 
      color: 'text-yellow-500',
      link: '/admin/transactions'
    },
  ]);
  const [recentActivities] = useState([
    { id: 1, user: 'John Doe', action: 'created a new event', time: '2 mins ago', status: 'completed' },
    { id: 2, user: 'Jane Smith', action: 'updated ticket prices', time: '10 mins ago', status: 'completed' },
    { id: 3, user: 'System', action: 'scheduled maintenance', time: '1 hour ago', status: 'pending' },
    { id: 4, user: 'Alex Johnson', action: 'reported an issue', time: '3 hours ago', status: 'failed' },
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New event registration: Blockchain Conference', time: '2 mins ago', read: false, type: 'event' },
    { id: 2, message: '3 new tickets sold for Music Festival', time: '15 mins ago', read: false, type: 'ticket' },
    { id: 3, message: 'System maintenance scheduled for tonight', time: '1 hour ago', read: true, type: 'system' },
    { id: 4, message: 'New user registered: alex@example.com', time: '3 hours ago', read: true, type: 'user' },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Toggle notification dropdown
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    // Mark all notifications as read when opening
    if (!showNotifications) {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Handle navigation based on notification type
    switch(notification.type) {
      case 'event':
        // Navigate to events page
        break;
      case 'ticket':
        // Navigate to tickets page
        break;
      case 'user':
        // Navigate to users page
        break;
      default:
        break;
    }
    // Close dropdown after click
    setShowNotifications(false);
  };

  const quickActions = [
    { title: 'Create Event', icon: Calendar, link: '/admin/events/new' },
    { title: 'Manage Users', icon: UserCog, link: '/admin/users' },
    { title: 'View Reports', icon: Activity, link: '/admin/reports' },
    { title: 'System Settings', icon: Settings, link: '/admin/settings' },
  ];

  // Function to update data based on time range
  const updateData = (range) => {
    let days;
    switch(range) {
      case '24h':
        days = 1;
        break;
      case '7d':
        days = 7;
        break;
      case '30d':
        days = 30;
        break;
      case '90d':
        days = 90;
        break;
      default:
        days = 7;
    }

    // Update user activity data
    setUserActivity(generateUserActivity(days));
    
    // Update stats based on time range
    const multiplier = days / 7; // Adjust numbers based on range
    setStats([
      { 
        ...stats[0],
        value: Math.floor(156 * (days / 7)).toLocaleString(),
        change: `+${Math.floor(12 * (days / 7))}%`
      },
      { 
        ...stats[1],
        value: Math.floor(2345 * multiplier).toLocaleString(),
        change: `+${Math.floor(8 * multiplier)}%`
      },
      { 
        ...stats[2],
        value: Math.floor(12456 * multiplier).toLocaleString(),
        change: `+${Math.floor(15 * multiplier)}%`
      },
      { 
        ...stats[3],
        value: `₹${(145678 * multiplier).toLocaleString()}`,
        change: `+${Math.floor(22 * multiplier)}%`
      },
    ]);
  };

  // Handle time range change
  const handleTimeRangeChange = (e) => {
    const newRange = e.target.value;
    setTimeRange(newRange);
    updateData(newRange);
  };

  // Load initial data
  useEffect(() => {
    updateData(timeRange);
  }, []);

  // Tab content components
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <Link 
                  key={index} 
                  to={stat.link}
                  className="transform transition-all duration-200 hover:scale-105"
                >
                  <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`p-3 rounded-md ${stat.color.replace('text', 'bg')} bg-opacity-10`}>
                            <stat.icon className="w-6 h-6" />
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                              {stat.title}
                            </dt>
                            <dd>
                              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                                {stat.value}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="text-sm">
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {stat.change}
                          </span>{' '}
                          <span className="text-gray-500 dark:text-gray-400">
                            vs last period
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transform transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="p-5 flex items-center">
                      <div className={`p-3 rounded-md bg-blue-100 dark:bg-blue-900 bg-opacity-50`}>
                        <action.icon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium text-gray-900 dark:text-white">{action.title}</h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">Analytics Dashboard</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Sales Overview</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Event Categories</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={eventData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="events"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {eventData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        );
        break;

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-6">Settings</h2>
              <div className="space-y-6">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-medium mb-4">Account Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Notifications
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Receive email notifications
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Timezone
                      </label>
                      <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option>UTC</option>
                        <option>GMT</option>
                        <option>IST</option>
                        <option>EST</option>
                        <option>PST</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Appearance</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Theme
                      </label>
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Page Not Found</h2>
            <p className="text-gray-600 dark:text-gray-300">
              The page you are looking for does not exist or has been moved.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <select 
                  value={timeRange}
                  onChange={handleTimeRangeChange}
                  className="bg-gray-100 dark:bg-gray-700 border-0 rounded-md text-sm p-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
              <div className="relative">
                <button 
                  onClick={toggleNotifications}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full relative"
                  aria-label="Notifications"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="lucide lucide-bell"
                  >
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                  </svg>
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-10">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-900 dark:text-white">Notifications</h3>
                        <button 
                          onClick={() => setShowNotifications(false)}
                          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div 
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                              !notification.read ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                            }`}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 pt-0.5">
                                {notification.type === 'event' && (
                                  <Calendar className="h-5 w-5 text-blue-500" />
                                )}
                                {notification.type === 'ticket' && (
                                  <Ticket className="h-5 w-5 text-green-500" />
                                )}
                                {notification.type === 'system' && (
                                  <Server className="h-5 w-5 text-yellow-500" />
                                )}
                                {notification.type === 'user' && (
                                  <UserCog className="h-5 w-5 text-purple-500" />
                                )}
                              </div>
                              <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {notification.message}
                                </p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                          No new notifications
                        </div>
                      )}
                    </div>
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-center border-t border-gray-200 dark:border-gray-600">
                      <a 
                        href="#" 
                        className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View all notifications
                      </a>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(), 'MMM dd, yyyy HH:mm')}
              </div>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <nav className="mt-6 flex space-x-8 border-b border-gray-200 dark:border-gray-700">
            {['overview', 'analytics', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderTabContent()}

        {/* Charts and Activity */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Activity Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">User Activity</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userActivity}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    name="Active Users" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tickets" 
                    name="Tickets Sold" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentActivities.map((activity, index) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {index !== recentActivities.length - 1 ? (
                          <span 
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" 
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800 ${
                              activity.status === 'completed' ? 'bg-green-500' : 
                              activity.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}>
                              {activity.status === 'completed' ? (
                                <CheckCircle className="h-5 w-5 text-white" />
                              ) : activity.status === 'pending' ? (
                                <Clock className="h-5 w-5 text-white" />
                              ) : (
                                <XCircle className="h-5 w-5 text-white" />
                              )}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {activity.user}
                                </span>{' '}
                                {activity.action}
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                              <time dateTime={activity.time}>{activity.time}</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <Link 
                  to="/admin/activity" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View all activity<span aria-hidden="true"> &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Event Categories */}
        <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Events by Category</h3>
          <div className="h-80 flex items-center justify-center">
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eventData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="events"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {eventData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} events`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>

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