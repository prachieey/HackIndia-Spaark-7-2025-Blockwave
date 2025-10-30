import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import api from '../../services/api';

const EmailVerification = () => {
  const { token } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await api.get(`/api/auth/verify-email/${token}`);
        setStatus('success');
        setMessage('Email verified successfully! Redirecting to dashboard...');
        
        // Update user's verification status
        if (user) {
          user.isEmailVerified = true;
        }
        
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
        
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to verify email. The link may have expired or is invalid.');
      }
    };

    verifyEmail();
  }, [token, navigate, user]);

  const resendVerification = async () => {
    try {
      setStatus('sending');
      await api.post('/api/auth/resend-verification', { email: user?.email });
      setStatus('sent');
      setMessage('Verification email sent. Please check your inbox.');
    } catch (error) {
      setStatus('error');
      setMessage('Failed to resend verification email. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {status === 'verifying' && 'Verifying Your Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h2>
        </div>

        <div className={`p-4 rounded-md ${
          status === 'success' 
            ? 'bg-green-50 border-l-4 border-green-400' 
            : status === 'error' 
              ? 'bg-red-50 border-l-4 border-red-400' 
              : 'bg-blue-50 border-l-4 border-blue-400'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {status === 'success' ? (
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : status === 'error' ? (
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm ${
                status === 'success' ? 'text-green-700' : 
                status === 'error' ? 'text-red-700' : 'text-blue-700'
              }`}>
                {message}
              </p>
              {status === 'error' && user?.email && (
                <button
                  onClick={resendVerification}
                  disabled={status === 'sending' || status === 'sent'}
                  className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'sending' 
                    ? 'Sending...' 
                    : status === 'sent' 
                      ? 'Email Sent!' 
                      : 'Resend Verification Email'}
                </button>
              )}
            </div>
          </div>
        </div>

        {status === 'error' && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Need help?{' '}
              <a href="mailto:support@example.com" className="font-medium text-blue-600 hover:text-blue-500">
                Contact support
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
