const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
// Get all teachers (with pagination, filtering, and sorting)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, filter, sortBy } = req.query;
    const skip = (page - 1) * limit;

    let query = Teacher.find();

    // Filtering
    if (filter) {
      query = query.where('name', new RegExp(filter, 'i')); // Case-insensitive name filtering
    }

    // Sorting
    if (sortBy) {
      const sortOrder = sortBy.startsWith('-') ? -1 : 1;
      const sortField = sortBy.startsWith('-') ? sortBy.slice(1) : sortBy;
      query = query.sort({ [sortField]: sortOrder });
    }

    // Pagination
    const total = await Teacher.countDocuments(query);
    const teachers = await query.skip(skip).limit(parseInt(limit));

    res.json({
      teachers,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new teacher
router.post('/', async (req, res) => {
  const teacher = new Teacher({
    name: req.body.name,
    gender: req.body.gender,
    dob: req.body.dob,
    contact: req.body.contact,
    salary: req.body.salary,
    email: req.body.email,
  });

  try {
    const newTeacher = await teacher.save();
    res.status(201).json(newTeacher);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a teacher
router.put('/:id', async (req, res) => {
  try {
    const updatedTeacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTeacher);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a teacher
router.delete('/:id', async (req, res) => {
  try {
    const teacherId = req.params.id;

    // Find the teacher to be deleted
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Check if the teacher is assigned to a class
    if (teacher.assignedClass) {
      return res.status(400).json({ message: 'Cannot delete teacher assigned to a class' });
    }

    // Delete the teacher
    await Teacher.findByIdAndDelete(teacherId);

    res.json({ message: 'Teacher deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get teacher by ID
router.get('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;