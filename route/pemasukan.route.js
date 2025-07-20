const express = require('express');
const router = express.Router();
const storingController = require('../controllers/pemasukan.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/', storingController.getAllStoring);
router.post('/', verifyToken, storingController.createStoring);
router.put('/:id', verifyToken, storingController.updateStoring);
router.delete('/:id', verifyToken, storingController.deleteStoring);

module.exports = router;
