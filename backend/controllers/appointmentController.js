const Appointment = require('../models/Appointment');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');

// Helper to standardise Date to UTC Start-of-Day (avoid time zone mismatches in uniqueness checks)
const getStartOfDay = (dateString) => {
  const d = new Date(dateString);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, reason } = req.body;

    if (!doctorId || !date || !timeSlot || !reason) {
      return res.status(400).json({ success: false, message: 'Please provide all details' });
    }

    // Verify doctor exists and is approved
    const doctorUser = await User.findById(doctorId);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const doctorProfile = await DoctorProfile.findOne({ user: doctorId });
    if (!doctorProfile || doctorProfile.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Doctor is not currently available for booking' });
    }

    const targetDate = getStartOfDay(date);

    // Check if slot is already occupied for this doctor
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: targetDate,
      timeSlot,
      status: { $ne: 'cancelled' }, // Ignore cancelled appointments
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked for this doctor. Please pick another time slot.',
      });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date: targetDate,
      timeSlot,
      reason,
      status: 'pending',
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's appointments
// @route   GET /api/appointments
// @access  Private
exports.getMyAppointments = async (req, res) => {
  try {
    let query = {};
    let populateField = '';

    if (req.user.role === 'patient') {
      query.patient = req.user._id;
      populateField = 'doctor';
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
      populateField = 'patient';
    } else if (req.user.role === 'admin') {
      // Admin can see all appointments
      populateField = 'doctor patient';
    }

    let appointmentsQuery = Appointment.find(query);
    if (req.user.role === 'admin') {
      appointmentsQuery = appointmentsQuery
        .populate('doctor', 'name email phoneNumber gender')
        .populate('patient', 'name email phoneNumber gender');
    } else {
      appointmentsQuery = appointmentsQuery.populate(populateField, 'name email phoneNumber gender');
    }

    const appointments = await appointmentsQuery.sort({ date: 1, timeSlot: 1 });

    // For doctor details, we can also inject the specialization info
    const populatedData = await Promise.all(
      appointments.map(async (app) => {
        const docObj = app.toObject();
        if (req.user.role === 'patient' && docObj.doctor) {
          const docProfile = await DoctorProfile.findOne({ user: docObj.doctor._id });
          docObj.doctor.specialization = docProfile ? docProfile.specialization : 'General';
        }
        return docObj;
      })
    );

    res.json({ success: true, count: populatedData.length, data: populatedData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel an appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Verify ownership (only patient or assigned doctor or admin can cancel)
    if (
      appointment.patient.toString() !== req.user._id.toString() &&
      appointment.doctor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this appointment' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ success: true, message: 'Appointment successfully cancelled', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment status (Approve / Reject / Complete)
// @route   PUT /api/appointments/:id/status
// @access  Private (Doctor / Admin only)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    if (!['approved', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update' });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Verify permission (only assigned doctor or admin can update status)
    if (appointment.doctor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this appointment' });
    }

    appointment.status = status;
    if (notes) {
      appointment.notes = notes;
    }
    
    await appointment.save();

    res.json({ success: true, message: `Appointment status updated to ${status}`, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
