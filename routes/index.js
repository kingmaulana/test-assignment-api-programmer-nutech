const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.send('Route Work!')
})

router.post('/register', (req, res) => { 
    res.send('Received registration data')
})

module.exports = router