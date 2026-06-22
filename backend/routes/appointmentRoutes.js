const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .post(authorize('patient'), bookAppointment)
  .get(getMyAppointments);

router.put('/:id/cancel', cancelAppointment);
router.put('/:id/status', authorize('doctor', 'admin'), updateAppointmentStatus);

module.exports = router;
