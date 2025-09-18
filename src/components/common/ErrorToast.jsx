import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const ErrorToast = ({ message, toastId }) => (
  <div className="flex items-center justify-between w-full max-w-md p-4 text-red-700 bg-red-100 rounded-lg shadow-lg">
    <div className="flex items-center">
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-200 rounded-lg">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3 text-sm font-medium">
        {message}
      </div>
    </div>
    <button
      type="button"
      className="ml-4 -mx-1.5 -my-1.5 bg-red-100 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex h-8 w-8"
      onClick={() => toast.dismiss(toastId)}
      aria-label="Close"
    >
      <span className="sr-only">Close</span>
      <XMarkIcon className="w-5 h-5" />
    </button>
  </div>
);

export default ErrorToast;
