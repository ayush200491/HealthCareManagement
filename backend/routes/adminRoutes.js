const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllDoctors,
  updateDoctorStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/doctors', getAllDoctors);
router.put('/doctors/:id/approve', updateDoctorStatus);

module.exports = router;
