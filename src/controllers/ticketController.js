import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { Web3 } from 'web3';

// Get all tickets (Admin only)
export const getAllTickets = catchAsync(async (req, res, next) => {
  const tickets = await Ticket.find();

  res.status(200).json({
    status: 'success',
    results: tickets.length,
    data: {
      tickets,
    },
  });
});

// Get a single ticket
export const getTicket = catchAsync(async (req, res, next) => {
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
    return next(
      new AppError('You do not have permission to view this ticket', 403)
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      ticket,
    },
  });
});

// Get tickets for a specific event (public)
export const getTicketsForEvent = catchAsync(async (req, res, next) => {
  const tickets = await Ticket.find({ 
    event: req.params.eventId,
    status: 'active' 
  });

  res.status(200).json({
    status: 'success',
    results: tickets.length,
    data: {
      tickets,
    },
  });
});

// Get all tickets for an event (Organizer & Admin only)
export const getAllTicketsForEvent = catchAsync(async (req, res, next) => {
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

// Purchase a new ticket
export const purchaseTicket = catchAsync(async (req, res, next) => {
  const { eventId, ticketTypeId, quantity = 1, attendeeInfo } = req.body;

  // 1) Get the event
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  // 2) Find the ticket type
  const ticketType = event.ticketTypes.id(ticketTypeId);
  if (!ticketType) {
    return next(new AppError('No ticket type found with that ID', 404));
  }

  // 3) Check if tickets are available
  if (ticketType.quantity - ticketType.sold < quantity) {
    return next(new AppError('Not enough tickets available', 400));
  }

  // 4) Process payment (in a real app, this would integrate with a payment processor)
  // For now, we'll just simulate a successful payment
  const totalPrice = ticketType.price * quantity;
  
  // In a real app, you would verify the transaction on the blockchain here
  // For example:
  // const web3 = new Web3(process.env.BLOCKCHAIN_NODE_URL);
  // const receipt = await web3.eth.getTransactionReceipt(transactionHash);
  // if (!receipt || !receipt.status) {
  //   return next(new AppError('Payment failed', 400));
  // }

  // 5) Create tickets
  const tickets = [];
  for (let i = 0; i < quantity; i++) {
    const ticket = await Ticket.create({
      event: eventId,
      owner: req.user.id,
      ticketType: {
        name: ticketType.name,
        price: ticketType.price,
        currency: ticketType.currency,
      },
      attendee: attendeeInfo || {
        name: req.user.name,
        email: req.user.email,
      },
      purchasePrice: ticketType.price,
      purchaseDate: Date.now(),
      status: 'active',
    });

    tickets.push(ticket);

    // Update ticket type sold count
    ticketType.sold += 1;
  }

  // 6) Save the event with updated ticket counts
  await event.save();

  // 7) Add tickets to user's account
  await User.findByIdAndUpdate(req.user.id, {
    $push: { tickets: { $each: tickets.map(t => t._id) } },
  });

  res.status(201).json({
    status: 'success',
    data: {
      tickets,
    },
  });
});

// Transfer a ticket to another user
export const transferTicket = catchAsync(async (req, res, next) => {
  const { to, ticketId } = req.body;

  // 1) Get the ticket
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    return next(new AppError('No ticket found with that ID', 404));
  }

  // 2) Check if the user owns the ticket
  if (ticket.owner.toString() !== req.user.id) {
    return next(
      new AppError('You do not have permission to transfer this ticket', 403)
    );
  }

  // 3) Check if ticket is transferable
  if (!ticket.isTransferable) {
    return next(new AppError('This ticket is not transferable', 400));
  }

  // 4) Find the recipient
  const recipient = await User.findOne({
    $or: [{ email: to }, { walletAddress: to }],
  });

  if (!recipient) {
    return next(
      new AppError(
        'Recipient not found. Please check the email or wallet address',
        404
      )
    );
  }

  // 5) Update ticket ownership
  ticket.owner = recipient._id;
  ticket.transferHistory.push({
    from: req.user.id,
    to: recipient._id,
    timestamp: Date.now(),
  });

  await ticket.save();

  // 6) Update user's ticket arrays
  await User.findByIdAndUpdate(req.user.id, {
    $pull: { tickets: ticket._id },
  });

  await User.findByIdAndUpdate(recipient._id, {
    $addToSet: { tickets: ticket._id },
  });

  // In a real app, you would also transfer the NFT on the blockchain here

  res.status(200).json({
    status: 'success',
    message: 'Ticket transferred successfully',
    data: {
      ticket,
    },
  });
});

// Validate a ticket (for event check-in)
export const validateTicket = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;

  // 1) Get the ticket
  const ticket = await Ticket.findById(ticketId).populate('event');
  if (!ticket) {
    return next(new AppError('No ticket found with that ID', 404));
  }

  // 2) Check if the user has permission to validate this ticket
  // (e.g., event organizer or admin)
  if (
    ticket.event.organizer.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new AppError('You do not have permission to validate this ticket', 403)
    );
  }

  // 3) Check if ticket is already used
  if (ticket.status === 'used') {
    return next(new AppError('This ticket has already been used', 400));
  }

  // 4) Mark ticket as used
  ticket.status = 'used';
  ticket.usedAt = Date.now();
  ticket.verifiedBy = req.user.id;
  await ticket.save();

  res.status(200).json({
    status: 'success',
    message: 'Ticket validated successfully',
    data: {
      ticket,
    },
  });
});

// Verify a ticket (mark as verified by organizer)
export const verifyTicket = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;
  const { status } = req.body;

  // 1) Get the ticket
  const ticket = await Ticket.findById(ticketId).populate('event');
  if (!ticket) {
    return next(new AppError('No ticket found with that ID', 404));
  }

  // 2) Check if the user has permission to verify this ticket
  if (
    ticket.event.organizer.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new AppError('You do not have permission to verify this ticket', 403)
    );
  }

  // 3) Update ticket status
  ticket.status = status;
  ticket.verifiedAt = Date.now();
  ticket.verifiedBy = req.user.id;
  await ticket.save();

  res.status(200).json({
    status: 'success',
    message: 'Ticket verification status updated',
    data: {
      ticket,
    },
  });
});

// Void a ticket (Admin only)
export const voidTicket = catchAsync(async (req, res, next) => {
  const ticket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { status: 'void' },
    { new: true }
  );

  if (!ticket) {
    return next(new AppError('No ticket found with that ID', 404));
  }

  // In a real app, you would also handle refunds here

  res.status(200).json({
    status: 'success',
    message: 'Ticket has been voided',
    data: {
      ticket,
    },
  });
});

// Get current user's tickets
export const getMyTickets = catchAsync(async (req, res, next) => {
  const tickets = await Ticket.find({ owner: req.user.id })
    .populate({
      path: 'event',
      select: 'title startDate venue bannerImage',
    })
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: tickets.length,
    data: {
      tickets,
    },
  });
});
