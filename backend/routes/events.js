const express = require('express');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getCategories,
  createEventValidation,
  updateEventValidation
} = require('../controllers/eventsController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { uploadMultiple, handleUploadError } = require('../utils/upload');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getEvents);
router.get('/categories', getCategories);
router.get('/:id', optionalAuth, getEvent);

// Protected routes
router.use(protect);

router
  .route('/')
  .post(
    authorize('organizer', 'admin'),
    uploadMultiple('eventImages', 5),
    handleUploadError,
    createEventValidation,
    createEvent
  );

router
  .route('/:id')
  .put(
    uploadMultiple('eventImages', 5),
    handleUploadError,
    updateEventValidation,
    updateEvent
  )
  .delete(deleteEvent);

router.get('/organizer/me', authorize('organizer', 'admin'), getMyEvents);

module.exports = router;
