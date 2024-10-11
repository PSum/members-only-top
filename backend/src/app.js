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


app.use(express.json())
app.use(cors());

passport.use(new LocalStrategy(
  async (username, password, done) => {
    const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (!rows[0]) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    
    const match = await bcrypt.compare(password, rows[0].password);
    if (match) {
      return done(null, rows[0]); // Authentication successful
    } else {
      return done(null, false, { message: 'Incorrect password.' });
    }
  }
));

app.post("/login", async (req, res) => {
    let { username, password } = req.body;
    //This lookup would normally be done using a database
    const {rows} = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    console.log(rows[0]);
        if (password === rows[0].password) { //the password compare would normally be done using bcrypt.
            const opts = {}
            opts.expiresIn = 120;  //token expires in 2min
            const secret = process.env.SECRETKEY; 
            const token = jwt.sign({ username }, secret, opts);
            return res.status(200).json({
                message: "Auth Passed",
                token
            })
        }
    return res.status(401).json({message: "Invalid username or password"})
});

app.get("/protected", verifyToken , (req, res) => {
    return res.status(200).send("YAY! this is a protected Route")
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

app.listen(port, () => console.log(`Server has started on port: ${port}`))
