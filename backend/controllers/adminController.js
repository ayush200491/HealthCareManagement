const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');

// @desc    Get dashboard metrics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAppointments = await Appointment.countDocuments();
    
    // Revenue calculations (Sum of consultation fees for completed appointments)
    const completedAppointments = await Appointment.find({ status: 'completed' });
    let totalRevenue = 0;
    
    for (const app of completedAppointments) {
      const docProfile = await DoctorProfile.findOne({ user: app.doctor });
      if (docProfile) {
        totalRevenue += docProfile.consultationFee;
      }
    }

    res.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get list of doctors (all statuses)
// @route   GET /api/admin/doctors
// @access  Private (Admin only)
exports.getAllDoctors = async (req, res) => {
  try {
    const profiles = await DoctorProfile.find().populate('user', '-password');
    res.json({ success: true, data: profiles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or reject doctor profile
// @route   PUT /api/admin/doctors/:id/approve
// @access  Private (Admin only)
exports.updateDoctorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status parameter' });
    }

    const profile = await DoctorProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    profile.status = status;
    await profile.save();

    res.json({ success: true, message: `Doctor profile status updated to ${status}`, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
