import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

// Custom toast component
const CustomToast = ({ closeToast, toastProps, type = 'error', message }) => {
  const toastType = type === 'success' ? 'success' : 'error';
  const bgColor = toastType === 'error' ? 'bg-red-100' : 'bg-green-100';
  const textColor = toastType === 'error' ? 'text-red-800' : 'text-green-800';
  const iconBgColor = toastType === 'error' ? 'bg-red-200' : 'bg-green-200';
  const iconColor = toastType === 'error' ? 'text-red-600' : 'text-green-600';
  
  // Safely get message text
  const getMessage = () => {
    if (!message) return null;
    if (typeof message === 'string') return message;
    if (message.message) return message.message;
    try {
      return String(message);
    } catch (e) {
      return null;
    }
  };
  
  const messageContent = getMessage();
  if (!messageContent) return null;

  return (
    <div 
      className={`flex items-center justify-between w-full p-4 ${bgColor} ${textColor} rounded-lg shadow-lg`}
      role="alert"
    >
      <div className="flex items-center">
        <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${iconBgColor} ${iconColor} rounded-lg`}>
          {toastType === 'error' ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="ml-3 text-sm font-medium">
          {messageContent}
        </div>
      </div>
      <button
        type="button"
        className={`ml-4 -mx-1.5 -my-1.5 ${bgColor} ${textColor} rounded-lg focus:ring-2 focus:ring-${toastType === 'error' ? 'red' : 'green'}-400 p-1.5 hover:${toastType === 'error' ? 'bg-red' : 'bg-green'}-200 inline-flex h-8 w-8`}
        onClick={closeToast}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

// Show a custom toast
const showToast = (type, message, options = {}) => {
  const toastType = type === 'success' ? 'success' : 'error';
  const defaultOptions = {
    position: 'top-center',
    autoClose: toastType === 'error' ? 5000 : 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    closeButton: false,
    ...options
  };

  return toast(
    ({ closeToast }) => (
      <CustomToast 
        closeToast={closeToast} 
        type={toastType} 
        message={message} 
      />
    ),
    {
      ...defaultOptions,
      className: 'custom-toast',
      bodyClassName: 'custom-toast-body'
    }
  );
};

// Export helper functions
export const showError = (message, options) => showToast('error', message, options);
export const showSuccess = (message, options) => showToast('success', message, options);

export default CustomToast;
