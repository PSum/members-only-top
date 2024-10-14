require('dotenv').config();
const cors = require('cors');

// express stuff
const express = require('express')
const app = express();
const passport = require('./config/passport');

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const setupRoutes = require('./routes/setupRoutes');

// database stuff
const port = process.env.PORT;

app.use(express.json())
app.use(cors());

app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/setup', setupRoutes);


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
