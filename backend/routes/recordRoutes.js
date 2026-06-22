const express = require('express');
const router = express.Router();
const {
  createMedicalRecord,
  getMyAppRecords,
} = require('../controllers/recordController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .post(authorize('doctor'), createMedicalRecord)
  .get(getMyAppRecords);

module.exports = router;
