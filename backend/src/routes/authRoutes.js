const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const router = express.Router();

router.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(401).json({
                message: info ? info.message : 'Login failed',
                user   : user
            });
        }

        // Generate a JWT if authentication was successful
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Respond with the token and user info
        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                membership: user.membership
            }
        });
    })(req, res, next);
});

module.exports = router;