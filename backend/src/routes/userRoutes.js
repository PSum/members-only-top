const express = require('express');
const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const passport = require('passport');

const router = express.Router();
const saltRounds = 10;

router.get('/', async (req, res) => {
    try {
        const data = await pool.query(`SELECT * FROM users`)
        res.status(200).send(data.rows)
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

router.get("/protected", passport.authenticate('jwt', {session: false}), (req, res) => {
    res.json({
        message: 'You have accessed the dashboard!',
        user: req.user  // This will be the authenticated user
    });
})

router.post('/addUser', async (req, res) => {
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

 router.get('/setupUser', async (req, res) => {
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

 module.exports = router;