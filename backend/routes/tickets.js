const express = require('express');
const {
  createTicket,
  getMyTickets,
  getTicket,
  cancelTicket,
  verifyTicket,
  scanTicket,
  getEventTickets,
  createTicketValidation
} = require('../controllers/ticketsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', createTicketValidation, createTicket);
router.get('/my-tickets', getMyTickets);
router.get('/event/:eventId', authorize('organizer', 'admin'), getEventTickets);
router.post('/verify', authorize('organizer', 'admin'), verifyTicket);
router.post('/scan', authorize('organizer', 'admin'), scanTicket);

router
  .route('/:id')
  .get(getTicket);

router.put('/:id/cancel', cancelTicket);

module.exports = router;
