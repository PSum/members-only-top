require('dotenv').config();
const cors = require('cors');

// express stuff
const express = require('express')
const app = express();
const passport = require('./config/passport');

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

// database stuff
const port = process.env.PORT;

app.use(express.json())
app.use(cors());

app.use('/users', userRoutes);
app.use('/auth', authRoutes);


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




app.listen(port, () => console.log(`Server has started on port: ${port}`))
