import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import APIFeatures from '../utils/apiFeatures.js';

// Get all tickets (Admin only)
const getAllTickets = catchAsync(async (req, res, next) => {
  const tickets = await Ticket.find();

  res.status(200).json({
    status: 'success',
    results: tickets.length,
    data: {
      tickets,
    },
  });
});

// Void a ticket (Admin only)
const voidTicket = catchAsync(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id);
  
  if (!ticket) {
    return next(new AppError('No ticket found with that ID', 404));
  }

  // Update ticket status to voided
  ticket.status = 'voided';
  ticket.voidedAt = Date.now();
  ticket.voidedBy = req.user.id;
  
  await ticket.save();

  res.status(200).json({
    status: 'success',
    data: {
      ticket
    }
  });
});

// Delete a ticket (Admin/Organizer only)
const deleteTicket = catchAsync(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id);
  
  if (!ticket) {
    return next(new AppError('No ticket found with that ID', 404));
  }

  // Get the event to check organizer
  const event = await Event.findById(ticket.event);
  
  // Check if user has permission to delete this ticket
  if (
    req.user.role !== 'admin' && 
    (!event || event.organizer.toString() !== req.user.id)
  ) {
    return next(
      new AppError('You do not have permission to delete this ticket', 403)
    );
  }

  // Soft delete by updating status
  ticket.status = 'cancelled';
  ticket.cancelledAt = Date.now();
  ticket.cancelledBy = req.user.id;
  await ticket.save({ validateBeforeSave: false });

  // If the ticket was active, increment the available ticket count
  if (ticket.status === 'active') {
    await Event.findByIdAndUpdate(
      ticket.event,
      { $inc: { availableTickets: 1 } }
    );
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Validate a ticket
const validateTicket = catchAsync(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id).populate({
    path: 'event',
    select: 'title startDate venue'
  });

  if (!ticket) {
    return next(new AppError('No ticket found with that ID', 404));
  }

  // Check if ticket is valid (not used, not expired, etc.)
  const now = new Date();
  if (ticket.status !== 'active') {
    return res.status(200).json({
      status: 'success',
      data: {
        isValid: false,
        reason: 'Ticket is not active',
        ticket: {
          id: ticket._id,
          status: ticket.status,
          event: ticket.event
        }
      }
    });
  }

  // Check if the event has already ended
  if (ticket.event.endDate < now) {
    return res.status(200).json({
      status: 'success',
      data: {
        isValid: false,
        reason: 'Event has already ended',
        ticket: {
          id: ticket._id,
          event: ticket.event,
          eventEndDate: ticket.event.endDate
        }
      }
    });
  }

  // Ticket is valid
  res.status(200).json({
    status: 'success',
    data: {
      isValid: true,
      ticket: {
        id: ticket._id,
        status: ticket.status,
        event: ticket.event,
        owner: ticket.owner
      }
    }
  });
});

// Get a single ticket
const getTicket = catchAsync(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id).populate([
    { path: 'event', select: 'title startDate venue' },
    { path: 'owner', select: 'name email' },
  ]);

  if (!ticket) {
    return next(new AppError('No ticket found with that ID', 404));
  }

  // Check if the user has permission to view this ticket
  if (
    ticket.owner.toString() !== req.user.id &&
    req.user.role !== 'admin' &&
    !(ticket.event.organizer && ticket.event.organizer.toString() === req.user.id)
  ) {
    return next(new AppError('You are not authorized to view this ticket', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      ticket
    }
  });
});

// Get tickets for a specific event (public)
const getTicketsForEvent = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;
  
  // 1) Get the event
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  // 2) Get all tickets for the event
  const tickets = await Ticket.find({ event: eventId })
    .populate({
      path: 'owner',
      select: 'name email'
    })
    .sort('-createdAt');

  // 3) Send response
  res.status(200).json({
    status: 'success',
    results: tickets.length,
    data: {
      tickets
    }
  });
});

// Get all tickets for an event (Organizer & Admin only)
const getAllTicketsForEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.eventId);
  
  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  // Check if user is the organizer or admin
  if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError('You do not have permission to view these tickets', 403)
    );
  }

  const tickets = await Ticket.find({ event: req.params.eventId });

  res.status(200).json({
    status: 'success',
    results: tickets.length,
    data: {
      tickets,
    },
  });
});

// Create a new ticket (Admin/Organizer only)
const createTicket = catchAsync(async (req, res, next) => {
  const { eventId, ownerId, ticketType, price, status = 'active' } = req.body;

  // 1) Check if the event exists
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  // 2) Verify the user has permission to create tickets for this event
  if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError('You do not have permission to create tickets for this event', 403)
    );
  }

  // 3) Check if the ticket type is valid for this event
  const validTicketType = event.ticketTypes.some(
    type => type._id.toString() === ticketType
  );

  if (!validTicketType) {
    return next(new AppError('Invalid ticket type for this event', 400));
  }

  // 4) Create the ticket
  const ticket = await Ticket.create({
    event: eventId,
    owner: ownerId || req.user.id,
    ticketType,
    price,
    status,
    createdBy: req.user.id
  });

  // 5) If the ticket is active, decrement the available ticket count
  if (status === 'active') {
    await Event.findByIdAndUpdate(
      eventId,
      { $inc: { availableTickets: -1 } }
    );
  }

  res.status(201).json({
    status: 'success',
    data: {
      ticket
    }
  });
});

