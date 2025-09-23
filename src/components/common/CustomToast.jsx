import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const CustomToast = ({ type = 'error', message, toastId }) => {
  // Ensure type is either 'error' or 'success'
  const toastType = type === 'success' ? 'success' : 'error';
  const bgColor = toastType === 'error' ? 'bg-red-100' : 'bg-green-100';
  const textColor = toastType === 'error' ? 'text-red-800' : 'text-green-800';
  const iconBgColor = toastType === 'error' ? 'bg-red-200' : 'bg-green-200';
  const iconColor = toastType === 'error' ? 'text-red-600' : 'text-green-600';
  
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (toastId) {
        toast.dismiss(toastId);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [toastId]);
  
  // Safely get message text
  const getMessage = () => {
    if (!message) return null; // Don't show 'An unknown error occurred'
    if (typeof message === 'string') return message;
    if (typeof message === 'object' && message.message) return message.message;
    try {
      return String(message);
    } catch (e) {
      return null; // Don't show 'An error occurred'
    }
  };
  
  // Don't render anything if there's no message
  if (!getMessage()) return null;

  return (
    <div 
      className={`fixed bottom-4 right-4 flex items-center justify-between w-full max-w-md p-4 ${bgColor} ${textColor} rounded-lg shadow-lg z-50`}
      role="alert"
      style={{
        animation: 'slideIn 0.3s ease-out forwards',
        maxWidth: 'calc(100% - 2rem)'
      }}
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
          {getMessage()}
        </div>
      </div>
      <button
        type="button"
        className={`ml-4 -mx-1.5 -my-1.5 ${bgColor} ${textColor} rounded-lg focus:ring-2 focus:ring-${toastType === 'error' ? 'red' : 'green'}-400 p-1.5 hover:${toastType === 'error' ? 'bg-red' : 'bg-green'}-200 inline-flex h-8 w-8`}
        onClick={() => toast.dismiss(toastId)}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export const showToast = (type, message) => {
  // Validate input
  const toastType = type === 'success' ? 'success' : 'error';
  
  return toast.custom(
    (t) => <CustomToast type={toastType} message={message} toastId={t.id} />,
    {
      duration: toastType === 'error' ? 5000 : 3000,
      position: 'top-center',
    }
  );
};

export const showError = (message) => showToast('error', message);
export const showSuccess = (message) => showToast('success', message);

export default CustomToast;
