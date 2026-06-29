const express = require('express');
const router = express.Router();
const {
  bookAppointment, getClientAppointments, getVendorAppointments,
  updateAppointmentStatus, clientRescheduleOrCancel, checkAvailability, getDashboardStats
} = require('../controllers/appointmentController');
const auth = require('../middleware/auth');

router.post('/book', bookAppointment);
router.get('/client', getClientAppointments);
router.get('/availability', checkAvailability);
router.patch('/client/:booking_id', clientRescheduleOrCancel);

router.get('/vendor', auth, getVendorAppointments);
router.patch('/vendor/:id', auth, updateAppointmentStatus);
router.get('/dashboard', auth, getDashboardStats);

module.exports = router;