// Cancel a ticket
const cancelTicket = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;
  const userId = req.user.id;

  // 1) Get the ticket and verify ownership
  const ticket = await Ticket.findById(ticketId).populate('event');
  if (!ticket) {
    return next(new AppError('No ticket found with that ID', 404));
  }

  // 2) Check if the user owns the ticket or is an admin
  if (ticket.owner.toString() !== userId && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to cancel this ticket', 403));
  }

  // 3) Check if the ticket is already cancelled
  if (ticket.status === 'cancelled') {
    return next(new AppError('This ticket is already cancelled', 400));
  }

  // 4) Update the ticket status to cancelled
  ticket.status = 'cancelled';
  ticket.cancelledAt = Date.now();
  ticket.cancelledBy = userId;
  await ticket.save({ validateBeforeSave: false });

  // 5) If the ticket was active, increment the available ticket count
  if (ticket.status === 'active' && ticket.event) {
    await Event.findByIdAndUpdate(
      ticket.event._id,
      { $inc: { availableTickets: 1 } }
    );
  }

  // 6) Send response
  res.status(200).json({
    status: 'success',
    data: {
      ticket
    }
  });
});

// Transfer a ticket to another user
const transferTicket = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;
  const { newOwnerId } = req.body;
  const userId = req.user.id;

  // 1) Get the ticket
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    return next(new AppError('No ticket found with that ID', 404));
  }

  // 2) Check if the current user is the ticket owner
  if (ticket.owner.toString() !== userId) {
    return next(new AppError('You are not authorized to transfer this ticket', 403));
  }

  // 3) Check if the new owner exists
  const newOwner = await User.findById(newOwnerId);
  if (!newOwner) {
    return next(new AppError('No user found with that ID', 404));
  }

  // 4) Update the ticket owner
  ticket.owner = newOwnerId;
  ticket.transferredAt = Date.now();
  ticket.transferredFrom = userId;
  await ticket.save();

  // 5) Send response
  res.status(200).json({
    status: 'success',
    data: {
      ticket
    }
  });
});

// Verify a ticket
const verifyTicket = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;
  const { status } = req.body;

  // 1) Get the ticket
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    return next(new AppError('No ticket found with that ID', 404));
  }

  // 2) Check if the ticket is active
  if (ticket.status !== 'active') {
    return next(new AppError('Ticket is not active', 400));
  }

  // 3) Verify the ticket
  ticket.status = 'verified';
  ticket.verifiedAt = Date.now();
  ticket.verifiedBy = req.user.id;
  await ticket.save({ validateBeforeSave: false });

  // 4) Send response
  res.status(200).json({
    status: 'success',
    data: {
      ticket
    }
  });
});

// Create a new ticket type for an event
const createTicketType = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;
  const { name, description, price, quantity, maxPerUser = 1, saleStart, saleEnd } = req.body;

  // 1) Get the event
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  // 2) Check if the user is the organizer or an admin
  if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to create ticket types for this event', 403));
  }

  // 3) Create the ticket type
  const ticketType = {
    name,
    description,
    price,
    quantity,
    available: quantity,
    maxPerUser,
    saleStart: saleStart || event.startDate,
    saleEnd: saleEnd || event.endDate,
    createdBy: req.user.id
  };

  // 4) Add the ticket type to the event
  event.ticketTypes.push(ticketType);
  await event.save({ validateBeforeSave: false });

  // 5) Send response
  res.status(201).json({
    status: 'success',
    data: {
      ticketType: event.ticketTypes[event.ticketTypes.length - 1]
    }
  });
});

// Get all tickets for the current user
// Purchase a ticket
const purchaseTicket = catchAsync(async (req, res, next) => {
  const { eventId, ticketTypeId, quantity = 1 } = req.body;
  const userId = req.user.id;

  // 1) Get the event
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  // 2) Find the ticket type
  const ticketType = event.ticketTypes.find(type => type._id.toString() === ticketTypeId);
  if (!ticketType) {
    return next(new AppError('No ticket type found with that ID', 404));
  }

  // 3) Check if ticket type is available
  if (ticketType.available < quantity) {
    return next(new AppError('Not enough tickets available', 400));
  }

  // 4) Create the ticket(s)
  const tickets = [];
  for (let i = 0; i < quantity; i++) {
    const ticket = await Ticket.create({
      event: eventId,
      owner: userId,
      ticketType: ticketType._id,
      price: ticketType.price,
      status: 'active',
      purchasedAt: Date.now()
    });
    tickets.push(ticket);

    // 5) Decrement available tickets
    ticketType.available -= 1;
  }

  // 6) Save the event with updated ticket type availability
  await event.save({ validateBeforeSave: false });

  // 7) Send response
  res.status(201).json({
    status: 'success',
    data: {
      tickets
    }
  });
});

// Get all tickets for the current user
const getMyTickets = catchAsync(async (req, res, next) => {
  const tickets = await Ticket.find({ owner: req.user.id })
    .populate({
      path: 'event',
      select: 'title startDate endDate venue imageCover'
    })
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: tickets.length,
    data: {
      tickets
    }
  });
});

export {
  getAllTickets,
  getTicket,
  getTicketsForEvent,
  getAllTicketsForEvent,
  createTicket,
  deleteTicket,
  cancelTicket,
  transferTicket,
  verifyTicket,
  validateTicket,
  voidTicket,
  createTicketType,
  getMyTickets,
  purchaseTicket
};
