const task = require("../models/task");
const project = require("../models/project");
const express = require("express")
const router = express.Router();
const {managerOrAdminAuth, assignedToProject} = require("../utils/auth");
const shift = require("../models/shift");
const section = require("../models/section");

router.post("/create",assignedToProject,async  (req, res) => {
    const {title,description,createdBy,assignedToName, projectId} = req.body;
    const assignedTo = [{name:assignedToName,time:Date.now()}];
    const sectionHistory = [{section:"To do",assignedBy:createdBy,changedOn:Date.now()}];
    const currentSection = await section.findOne({projectId:projectId,title:"To do"}).then(s=>s._id).catch(err=>console.log(err));
    task.create({
            title,
            description,
            createdBy,
            assignedTo,
            projectId,
            sectionHistory,
            currentSection
    }).then(t =>{
        project.findById(projectId).then(project => {
            project.tasks.push(t._id);
            project.save().then(() => {
                section.findOne({projectId:projectId,title:"To do"}).then(s=>{
                    console.log(s);
                    s.tasks.push(t._id);
                    s.save().catch(err=>console.log(err));
                }).catch(err=>console.log(err));
                res.status(200).json({message: "Task successfully created", task: t})
            }).catch(err => {
                console.log(err);
                task.findByIdAndDelete(t._id);
                res.status(400).json({message: "Task not successfully created", error: err.message});
            });
        }).catch(err=>{
            console.log(err);
            task.findByIdAndDelete(t._id);
            res.status(400).json({message: "Task not successfully created", error: err.message});
        })
    }).catch(err=>{
        task.findOneAndDelete({title:title}).then(()=>{
            res.status(400).json({message: "Task not successfully created", error: err.message});
        })
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
    }).catch(err=>{
        console.log(err);
        res.status(400).json({message: "Task not found", error: err.message,});
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
});

router.post("/assign",assignedToProject, (req, res) => {
    const {id,newAssign} = req.body;
    task.findById(id).then(task=>{
        task.assignedTo.push({name:newAssign,time:Date.now()});
        task.save().then(task =>
            res.status(200).json({message: "Task successfully assigned", task})
        ).catch (err=>{
            res.status(400).json({message: "Task not assigned", error: err.message,})
        })
    }).catch (err=>{
        res.status(400).json({message: "Task not found", error: err.message,})
    });
});

//TODO: Update time elapsed below.
router.put("/change_section",assignedToProject, (req, res) => {
    const {id,newSection,changedBy} = req.body;
    task.findById(id).then(t=>{
        section.findByIdAndUpdate(t.currentSection,{$pull:{"tasks":id}}).catch(err=>console.log(err));
        section.findById(newSection).then(s=>{
            s.tasks.push(id);
            s.save().catch(err=>console.log(err));
            t.currentSection = newSection;
            t.sectionHistory.push({section:s.title,assignedBy:changedBy,changedOn:Date.now()});
            t.save().then(task =>
                res.status(200).json({message: "Successfully changed section", task})
            ).catch (err=>{
                res.status(400).json({message: "Unable to change section", error: err.message,})
            })
        }).catch(err=>console.log(err));
    }).catch (err=>{
        res.status(400).json({message: "Task not found", error: err.message,})
    });
});

// TODO: If comment functionality is added, revise this API
router.delete("/delete",managerOrAdminAuth, (req, res) => {
    const {id} = req.body;
    task.findByIdAndDelete(id).then(t => {
        t.shifts.forEach(s => {
            shift.findById(s).then(s => {
                s.assignedToTask = null;
                s.save().catch(err => console.log(err));
            })
        })
        section.findByIdAndUpdate(t.currentSection,{$pull:{"tasks":id}}).catch(err=>console.log(err));
        project.findById(t.projectId).then(project => {
            project.tasks = project.tasks.filter(t => t !== id);
            project.save().then(() => {
                res.status(200).json({message: "Task successfully deleted", task: t})
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
});

module.exports = router;


