const express = require('express');
const router = express.Router()
const UserController = require('../controllers/userController');
const authentication = require('../middlewares/authentication')

router.get('/', (req, res) => {
    res.send('Route Work!')
})

router.post('/registration', UserController.registration);
router.post('/login', UserController.login);

router.use(authentication)
router.get('/profile', UserController.getProfile);

module.exports = router