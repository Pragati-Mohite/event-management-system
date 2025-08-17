const express = require('express');
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  logout,
  registerValidation,
  loginValidation,
  updateDetailsValidation
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetailsValidation, updateDetails);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;
