const express = require('express');
const router = express.Router();
const productController = require('../controllers/produk.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/', productController.getAllProduct);
router.post('/', verifyToken, productController.createProduct);
router.put('/:id', verifyToken, productController.updateProduct);
router.delete('/:id', verifyToken, productController.deleteProduct);

module.exports = router;
