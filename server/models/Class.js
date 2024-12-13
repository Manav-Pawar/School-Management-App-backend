const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true,
    minlength: [3, 'Class name must be at least 3 characters long'],
    maxlength: [50, 'Class name cannot exceed 50 characters'],
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2000, 'Year must be after 2000'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  studentFees: {
    type: Number,
    required: [true, 'Student fees is required'],
    min: [0, 'Student fees cannot be negative'], // Example: Fees cannot be negative
  },
  studentLimit: {
    type: Number,
    default: 30,
    min: [1, 'Student limit must be at least 1'], // Example: Limit should be at least 1
  },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
});

const Class = mongoose.model('Class', classSchema);

module.exports = Class;