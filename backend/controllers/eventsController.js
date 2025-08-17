const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const path = require('path');

// @desc    Get all events with filtering, searching, and pagination
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = { status: 'published' };

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Location filter
    if (req.query.city) {
      query['venue.city'] = new RegExp(req.query.city, 'i');
    }
    if (req.query.state) {
      query['venue.state'] = new RegExp(req.query.state, 'i');
    }

    // Date range filter
    if (req.query.startDate) {
      query.startDate = { $gte: new Date(req.query.startDate) };
    }
    if (req.query.endDate) {
      if (query.startDate) {
        query.startDate.$lte = new Date(req.query.endDate);
      } else {
        query.startDate = { $lte: new Date(req.query.endDate) };
      }
    }

    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Sort options
    let sort = {};
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',');
      sortBy.forEach(field => {
        if (field.startsWith('-')) {
          sort[field.substring(1)] = -1;
        } else {
          sort[field] = 1;
        }
      });
    } else {
      sort = { startDate: 1 }; // Default sort by start date
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .select('-__v')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      count: events.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: events
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email phone profileImage');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Only show published events to public or event owner/admin
    if (event.status !== 'published' && 
        (!req.user || (req.user.id !== event.organizer._id.toString() && req.user.role !== 'admin'))) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Get event error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Organizer, Admin)
exports.createEvent = async (req, res, next) => {
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

    // Add user to req.body
    req.body.organizer = req.user.id;

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(file => file.filename);
    }

    const event = await Event.create(req.body);
    
    await event.populate('organizer', 'name email');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Event owner, Admin)
exports.updateEvent = async (req, res, next) => {
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

    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Make sure user is event owner or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.filename);
      req.body.images = event.images ? [...event.images, ...newImages] : newImages;
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('organizer', 'name email');

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    console.error('Update event error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Event owner, Admin)
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Make sure user is event owner or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Delete event error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get events by organizer
// @route   GET /api/events/organizer/me
// @access  Private (Organizer, Admin)
exports.getMyEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const events = await Event.find({ organizer: req.user.id })
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments({ organizer: req.user.id });

    res.status(200).json({
      success: true,
      count: events.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: events
    });
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get event categories
// @route   GET /api/events/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = [
      'Music',
      'Sports',
      'Technology',
      'Business',
      'Arts',
      'Food',
      'Health',
      'Education',
      'Entertainment',
      'Other'
    ];

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Validation rules
exports.createEventValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .isIn(['Music', 'Sports', 'Technology', 'Business', 'Arts', 'Food', 'Health', 'Education', 'Entertainment', 'Other'])
    .withMessage('Please select a valid category'),
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Start date must be in the future');
      }
      return true;
    }),
  body('endDate')
    .isISO8601()
    .withMessage('Please provide a valid end date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('startTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid start time (HH:MM)'),
  body('endTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid end time (HH:MM)'),
  body('venue.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Venue name must be between 2 and 100 characters'),
  body('venue.address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Venue address must be between 5 and 200 characters'),
  body('venue.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('venue.state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('venue.zipCode')
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage('Zip code must be between 5 and 10 characters'),
  body('ticketTypes')
    .isArray({ min: 1 })
    .withMessage('At least one ticket type is required'),
  body('ticketTypes.*.name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Ticket type name must be between 2 and 50 characters'),
  body('ticketTypes.*.price')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Ticket price must be a positive number'),
  body('ticketTypes.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Ticket quantity must be at least 1')
];

exports.updateEventValidation = exports.createEventValidation;
