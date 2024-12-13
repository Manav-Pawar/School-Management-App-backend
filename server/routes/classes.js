const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

// Get all classes (with pagination, filtering, and sorting)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, filter, sortBy } = req.query;
    const skip = (page - 1) * limit;

    let query = Class.find();

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

    query = query.populate('teacher', 'name').populate('students', 'name');

    // Pagination
    const total = await Class.countDocuments(query);
    const classes = await query.skip(skip).limit(parseInt(limit));

    res.json({
      classes,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new class
router.post('/', async (req, res) => {
  const classData = req.body;
  try {
    if (classData.teacher) {
      const teacher = await Teacher.findById(classData.teacher);
      if (!teacher) {
        return res.status(400).json({ message: 'Teacher not found' });
      }
    }

    const newClass = new Class(classData);
    const savedClass = await newClass.save();

    // If a teacher is assigned, update the teacher's assignedClass
    if (classData.teacher) {
      await Teacher.findByIdAndUpdate(classData.teacher, { assignedClass: savedClass._id });
    }

    res.status(201).json(savedClass);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a class
router.put('/:id', async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (req.body.teacher) {
      await Teacher.findOneAndUpdate({ assignedClass: req.params.id }, { assignedClass: null });
      await Teacher.findByIdAndUpdate(req.body.teacher, { assignedClass: req.params.id });
    }
    res.json(updatedClass);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a class
router.delete('/:id', async (req, res) => {
  try {
    const classId = req.params.id;

    // Update teacher's assignedClass to null
    const classToDelete = await Class.findById(classId);
    if (classToDelete.teacher) {
      await Teacher.findByIdAndUpdate(classToDelete.teacher, { assignedClass: null });
    }

    // Remove class reference from students
    await Student.updateMany({ class: classId }, { $unset: { class: "" } });

    // Delete the class
    await Class.findByIdAndDelete(classId);

    res.json({ message: 'Class deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get class by ID
router.get('/:id', async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('teacher', 'name')
      .populate('students', 'name');
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(classData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Assign a student to a class
router.post('/:classId/students/:studentId', async (req, res) => {
  try {
    const classId = req.params.classId;
    const studentId = req.params.studentId;

    const classData = await Class.findById(classId);
    const student = await Student.findById(studentId);

    if (!classData || !student) {
      return res.status(404).json({ message: 'Class or student not found' });
    }

    if (classData.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student already assigned to this class' });
    }

    if (classData.studentLimit <= classData.students.length) {
      return res.status(400).json({ message: 'Student limit for this class is reached' });
    }

    classData.students.push(studentId);
    await classData.save();

    student.class = classId;
    await student.save();

    res.json(classData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Remove a student from a class
router.delete('/:classId/students/:studentId', async (req, res) => {
  try {
    const classId = req.params.classId;
    const studentId = req.params.studentId;

    const classData = await Class.findById(classId);
    const student = await Student.findById(studentId);

    if (!classData || !student) {
      return res.status(404).json({ message: 'Class or student not found' });
    }

    if (!classData.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student is not assigned to this class' });
    }

    classData.students = classData.students.filter((id) => id.toString() !== studentId);
    await classData.save();

    student.class = undefined;
    await student.save();

    res.json(classData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;