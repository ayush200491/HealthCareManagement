const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');

// @desc    Create a medical record and prescription (Completed Consultation)
// @route   POST /api/records
// @access  Private (Doctor only)
exports.createMedicalRecord = async (req, res) => {
  try {
    const { appointmentId, diagnoses, prescribedMedicines, notes } = req.body;

    if (!appointmentId || !diagnoses) {
      return res.status(400).json({ success: false, message: 'Please provide appointment ID and diagnosis info' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Verify requesting doctor matches the appointment doctor
    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to consult on this appointment' });
    }

    // Create medical record
    const record = await MedicalRecord.create({
      patient: appointment.patient,
      doctor: req.user._id,
      appointment: appointmentId,
      diagnoses,
      prescribedMedicines: prescribedMedicines || [],
      notes,
    });

    // Mark appointment status as completed
    appointment.status = 'completed';
    await appointment.save();

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's medical records
// @route   GET /api/records
// @access  Private (Patient and Doctor)
exports.getMyAppRecords = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    const records = await MedicalRecord.find(query)
      .populate('doctor', 'name email phoneNumber')
      .populate('patient', 'name email phoneNumber gender dob')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
