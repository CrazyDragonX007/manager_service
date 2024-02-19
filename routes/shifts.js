const shift = require("../models/shift");
const express = require("express")
const router = express.Router();
const {managerOrAdminAuth} = require("../utils/auth");
const project = require("../models/project");
const task = require("../models/task");

router.post("/create",managerOrAdminAuth, (req, res) => {
    const {title,description,startTime,endTime,date,location,createdBy,assignedTo,projectId,assignedToTask} = req.body;
    shift.create({
            title,
            description,
            createdBy,
            assignedTo,
            projectId,
            date,
            startTime,
            endTime,
            location,
            assignedToTask
    }).then(stf =>{
        project.findById(projectId).then(p => {
            const shifts = p.shifts;
            console.log(p);
            shifts.push(stf._id);
            p.shifts = shifts;
            p.save().then(() => {
                task.findByIdAndUpdate(assignedToTask,{$push:{"shifts":stf._id}}).catch(err=>console.log(err));
                res.status(200).json({message: "Shift successfully created", shift: stf})
            }).catch(err => {
                console.log(err);
                shift.findByIdAndDelete(stf._id);
                res.status(400).json({message: "Shift not successfully created", error: err.message});
            });
        }).catch(err=>console.log(err));
    }).catch(err=>{
        res.status(400).json({message: "Shift not successfully created", error: err.message});
    })
})

router.put("/change_task",managerOrAdminAuth, (req, res) => {
    const {id, assignedToTask} = req.body;
    if(!assignedToTask) return res.status(400).json({message: "No task provided"});
    shift.findById(id).then(shift=>{
        const oldTask = shift.assignedToTask;
        shift.assignedToTask = assignedToTask;
        shift.save().then(shift => {
            task.findByIdAndUpdate(assignedToTask,{$push:{"shifts":shift._id}}).catch(err=>console.log(err));
            task.findByIdAndUpdate(oldTask,{$pull:{"shifts":shift._id}}).catch(err=>console.log(err));
            res.status(200).json({message: "Task successfully changed", shift})
        }).catch (err=>{
            res.status(400).json({message: "Task could not be changed", error: err.message,})
        })
    })
});

router.put("/edit",managerOrAdminAuth, (req, res) => {
    const {id,title,description,startTime,endTime,date,location,assignedTo,projectTitle} = req.body;
    shift.findById(id).then(s=>{
        if(s.startTime < Date.now()) return res.status(400).json({message: "Shift has already started"});
        if(title) s.title = title;
        if(description) s.description = description;
        if(startTime) s.startTime = startTime;
        if(endTime) s.endTime = endTime;
        if(date) s.date = date;
        if(location) s.location = location;
        if(assignedTo) s.assignedTo = assignedTo;
        if(projectTitle) s.projectTitle = projectTitle;
        s.save().then(sft =>
            res.status(200).json({message: "Shift successfully edited", shift: sft})
        ).catch (err=>{
            res.status(400).json({message: "Shift not successful edited", error: err.message,})
        })
    })
})

//TODO: Add get shifts route
//TODO: Add delete shift route

module.exports = router;