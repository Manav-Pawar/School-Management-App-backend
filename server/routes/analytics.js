const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

// Get class analytics
router.get('/class/:classId', async (req, res) => {
  try {
    const classId = req.params.classId;
    const classData = await Class.findById(classId)
      .populate('teacher', 'name') // Populate teacher and only include the 'name' field
      .populate('students', 'name gender'); // Populate students and include 'name' and 'gender'

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Calculate the number of male and female students
    const maleStudents = classData.students.filter(student => student.gender === 'Male').length;
    const femaleStudents = classData.students.filter(student => student.gender === 'Female').length;

    const analytics = {
      class: { // Include class details in the response 
        name: classData.name,
        year: classData.year,
        teacher: classData.teacher,
        students: classData.students,
      },
      genderDistribution: {
        male: maleStudents,
        female: femaleStudents,
      },
    };

    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get financial analytics
router.get('/financials', async (req, res) => {
  try {
    const { type, year, month } = req.query;

    let startDate, endDate;
    if (type === 'yearly') {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
    } else { // type === 'monthly'
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0); // Set end date to last day of the month
    }

    // Use createdAt field for filtering based on date range
    const totalSalaryExpense = await Teacher.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate } // Correctly filter by createdAt
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$salary' }
        }
      }
    ]);

    const totalFeesIncome = await Student.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate } // Correctly filter by createdAt
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$feesPaid' }
        }
      }
    ]);

    res.json({
      expenses: totalSalaryExpense.length > 0 ? totalSalaryExpense[0].total : 0,
      income: totalFeesIncome.length > 0 ? totalFeesIncome[0].total : 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;