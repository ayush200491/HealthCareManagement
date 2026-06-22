const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');

// @desc    Get all approved doctors
// @route   GET /api/doctors
// @access  Private (Patients & Admin)
exports.getApprovedDoctors = async (req, res) => {
  try {
    const { specialization, search } = req.query;
    
    // Find all approved doctor profiles
    let query = { status: 'approved' };
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    const approvedProfiles = await DoctorProfile.find(query).populate('user', '-password');
    
    let doctors = approvedProfiles;

    // Optional text search for doctor's name
    if (search) {
      doctors = approvedProfiles.filter(doc => 
        doc.user && doc.user.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Private
exports.getDoctorById = async (req, res) => {
  try {
    const doctorUser = await User.findById(req.params.id).select('-password');
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const profile = await DoctorProfile.findOne({ user: req.params.id });

    res.json({
      success: true,
      data: {
        user: doctorUser,
        profile,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get list of all specializations
// @route   GET /api/doctors/specializations
// @access  Private
exports.getSpecializations = async (req, res) => {
  try {
    const specializations = await DoctorProfile.distinct('specialization', { status: 'approved' });
    res.json({ success: true, data: specializations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
