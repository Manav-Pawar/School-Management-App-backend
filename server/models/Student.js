const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    minlength: [3, 'Student name must be at least 3 characters long'],
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other'], // Restricting to specific values
  },
  dob: {
    type: Date,
    required: [true, 'Date of birth is required'],
  },
  contact: {
    type: String,
    required: [true, 'Contact number is required'],
    match: [/^[0-9]{10}$/, 'Invalid contact number format'], // Example using regex
  },
  feesPaid: {
    type: Number,
    required: [true, 'Fees paid is required'],
    min: [0, 'Fees paid cannot be negative'],
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  },
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;