const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Teacher name is required'],
    trim: true,
    minlength: [3, 'Teacher name must be at least 3 characters long'],
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other'],
  },
  dob: {
    type: Date,
    required: [true, 'Date of birth is required'],
  },
  contact: {
    type: String,
    required: [true, 'Contact number is required'],
    match: [/^[0-9]{10}$/, 'Invalid contact number format'],
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: [0, 'Salary cannot be negative'],
  },
  assignedClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], // Add required validation
    unique: true, // Keep the unique constraint
    trim: true,
    lowercase: true, // Consider lowercasing email for consistency
    // You can add a regex validation for email format if needed
  },
}, { timestamps: true });

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;