const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    title:{type:String,required:true,unique:true},
    description:{type: String},
    createdBy: {type: String, required: true},
    createdOn: {type: Date, default: Date.now},
    assignedManagers: {type: [{}], required: true,default:[]},
    assignedEmployees: {type: [{}], required: true,default:[]},
    tasks:{type:[String],default:[],required:true},
    shifts:{type:[String],default:[],required:true},
    teamId:{type:Number,required:true}
})

module.exports = mongoose.model('project',projectSchema);