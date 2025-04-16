const express = require('express');
const UserController = require('../controllers/userController');
const router = express.Router()

router.get('/', (req, res) => {
    res.send('Route Work!')
})

router.post('/registration', UserController.registration);
router.post('/login', UserController.login);

module.exports = router