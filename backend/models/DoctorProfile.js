const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, 'Please provide specialization'],
      trim: true,
    },
    experienceYears: {
      type: Number,
      required: [true, 'Please provide years of experience'],
    },
    consultationFee: {
      type: Number,
      required: [true, 'Please provide consultation fee'],
    },
    bio: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    availableDays: {
      type: [String], // e.g. ["Monday", "Wednesday", "Friday"]
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    availableHours: {
      start: {
        type: String, // e.g., "09:00"
        default: '09:00',
      },
      end: {
        type: String, // e.g., "17:00"
        default: '17:00',
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
