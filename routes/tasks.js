const task = require("../models/task");
const project = require("../models/project");
const express = require("express")
const router = express.Router();
const {managerOrAdminAuth, assignedToProject} = require("../utils/auth");

router.post("/create",assignedToProject, (req, res) => {
    const {title,description,createdBy,assignedToName,currentSection, projectId} = req.body;
    const assignedTo = [{name:assignedToName,time:Date.now()}];
    const sectionHistory = [{section:"To do",assignedBy:createdBy,changedOn:Date.now()}];
    task.create({
            title,
            description,
            createdBy,
            assignedTo,
            currentSection,
            projectId,
            sectionHistory
    }).then(t =>{
        project.findById(projectId).then(project => {
            project.tasks.push(t._id);
            project.save().then(() => {
                res.status(200).json({message: "Task successfully created", task: t})
            }).catch(err => {
                console.log(err);
                task.findByIdAndDelete(t._id);
                res.status(400).json({message: "Task not successfully created", error: err.message});
            });
        }).catch(err=>{
            console.log("here");
            console.log(err);
            task.findByIdAndDelete(t._id);
            res.status(400).json({message: "Task not successfully created", error: err.message});
        })
    }).catch(err=>{
        task.findOneAndDelete({title:title}).then(()=>{
            res.status(400).json({message: "Task not successfully created", error: err.message});
        })
        console.log("here2");
        console.log(err);
    })
})

router.put("/edit",assignedToProject, (req, res) => {
    const {id,title,description} = req.body;
    task.findById(id).then(task=>{
        if(title) task.title = title;
        if(description) task.description = description;
        task.save().then(task =>
            res.status(200).json({message: "Task successfully edited", task})
        ).catch (err=>{
            res.status(400).json({message: "Task not successful edited", error: err.message,})
        })
    })
})

router.get("/all_tasks",assignedToProject, (req,res)=>{
    const {projectId} = req.query;
    if(projectId) {
        task.find({projectId:projectId}).then(tasks => res.status(200).json(tasks)).catch(err => {
            console.log(err);
            res.status(400).json(err)
        });
    }else{
        res.status(400).json({message: "No project Id given"});
    }
})

router.post("/assign",assignedToProject, (req, res) => {
    const {id,newAssign} = req.body;
    task.findById(id).then(task=>{
        task.assignedTo.push({name:newAssign,time:Date.now()});
        task.save().then(task =>
            res.status(200).json({message: "Task successfully assigned", task})
        ).catch (err=>{
            res.status(400).json({message: "Task not successful assigned", error: err.message,})
        })
    }).catch (err=>{
        res.status(400).json({message: "Task not found", error: err.message,})
    })
})

//TODO: Add section change API to update section history and update time elapsed

// TODO: If comment functionality is added, revise this API
//TODO: After shift functionality is added, revise this API
router.delete("/delete",managerOrAdminAuth, (req, res) => {
    const {id} = req.body;
    task.findByIdAndDelete(id).then(task => {
        project.findById(task.projectId).then(project => {
            project.tasks = project.tasks.filter(t => t !== id);
            project.save().then(() => {
                res.status(200).json({message: "Task successfully deleted", task})
            }).catch(err => {
                console.log(err);
                res.status(400).json({message: "Task not successfully deleted", error: err.message});
            });
        }).catch(err => {
            console.log(err);
            res.status(400).json({message: "Task not successfully deleted", error: err.message});
        });
    }).catch(err => {
        console.log(err);
        res.status(400).json({message: "Task not found", error: err.message});
    });
})

module.exports = router;


