const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
    title:{type:String,required:true,unique:true},
    projectId: {type: String, required: true},
    tasks: {type: [String], default: []}
});

sectionSchema.index({title:1,projectId:1},{unique:true});

module.exports = mongoose.model('section',sectionSchema);