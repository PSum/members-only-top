require('dotenv').config();
// express stuff
const express = require('express')
const session = require('express-session')
const app = express()

const jwt = require('jsonwebtoken')
const passport = require('passport');
const cors = require('cors');

const pool = require('./db/pool')
const port = process.env.PORT;



app.use(express.json())
app.use(cors());

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the API'
  });
});

app.post("/login", (req, res) => {
    let { email, password } = req.body;
    //This lookup would normally be done using a database
    if (email === "paul@nanosoft.co.za") {
        if (password === "pass") { //the password compare would normally be done using bcrypt.
            const secret = "SECRET_KEY" //normally stored in process.env.secret
            const token = jwt.sign({ email }, secret, opts);
            return res.status(200).json({
                message: "Auth Passed",
                token
            })
        }
    }
    return res.status(401).json({ message: "Auth Failed" })
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

app.listen(port, () => console.log(`Server has started on port: ${port}`))
