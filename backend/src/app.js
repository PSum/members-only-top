require('dotenv').config();
const cors = require('cors');

// express stuff
const express = require('express')
const session = require('express-session')
const app = express()

// jwt stuff
const jwt = require('jsonwebtoken')

// passport stuff
const passport = require('passport');
const LocalStrategy = require('passport-local');

// database stuff
const pool = require('./db/pool')
const port = process.env.PORT;
const saltRounds = 10;
const bcrypt = require('bcrypt');

app.use(express.json())
app.use(cors());

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

app.post('/login', (req, res, next) => {
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

app.get("/protected", passport.authenticate('jwt', {session: false}), (req, res) => {
    res.json({
        message: 'You have accessed the dashboard!',
        user: req.user  // This will be the authenticated user
    });
})

app.get('/', async (req, res) => {
    try {
        const data = await pool.query(`SELECT * FROM users`)
        res.status(200).send(data.rows)
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

app.post('/addUser', async (req, res) => {
    const { fullname, username, password, membership } = req.body;

    try {
        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user into the database with the hashed password
        await pool.query(`INSERT INTO users (fullname, username, password, membership) VALUES ($1, $2, $3, $4)`, [fullname, username, hashedPassword, membership]);

        res.status(200).send({ message: "User successfully added" });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

 app.get('/setupUser', async (req, res) => {
     try {
         await pool.query(
           `CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, fullname VARCHAR(100), username VARCHAR(100), password VARCHAR(100), membership VARCHAR(100))`
         );
         res.status(200).send({ message: "Successfully created table" });
     } catch (err) {
         console.log(err)
         res.sendStatus(500)
     }
 })
// 
// 
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

// Verfigy Token
function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers['authorization'];
  // Check if bearer is undefined
  if(typeof bearerHeader !== 'undefined') {
    // Split at the space
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token
    req.token = bearerToken;
    // Next middleware
    next();
  } else {
    // Forbidden
    res.sendStatus(403);
  }
}

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
