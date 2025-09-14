const AppError = require('./appError');

/**
 * Get pagination parameters from request query
 * @param {Object} query - Request query object
 * @returns {Object} - Pagination options
 */
const getPaginationParams = (query) => {
  const page = Math.abs(parseInt(query.page, 10)) || 1;
  const limit = Math.abs(parseInt(query.limit, 10)) || 10;
  const skip = (page - 1) * limit;

  // Validate pagination parameters
  if (page < 1) {
    throw new AppError('Page must be greater than 0', 400);
  }

  if (limit < 1 || limit > 100) {
    throw new AppError('Limit must be between 1 and 100', 400);
  }

  return { page, limit, skip };
};

/**
 * Format pagination response
 * @param {Object} result - Mongoose pagination result
 * @param {string} baseUrl - Base URL for pagination links
 * @returns {Object} - Formatted pagination response
 */
const formatPagination = (result, baseUrl) => {
  const { docs, totalDocs, limit, page, totalPages, hasNextPage, hasPrevPage } = result;
  
  // Remove query string from baseUrl if it exists
  const cleanBaseUrl = baseUrl.split('?')[0];
  
  // Build query parameters without pagination params
  const queryParams = new URLSearchParams(baseUrl.split('?')[1] || '');
  ['page', 'limit', 'sort', 'fields'].forEach(param => queryParams.delete(param));
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const basePath = `${cleanBaseUrl}${queryString ? `${queryString}&` : '?'}`;
  
  // Create pagination links
  const links = {
    self: `${basePath}page=${page}&limit=${limit}`,
    first: `${basePath}page=1&limit=${limit}`,
    last: `${basePath}page=${totalPages}&limit=${limit}`,
  };

  if (hasNextPage) {
    links.next = `${basePath}page=${page + 1}&limit=${limit}`;
  }

  if (hasPrevPage) {
    links.prev = `${basePath}page=${page - 1}&limit=${limit}`;
  }

  return {
    items: docs,
    pagination: {
      total: totalDocs,
      count: docs.length,
      perPage: limit,
      currentPage: page,
      totalPages,
      links,
    },
  };
};

/**
 * Apply pagination to a Mongoose query
 * @param {Object} query - Mongoose query object
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Number of items per page
 * @param {string} sort - Sort criteria
 * @param {string} select - Fields to select
 * @returns {Promise<Object>} - Pagination result
 */
const paginate = async (query, { page, limit }, sort = '-createdAt', select = '') => {
  // Execute count query in parallel with the main query
  const [total, items] = await Promise.all([
    query.model.countDocuments(query.getFilter()),
    query
      .clone()
      .sort(sort)
      .select(select)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec(),
  ]);

  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    docs: items,
    totalDocs: total,
    limit: limit,
    page: page,
    totalPages,
    hasNextPage,
    hasPrevPage,
    pagingCounter: (page - 1) * limit + 1,
  };
};

/**
 * Apply filters to a Mongoose query
 * @param {Object} query - Mongoose query object
 * @param {Object} filters - Filters to apply
 * @param {Object} filterMap - Mapping of filter names to query conditions
 * @returns {Object} - Updated query object
 */
const applyFilters = (query, filters, filterMap = {}) => {
  if (!filters || typeof filters !== 'object') {
    return query;
  }

  // Apply each filter from the filter map
  Object.entries(filterMap).forEach(([filterName, condition]) => {
    if (filters[filterName] !== undefined) {
      if (typeof condition === 'function') {
        // If condition is a function, call it with the filter value
        condition(query, filters[filterName]);
      } else {
        // Otherwise, treat it as a field name
        query.where(condition).equals(filters[filterName]);
      }
    }
  });

  return query;
};

/**
 * Apply sorting to a Mongoose query
 * @param {Object} query - Mongoose query object
 * @param {string} sort - Sort criteria (e.g., '-createdAt,name')
 * @param {Object} defaultSort - Default sort criteria
 * @returns {Object} - Updated query object
 */
const applySorting = (query, sort, defaultSort = { createdAt: -1 }) => {
  if (!sort) {
    return query.sort(defaultSort);
  }

  const sortCriteria = {};
  const sortFields = sort.split(',');

  sortFields.forEach((field) => {
    let sortOrder = 1; // Default to ascending
    let fieldName = field.trim();

    // Check for descending sort
    if (fieldName.startsWith('-')) {
      sortOrder = -1;
      fieldName = fieldName.substring(1);
    }

    sortCriteria[fieldName] = sortOrder;
  });

  return query.sort(sortCriteria);
};

/**
 * Apply field selection to a Mongoose query
 * @param {Object} query - Mongoose query object
 * @param {string} fields - Comma-separated list of fields to select
 * @returns {Object} - Updated query object
 */
const applyFieldSelection = (query, fields) => {
  if (!fields) return query;
  
  const selectedFields = fields
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean)
    .join(' ');

  return query.select(selectedFields);
};

module.exports = {
  getPaginationParams,
  formatPagination,
  paginate,
  applyFilters,
  applySorting,
  applyFieldSelection,
};
