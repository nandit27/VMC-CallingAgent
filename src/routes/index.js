// Main route aggregator - combines all module routes

const express = require('express');
const router = express.Router();

const telephonyRoutes = require('./telephony');
const healthRoutes = require('./health');
const complaintsRoutes = require('./complaints');

// Mount routes
router.use('/telephony', telephonyRoutes);
router.use('/health', healthRoutes);
router.use('/complaints', complaintsRoutes);

module.exports = router;
