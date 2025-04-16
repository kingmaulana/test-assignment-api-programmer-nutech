const express = require('express')
const router = express.Router()
const UserController = require('../controllers/userController')

router.get('/', (req, res) => {
    res.send('Route Work!')
})

router.post('/registration', UserController.registration);

module.exports = router