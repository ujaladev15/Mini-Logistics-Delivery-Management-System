const express = require('express');
const router = express.Router();
const { getUsers, getDrivers, getStats } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [customer, driver, admin]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', authenticate, authorize('admin'), getUsers);

/**
 * @swagger
 * /users/drivers:
 *   get:
 *     summary: Get all drivers (Admin only)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of drivers
 */
router.get('/drivers', authenticate, authorize('admin'), getDrivers);

/**
 * @swagger
 * /users/stats:
 *   get:
 *     summary: Get system statistics (Admin only)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: System stats
 */
router.get('/stats', authenticate, authorize('admin'), getStats);

module.exports = router;
