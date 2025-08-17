const { body, validationResult } = require('express-validator');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Create ticket booking
// @route   POST /api/tickets
// @access  Private
exports.createTicket = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { eventId, ticketTypeId, quantity, attendeeInfo } = req.body;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is published
    if (event.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Event is not available for booking'
      });
    }

    // Find the specific ticket type
    const ticketType = event.ticketTypes.id(ticketTypeId);
    if (!ticketType) {
      return res.status(404).json({
        success: false,
        message: 'Ticket type not found'
      });
    }

    // Check availability
    const availableTickets = ticketType.quantity - ticketType.sold;
    if (quantity > availableTickets) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableTickets} tickets available for this type`
      });
    }

    // Calculate total amount
    const totalAmount = ticketType.price * quantity;

    // Create ticket (initially pending)
    const ticket = await Ticket.create({
      event: eventId,
      user: req.user.id,
      ticketType: {
        name: ticketType.name,
        price: ticketType.price
      },
      quantity,
      totalAmount,
      attendeeInfo: attendeeInfo || {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone
      }
    });

    await ticket.populate([
      { path: 'event', select: 'title startDate venue organizer' },
      { path: 'user', select: 'name email phone' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Ticket booking created successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's tickets
// @route   GET /api/tickets/my-tickets
// @access  Private
exports.getMyTickets = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const tickets = await Ticket.find({ user: req.user.id })
      .populate('event', 'title startDate venue images')
      .sort({ bookingDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Ticket.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: tickets.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: tickets
    });
  } catch (error) {
    console.error('Get my tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate([
        { 
          path: 'event', 
          select: 'title description startDate endDate startTime endTime venue organizer',
          populate: { path: 'organizer', select: 'name email phone' }
        },
        { path: 'user', select: 'name email phone' }
      ]);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if user owns the ticket or is the event organizer
    if (ticket.user._id.toString() !== req.user.id && 
        ticket.event.organizer._id.toString() !== req.user.id &&
        req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this ticket'
      });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Cancel ticket
// @route   PUT /api/tickets/:id/cancel
// @access  Private
exports.cancelTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('event', 'startDate');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if user owns the ticket
    if (ticket.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to cancel this ticket'
      });
    }

    // Check if ticket can be cancelled (not already cancelled or used)
    if (ticket.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Ticket is already cancelled'
      });
    }

    if (ticket.status === 'used') {
      return res.status(400).json({
        success: false,
        message: 'Used ticket cannot be cancelled'
      });
    }

    // Check if event has already started
    if (new Date() >= ticket.event.startDate) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel ticket for event that has already started'
      });
    }

    // Update ticket status
    await ticket.cancelTicket();

    // Update event ticket count
    const event = await Event.findById(ticket.event._id);
    const ticketType = event.ticketTypes.find(
      type => type.name === ticket.ticketType.name
    );
    if (ticketType) {
      ticketType.sold = Math.max(0, ticketType.sold - ticket.quantity);
      await event.save();
    }

    res.status(200).json({
      success: true,
      message: 'Ticket cancelled successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Cancel ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Verify QR code
// @route   POST /api/tickets/verify
// @access  Private (Organizer, Admin)
exports.verifyTicket = async (req, res, next) => {
  try {
    const { qrCodeData } = req.body;

    if (!qrCodeData) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required'
      });
    }

    try {
      const ticket = await Ticket.verifyQRCode(qrCodeData);
      
      // Check if user is authorized to verify this ticket
      if (req.user.role !== 'admin' && 
          ticket.event.organizer.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to verify tickets for this event'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Ticket is valid',
        data: {
          ticket: {
            ticketNumber: ticket.ticketNumber,
            attendeeInfo: ticket.attendeeInfo,
            ticketType: ticket.ticketType,
            quantity: ticket.quantity,
            event: {
              title: ticket.event.title,
              startDate: ticket.event.startDate,
              venue: ticket.event.venue
            }
          },
          isValid: true
        }
      });
    } catch (verifyError) {
      return res.status(400).json({
        success: false,
        message: verifyError.message,
        data: { isValid: false }
      });
    }
  } catch (error) {
    console.error('Verify ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark ticket as used (scan entry)
// @route   POST /api/tickets/scan
// @access  Private (Organizer, Admin)
exports.scanTicket = async (req, res, next) => {
  try {
    const { qrCodeData } = req.body;

    if (!qrCodeData) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required'
      });
    }

    try {
      const ticket = await Ticket.verifyQRCode(qrCodeData);
      
      // Check if user is authorized to scan this ticket
      if (req.user.role !== 'admin' && 
          ticket.event.organizer.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to scan tickets for this event'
        });
      }

      // Mark ticket as used
      await ticket.markAsUsed();

      res.status(200).json({
        success: true,
        message: 'Ticket scanned successfully - Entry granted',
        data: {
          attendeeInfo: ticket.attendeeInfo,
          ticketType: ticket.ticketType,
          scanTime: ticket.usedAt,
          event: {
            title: ticket.event.title,
            venue: ticket.event.venue
          }
        }
      });
    } catch (verifyError) {
      return res.status(400).json({
        success: false,
        message: verifyError.message
      });
    }
  } catch (error) {
    console.error('Scan ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get event tickets (for organizers)
// @route   GET /api/tickets/event/:eventId
// @access  Private (Event Organizer, Admin)
exports.getEventTickets = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is event organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view tickets for this event'
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    let query = { event: req.params.eventId };

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by payment status
    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
    }

    const tickets = await Ticket.find(query)
      .populate('user', 'name email phone')
      .select('-qrCode') // Don't send QR code in list view
      .sort({ bookingDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Ticket.countDocuments(query);

    res.status(200).json({
      success: true,
      count: tickets.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: tickets
    });
  } catch (error) {
    console.error('Get event tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Validation rules
exports.createTicketValidation = [
  body('eventId')
    .isMongoId()
    .withMessage('Valid event ID is required'),
  body('ticketTypeId')
    .isMongoId()
    .withMessage('Valid ticket type ID is required'),
  body('quantity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10'),
  body('attendeeInfo.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Attendee name must be between 2 and 50 characters'),
  body('attendeeInfo.email')
    .optional()
    .isEmail()
    .withMessage('Valid attendee email is required'),
  body('attendeeInfo.phone')
    .optional()
    .matches(/^\d{10}$/)
    .withMessage('Attendee phone must be 10 digits')
];

module.exports = exports;
