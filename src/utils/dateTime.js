const moment = require('moment-timezone');
const AppError = require('./appError');

// Set default timezone
const DEFAULT_TIMEZONE = process.env.TZ || 'Asia/Kolkata';

/**
 * Format a date to a human-readable string
 * @param {Date|string} date - Date to format
 * @param {string} [format='llll'] - Moment.js format string
 * @param {string} [timezone] - Timezone to use (default: server timezone)
 * @returns {string} - Formatted date string
 */
const formatDate = (date, format = 'llll', timezone) => {
  if (!date) return '';
  
  let momentDate = moment(date);
  
  if (!momentDate.isValid()) {
    throw new AppError('Invalid date provided', 400);
  }
  
  if (timezone) {
    momentDate = momentDate.tz(timezone);
  }
  
  return momentDate.format(format);
};

/**
 * Parse a date string into a Date object
 * @param {string} dateString - Date string to parse
 * @param {string} [format] - Expected format of the input string
 * @param {string} [timezone] - Timezone to use for parsing
 * @returns {Date} - Parsed Date object
 */
const parseDate = (dateString, format, timezone) => {
  if (!dateString) return null;
  
  let momentDate;
  
  if (format) {
    momentDate = moment(dateString, format, true); // Strict parsing
  } else {
    momentDate = moment(dateString);
  }
  
  if (!momentDate.isValid()) {
    throw new AppError(`Invalid date format. Expected format: ${format || 'ISO 8601'}`, 400);
  }
  
  if (timezone) {
    momentDate = momentDate.tz(timezone);
  }
  
  return momentDate.toDate();
};

/**
 * Get the current date and time in a specific timezone
 * @param {string} [timezone] - Timezone to use (default: server timezone)
 * @returns {Date} - Current date and time in the specified timezone
 */
const getCurrentDate = (timezone) => {
  return timezone 
    ? moment().tz(timezone).toDate() 
    : new Date();
};

/**
 * Add time to a date
 * @param {Date|string} date - Base date
 * @param {number} amount - Amount to add
 * @param {string} unit - Unit of time (years, months, weeks, days, hours, minutes, seconds)
 * @param {string} [timezone] - Timezone to use
 * @returns {Date} - New date with time added
 */
const addTime = (date, amount, unit, timezone) => {
  let momentDate = moment(date);
  
  if (timezone) {
    momentDate = momentDate.tz(timezone);
  }
  
  return momentDate.add(amount, unit).toDate();
};

/**
 * Subtract time from a date
 * @param {Date|string} date - Base date
 * @param {number} amount - Amount to subtract
 * @param {string} unit - Unit of time (years, months, weeks, days, hours, minutes, seconds)
 * @param {string} [timezone] - Timezone to use
 * @returns {Date} - New date with time subtracted
 */
const subtractTime = (date, amount, unit, timezone) => {
  return addTime(date, -amount, unit, timezone);
};

/**
 * Get the difference between two dates in the specified unit
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @param {string} [unit='milliseconds'] - Unit of time for the result
 * @param {boolean} [floating=false] - Return a floating point number
 * @returns {number} - Difference between the dates
 */
const getDateDiff = (date1, date2, unit = 'milliseconds', floating = false) => {
  return moment(date1).diff(moment(date2), unit, floating);
};

/**
 * Check if a date is between two other dates (inclusive)
 * @param {Date|string} date - Date to check
 * @param {Date|string} start - Start date
 * @param {Date|string} end - End date
 * @param {string} [unit] - Unit of time for comparison
 * @param {string} [inclusivity='[]'] - '()' to exclude the start and end, '[]' to include them, etc.
 * @returns {boolean} - True if the date is between start and end
 */
const isBetween = (date, start, end, unit, inclusivity = '[]') => {
  return moment(date).isBetween(start, end, unit, inclusivity);
};

/**
 * Check if a date is in the past
 * @param {Date|string} date - Date to check
 * @param {string} [unit] - Unit of time for comparison
 * @returns {boolean} - True if the date is in the past
 */
const isPast = (date, unit) => {
  return moment(date).isBefore(moment(), unit);
};

/**
 * Check if a date is in the future
 * @param {Date|string} date - Date to check
 * @param {string} [unit] - Unit of time for comparison
 * @returns {boolean} - True if the date is in the future
 */
const isFuture = (date, unit) => {
  return moment(date).isAfter(moment(), unit);
};

/**
 * Get the start of a time period
 * @param {Date|string} date - Base date
 * @param {string} unit - Unit of time (year, month, week, day, hour, minute, second)
 * @param {string} [timezone] - Timezone to use
 * @returns {Date} - Start of the time period
 */
const startOf = (date, unit, timezone) => {
  let momentDate = moment(date);
  
  if (timezone) {
    momentDate = momentDate.tz(timezone);
  }
  
  return momentDate.startOf(unit).toDate();
};

/**
 * Get the end of a time period
 * @param {Date|string} date - Base date
 * @param {string} unit - Unit of time (year, month, week, day, hour, minute, second)
 * @param {string} [timezone] - Timezone to use
 * @returns {Date} - End of the time period
 */
const endOf = (date, unit, timezone) => {
  let momentDate = moment(date);
  
  if (timezone) {
    momentDate = momentDate.tz(timezone);
  }
  
  return momentDate.endOf(unit).toDate();
};

/**
 * Convert a date to a specific timezone
 * @param {Date|string} date - Date to convert
 * @param {string} timezone - Target timezone
 * @returns {Date} - Converted date
 */
const convertToTimezone = (date, timezone) => {
  return moment(date).tz(timezone).toDate();
};

/**
 * Format a duration in a human-readable format
 * @param {number} milliseconds - Duration in milliseconds
 * @param {boolean} [includeSeconds=false] - Whether to include seconds in the output
 * @returns {string} - Formatted duration (e.g., "2 days, 3 hours, 30 minutes")
 */
const formatDuration = (milliseconds, includeSeconds = false) => {
  const duration = moment.duration(milliseconds);
  const parts = [];
  
  const days = Math.floor(duration.asDays());
  if (days > 0) {
    parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  }
  
  const hours = duration.hours();
  if (hours > 0 || parts.length > 0) {
    parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  }
  
  const minutes = duration.minutes();
  if (minutes > 0 || parts.length > 0 || includeSeconds) {
    parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  }
  
  if (includeSeconds) {
    const seconds = duration.seconds();
    parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
  }
  
  return parts.join(', ');
};

module.exports = {
  DEFAULT_TIMEZONE,
  formatDate,
  parseDate,
  getCurrentDate,
  addTime,
  subtractTime,
  getDateDiff,
  isBetween,
  isPast,
  isFuture,
  startOf,
  endOf,
  convertToTimezone,
  formatDuration,
};
