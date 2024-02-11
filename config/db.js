const mongoose = require('mongoose')

const connectDB = async() => {
    //return mongoose.connect(process.env.MONGODB_URL)
    return mongoose.connect("mongodb://127.0.0.1/contacts_data")
  .then(() => console.log("Connection to database established..."))
  .catch((err) => console.error("Error connecting to database:", err));
}; 

module.exports = connectDB;