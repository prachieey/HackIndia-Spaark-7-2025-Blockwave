import Event from '../models/Event.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import APIFeatures from '../utils/apiFeatures.js';

// Helper function to filter fields
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Get all events with filtering, sorting, pagination
export const getAllEvents = catchAsync(async (req, res, next) => {
  // Execute query
  const features = new APIFeatures(Event.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  
  const events = await features.query;

  // Send response
  res.status(200).json({
    status: 'success',
    results: events.length,
    data: {
      events,
    },
  });
});

// Get a single event
export const getEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id).populate([
    { path: 'organizer', select: 'name email' },
    { path: 'reviews' },
  ]);

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  // Increment views
  event.views += 1;
  await event.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      event,
    },
  });
});

// Create a new event
export const createEvent = catchAsync(async (req, res, next) => {
  // Add organizer to request body
  req.body.organizer = req.user.id;
  
  const newEvent = await Event.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      event: newEvent,
    },
  });
});

// Update an event
export const updateEvent = catchAsync(async (req, res, next) => {
  // 1) Filter out unwanted fields
  const filteredBody = filterObj(
    req.body,
    'title',
    'description',
    'category',
    'startDate',
    'endDate',
    'venue',
    'ticketTypes',
    'bannerImage',
    'gallery',
    'termsConditions',
    'refundPolicy',
    'tags'
  );

  // 2) Update event document
  const updatedEvent = await Event.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedEvent) {
    return next(new AppError('No event found with that ID', 404));
  }

  // 3) Check if user is the organizer or admin
  if (
    updatedEvent.organizer.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new AppError('You do not have permission to perform this action', 403)
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      event: updatedEvent,
    },
  });
});

// Delete an event
export const deleteEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  // Check if user is the organizer or admin
  if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError('You do not have permission to perform this action', 403)
    );
  }

  await Event.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Get events by category
export const getEventsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  const events = await Event.find({ category, status: 'upcoming' });

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: {
      events,
    },
  });
});

// Get events by organizer
export const getEventsByOrganizer = catchAsync(async (req, res, next) => {
  const { organizerId } = req.params;
  const events = await Event.find({ organizer: organizerId });

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: {
      events,
    },
  });
});

// Get user's registered events
export const getMyRegisteredEvents = catchAsync(async (req, res, next) => {
  const events = await Event.find({ 'tickets.attendee': req.user.id });

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: {
      events,
    },
  });
});

// Get events organized by the current user
export const getMyOrganizedEvents = catchAsync(async (req, res, next) => {
  const events = await Event.find({ organizer: req.user.id });

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: {
      events,
    },
  });
});

// Admin: Get all events (including inactive)
export const adminGetAllEvents = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Event.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  
  const events = await features.query;

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: {
      events,
    },
  });
});

// Admin: Update event status
export const adminUpdateEventStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  
  if (!['active', 'suspended', 'cancelled'].includes(status)) {
    return next(new AppError('Invalid status value', 400));
  }

  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      event,
    },
  });
});
