import mongoose from 'mongoose';
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
const getAllEvents = catchAsync(async (req, res, next) => {
  console.log('\n=== getAllEvents controller called ===');
  console.log('Query parameters:', JSON.stringify(req.query, null, 2));
  
  try {
    // Log database connection status
    const db = mongoose.connection;
    console.log('Database connection state:', db.readyState);
    console.log('Database name:', db.name);
    
    // Directly fetch all events without using APIFeatures
    const events = await Event.find({}).lean();
    const total = events.length;
    
    console.log(`Found ${events.length} events out of ${total} total`);

    // Log first event (if any) to verify data structure
    if (events.length > 0) {
      console.log('Sample event:', JSON.stringify(events[0], null, 2));
    } else {
      console.log('No events found in the database');
      // Check if the events collection exists and has documents
      const count = await Event.countDocuments();
      console.log(`Total events in database: ${count}`);
      
      // If no events found, try to seed the database
      if (count === 0) {
        console.log('Attempting to seed the database with sample events...');
        try {
          const { exec } = await import('child_process');
          exec('node scripts/seedEvents.js', (error, stdout, stderr) => {
            if (error) {
              console.error('Error seeding database:', error);
              return;
            }
            console.log('Database seeded successfully');
            console.log(stdout);
          });
        } catch (error) {
          console.error('Error running seed script:', error);
        }
      }
    }

    // Send response
    console.log('Sending response with events');
    res.status(200).json({
      status: 'success',
      results: events.length,
      total,
      data: {
        events
      }
    });
  } catch (error) {
    console.error('Error in getAllEvents:', error);
    
    // More detailed error information
    const errorInfo = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue
    };
    
    console.error('Error details:', JSON.stringify(errorInfo, null, 2));
    
    res.status(500).json({
      status: 'error',
      message: 'Error fetching events',
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message,
        details: errorInfo
      })
    });
  }
});

// Get a single event
const getEvent = catchAsync(async (req, res, next) => {
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
const createEvent = catchAsync(async (req, res, next) => {
  // For testing, allow organizer to be passed in the request body
  // In production, this should be set from the authenticated user
  if (!req.body.organizer) {
    return next(new AppError('Organizer ID is required', 400));
  }
  
  const newEvent = await Event.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      event: newEvent,
    },
  });
});

// Update an event
const updateEvent = catchAsync(async (req, res, next) => {
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
const deleteEvent = catchAsync(async (req, res, next) => {
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
const getEventsByCategory = catchAsync(async (req, res, next) => {
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
const getEventsByOrganizer = catchAsync(async (req, res, next) => {
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
const getMyRegisteredEvents = catchAsync(async (req, res, next) => {
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
const getMyOrganizedEvents = catchAsync(async (req, res, next) => {
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
const adminGetAllEvents = catchAsync(async (req, res, next) => {
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
const adminUpdateEventStatus = catchAsync(async (req, res, next) => {
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

export {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByCategory,
  getEventsByOrganizer,
  getMyRegisteredEvents,
  getMyOrganizedEvents,
  adminGetAllEvents,
  adminUpdateEventStatus,
};
