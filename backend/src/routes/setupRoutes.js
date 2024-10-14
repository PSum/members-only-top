const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

 router.get('/Users', async (req, res) => {
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


router.get('/Posts', async (req, res) => {
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

module.exports = router;