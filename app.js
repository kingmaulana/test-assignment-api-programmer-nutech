const express = require('express')
const app = express()
const router = require('./routes/')

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(router)

// Specify a port
const port = 3000; // You can choose any port number you like, like 3000, 8080, etc.

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

module.exports = app
