const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey12345', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phoneNumber,
      gender,
      dob,
      specialization,
      experienceYears,
      consultationFee,
      bio,
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create base user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
      phoneNumber,
      gender,
      dob,
    });

    let doctorProfile = null;

    // If user registers as a doctor, create their profile (pending status)
    if (user.role === 'doctor') {
      if (!specialization || !experienceYears || !consultationFee) {
        // Cleanup created user if doctor details are missing
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          success: false,
          message: 'Doctors must provide specialization, experience years, and consultation fee',
        });
      }

      doctorProfile = await DoctorProfile.create({
        user: user._id,
        specialization,
        experienceYears,
        consultationFee,
        bio,
        status: 'pending', // Requires admin approval
      });
    }

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
          doctorProfile: doctorProfile,
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await DoctorProfile.findOne({ user: user._id });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        dob: user.dob,
        token: generateToken(user._id),
        doctorProfile,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      let doctorProfile = null;
      if (user.role === 'doctor') {
        doctorProfile = await DoctorProfile.findOne({ user: user._id });
      }

      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phoneNumber: user.phoneNumber,
          gender: user.gender,
          dob: user.dob,
          doctorProfile,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
      user.gender = req.body.gender || user.gender;
      user.dob = req.body.dob || user.dob;
      user.profileCompleted = true;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      let doctorProfile = null;
      if (user.role === 'doctor') {
        doctorProfile = await DoctorProfile.findOne({ user: user._id });
        if (doctorProfile) {
          doctorProfile.specialization = req.body.specialization || doctorProfile.specialization;
          doctorProfile.experienceYears = req.body.experienceYears || doctorProfile.experienceYears;
          doctorProfile.consultationFee = req.body.consultationFee || doctorProfile.consultationFee;
          doctorProfile.bio = req.body.bio || doctorProfile.bio;
          if (req.body.availableDays) {
            doctorProfile.availableDays = req.body.availableDays;
          }
          if (req.body.availableHours) {
            doctorProfile.availableHours = req.body.availableHours;
          }
          await doctorProfile.save();
        }
      }

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          phoneNumber: updatedUser.phoneNumber,
          gender: updatedUser.gender,
          dob: updatedUser.dob,
          doctorProfile,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
