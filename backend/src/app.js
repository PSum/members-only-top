require('dotenv').config();
const cors = require('cors');

// express stuff
const express = require('express')
const app = express()

// jwt stuff
const jwt = require('jsonwebtoken')

// passport stuff
const passport = require('passport');
const LocalStrategy = require('passport-local');

const userRoutes = require('./routes/userRoutes')
const authRoutes = require('./routes/authRoutes')

// database stuff
const pool = require('./db/pool')
const port = process.env.PORT;
const bcrypt = require('bcrypt');

app.use(express.json())
app.use(cors());

app.use('/users', userRoutes);
app.use('/auth', authRoutes);

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

// app.get('/setupPosts', async (req, res) => {
//     try {
//         await pool.query(
//           `CREATE TABLE IF NOT EXISTS posts (id SERIAL PRIMARY KEY, timestamp VARCHAR(100), title VARCHAR(100), message VARCHAR(400),  username VARCHAR(100))`
//         );
//         res.status(200).send({ message: "Successfully created table" });
//     } catch (err) {
//         console.log(err)
//         res.sendStatus(500)
//     }
// })
// 
// app.get("/deleteAll", async (req,res) => {
//     try{
//         await pool.query(
//             `DELETE FROM ${databaseName}`
//         );
//         res.status(200).send({
//             message: "Sucessfully deleted all the content"
//         });
//     } catch (err){
//         console.log(err);
//         res.sendStatus(500);
//     }
// })


const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

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


app.listen(port, () => console.log(`Server has started on port: ${port}`))
