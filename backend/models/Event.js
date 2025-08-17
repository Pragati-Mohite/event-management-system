const mongoose = require('mongoose');

const ticketTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ticket type name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Ticket price is required'],
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Ticket quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  sold: {
    type: Number,
    default: 0,
    min: [0, 'Sold tickets cannot be negative']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [200, 'Description cannot be longer than 200 characters']
  }
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxLength: [100, 'Title cannot be longer than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxLength: [2000, 'Description cannot be longer than 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: [
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
    ]
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required']
  },
  venue: {
    name: {
      type: String,
      required: [true, 'Venue name is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Venue address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required'],
      trim: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  ticketTypes: [ticketTypeSchema],
  images: [{
    type: String
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  meetingLink: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  maxAttendees: {
    type: Number,
    min: [1, 'Maximum attendees must be at least 1']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total available tickets
eventSchema.virtual('totalTickets').get(function() {
  return this.ticketTypes.reduce((total, ticket) => total + ticket.quantity, 0);
});

// Calculate total sold tickets
eventSchema.virtual('totalSold').get(function() {
  return this.ticketTypes.reduce((total, ticket) => total + ticket.sold, 0);
});

// Calculate available tickets
eventSchema.virtual('availableTickets').get(function() {
  return this.totalTickets - this.totalSold;
});

// Validate dates
eventSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    next(new Error('End date must be after start date'));
  }
  
  if (this.startDate < new Date()) {
    next(new Error('Event date cannot be in the past'));
  }
  
  this.updatedAt = Date.now();
  next();
});

// Index for efficient searching
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ category: 1, startDate: 1 });
eventSchema.index({ 'venue.city': 1, 'venue.state': 1 });
eventSchema.index({ organizer: 1 });

module.exports = mongoose.model('Event', eventSchema);
