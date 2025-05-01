import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Key, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: 'success', text: 'Profile updated successfully!' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <h1 className="text-3xl font-bold text-holographic-white">Profile Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-holographic-white mb-1">
              Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tech-blue w-5 h-5" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input w-full pl-10"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-holographic-white mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tech-blue w-5 h-5" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input w-full pl-10"
              />
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-6">
          <h2 className="text-xl font-bold text-holographic-white">Change Password</h2>

          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-holographic-white mb-1">
              Current Password
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tech-blue w-5 h-5" />
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="input w-full pl-10"
              />
            </div>
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-holographic-white mb-1">
              New Password
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tech-blue w-5 h-5" />
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="input w-full pl-10"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-holographic-white mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tech-blue w-5 h-5" />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input w-full pl-10"
              />
            </div>
          </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-validation-green bg-opacity-20 border border-validation-green' 
              : 'bg-flame-red bg-opacity-20 border border-flame-red'
          }`}>
            <p className="text-holographic-white">{message.text}</p>
          </div>
        )}

        <button type="submit" className="btn btn-primary w-full flex items-center justify-center">
          <Save className="w-5 h-5 mr-2" />
          Save Changes
        </button>
      </form>
    </motion.div>
  );
};

export default ProfilePage;