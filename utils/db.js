const mongoose = require("mongoose");
const {db_string} = require("./config");
const db = async () => {
    await mongoose.connect(db_string)
    console.log("MongoDB Connected")
}
module.exports = db;