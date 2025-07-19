const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, userController.getAllUsers);
router.post('/', verifyToken, userController.createUser);
router.put('/:id', verifyToken, userController.updateUser);
router.delete('/:id', verifyToken, userController.deleteUser);
router.put('/:id/status', verifyToken, userController.updateStatus);
router.post('/login', userController.login);

module.exports = router;
