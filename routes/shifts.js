const shift = require("../models/shift");
const express = require("express")
const router = express.Router();
const {managerOrAdminAuth, getEmailFromToken} = require("../utils/auth");
const project = require("../models/project");
const task = require("../models/task");

router.post("/create",managerOrAdminAuth, (req, res) => {
    const {title,description,start,end,date,location,createdBy,assignedTo,projectId,assignedToTask} = req.body;
    shift.create({
            title,
            description,
            createdBy,
            assignedTo,
            projectId,
            date,
            start,
            end,
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
    const {id,title,description,start,end,date,location,assignedTo,projectTitle} = req.body;
    shift.findById(id).then(s=>{
        if(s.start < Date.now()) return res.status(400).json({message: "Shift has already started"});
        if(title) s.title = title;
        if(description) s.description = description;
        if(start) s.start = start;
        if(end) s.end = end;
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

router.get("/all_shifts",managerOrAdminAuth, (req,res)=>{
    shift.find({projectId: req.query.projectId}).then(shifts=>{
        res.status(200).json(shifts)
    }).catch(err=>{
        res.status(400).json(err);
        console.log(err);
    });
})

router.get("/my_shifts",getEmailFromToken, (req,res)=>{
    shift.find({assignedTo:req.user_email}).then(shifts=>res.status(200).json(shifts)).catch(err=>{
        res.status(400).json(err);
        console.log(err);
    });
})

router.delete("/delete",managerOrAdminAuth, (req, res) => {
    const {id} = req.body;
    shift.findById(id).then(s=>{
        if(s.startTime < Date.now()) return res.status(400).json({message: "Shift has already started and cannot be deleted."});
        else{
            if(s.assignedToTask) {
                task.findByIdAndUpdate(assignedToTask, {$pull: {"shifts": id}}).catch(err => console.log(err));
            }
            project.findByIdAndUpdate(s.projectId,{$pull:{"shifts":id}}).catch(err=>console.log(err));
            shift.findByIdAndDelete(id).then(shift => {
                res.status(200).json({message: "Shift successfully deleted", shift})
            }).catch(err => {
                res.status(400).json({message: "Shift not successfully deleted", error: err.message});
            });
        }
    }).catch(err=>{
        console.log(err);
        res.status(400).json({message: "Shift not successfully deleted", error: err.message});
    });
});

module.exports = router;