const task = require("../models/task");
const project = require("../models/project");
const express = require("express")
const router = express.Router();
const {managerOrAdminAuth, assignedToProject} = require("../utils/auth");
const shift = require("../models/shift");
const section = require("../models/section");
const User = require("../models/user");
const mailer = require("../utils/mailer");

router.post("/create",assignedToProject,async  (req, res) => {
    const {title,description,createdBy,assignedTo, projectId, currentSection} = req.body;
    const assignedToHistory = [{name:assignedTo,time:Date.now()}];
    task.create({
            title,
            description,
            createdBy,
            assignedTo,
            assignedToHistory,
            projectId,
            currentSection
    }).then(t =>{
        project.findById(projectId).then(project => {
            project.tasks.push(t._id);
            project.save().then(() => {
                section.findById(currentSection).then(s=>{
                    t.sectionHistory = [{section: s.title, assignedBy: createdBy, changedOn: Date.now()}];
                    s.tasks.push(t._id.toString());
                    s.save().catch(err=>console.log(err));
                    t.save();
                    res.status(200).json({message: "Task successfully created", task: t})
                    User.findById(assignedTo).then(user=>{
                        const subject = "Task Assigned";
                        const body = `Hi ${user.name},\n\n You have been assigned a task by ${createdBy}. Kindly login to view details.\n\n Sincerely,\n Team AIM`;
                        mailer(user.email, subject, body).then(r =>console.log(r)).catch(err=>console.log(err));
                    });
                }).catch(err=>console.log(err));
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
    const {_id,title,description} = req.body;
    task.findById(_id).then(task=>{
        if(title) task.title = title;
        if(description) task.description = description;
        task.save().then(task =>
            res.status(200).json(task)
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
        task.find({projectId:projectId}).then(tasks =>
        {
            section.find({projectId:projectId}).then(sections=>{
                sections.forEach(s=>{
                    s.tasks = s.tasks?.map(t => tasks.find(task => task._id.toString() === t?.toString()));
                })
                res.status(200).json(sections)
            }).catch(err=>console.log(err))
        }).catch(err => {
            console.log(err);
            res.status(400).json(err)
        });
    }else{
        res.status(400).json({message: "No project Id given"});
    }
});

router.get("/project_tasks",(req,res)=>{
    const {projectId} = req.query;
    task.find({projectId:projectId}).then(tasks => {
        res.status(200).json(tasks);
    }).catch(err => {
        console.log(err);
        res.status(400).json(err);
    });
})

router.post("/assign",assignedToProject, (req, res) => {
    const {id,newAssign} = req.body;
    task.findById(id).then(task=>{
        User.findById(newAssign).then(user=>{
            const subject = "Task Assigned";
            const body = `Hi ${user.name},\n\n You have been assigned a task named ${task.title}. Kindly login to view details.\n\n Sincerely,\n Team AIM`;
            mailer(user.email, subject, body).then(r =>console.log(r)).catch(err=>console.log(err));
        });
        task.assignedToHistory.push({name:newAssign,time:Date.now()});
        task.assignedTo = newAssign;
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
        section.findById(t.currentSection).then(s=>{
            const index = s.tasks.indexOf(id);
            s.tasks.splice(index,1);
            s.save().catch(err=>console.log(err));
        }).catch(err=>console.log(err));
        section.findById(newSection).then(s=>{
            s.tasks.push(id.toString());
            s.save().catch(err=>console.log(err));
            oldSection = t.currentSection;
            t.currentSection = newSection;
            t.sectionHistory.push({section:s.title,assignedBy:changedBy,changedOn:Date.now()});
            t.save().then(task =>
                res.status(200).json({message: "Successfully changed section", change:{oldSection:oldSection,newSection:newSection,task:task}})
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
    const {id} = req.query;
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


