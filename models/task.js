const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title:{type:String,required:true,unique:true},
    description:{type: String},
    createdBy: {type: String, required: true},
    assignedTo: {type: [{name:String,time:Date}], required: true},
    currentSection: {type: String, required: true, default: "To Do"},
    projectId: {type: String, required: true},
    sectionHistory:{type:[{section:String,assignedBy:String,changedOn:Date}],default:[]},
    timeElapsed: {type: Number, default: 0},
    shifts: {type: [String], default: []}
});

module.exports = mongoose.model('task',taskSchema);