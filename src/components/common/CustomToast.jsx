import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const CustomToast = ({ type = 'error', message, toastId }) => {
  const bgColor = type === 'error' ? 'bg-red-100' : 'bg-green-100';
  const textColor = type === 'error' ? 'text-red-800' : 'text-green-800';
  const iconBgColor = type === 'error' ? 'bg-red-200' : 'bg-green-200';
  const iconColor = type === 'error' ? 'text-red-600' : 'text-green-600';
  
  return (
    <div className={`flex items-center justify-between w-full max-w-md p-4 ${bgColor} ${textColor} rounded-lg shadow-lg`}>
      <div className="flex items-center">
        <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${iconBgColor} ${iconColor} rounded-lg`}>
          {type === 'error' ? (
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
          {typeof message === 'string' ? message : message.toString()}
        </div>
      </div>
      <button
        type="button"
        className={`ml-4 -mx-1.5 -my-1.5 ${bgColor} ${textColor} rounded-lg focus:ring-2 focus:ring-${type === 'error' ? 'red' : 'green'}-400 p-1.5 hover:${type === 'error' ? 'bg-red' : 'bg-green'}-200 inline-flex h-8 w-8`}
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
  return toast.custom((t) => (
    <CustomToast type={type} message={message} toastId={t.id} />
  ), {
    duration: type === 'error' ? 5000 : 3000,
  });
};

export const showError = (message) => showToast('error', message);
export const showSuccess = (message) => showToast('success', message);

export default CustomToast;
