import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Settings, LogOut, User, Bell, Lock, CreditCard, Shield } from 'lucide-react';

const SettingsPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center mb-8">
        <Settings className="h-8 w-8 text-tech-blue mr-3" />
        <h1 className="text-3xl font-bold text-holographic-white">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === 'profile' ? 'bg-deep-purple/20 text-tech-blue' : 'text-holographic-white/80 hover:bg-deep-purple/10'
              }`}
            >
              <User className="h-5 w-5 mr-3" />
              Profile
            </button>
            
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === 'notifications' ? 'bg-deep-purple/20 text-tech-blue' : 'text-holographic-white/80 hover:bg-deep-purple/10'
              }`}
            >
              <Bell className="h-5 w-5 mr-3" />
              Notifications
            </button>
            
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === 'security' ? 'bg-deep-purple/20 text-tech-blue' : 'text-holographic-white/80 hover:bg-deep-purple/10'
              }`}
            >
              <Lock className="h-5 w-5 mr-3" />
              Security
            </button>
            
            <button
              onClick={() => setActiveTab('billing')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === 'billing' ? 'bg-deep-purple/20 text-tech-blue' : 'text-holographic-white/80 hover:bg-deep-purple/10'
              }`}
            >
              <CreditCard className="h-5 w-5 mr-3" />
              Billing
            </button>
            
            <button
              onClick={() => setActiveTab('privacy')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === 'privacy' ? 'bg-deep-purple/20 text-tech-blue' : 'text-holographic-white/80 hover:bg-deep-purple/10'
              }`}
            >
              <Shield className="h-5 w-5 mr-3" />
              Privacy
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 rounded-lg text-left text-red-400 hover:bg-red-900/20 transition-colors mt-4"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3 bg-space-black/50 rounded-xl p-6">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-holographic-white">Profile Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full bg-space-black border border-gray-700 rounded-lg px-4 py-2 text-holographic-white focus:outline-none focus:ring-2 focus:ring-tech-blue"
                    defaultValue="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full bg-space-black border border-gray-700 rounded-lg px-4 py-2 text-holographic-white focus:outline-none focus:ring-2 focus:ring-tech-blue"
                    defaultValue="john@example.com"
                  />
                </div>
                <div className="pt-4">
                  <button className="px-4 py-2 bg-tech-blue text-white rounded-lg hover:bg-tech-blue/90 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-holographic-white">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-space-black/50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-holographic-white">Email Notifications</h3>
                    <p className="text-sm text-gray-400">Receive updates and notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications.email}
                      onChange={() => handleNotificationChange('email')}
                    />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tech-blue"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-space-black/50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-holographic-white">SMS Notifications</h3>
                    <p className="text-sm text-gray-400">Receive important updates via SMS</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications.sms}
                      onChange={() => handleNotificationChange('sms')}
                    />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tech-blue"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-space-black/50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-holographic-white">Push Notifications</h3>
                    <p className="text-sm text-gray-400">Get instant updates on your device</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications.push}
                      onChange={() => handleNotificationChange('push')}
                    />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tech-blue"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-holographic-white">Security Settings</h2>
              <div className="space-y-6">
                <div className="p-4 bg-space-black/50 rounded-lg">
                  <h3 className="font-medium text-holographic-white mb-2">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Current Password</label>
                      <input
                        type="password"
                        className="w-full bg-space-black border border-gray-700 rounded-lg px-4 py-2 text-holographic-white focus:outline-none focus:ring-2 focus:ring-tech-blue"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">New Password</label>
                      <input
                        type="password"
                        className="w-full bg-space-black border border-gray-700 rounded-lg px-4 py-2 text-holographic-white focus:outline-none focus:ring-2 focus:ring-tech-blue"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full bg-space-black border border-gray-700 rounded-lg px-4 py-2 text-holographic-white focus:outline-none focus:ring-2 focus:ring-tech-blue"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <button className="px-4 py-2 bg-tech-blue text-white rounded-lg hover:bg-tech-blue/90 transition-colors">
                      Update Password
                    </button>
                  </div>
                </div>
                
                <div className="p-4 bg-space-black/50 rounded-lg">
                  <h3 className="font-medium text-holographic-white mb-2">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-400 mb-4">Add an extra layer of security to your account</p>
                  <button className="px-4 py-2 border border-tech-blue text-tech-blue rounded-lg hover:bg-tech-blue/10 transition-colors">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-holographic-white">Billing & Payments</h2>
              <div className="bg-space-black/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-medium text-holographic-white">Current Plan</h3>
                    <p className="text-sm text-gray-400">Free Plan</p>
                  </div>
                  <button className="px-4 py-2 bg-tech-blue text-white rounded-lg hover:bg-tech-blue/90 transition-colors">
                    Upgrade Plan
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-space-black/30 rounded-lg">
                    <div>
                      <h4 className="font-medium text-holographic-white">Payment Methods</h4>
                      <p className="text-sm text-gray-400">Manage your payment methods</p>
                    </div>
                    <button className="text-tech-blue hover:underline">Manage</button>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-space-black/30 rounded-lg">
                    <div>
                      <h4 className="font-medium text-holographic-white">Billing History</h4>
                      <p className="text-sm text-gray-400">View your payment history</p>
                    </div>
                    <button className="text-tech-blue hover:underline">View History</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-holographic-white">Privacy Settings</h2>
              <div className="space-y-6">
                <div className="p-4 bg-space-black/50 rounded-lg">
                  <h3 className="font-medium text-holographic-white mb-2">Data Privacy</h3>
                  <p className="text-sm text-gray-400 mb-4">Control how we use your data</p>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="analytics"
                        className="h-4 w-4 text-tech-blue rounded border-gray-600 focus:ring-tech-blue"
                        defaultChecked
                      />
                      <label htmlFor="analytics" className="ml-2 text-sm text-gray-300">
                        Allow analytics collection
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="personalization"
                        className="h-4 w-4 text-tech-blue rounded border-gray-600 focus:ring-tech-blue"
                        defaultChecked
                      />
                      <label htmlFor="personalization" className="ml-2 text-sm text-gray-300">
                        Personalize my experience
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-space-black/50 rounded-lg">
                  <h3 className="font-medium text-holographic-white mb-2">Data Export & Deletion</h3>
                  <p className="text-sm text-gray-400 mb-4">Manage your data</p>
                  <div className="flex space-x-4">
                    <button className="px-4 py-2 border border-tech-blue text-tech-blue rounded-lg hover:bg-tech-blue/10 transition-colors">
                      Export My Data
                    </button>
                    <button className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors">
                      Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
