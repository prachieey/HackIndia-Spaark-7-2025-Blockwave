import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
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
  Rocket,
  ChevronDown,
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useEvents } from '../contexts/EventsContext';
import { events } from '../utils/api';
import { format, addDays, parseISO } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Custom components
const StepIndicator = ({ currentStep, totalSteps, steps }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step.id 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
              }`}
            >
              {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
            </div>
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
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-500',
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

const CreateEventPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { refreshEvents } = useEvents();
  const navigate = useNavigate();
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
    organizer: ''
  });
  const [errors, setErrors] = useState({});
  
  // Add smooth scroll behavior
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // Check authentication status and redirect if needed
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('scantyx_token');
    const storedUser = localStorage.getItem('scantyx_user');
    
    if ((token || storedUser) && !isAuthenticated) {
      console.log('User has token but isAuthenticated is false. Updating auth state...');
      return;
    }
    
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

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Check each required field
    if (!formData.title || !formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }
    
    if (!formData.description || !formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 50) {
      newErrors.description = 'Description should be at least 50 characters long';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Event date cannot be in the past';
      }
    }
    
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }
    
    if (!formData.location || !formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (formData.price === undefined || formData.price === '' || isNaN(parseFloat(formData.price))) {
      newErrors.price = 'Valid price is required';
    } else if (parseFloat(formData.price) < 0) {
      newErrors.price = 'Price cannot be negative';
    }
    
    if (!formData.capacity || isNaN(parseInt(formData.capacity, 10)) || parseInt(formData.capacity, 10) <= 0) {
      newErrors.capacity = 'Valid capacity is required (minimum 1)';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      // Scroll to the first error
      const firstError = Object.keys(newErrors)[0];
      const element = document.querySelector(`[name="${firstError}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // Show toast with error count
      const errorCount = Object.keys(newErrors).length;
      toast.error(`Please fix ${errorCount} ${errorCount === 1 ? 'error' : 'errors'} in the form`);
      
      return false;
    }
    
    return true;
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow numbers for price and capacity
    if (name === 'price' || name === 'capacity') {
      // Remove any non-numeric characters except decimal point for price
      const numericValue = name === 'price' 
        ? value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
        : value.replace(/\D/g, ''); // Only allow integers for capacity
      
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle image upload
  const handleImageUpload = (file) => {
    if (file) {
      // In a real app, you'd upload to a server here
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        image: imageUrl
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        image: ''
      }));
    }
  };
  
  const nextStep = () => setStep(s => Math.min(3, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check authentication first
    if (!user || !user.id) {
      const errorMsg = 'You must be logged in to create an event';
      console.error(errorMsg);
      toast.error(errorMsg);
      // Optionally redirect to login page
      // navigate('/login', { state: { from: '/create-event' } });
      return;
    }
    
    setLoading(true);
    console.log('Form submission started');
    console.log('Form data:', formData);
    
    try {
      console.log('Validating form...');
      const isValid = validateForm();
      console.log('Validation result:', isValid);
      console.log('Current errors:', errors);
      
      if (!isValid) {
        console.log('Form validation failed');
        setLoading(false);
        return;
      }
      
      // Prepare event data for the API
      const eventData = {
        title: formData.title,
        description: formData.description,
        summary: formData.description.substring(0, 200),
        category: formData.category,
        bannerImage: formData.image || 'https://via.placeholder.com/1200x400',
        startDate: new Date(`${formData.date}T${formData.time}`).toISOString(),
        endDate: new Date(new Date(`${formData.date}T${formData.time}`).getTime() + (2 * 60 * 60 * 1000)).toISOString(),
        location: formData.location,
        price: parseFloat(formData.price) || 0,
        capacity: parseInt(formData.capacity, 10) || 100,
        organizer: user.id,
        status: 'draft',
        isVirtual: false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      
      console.log('Sending event data:', JSON.stringify(eventData, null, 2));
      
      const response = await events.createEvent(eventData);
      console.log('API Response:', response);
      
      if (response && (response._id || response.id)) {
        toast.success('Event created successfully! Redirecting to explore page...');
        setSuccess(true);
        
        // Refresh events list in the context
        if (refreshEvents) {
          await refreshEvents();
        }
        
        setTimeout(() => {
          navigate('/explore');
        }, 1500);
      } else {
        const errorMsg = response?.message || 'No event ID in response';
        console.error('Failed to create event:', errorMsg);
        throw new Error(`Failed to create event: ${errorMsg}`);
      }
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create event';
      console.error('Error details:', errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Render success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">Event Created!</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Your event has been successfully created.</p>
          <div className="mt-6">
            <Button
              onClick={() => navigate('/explore')}
              variant="primary"
            >
              View All Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render form steps
  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <FormCard title="Event Details" step={1} totalSteps={3} className="mb-8">
            <Input
              label="Event Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              icon={Tag}
              error={errors.title}
              required
            />
            
            <TextArea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us about your event..."
              error={errors.description}
              required
              rows={4}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                icon={Calendar}
                error={errors.date}
                required
              />
              
              <Input
                label="Time"
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                icon={Clock}
                error={errors.time}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 pr-10 rounded-lg border-2 ${
                    errors.location 
                      ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-200 dark:border-gray-700 focus:ring-primary-500 focus:border-primary-500'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
                  required
                >
                  <option value="">Select a city</option>
                  {[
                    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad',
                    'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
                    'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
                    'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna',
                    'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik',
                    'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali',
                    'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad',
                    'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad',
                    'Howrah', 'Ranchi', 'Jabalpur', 'Gwalior', 'Coimbatore',
                    'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota',
                    'Chandigarh', 'Guwahati', 'Solapur', 'Hubli-Dharwad',
                    'Mysore', 'Tiruchirappalli', 'Bareilly', 'Aligarh',
                    'Tiruppur', 'Gurgaon', 'Moradabad', 'Jalandhar',
                    'Bhubaneswar', 'Salem', 'Warangal', 'Guntur', 'Bhiwandi',
                    'Saharanpur', 'Gorakhpur', 'Bikaner', 'Amravati',
                    'Noida', 'Jamshedpur', 'Bhilai', 'Cuttack', 'Firozabad',
                    'Kochi', 'Nellore', 'Bhavnagar', 'Dehradun',
                    'Durgapur', 'Asansol', 'Rourkela', 'Nanded',
                    'Kolhapur', 'Ajmer', 'Akola', 'Gulbarga', 'Jamnagar',
                    'Ujjain', 'Loni', 'Siliguri', 'Jhansi', 'Ulhasnagar',
                    'Jammu', 'Sangli-Miraj & Kupwad', 'Belgaum',
                    'Mangalore', 'Ambattur', 'Tirunelveli', 'Malegaon',
                    'Gaya', 'Jalgaon', 'Udaipur', 'Maheshtala'
                  ].map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {errors.location && (
                <p className="mt-1 text-sm text-red-500">{errors.location}</p>
              )}
            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700/50 mt-8">
              <Button 
                onClick={nextStep} 
                variant="primary"
                size="lg"
              >
                Continue to Pricing & Capacity
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </FormCard>
        );
      
      case 2:
        return (
          <FormCard title="Pricing & Capacity" step={2} totalSteps={3} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price (INR) <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={`block w-full pl-7 pr-12 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-gray-100 ${
                      errors.price 
                        ? 'border-red-400' 
                        : 'border-gray-200 dark:border-gray-700 dark:bg-gray-700'
                    }`}
                    placeholder="0"
                    min="0"
                    step="1"
                    required
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                )}
              </div>
              
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
                required
              />
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 pr-10 rounded-lg border-2 ${
                    errors.category 
                      ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-200 dark:border-gray-700 focus:ring-primary-500 focus:border-primary-500'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
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
                <p className="mt-1 text-sm text-red-500">
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
          </FormCard>
        );
      
      case 3:
        return (
          <FormCard title="Add Media" step={3} totalSteps={3} className="mb-8">
            <ImageUpload onImageUpload={handleImageUpload} error={errors.image} />
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or enter an image URL
                </span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-200"
              />
              <Button 
                onClick={() => {
                  if (formData.image) {
                    try {
                      new URL(formData.image);
                    } catch (e) {
                      setErrors(prev => ({
                        ...prev,
                        image: 'Please enter a valid URL'
                      }));
                    }
                  }
                }}
                variant="outline"
              >
                Use URL
              </Button>
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
            
            <div className="flex justify-between pt-6 border-t border-gray-100 dark:border-gray-700/50 mt-8">
              <Button 
                onClick={prevStep} 
                variant="secondary"
                size="lg"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Pricing
              </Button>
              
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  size="lg"
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
                  onClick={handleSubmit}
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  Publish Event
                </Button>
              </div>
            </div>
          </FormCard>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/20 mb-6">
            <Rocket className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
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
};

export default CreateEventPage;