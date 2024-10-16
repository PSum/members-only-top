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

router.get("/posts", passport.authenticate('jwt', {session: false}), async (req, res) => {
    try {
        const data = await pool.query('SELECT * FROM posts')
        res.status(200).send(data.rows)
    } catch (err) {
        console.log(err);
        res.json(500).send({message: err});
    }
})

router.post('/addUser', async (req, res) => {
    const { fullname, username, password, passcode } = req.body;
    try {
        if (passcode ===process.env.PASSCODE){
        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const membership = 'admin';

        // Insert user into the database with the hashed password
        await pool.query(`INSERT INTO users (fullname, username, password, membership) VALUES ($1, $2, $3, $4)`, [fullname, username, hashedPassword, membership]);

        res.status(200).send({ message: `User successfully added` });
        } else {
            res.status(403).send({ message: 'Wrong passcode provided'})
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: err});
    }
})


 
router.post('/addPost', async (req, res) => {
    const {timestamp, title, message, username} = req.body;

    try {
        await pool.query(`INSERT INTO posts (timestamp, title, message, username) VALUES ($1, $2, $3, $4)`, [timestamp, title, message, username]);
        res.status(200).send({message: 'Post successfully added!'});
    } catch (err) {
        console.log(err)
        res.json(500).send({message: err});
    }
})


 module.exports = router;