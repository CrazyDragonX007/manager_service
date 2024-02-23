const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    title:{type:String,required:true,unique:true},
    description:{type: String},
    createdBy: {type: String, required: true},
    createdOn: {type: Date, default: Date.now},
    assignedManagers: {type: [String], required: true}, // user's email goes here
    assignedEmployees: {type: [String], required: true,default:[]}, // user's email goes here
    tasks:{type:[String],default:[],required:true},
    shifts:{type:[String],default:[],required:true}
})

module.exports = mongoose.model('project',projectSchema);