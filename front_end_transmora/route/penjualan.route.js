const express = require('express');
const router = express.Router();
const salesController = require('../controllers/penjualan.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/', salesController.getAllSales);
router.post('/', verifyToken, salesController.createSales);
router.put('/:id', verifyToken, salesController.updateSales);
router.delete('/:id', verifyToken, salesController.deleteSales);

module.exports = router;
