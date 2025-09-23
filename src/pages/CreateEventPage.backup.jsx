import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  Check, 
  Clock, 
  DollarSign, 
  Image as ImageIcon, 
  MapPin, 
  Plus, 
  Tag, 
  Ticket, 
  Upload, 
  Users, 
  X,
  Loader2,
  ImagePlus,
  CalendarDays,
  Globe,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/blockchain/Web3Context';
import { toast } from 'react-hot-toast';
import { events } from '../utils/api';
import { useDropzone } from 'react-dropzone';
import { format, addDays, parseISO } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

            <span className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              {step.name}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-1 mx-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div 
                className="h-full bg-primary-500 rounded-full transition-all duration-500"
                style={{ width: currentStep > step.id ? '100%' : '0%' }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const FormCard = ({ children, title, step, totalSteps, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden ${className}`}
  >
    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        {step && totalSteps && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Step {step} of {totalSteps}
          </span>
        )}
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </motion.div>
);

const Input = ({ 
  label, 
  icon: Icon, 
  error, 
  required = false, 
  className = '', 
  containerClassName = '',
  ...props 
}) => (
  <div className={`mb-6 ${containerClassName}`}>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <input
        className={`w-full px-4 py-2.5 rounded-lg border-2 ${
          error 
            ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-200 dark:border-gray-700 focus:ring-primary-500 focus:border-primary-500'
        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition duration-200 ${Icon ? 'pl-10' : 'pl-4'} ${className}`}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

const TextArea = ({ 
  label, 
  error, 
  required = false, 
  className = '', 
  rows = 4, 
  ...props 
}) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      className={`w-full px-4 py-2.5 rounded-lg border-2 ${
        error 
          ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
          : 'border-gray-200 dark:border-gray-700 focus:ring-primary-500 focus:border-primary-500'
      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition duration-200 ${className}`}
      rows={rows}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

const Button = ({ 
  children, 
  loading = false, 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    outline: 'bg-transparent text-primary-500 border border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:ring-primary-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
};

const ImageUpload = ({ onImageUpload, error, className = '' }) => {
  const [preview, setPreview] = useState(null);
  
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
        onImageUpload(file);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  return (
    <div className={`mb-6 ${className}`}>
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          error 
            ? 'border-red-400 bg-red-50 dark:bg-red-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 bg-gray-50 dark:bg-gray-700/50'
        }`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="mx-auto max-h-64 rounded-lg object-cover"
            />
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Click or drag to replace image
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
              <Upload className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {isDragActive ? 'Drop the image here' : 'Upload an image'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, or WEBP up to 5MB
              </p>
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

            <span className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              {step.name}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-1 mx-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div 
                className="h-full bg-primary-500 rounded-full transition-all duration-500"
                style={{ width: currentStep > step.id ? '100%' : '0%' }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const FormCard = ({ children, title, step, totalSteps, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden ${className}`}
  >
    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        {step && totalSteps && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Step {step} of {totalSteps}
          </span>
        )}
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </motion.div>
);

const Input = ({ 
  label, 
  icon: Icon, 
  error, 
  required = false, 
  className = '', 
  containerClassName = '',
  ...props 
}) => (
  <div className={`mb-6 ${containerClassName}`}>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <input
        className={`w-full px-4 py-2.5 rounded-lg border-2 ${
          error 
            ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-200 dark:border-gray-700 focus:ring-primary-500 focus:border-primary-500'
        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition duration-200 ${Icon ? 'pl-10' : 'pl-4'} ${className}`}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

const TextArea = ({ 
  label, 
  error, 
  required = false, 
  className = '', 
  rows = 4, 
  ...props 
}) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      className={`w-full px-4 py-2.5 rounded-lg border-2 ${
        error 
          ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
          : 'border-gray-200 dark:border-gray-700 focus:ring-primary-500 focus:border-primary-500'
      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition duration-200 ${className}`}
      rows={rows}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

const Button = ({ 
  children, 
  loading = false, 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    outline: 'bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 focus:ring-primary-500',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const FormCard = ({ children, title, step, totalSteps, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden ${className}`}
  >
    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        {step && totalSteps && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Step {step} of {totalSteps}
          </span>
        )}
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </motion.div>
);

const Input = ({ 
  label, 
  icon: Icon, 
  error, 
  required = false, 
  className = '', 
  containerClassName = '',
  ...props 
}) => (
  <div className={`mb-6 ${containerClassName}`}>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <input
        className={`w-full px-4 py-2.5 rounded-lg border-2 ${
          error 
            ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-200 dark:border-gray-700 focus:ring-primary-500 focus:border-primary-500'
        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition duration-200 ${Icon ? 'pl-10' : 'pl-4'} ${className}`}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

const TextArea = ({ 
  label, 
  error, 
  required = false, 
  className = '', 
  rows = 4, 
  ...props 
}) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      className={`w-full px-4 py-2.5 rounded-lg border-2 ${
        error 
          ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
          : 'border-gray-200 dark:border-gray-700 focus:ring-primary-500 focus:border-primary-500'
      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition duration-200 ${className}`}
      rows={rows}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

const Button = ({ 
  children, 
  loading = false, 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    outline: 'bg-transparent text-primary-500 border border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:ring-primary-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
};

const ImageUpload = ({ onImageUpload, error, className = '' }) => {
  const [preview, setPreview] = useState(null);
  
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
        onImageUpload(file);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
  });

  return (
    <div className={`mb-6 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Event Image <span className="text-red-500">*</span>
      </label>
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ${
          error 
            ? 'border-red-400 bg-red-50 dark:bg-red-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 bg-gray-50 dark:bg-gray-700/50'
        } ${isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''}`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="mx-auto max-h-48 rounded-lg object-cover"
            />
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
                onImageUpload(null);
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
              <Upload className="h-6 w-6 text-primary-500" />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p className="font-medium">
                {isDragActive ? 'Drop the image here' : 'Drag and drop an image here, or click to select'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                PNG, JPG, or WebP (max. 5MB)
              </p>
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

// Import custom fonts
import '@fontsource/playfair-display/700.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';

// Custom DatePicker Input Component
const CustomDateInput = ({ value, onClick, icon: Icon, label, error }) => (
  <div className="w-full">
    <div 
      onClick={onClick}
      className={`flex items-center px-4 py-3 text-gray-800 dark:text-gray-200 bg-white/50 dark:bg-gray-800/50 border-2 rounded-lg cursor-pointer ${
        error 
          ? 'border-red-400 focus:border-red-500' 
          : 'border-gray-200 dark:border-gray-700 focus:border-primary-500'
      } focus:outline-none transition-colors duration-200`}
    >
      {Icon && <Icon className="h-5 w-5 mr-3 text-gray-400" />}
      <span className={!value ? 'text-gray-400' : ''}>
        {value || `Select ${label}`}
      </span>
    </div>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

// Styled Components
const Card = ({ children, className = '', title, icon: Icon, step, totalSteps }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/50 transition-all duration-300 hover:shadow-xl ${className}`}
  >
    <div className="p-6 md:p-8">
      {title && (
        <div className="mb-6 pb-4 border-b border-gray-100 dark:border-gray-700/50">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              {Icon && <Icon className="h-6 w-6 mr-3 text-primary-500" />}
              {title}
            </h3>
            {step && totalSteps && (
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Step {step} of {totalSteps}
              </span>
            )}
          </div>
        </div>
      )}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  </motion.div>
);

const Input = ({ 
  label, 
  icon: Icon, 
  error, 
  className = '', 
  containerClassName = '',
  required = false,
  ...props 
}) => {
  const inputClass = `w-full px-4 py-3 text-gray-800 dark:text-gray-200 bg-white/70 dark:bg-gray-800/70 border-2 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-1 transition-all duration-200 ${
    error 
      ? 'border-red-400 focus:border-red-500' 
      : 'border-gray-200 dark:border-gray-700 focus:border-primary-500'
  } rounded-xl font-sans transition-all duration-200 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900/30 focus:ring-opacity-50 ${
    Icon ? 'pl-12' : 'pl-4'
  } ${className}`;

  return (
    <div className={`mb-6 ${containerClassName}`}>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 font-sans">
          {label}
        </label>
        {required && <span className="text-xs text-red-500">Required</span>}
      </div>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          className={inputClass}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
};
          {...props}
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-500 font-sans">{error}</p>}
    </div>
  );
};

const TextArea = ({ label, error, className = '', ...props }) => {
  const textareaClass = `w-full px-4 py-3 text-gray-800 dark:text-gray-200 bg-white/50 dark:bg-gray-800/50 border-2 ${
    error 
      ? 'border-red-400 focus:border-red-500' 
      : 'border-gray-200 dark:border-gray-700 focus:border-primary-500'
  } rounded-xl font-sans transition-all duration-200 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900/30 focus:ring-opacity-50 ${className}`;

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 font-sans">
        {label}
      </label>
      <textarea
        className={textareaClass}
        rows="4"
        {...props}
      />
      {error && <p className="mt-2 text-sm text-red-500 font-sans">{error}</p>}
    </div>
  );
};

const Button = ({ 
  children, 
  loading, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-sans font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed';
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 focus:ring-offset-2 focus:ring-primary-500',
    secondary: 'bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600/80 shadow-sm',
    outline: 'border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/20',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg',
  };

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
          <span className="font-medium">Processing...</span>
        </>
      ) : (
        <span className="flex items-center">
          {props.icon && <span className="mr-2">{props.icon}</span>}
          {children}
        </span>
      )}
    </button>
  );
};

const CreateEventPage = () => {
  // Add smooth scroll behavior
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const { isConnected } = useWeb3();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    price: '',
    capacity: '',
    image: '',
    // Added organizer field to track who created the event
    organizer: ''
  });
  const [errors, setErrors] = useState({});
  
  // Check authentication status and redirect if needed
  useEffect(() => {
    // Check for token in localStorage as a fallback
    const token = localStorage.getItem('token') || localStorage.getItem('scantyx_token');
    const storedUser = localStorage.getItem('scantyx_user');
    
    // If we have a token or user in localStorage but isAuthenticated is false, update the auth state
    if ((token || storedUser) && !isAuthenticated) {
      console.log('User has token but isAuthenticated is false. Updating auth state...');
      // This will be handled by the AuthProvider's useEffect
      return;
    }
    
    // If no token or user and not authenticated, redirect to login
    if (!token && !storedUser && !isAuthenticated) {
      console.log('No authentication found, redirecting to login...');
      navigate('/login', { 
        state: { 
          from: '/create-event',
          message: 'Please sign in to create an event'
        } 
      });
    }
  }, [isAuthenticated, navigate]);

  // Sample event categories
  const categories = [
    'Music',
    'Technology',
    'Business',
    'Food & Drink',
    'Health & Wellness',
    'Sports & Fitness',
    'Education',
    'Arts & Culture',
    'Fashion',
    'Other'
  ];

  // Sample event images
  const sampleImages = [
    'https://images.unsplash.com/photo-1505373876331-ff89baa5d2c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1511578314323-379afb476865?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1533174075247-9a2c4e81a0e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  ];

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Event title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.capacity) newErrors.capacity = 'Capacity is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle image selection
  const handleImageSelect = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      image: imageUrl
    }));
    // Clear image error
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };
  
  const nextStep = () => setStep(s => Math.min(3, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // No need to check for authentication here as ProtectedRoute handles it
    
    setLoading(true);
    
    try {
      // Validate form
      if (!validateForm()) {
        setLoading(false);
        return;
      }
      
      // Double check authentication
      if (!user || !user.id) {
        throw new Error('You must be logged in to create an event');
      }
      
      // Prepare event data for the API
      const eventData = {
        ...formData,
        title: formData.title,
        description: formData.description,
        summary: formData.description.substring(0, 200), // Create a summary from description
        category: formData.category,
        bannerImage: formData.image || 'https://via.placeholder.com/1200x400',
        startDate: new Date(`${formData.date}T${formData.time}`),
        endDate: new Date(new Date(`${formData.date}T${formData.time}`).getTime() + (2 * 60 * 60 * 1000)), // Default 2 hour event
        location: formData.location,
        price: parseFloat(formData.price),
        capacity: parseInt(formData.capacity, 10),
        organizer: user.id, // Use the logged-in user's ID
        status: 'draft', // Default status
        isVirtual: false, // Default to in-person events
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Get user's timezone
      };
      
      // Call the API to create the event
      const response = await eventsAPI.createEvent(eventData);
      
      if (response && (response._id || response.id)) {
        toast.success('Event created successfully!');
        setSuccess(true);
        
        // Navigate to explore page after a short delay
        setTimeout(() => {
          navigate('/explore');
        }, 1500);
      } else {
        throw new Error('Failed to create event: ' + (response?.message || 'Unknown error'));
      }
      
    } catch (error) {
      console.error('Error creating event:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create event';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Render success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-space-black">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-holographic-white">Event Created!</h2>
          <p className="mt-2 text-neon-blue">Your event has been successfully created.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/explore')}
              className="px-4 py-2 bg-neon-blue text-space-black rounded-md hover:bg-neon-pink transition-colors"
            >
              View All Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render form steps
  const renderStep = () => {
    const stepContent = {
      1: (
        <Card title="Event Details" icon={Calendar} className="mb-8">
          <Input
            label="Event Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter event title"
            icon={Tag}
            error={errors.title}
          />
          
          <TextArea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Tell us about your event..."
            error={errors.description}
            className="min-h-[120px]"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Date & Time"
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              icon={Clock}
              error={errors.date}
            />
            
            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Where is your event?"
              icon={MapPin}
              error={errors.location}
            />
          </div>
          
          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700/50 mt-8">
            <Button 
              onClick={nextStep} 
              variant="primary"
              size="lg"
              fullWidth
            >
              Continue to Pricing & Capacity
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </Card>
      ),
      
      2: (
        <Card title="Pricing & Capacity" icon={Tag} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Price ($)"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              icon={DollarSign}
              error={errors.price}
              min="0"
              step="0.01"
            />
            
            <Input
              label="Capacity"
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="Max attendees"
              icon={Users}
              error={errors.capacity}
              min="1"
            />
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <div className="relative">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-200 focus:border-primary-500 focus:outline-none transition-all duration-200"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            {errors.category && (
              <p className="mt-2 text-sm text-red-500 font-sans">
                {errors.category}
              </p>
            )}
          </div>
          
          <div className="flex justify-between pt-6 border-t border-gray-100 dark:border-gray-700/50 mt-8">
            <Button 
              onClick={prevStep} 
              variant="secondary"
              size="lg"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            
            <Button 
              onClick={nextStep} 
              variant="primary"
              size="lg"
            >
              Continue to Media
              <ImageIcon className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </Card>
      ),
      
      3: (
        <Card title="Add Media" icon={ImageIcon} className="mb-8">
          <div className="space-y-8">
            <div className="text-center">
              <div className="mt-2 flex justify-center text-sm text-gray-600 dark:text-gray-400">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 w-full max-w-md hover:border-primary-300 dark:hover:border-primary-600 transition-colors duration-200"
                >
                  <div className="flex flex-col items-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <div className="flex text-sm">
                      <span className="relative font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
                        Upload a file
                      </span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or enter an image URL
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all duration-200"
                />
                <Button 
                  onClick={() => {
                    if (formData.image) {
                      try {
                        new URL(formData.image);
                        handleImageSelect(formData.image);
                      } catch (e) {
                        setErrors(prev => ({
                          ...prev,
                          image: 'Please enter a valid URL'
                        }));
                      }
                    }
                  }}
                  variant="outline"
                  size="lg"
                >
                  Use URL
                </Button>
              </div>
              {errors.image && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.image}
                </p>
              )}
            </div>
            
            {formData.image && (
              <div className="mt-6 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Preview:</p>
                <img 
                  src={formData.image} 
                  alt="Event preview" 
                  className="rounded-lg w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    setErrors(prev => ({
                      ...prev,
                      image: 'Failed to load image from URL'
                    }));
                  }}
                />
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-100 dark:border-gray-700/50 mt-8">
              <Button 
                onClick={prevStep} 
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Pricing
              </Button>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      image: ''
                    }));
                    setErrors(prev => ({
                      ...prev,
                      image: ''
                    }));
                  }}
                >
                  Skip for now
                </Button>
                
                <Button 
                  loading={loading}
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={handleSubmit}
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  Publish Event
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )
    };
    
    return (
      <motion.div
        key={`step-${step}`}
        initial={{ opacity: 0, x: step > 2 ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: step > 2 ? -20 : 20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {step === 1 && stepContent[1]}
        {step === 2 && stepContent[2]}
        {step === 3 && stepContent[3]}
      </motion.div>
    );
  };

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/20 mb-6">
            <Rocket className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4">
            Create Your Event
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Fill in the details below to create a stunning event page that captures attention and drives engagement.
          </p>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <div className="flex flex-col items-center">
                  <div 
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      step >= stepNum 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    } font-medium`}
                  >
                    {stepNum}
                  </div>
                  <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">
                    {stepNum === 1 ? 'Details' : stepNum === 2 ? 'Pricing' : 'Media'}
                  </span>
                </div>
                {stepNum < 3 && (
                  <div className="flex-1 h-1 mx-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div 
                      className="h-full bg-primary-600 rounded-full transition-all duration-500"
                      style={{ width: step > stepNum ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Form Content */}
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/20 mb-6">
            <Rocket className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4">
            Create Your Event
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Fill in the details below to create a stunning event page that captures attention and drives engagement.
          </p>
        </div>
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-neon-blue hover:text-neon-pink transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-holographic-white mb-2">Create New Event</h1>
            <p className="text-gray-400">Create and manage your event on the blockchain</p>
          </div>
          
          <Card className="mb-8">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                {[1, 2, 3].map((stepNum) => (
                  <div key={stepNum} className="flex flex-col items-center">
                    <div 
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        step === stepNum 
                          ? 'bg-neon-blue text-space-black' 
                          : step > stepNum 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      } font-medium`}
                    >
                      {step > stepNum ? <Check className="h-5 w-5" /> : stepNum}
                    </div>
                    <span className="text-xs mt-2 text-gray-400">
                      {stepNum === 1 ? 'Details' : stepNum === 2 ? 'Pricing' : 'Images'}
                    </span>
                  </div>
                ))}
                <div className="flex-1 h-1 mx-2 bg-gray-200 dark:bg-gray-700">
                  <div 
                    className="h-full bg-neon-blue transition-all duration-300"
                    style={{ width: `${((step - 1) / 2) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* Form Content */}
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </Card>
          
          {/* Connect Wallet Banner */}
          {!isConnected && step > 1 && (
            <div className="bg-yellow-900/30 border border-yellow-800 text-yellow-400 p-4 rounded-lg mb-6 flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">Connect your wallet</h3>
                <p className="text-sm mt-1">You need to connect your wallet to create an event on the blockchain.</p>
                <div className="mt-2">
                  <button
                    onClick={connectWallet}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-yellow-800 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Connect Wallet
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Form Validation Errors */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 p-4 rounded-lg mb-6">
              <h3 className="font-medium">Please fix the following errors:</h3>
              <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
                {Object.values(errors).map((error, index) => (
                  error && <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;
