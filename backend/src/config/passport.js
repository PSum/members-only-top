const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');
const pool = require('../db/pool'); // Database connection

// Local Strategy for user login
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (!rows[0]) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    const match = await bcrypt.compare(password, rows[0].password);
    return match ? done(null, rows[0]) : done(null, false, { message: 'Incorrect password.' });
  } catch (err) {
    return done(err);
  }
}));

// JWT Strategy for token authentication
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [jwt_payload.id]);
    return rows[0] ? done(null, rows[0]) : done(null, false);
  } catch (err) {
    return done(err, false);
  }
}));
