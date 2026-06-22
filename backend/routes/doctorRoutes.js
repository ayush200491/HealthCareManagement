const express = require('express');
const router = express.Router();
const {
  getApprovedDoctors,
  getDoctorById,
  getSpecializations,
} = require('../controllers/doctorController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getApprovedDoctors);
router.get('/specializations', getSpecializations);
router.get('/:id', getDoctorById);

module.exports = router;
