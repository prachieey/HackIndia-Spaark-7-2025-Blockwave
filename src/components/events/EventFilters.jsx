import React, { useState, useEffect } from 'react';
import { Search, Sliders, X, MapPin, Calendar, Clock, Tag, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const categories = [
  'All',
  'Music',
  'Sports',
  'Technology',
  'Business',
  'Education',
  'Entertainment',
  'Food & Drink',
  'Arts',
  'Health',
  'Other'
];

const priceRanges = [
  { id: 'free', label: 'Free', min: 0, max: 0 },
  { id: 'under25', label: 'Under $25', min: 0.01, max: 25 },
  { id: '25to50', label: '$25 - $50', min: 25, max: 50 },
  { id: '50to100', label: '$50 - $100', min: 50, max: 100 },
  { id: 'over100', label: 'Over $100', min: 100, max: Infinity },
];

const sortOptions = [
  { id: 'date-asc', label: 'Date: Soonest First' },
  { id: 'date-desc', label: 'Date: Latest First' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'popularity', label: 'Most Popular' },
];

const EventFilters = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedPriceRange,
  setSelectedPriceRange,
  dateRange,
  setDateRange,
  sortBy,
  setSortBy,
  showMap,
  setShowMap,
  filtersExpanded,
  setFiltersExpanded,
  onResetFilters
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Format date range display
  const formattedDateRange = dateRange[0]?.startDate && dateRange[0]?.endDate
    ? `${format(dateRange[0].startDate, 'MMM d')} - ${format(dateRange[0].endDate, 'MMM d, yyyy')}`
    : 'Any date';

  // Handle click outside to close date picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      const datePicker = document.querySelector('.rdrDateRangePicker');
      const dateInput = document.querySelector('.date-range-input');
      
      if (
        showDatePicker && 
        datePicker && 
        !datePicker.contains(event.target) && 
        !dateInput?.contains(event.target)
      ) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDatePicker]);

  return (
    <div className="space-y-6">
      {/* Search and Top Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search events by name, description, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            aria-label="Search events"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Toggle filters"
          >
            <Sliders className="h-5 w-5 mr-2 text-gray-600" />
            <span>Filters</span>
            {(selectedCategory !== 'All' || selectedPriceRange || dateRange[0]?.startDate) && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {[selectedCategory !== 'All' ? 1 : 0, selectedPriceRange ? 1 : 0, dateRange[0]?.startDate ? 1 : 0].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setShowMap(!showMap)}
            className="flex items-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label={showMap ? 'Hide map' : 'Show map'}
          >
            <MapPin className="h-5 w-5 mr-2 text-gray-600" />
            <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
          </button>
          
          <button
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className="hidden md:flex items-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label={filtersExpanded ? 'Hide filters' : 'Show filters'}
          >
            <Sliders className="h-5 w-5 mr-2 text-gray-600" />
            <span>{filtersExpanded ? 'Hide Filters' : 'Show Filters'}</span>
            {(selectedCategory !== 'All' || selectedPriceRange || dateRange[0]?.startDate) && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {[selectedCategory !== 'All' ? 1 : 0, selectedPriceRange ? 1 : 0, dateRange[0]?.startDate ? 1 : 0].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {selectedCategory !== 'All' && (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-sm">
            {selectedCategory}
            <button 
              onClick={() => setSelectedCategory('All')}
              className="ml-1.5 text-blue-500 hover:text-blue-700"
              aria-label={`Remove ${selectedCategory} filter`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
        
        {selectedPriceRange && (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-sm">
            {priceRanges.find(r => r.id === selectedPriceRange)?.label}
            <button 
              onClick={() => setSelectedPriceRange(null)}
              className="ml-1.5 text-blue-500 hover:text-blue-700"
              aria-label="Remove price filter"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
        
        {dateRange[0]?.startDate && (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-sm">
            {formattedDateRange}
            <button 
              onClick={() => setDateRange([{ startDate: null, endDate: null, key: 'selection' }])}
              className="ml-1.5 text-blue-500 hover:text-blue-700"
              aria-label="Remove date filter"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
        
        {(selectedCategory !== 'All' || selectedPriceRange || dateRange[0]?.startDate) && (
          <button
            onClick={onResetFilters}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Mobile Filters Panel */}
      <AnimatePresence>
        {(showMobileFilters || filtersExpanded) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`${showMobileFilters ? 'block md:hidden' : 'hidden md:block'} overflow-hidden`}
          >
            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg space-y-6">
              {/* Sort By */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Tag className="h-4 w-4 mr-1.5 text-gray-500" />
                  Sort By
                </h3>
                <div className="space-y-2">
                  {sortOptions.map((option) => (
                    <label key={option.id} className="flex items-center">
                      <input
                        type="radio"
                        name="sort"
                        checked={sortBy === option.id}
                        onChange={() => setSortBy(option.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-2 text-sm rounded-md text-left transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-100 text-blue-800 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <label key={range.id} className="flex items-center">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={selectedPriceRange === range.id}
                        onChange={() => setSelectedPriceRange(range.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-gray-500" />
                  Date Range
                </h3>
                <div className="relative">
                  <div 
                    className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition-colors date-range-input"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                  >
                    <span className="text-sm text-gray-700">
                      {formattedDateRange}
                    </span>
                    <Calendar className="h-4 w-4 text-gray-500" />
                  </div>
                  
                  {showDatePicker && (
                    <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                      <DateRange
                        editableDateInputs={true}
                        onChange={(item) => setDateRange([item.selection])}
                        moveRangeOnFirstSelection={false}
                        ranges={dateRange}
                        minDate={new Date()}
                        rangeColors={['#3b82f6']}
                        className="border-0"
                      />
                      <div className="flex justify-between p-3 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => {
                            setDateRange([{ startDate: null, endDate: null, key: 'selection' }]);
                            setShowDatePicker(false);
                          }}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDatePicker(false)}
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventFilters;
