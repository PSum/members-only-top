const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');
const pool = require('../db/pool');

passport.use(new LocalStrategy(
  async (username, password, done) => {
    const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (!rows[0]) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    
    const match = await bcrypt.compare(password, rows[0].password);
    console.log(match);
    if (match) {
      return done(null, rows[0]); // Authentication successful
    } else {
      return done(null, false, { message: 'Incorrect password.' });
    }
  }
));

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT from the Authorization header
    secretOrKey: process.env.JWT_SECRET // Your secret key
};

// Configure the Passport JWT strategy
passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [jwt_payload.id]);
        if (!rows[0]) {
            return done(null, false);
        }

        // If user exists, pass it to the request
        return done(null, rows[0]);
    } catch (err) {
        return done(err, false);
    }
}));

module.exports = passport;