const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
    title:{type:String,required:true,unique:true},
})

module.exports = mongoose.model('section',sectionSchema);