const mongoose = require('mongoose');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
    default: () => `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticketType: {
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'used'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    required: function() {
      return this.paymentStatus === 'paid';
    }
  },
  qrCode: {
    type: String // Base64 encoded QR code image
  },
  qrCodeData: {
    type: String,
    unique: true,
    default: uuidv4
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date
  },
  attendeeInfo: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String
    }
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Tickets expire 2 hours after event end time
      return new Date(Date.now() + 2 * 60 * 60 * 1000);
    }
  },
  notes: {
    type: String,
    maxLength: [500, 'Notes cannot exceed 500 characters']
  }
});

// Generate QR Code before saving
ticketSchema.pre('save', async function(next) {
  if (!this.qrCode) {
    try {
      const qrData = {
        ticketNumber: this.ticketNumber,
        eventId: this.event,
        userId: this.user,
        qrCodeData: this.qrCodeData,
        ticketType: this.ticketType.name,
        quantity: this.quantity,
        issuedAt: new Date().toISOString()
      };

      const qrCodeString = JSON.stringify(qrData);
      this.qrCode = await QRCode.toDataURL(qrCodeString, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      next(error);
    }
  }
  next();
});

// Index for efficient queries
ticketSchema.index({ event: 1, user: 1 });
ticketSchema.index({ ticketNumber: 1 });
ticketSchema.index({ qrCodeData: 1 });
ticketSchema.index({ status: 1, paymentStatus: 1 });
ticketSchema.index({ bookingDate: -1 });

// Virtual for ticket validation
ticketSchema.virtual('isValid').get(function() {
  return this.status === 'confirmed' && 
         this.paymentStatus === 'paid' && 
         !this.isUsed && 
         new Date() < this.expiresAt;
});

// Method to mark ticket as used
ticketSchema.methods.markAsUsed = function() {
  this.isUsed = true;
  this.usedAt = new Date();
  this.status = 'used';
  return this.save();
};

// Method to cancel ticket
ticketSchema.methods.cancelTicket = function() {
  this.status = 'cancelled';
  return this.save();
};

// Static method to verify QR code
ticketSchema.statics.verifyQRCode = async function(qrCodeData) {
  try {
    const parsedData = JSON.parse(qrCodeData);
    const ticket = await this.findOne({ 
      qrCodeData: parsedData.qrCodeData,
      ticketNumber: parsedData.ticketNumber 
    }).populate('event user');
    
    if (!ticket) {
      throw new Error('Invalid QR code');
    }
    
    if (ticket.isUsed) {
      throw new Error('Ticket already used');
    }
    
    if (ticket.status !== 'confirmed' || ticket.paymentStatus !== 'paid') {
      throw new Error('Ticket not valid for entry');
    }
    
    if (new Date() > ticket.expiresAt) {
      throw new Error('Ticket expired');
    }
    
    return ticket;
  } catch (error) {
    throw new Error('Invalid or expired QR code');
  }
};

module.exports = mongoose.model('Ticket', ticketSchema);
