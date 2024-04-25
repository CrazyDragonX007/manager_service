const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title:{type:String,required:true,unique:true},
    description:{type: String},
    createdOn: {type: Date, default: Date.now},
    createdBy: {type: String, required: true},
    assignedToHistory: {type: [{name:String,time:Date}], required: true},
    assignedTo: {type: String, required: true},
    currentSection: {type: String, required: true},
    projectId: {type: String, required: true},
    sectionHistory:{type:[{section:String,assignedBy:String,changedOn:Date}],default:[]},
    timeElapsed: {type: Number, default: 0},
    shifts: {type: [String], default: []}
});

module.exports = mongoose.model('task',taskSchema);