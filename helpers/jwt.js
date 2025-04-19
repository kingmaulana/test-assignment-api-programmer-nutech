const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET;
if (!secret) {
    console.error('JWT_SECRET is not defined in environment variables');
    process.exit(1);
}

function signToken(payload) {
    try {
        return jwt.sign({ email: payload }, secret, { expiresIn: '24h' });
    } catch (error) {
        console.error('Error signing token:', error);
        throw new Error('Failed to generate token');
    }
}

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, secret);
        return decoded.email;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token has expired');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        }
        throw error;
    }
}

module.exports = { 
    signToken, 
    verifyToken
};
