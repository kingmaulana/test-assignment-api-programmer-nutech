require('dotenv').config(); 
const express = require('express')
const app = express()
const router = require('./routes/')

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(router)

// Use environment port or fallback to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

module.exports = app
