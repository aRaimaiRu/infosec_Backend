require('dotenv').config();
const express = require('express');
const cors = require("cors");
const pool = require('./db');
const user = require('./routes/auth');
const errorHelpers = require('./middlewares/error-handler');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use("/api/user",user);


// here we expose an endpoint "persons"
app.get('/persons', async (req, res) => {
    let conn;
    try {
        // here we make a connection to MariaDB
        conn = await pool.getConnection();

        // create a new query to fetch all records from the table
        var query = "select * from members";

        // we run the query and set the result to a new variable
        var rows = await conn.query(query);

        // return the results
        res.send(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) return conn.release();
    }
});
app.get("/",async(req,res)=>{
    res.status(200).send("sucess")

})
app.use(errorHelpers);

const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 3002;
app.listen(port, () => console.log(`Listening on port ${port}`));