const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema({
    title:{type:String,required:true,unique:true},
    date: {type:Date, required:true},
    startTime: {type: Date, required: true},
    description: String,
    endTime: {type: Date, required:true},
    location: String,
    completed: {type: Boolean, default: false},
    createdBy: {type: String, required: true},
    assignedTo: {type: String, required: true},
    assignedToTask: String,
    projectId: {type: String, required: true}
});

module.exports = mongoose.model('shift',shiftSchema);