const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
    title:{type:String,required:true},
    projectId: {type: String, required: true},
    tasks: {type: [], default: []}
});

// sectionSchema.index({projectId:1,title:1},{unique:true});

module.exports = mongoose.model('section',sectionSchema);