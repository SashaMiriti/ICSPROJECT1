// File: backend/routes/matchingRoutes.js

const express = require('express');
const router = express.Router();
const { matchCaregivers } = require('../controllers/matchingController');

// POST endpoint for matching caregivers
router.post('/', matchCaregivers);

module.exports = router;
