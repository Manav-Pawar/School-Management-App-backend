const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Class = require('../models/Class');
// Get all students (with pagination, filtering, and sorting)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, filter, sortBy, includeClass } = req.query;
    const skip = (page - 1) * limit;

    let query = Student.find();

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

    if (includeClass) {
      query = query.populate('class');
    }

    // Pagination
    const total = await Student.countDocuments(query);
    const students = await query.skip(skip).limit(parseInt(limit));

    res.json({
      students,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new student
router.post('/', async (req, res) => {
  const student = new Student({
    name: req.body.name,
    gender: req.body.gender,
    dob: req.body.dob,
    contact: req.body.contact,
    feesPaid: req.body.feesPaid,
  });

  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a student
router.put('/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a student
router.delete('/:id', async (req, res) => {
  try {
    const studentId = req.params.id;

    // Find the student to be deleted
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if the student is assigned to a class
    if (student.class) {
      // Remove the student from the class
      const classData = await Class.findById(student.class);
      if (classData) {
        classData.students = classData.students.filter((id) => id.toString() !== studentId);
        await classData.save();
      }
    }

    // Delete the student
    await Student.findByIdAndDelete(studentId);

    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Assign a class to a student
router.post('/:studentId/assign-class', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { classId } = req.body; // Get classId from request body

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const classToAssign = await Class.findById(classId);
    if (!classToAssign) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if the student is already assigned to a class
    if (student.class) {
      // Unassign from the current class
      const currentClass = await Class.findById(student.class);
      if (currentClass) {
        currentClass.students.pull(studentId);
        await currentClass.save();
      }
    }

    // Assign the new class to the student
    student.class = classId;
    await student.save();

    // Add the student to the new class
    classToAssign.students.push(studentId);
    await classToAssign.save();

    res.status(200).json({ message: 'Class assigned to student successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Unassign a class from a student
router.post('/:studentId/unassign-class', async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Remove the student from the current class's students array
    if (student.class) {
      const currentClass = await Class.findById(student.class);
      if (currentClass) {
        currentClass.students.pull(studentId); // Use pull to remove
        await currentClass.save();
      }
    }

    // Unassign the class from the student
    student.class = undefined;
    await student.save();

    res.status(200).json({ message: 'Class unassigned from student successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;