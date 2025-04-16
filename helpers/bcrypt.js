
const bcrypt = require('bcryptjs')

function hashPassword(pass) {
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(pass, salt)
    return hash
}

function comparePassword(pass, hashPassword) {
    return bcrypt.compareSync(pass, hashPassword)
}

module.exports = {
    hashPassword,
    comparePassword
}