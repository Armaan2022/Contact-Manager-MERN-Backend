require("dotenv").config({ path: "./config/config.env" });
const express = require('express')
const morgan = require('morgan');
const connectDB = require('./config/db');
const auth = require("./middlewares/auth")

const app = express();

//middlewares
app.use(express.json());
app.use(morgan("tiny"))
app.use(require("cors")());

//routes
app.get("/protected", auth, (req, res) => {
    return res.status(200).json({...req.user._doc});
})
app.use("/api", require("./routes/auth"))
app.use("/api", require("./routes/contact"))

//configs
const PORT = process.env.PORT || 5000;
app.listen(PORT, async ()=>{
    try {
        await connectDB();
        console.log(`App listening on http://localhost:${PORT}`)
    } catch(err) {
        console.log(err);
    }
})