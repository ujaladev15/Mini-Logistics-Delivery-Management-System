const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const {
  createOrder, getOrders, getOrder,
  assignDriver, updateStatus, getDriverOrders
} = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a delivery order (Customer only)
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pickup_address, delivery_address]
 *             properties:
 *               pickup_address:
 *                 type: string
 *               delivery_address:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created
 */
router.post('/',
  authenticate,
  authorize('customer'),
  [
    body('pickup_address').trim().notEmpty().withMessage('Pickup address required'),
    body('delivery_address').trim().notEmpty().withMessage('Delivery address required'),
  ],
  validateRequest,
  createOrder
);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get orders list with pagination and filtering
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, assigned, picked, delivered]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated list of orders
 */
router.get('/',
  authenticate,
  authorize('admin', 'customer'),
  [
    query('status').optional().isIn(['pending', 'assigned', 'picked', 'delivered']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validateRequest,
  getOrders
);

/**
 * @swagger
 * /orders/driver/assigned:
 *   get:
 *     summary: Get orders assigned to current driver
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Driver's assigned orders
 */
router.get('/driver/assigned',
  authenticate,
  authorize('driver'),
  getDriverOrders
);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get single order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
router.get('/:id', authenticate, getOrder);

/**
 * @swagger
 * /orders/{id}/assign:
 *   post:
 *     summary: Assign a driver to an order (Admin only)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [driver_id]
 *             properties:
 *               driver_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Driver assigned
 *       400:
 *         description: Order not in pending status
 *       404:
 *         description: Order or driver not found
 */
router.post('/:id/assign',
  authenticate,
  authorize('admin'),
  [body('driver_id').notEmpty().withMessage('Driver ID required')],
  validateRequest,
  assignDriver
);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status (Driver only)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [assigned, picked, delivered]
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid status transition
 */
router.patch('/:id/status',
  authenticate,
  authorize('driver', 'admin'),
  [
    body('status').isIn(['assigned', 'picked', 'delivered']).withMessage('Invalid status value'),
  ],
  validateRequest,
  updateStatus
);

module.exports = router;
