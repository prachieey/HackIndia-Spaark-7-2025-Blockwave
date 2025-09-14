import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AuthModal = ({ isOpen, onClose, authType, setAuthType }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { login, signup } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (authType === 'signin') {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          setSuccess('Signed in successfully!');
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setError(result.error || 'Failed to sign in');
        }
      } else {
        const result = await signup(formData.name, formData.email, formData.password);
        if (result.success) {
          setSuccess('Account created successfully!');
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setError(result.error || 'Failed to create account');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthType = () => {
    setAuthType(authType === 'signin' ? 'signup' : 'signin');
    setError('');
    setSuccess('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-black bg-opacity-80">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-md bg-space-black border border-deep-purple rounded-xl p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-holographic-white hover:text-tech-blue transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-holographic-white">
                {authType === 'signin' ? 'Sign In' : 'Create Account'}
              </h2>
              <p className="tagline mt-2">No Scams, Just Scans</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-flame-red bg-opacity-20 border border-flame-red rounded-lg text-holographic-white">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-validation-green bg-opacity-20 border border-validation-green rounded-lg text-holographic-white">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {authType === 'signup' && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-holographic-white mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required={authType === 'signup'}
                    className="input w-full"
                    placeholder=""
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-holographic-white mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input w-full"
                  placeholder=""
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-holographic-white mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input w-full"
                  placeholder=""
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`btn btn-primary w-full ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading
                  ? 'Processing...'
                  : authType === 'signin'
                  ? 'Sign In'
                  : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-holographic-white/70">
                {authType === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                <button
                  onClick={toggleAuthType}
                  className="ml-2 text-tech-blue hover:underline focus:outline-none"
                >
                  {authType === 'signin' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;