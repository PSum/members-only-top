require('dotenv').config();
// express stuff
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser');
const app = express()

const jwt = require('jsonwebtoken')
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cors = require('cors');

const pool = require('./db/pool')

const databaseName = "membersOnly"
const port = process.env.PORT;



app.use(express.json())
app.use(cors());
app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
      const user = rows[0];

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      if (user.password !== password) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch(err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    const user = rows[0];

    done(null, user);
  } catch(err) {
    done(err);
  }
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the API'
  });
});

app.post('/api/posts', verifyToken, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {
      res.json({
        message: 'Post created!',
        authData
      });
    }
  })
});

app.post('/api/login', (req, res) => {
  // Do authentication here with database and get user back from database
  // Mock user
  const user = {
    id: 1,
    username: 'Mike',
    email: 'mike@gmail.com',
  }

  jwt.sign({user: user}, 'secretkey', { expiresIn: '1h' },(err, token) => {
    res.json({
      // Save this token in react in local storage and send it with the requests of the client
      token: token
    });
  });
});


app.post("/log-in", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: "Server error", error: err });
    }
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Log in the user
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: "Login failed", error: err });
      }
      return res.status(200).json({ message: "Login successful", user });
    });
  })(req, res, next);
});


app.get('/', async (req, res) => {
    try {
        const data = await pool.query(`SELECT * FROM ${databaseName}`)
        res.status(200).send(data.rows)
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})


app.post('/addUser', async (req, res) => {
    const {fullname, username, password, membership} = req.body
    try {
        await pool.query(`INSERT INTO users (fullname, username, password, membership) VALUES ($1, $2, $3, $4)`, [fullname, username, password, membership])
        res.status(200).send({ message: "Successfully added child" })
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})


app.get('/setupUser', async (req, res) => {
    try {
        await pool.query(
          `CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, fullname VARCHAR(100), username VARCHAR(100), password VARCHAR(100), memebership VARCHAR(100))`
        );
        res.status(200).send({ message: "Successfully created table" });
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})


app.get('/setupPosts', async (req, res) => {
    try {
        await pool.query(
          `CREATE TABLE IF NOT EXISTS posts (id SERIAL PRIMARY KEY, timestamp VARCHAR(100), title VARCHAR(100), message VARCHAR(400),  username VARCHAR(100))`
        );
        res.status(200).send({ message: "Successfully created table" });
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

app.get("/deleteAll", async (req,res) => {
    try{
        await pool.query(
            `DELETE FROM ${databaseName}`
        );
        res.status(200).send({
            message: "Sucessfully deleted all the content"
        });
    } catch (err){
        console.log(err);
        res.sendStatus(500);
    }
})

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

app.listen(port, () => console.log(`Server has started on port: ${port}`))
