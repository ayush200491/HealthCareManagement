const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Please select a date for the appointment'],
    },
    timeSlot: {
      type: String, // e.g., "10:00 AM", "02:30 PM"
      required: [true, 'Please select a time slot'],
    },
    reason: {
      type: String,
      required: [true, 'Please state the reason for appointment'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'cancelled', 'completed'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent double bookings for the same doctor at the same date and time slot
appointmentSchema.index({ doctor: 1, date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
